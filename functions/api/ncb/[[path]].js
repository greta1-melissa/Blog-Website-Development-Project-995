export async function onRequest(context) {
  const { request, env, params } = context;

  const CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
  };

  const json = (obj, status = 200) =>
    new Response(JSON.stringify(obj), {
      status,
      headers: { "Content-Type": "application/json", ...CORS },
    });

  // Preflight
  if (request.method === "OPTIONS") return new Response(null, { headers: CORS });

  try {
    // Base URL (origin only)
    const rawBase = env.NCB_URL || env.NCB_BASE_URL || "https://api.nocodebackend.com";
    let ncbHost = "https://api.nocodebackend.com";
    try {
      ncbHost = new URL(rawBase).origin;
    } catch (_) {
      // keep default
    }

    const instance = String(
      env.NCB_INSTANCE || env.VITE_NCB_INSTANCE || env.VITE_NCB_INSTANCE_ID || ""
    ).trim();

    const apiKey = String(env.NCB_API_KEY || env.VITE_NCB_API_KEY || "").trim();

    if (!instance || !apiKey) {
      return json(
        {
          ok: false,
          error: "Missing NCB configuration (Instance or API Key) in environment variables.",
          details: {
            hasInstance: !!instance,
            hasApiKey: !!apiKey,
            ncbHost,
          },
        },
        500
      );
    }

    // Parse incoming path segments
    const rawPath = params?.path || [];
    let segments = Array.isArray(rawPath)
      ? rawPath
      : String(rawPath).split("/").filter(Boolean);

    // Operations we support (case-insensitive)
    const allowedOps = new Set(["read", "readall", "create", "update", "delete"]);

    const s0 = String(segments[0] || "").toLowerCase();
    const s1 = String(segments[1] || "").toLowerCase();

    // 1) Strip instance if it matches env instance
    if (segments.length >= 3 && segments[0] === instance) {
      segments = segments.slice(1);
    }

    // 2) Strip any "legacy instance prefix" if first isn't an op but second is an op
    //    This fixes /api/ncb/<instance>/read/posts even if env instance differs slightly.
    if (segments.length >= 2 && !allowedOps.has(s0) && allowedOps.has(s1)) {
      segments = segments.slice(1);
    }

    // 3) Allow optional leading "api" segment (we'll also try api/ in upstream fallbacks)
    if (String(segments[0] || "").toLowerCase() === "api") {
      segments = segments.slice(1);
    }

    // Extract operation/table/id
    let operation = segments[0] || "read";
    let table = segments[1] || "";
    let id = segments[2];

    const opLower = String(operation).toLowerCase();
    if (opLower === "readall") operation = "readAll";
    else if (opLower === "read") operation = "read";
    else if (opLower === "create") operation = "create";
    else if (opLower === "update") operation = "update";
    else if (opLower === "delete") operation = "delete";
    else {
      // If operation is unknown, treat first segment as table and default to read
      table = segments[0] || "";
      id = segments[1];
      operation = "read";
    }

    if (!table) {
      return json({ ok: false, error: "Missing table name in request path.", segments }, 400);
    }

    const reqUrl = new URL(request.url);

    const makeQueryStyleUrl = (prefix, op) => {
      const upstreamPath = `${prefix}${op}/${table}${id ? `/${id}` : ""}`;
      const target = new URL(`${ncbHost}/${upstreamPath}`);

      // Force correct instance from server env
      target.searchParams.set("Instance", instance);

      // Forward query params EXCEPT Instance and cache-busters
      reqUrl.searchParams.forEach((v, k) => {
        const lk = k.toLowerCase();
        if (lk === "instance" || lk === "_t") return;
        target.searchParams.set(k, v);
      });

      return target.toString();
    };

    // Candidate upstream URLs (try safest first)
    const candidates = [];
    candidates.push(makeQueryStyleUrl("", operation));
    candidates.push(makeQueryStyleUrl("api/", operation));

    // Fallback read <-> readAll when upstream says "Cannot GET"
    if (operation === "read") {
      candidates.push(makeQueryStyleUrl("", "readAll"));
      candidates.push(makeQueryStyleUrl("api/", "readAll"));
    } else if (operation === "readAll") {
      candidates.push(makeQueryStyleUrl("", "read"));
      candidates.push(makeQueryStyleUrl("api/", "read"));
    }

    // Dedupe
    const triedUrls = [...new Set(candidates)];

    // Forward request
    const method = request.method.toUpperCase();
    const headers = {
      Accept: "application/json",
      Authorization: `Bearer ${apiKey}`,
    };

    const ct = request.headers.get("content-type");
    if (ct) headers["Content-Type"] = ct;

    let body = null;
    if (!["GET", "HEAD"].includes(method)) {
      body = await request.arrayBuffer();
    }

    let lastStatus = 0;
    let lastText = "";
    let usedUrl = "";

    for (const u of triedUrls) {
      usedUrl = u;

      let resp;
      try {
        resp = await fetch(u, { method, headers, body });
      } catch (e) {
        lastStatus = 0;
        lastText = String(e);
        continue;
      }

      lastStatus = resp.status;
      lastText = await resp.text();

      // If upstream returns a "Cannot GET ..." HTML 404, keep trying fallbacks
      if (!resp.ok) continue;

      // Success
      let payload;
      try {
        payload = JSON.parse(lastText);
      } catch (_) {
        payload = lastText;
      }

      return json({
        ok: true,
        data: payload,
        upstreamStatus: resp.status,
        upstreamUrlUsed: u,
        normalized: { operation, table, id },
      });
    }

    // All failed
    return json({
      ok: false,
      error: "Upstream NCB request failed",
      upstreamStatus: lastStatus || 502,
      upstreamUrlUsed: usedUrl,
      triedUrls,
      upstreamPreview: String(lastText || "").slice(0, 600),
      normalized: { operation, table, id, segments },
    });
  } catch (err) {
    return json(
      {
        ok: false,
        error: "Proxy Internal Error",
        message: err?.message ? String(err.message) : String(err),
      },
      500
    );
  }
}