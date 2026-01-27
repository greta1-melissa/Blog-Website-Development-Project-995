/**
 * Cloudflare Pages Function: NoCodeBackend Proxy (robust)
 *
 * Route: /api/ncb/*
 *
 * Why this exists:
 * - Inject Instance + Authorization server-side
 * - Normalize Cloudflare wildcard params reliably
 * - Avoid 404 loops like: "Cannot GET /<instance>/read/posts"
 * - Try multiple NCB URL formats (Instance as query param vs Instance in path, /api-prefixed, read vs readAll)
 */
export async function onRequest(context) {
  const { request, env, params } = context;

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
  };

  const json = (obj, status = 200, extraHeaders = {}) =>
    new Response(JSON.stringify(obj), {
      status,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
        ...corsHeaders,
        ...extraHeaders,
      },
    });

  // 1) CORS Preflight
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 2) Required config
    const instance = (
      env.VITE_NCB_INSTANCE ||
      env.VITE_NCB_INSTANCE_ID ||
      env.NCB_INSTANCE ||
      ""
    ).trim();

    const apiKey = (env.NCB_API_KEY || env.VITE_NCB_API_KEY || "").trim();

    const rawBase = (env.NCB_URL || "https://api.nocodebackend.com").trim();

    let ncbHost;
    try {
      // Use origin only so any accidental path in NCB_URL won't break routing
      ncbHost = new URL(rawBase).origin;
    } catch {
      ncbHost = "https://api.nocodebackend.com";
    }

    if (!instance || !apiKey) {
      return json(
        {
          ok: false,
          error: "Missing NCB configuration",
          hasInstance: !!instance,
          hasApiKey: !!apiKey,
        },
        500
      );
    }

    // 3) Normalize wildcard param into path segments (string vs array safety)
    const rawPath = params?.path;
    let pathSegments = Array.isArray(rawPath)
      ? rawPath
      : String(rawPath || "")
          .split("/")
          .filter(Boolean);

    // Common accidental prefix
    if (pathSegments[0] === "api") pathSegments = pathSegments.slice(1);

    // If someone accidentally included the instance in the URL path, strip it
    if (pathSegments[0] === instance) pathSegments = pathSegments.slice(1);

    // Extra safety: if first segment LOOKS like an instance and next is an operation, strip it
    const allowedOps = new Set(["read", "readAll", "create", "update", "delete"]);
    if (
      pathSegments.length >= 2 &&
      /^\d+_/.test(pathSegments[0]) &&
      allowedOps.has(pathSegments[1])
    ) {
      pathSegments = pathSegments.slice(1);
    }

    const [operationRaw, table, id] = pathSegments;

    if (!operationRaw || !table) {
      return json(
        {
          ok: false,
          error: "Invalid proxy path. Expected /<op>/<table>[/<id>]",
          pathSegments,
        },
        400
      );
    }

    // 4) Forward query params (but avoid cache-buster and duplicate Instance)
    const reqUrl = new URL(request.url);
    const forwardParams = new URLSearchParams();
    reqUrl.searchParams.forEach((val, key) => {
      if (key === "_t") return; // prevents NCB where-clause issues
      if (key.toLowerCase() === "instance") return; // we inject our own
      forwardParams.set(key, val);
    });

    // 5) Buffer body for non-GET/HEAD
    let rawBody = null;
    if (request.method !== "GET" && request.method !== "HEAD") {
      try {
        rawBody = await request.text();
      } catch {
        rawBody = null;
      }
    }

    // 6) Prepare headers (Authorization injected)
    const headers = new Headers(request.headers);
    headers.set("Authorization", `Bearer ${apiKey}`);
    headers.delete("Host");

    const operation = String(operationRaw);

    // 7) Build candidate upstream URLs
    const makeBasePath = (op) =>
      `${op}/${table}${id ? `/${id}` : ""}`;

    const candidates = [];
    const triedUrls = [];

    // Try the requested operation first, then fall back read <-> readAll
    const opVariants = [operation];
    if (operation === "read") opVariants.push("readAll");
    if (operation === "readAll") opVariants.push("read");

    for (const op of opVariants) {
      const basePath = makeBasePath(op);

      // Style A: Instance as query parameter (most common)
      candidates.push({ url: `${ncbHost}/${basePath}`, includeInstanceQuery: true });
      candidates.push({ url: `${ncbHost}/api/${basePath}`, includeInstanceQuery: true });

      // Style B: Instance in path (some NCB setups / older patterns)
      candidates.push({ url: `${ncbHost}/${instance}/${basePath}`, includeInstanceQuery: false });
      candidates.push({ url: `${ncbHost}/${instance}/api/${basePath}`, includeInstanceQuery: false });
      candidates.push({ url: `${ncbHost}/api/${instance}/${basePath}`, includeInstanceQuery: false });
    }

    // 8) Try candidates until one works
    let last = null;

    for (const c of candidates) {
      const u = new URL(c.url);

      // Always forward other query params
      forwardParams.forEach((v, k) => u.searchParams.set(k, v));

      // Inject Instance when using query style
      if (c.includeInstanceQuery) {
        u.searchParams.set("Instance", instance);
      }

      triedUrls.push(u.toString());

      let res;
      try {
        res = await fetch(
          new Request(u.toString(), {
            method: request.method,
            headers,
            body: rawBody,
            redirect: "follow",
          })
        );
      } catch (e) {
        last = { upstreamStatus: 0, upstreamStatusText: "FETCH_FAILED", upstreamPreview: String(e) };
        continue;
      }

      // Handle no-body statuses safely
      if ([101, 204, 205, 304].includes(res.status)) {
        return json({
          ok: true,
          data: null,
          upstreamStatus: res.status,
          upstreamUrlUsed: u.toString(),
          triedUrls,
        });
      }

      const contentType = res.headers.get("content-type") || "";
      const text = await res.text().catch(() => "");

      // Try parse JSON even if content-type is wrong
      let parsed = null;
      if (contentType.includes("application/json") || text.trim().startsWith("{") || text.trim().startsWith("[")) {
        try {
          parsed = JSON.parse(text);
        } catch {
          parsed = null;
        }
      }

      if (res.ok) {
        return json({
          ok: true,
          data: parsed ?? text,
          upstreamStatus: res.status,
          upstreamUrlUsed: u.toString(),
          triedUrls,
        });
      }

      // Save last failure and decide whether to continue
      last = {
        upstreamStatus: res.status,
        upstreamStatusText: res.statusText,
        upstreamUrlUsed: u.toString(),
        upstreamPreview: (text || "").slice(0, 500),
        upstreamJson: parsed,
      };

      // Auth failures won't be fixed by trying other URL shapes
      if (res.status === 401 || res.status === 403) break;
    }

    return json(
      {
        ok: false,
        error: "Upstream NCB request failed",
        ...last,
        triedUrls,
      },
      (last && last.upstreamStatus) || 502
    );
  } catch (err) {
    return json(
      {
        ok: false,
        error: "Proxy Internal Error",
        message: err?.message || String(err),
      },
      500
    );
  }
}