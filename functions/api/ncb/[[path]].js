/**
 * Cloudflare Pages Function: NoCodeBackend Proxy (Robust)
 *
 * Route: /api/ncb/*
 *
 * Goals:
 * - Always inject Instance + Authorization server-side.
 * - Be resilient to different NCB endpoint shapes (/read/:table, /api/read/:table, /readAll/:table, etc).
 * - Protect against misconfigured NCB_URL that includes a path (e.g. https://.../54230_instance).
 * - Provide rich debug fields (upstreamUrlUsed, triedUrls, upstreamPreview) while keeping UI unchanged.
 */
export async function onRequest(context) {
  const { request, env, params } = context;

  // --- CORS preflight
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
      },
    });
  }

  const proxyVersion = "2026-01-28-robust-ncb-proxy";

  // --- Resolve instance + api key
  const instance =
    (env.VITE_NCB_INSTANCE || env.VITE_NCB_INSTANCE_ID || env.NCB_INSTANCE || "").trim();

  const ncbApiKey = (env.NCB_API_KEY || env.VITE_NCB_API_KEY || "").trim();

  if (!instance) {
    return json(
      {
        ok: false,
        proxyVersion,
        error: "Missing NCB Instance",
        details:
          "Server configuration error: Instance ID not found in environment (VITE_NCB_INSTANCE / VITE_NCB_INSTANCE_ID / NCB_INSTANCE).",
      },
      500
    );
  }

  if (!ncbApiKey) {
    return json(
      {
        ok: false,
        proxyVersion,
        error: "Missing NCB API key",
        details: "Server configuration error: NCB_API_KEY not found in environment.",
      },
      500
    );
  }

  // --- Resolve NCB base URL safely (strip any path)
  const rawBase = (env.NCB_URL || "https://api.nocodebackend.com").trim();
  let baseOrigin = rawBase;
  try {
    // Ensure we can parse even if someone omitted scheme
    const normalized = rawBase.startsWith("http") ? rawBase : `https://${rawBase}`;
    baseOrigin = new URL(normalized).origin;
  } catch (e) {
    // Fall back, but keep going
    baseOrigin = "https://api.nocodebackend.com";
  }

  // --- Parse the incoming path after /api/ncb/
  let segments = params?.path || [];
  if (typeof segments === "string") segments = segments.split("/").filter(Boolean);

  // Strip leading slashes just in case
  segments = (segments || []).map(s => (s || "").toString()).filter(Boolean);

  // If someone accidentally includes the instance in the path, strip it:
  // /api/ncb/54230_bangtanmom/read/posts -> /read/posts
  if (segments[0] === instance) segments = segments.slice(1);

  // If someone includes "api" in the path, allow it but normalize away for parsing
  // /api/ncb/api/read/posts -> /read/posts
  if (segments[0] === "api") segments = segments.slice(1);

  const operation = segments[0] || "";
  const table = segments[1] || "";
  const rest = segments.slice(2); // e.g. /read/posts/123

  if (!operation) {
    return json(
      {
        ok: false,
        proxyVersion,
        error: "Missing operation",
        details: "Expected /api/ncb/<operation>/<table>...",
        received: { segments },
      },
      400
    );
  }

  // --- Copy query params (ignore cache-buster _t)
  const reqUrl = new URL(request.url);
  const passthroughParams = new URLSearchParams();
  reqUrl.searchParams.forEach((val, key) => {
    if (key === "_t") return;
    passthroughParams.set(key, val);
  });

  // --- Helper: build candidate URL
  const buildUrl = (origin, path, { includeInstanceQuery = true } = {}) => {
    const u = new URL(`${origin}${path.startsWith("/") ? "" : "/"}${path}`);
    // Preserve user query params
    passthroughParams.forEach((v, k) => u.searchParams.set(k, v));
    if (includeInstanceQuery) u.searchParams.set("Instance", instance);
    return u.toString();
  };

  // --- Candidate upstream paths (cover both query-param and instance-in-path styles)
  const opAll = operation === "read" ? "readAll" : operation;

  const tail = rest.length ? `/${rest.join("/")}` : "";

  const candidatePaths = [];

  // Preferred: Instance as query param
  if (table) {
    candidatePaths.push(`/${operation}/${table}${tail}`);
    candidatePaths.push(`/api/${operation}/${table}${tail}`);

    if (operation === "read") {
      candidatePaths.push(`/${opAll}/${table}${tail}`);
      candidatePaths.push(`/api/${opAll}/${table}${tail}`);
    }

    // Some backends expect Instance in the path
    candidatePaths.push(`/${instance}/${operation}/${table}${tail}`);
    candidatePaths.push(`/${instance}/api/${operation}/${table}${tail}`);

    if (operation === "read") {
      candidatePaths.push(`/${instance}/${opAll}/${table}${tail}`);
      candidatePaths.push(`/${instance}/api/${opAll}/${table}${tail}`);
    }
  } else {
    // Operation-only endpoints (rare)
    candidatePaths.push(`/${operation}${tail}`);
    candidatePaths.push(`/api/${operation}${tail}`);
    candidatePaths.push(`/${instance}/${operation}${tail}`);
    candidatePaths.push(`/${instance}/api/${operation}${tail}`);
  }

  // Table-as-query fallback (covers APIs like /read?table=posts)
  if (operation === "read" && table && !tail) {
    const q = new URLSearchParams(passthroughParams);
    q.set("table", table);
    q.set("Instance", instance);
    candidatePaths.push(`/read?${q.toString()}`);
    candidatePaths.push(`/api/read?${q.toString()}`);
  }

  // De-duplicate while preserving order
  const uniq = [];
  const seen = new Set();
  for (const p of candidatePaths) {
    const key = p;
    if (!seen.has(key)) {
      seen.add(key);
      uniq.push(p);
    }
  }

  const triedUrls = [];

  // --- Prepare headers + body
  const headers = new Headers(request.headers);
  headers.set("Authorization", `Bearer ${ncbApiKey}`);
  headers.delete("Host");

  // Body buffering (avoid reading twice)
  let rawBody = null;
  if (request.method !== "GET" && request.method !== "HEAD") {
    try {
      rawBody = await request.text();
    } catch (e) {
      rawBody = null;
    }
  }

  // --- Execute attempts
  let lastErr = null;

  for (const path of uniq) {
    // For instance-in-path candidates, don't *also* force Instance query param (avoid weird rewrites),
    // but keep it for query-param candidates.
    const isInstanceInPath = path.startsWith(`/${instance}/`);
    const upstreamUrl = buildUrl(baseOrigin, path, { includeInstanceQuery: !isInstanceInPath });

    triedUrls.push(upstreamUrl);

    try {
      const proxyReq = new Request(upstreamUrl, {
        method: request.method,
        headers,
        body: rawBody,
        redirect: "follow",
      });

      const res = await fetch(proxyReq);

      // Handle no-body statuses
      if ([101, 204, 205, 304].includes(res.status)) {
        return new Response(null, {
          status: res.status,
          headers: corsHeaders(res.headers),
        });
      }

      const ct = (res.headers.get("content-type") || "").toLowerCase();

      // Prefer JSON parsing, but fall back to text
      let text = null;
      let parsed = null;

      if (ct.includes("application/json")) {
        text = await res.text();
        try {
          parsed = text ? JSON.parse(text) : null;
        } catch (e) {
          parsed = null;
        }
      } else {
        text = await res.text();
      }

      // Determine "ok" for NCB:
      // - HTTP ok AND not an explicit ok:false body
      const bodySaysNotOk =
        parsed && typeof parsed === "object" && parsed !== null && parsed.ok === false;

      if (res.ok && !bodySaysNotOk) {
        // Success — return in a stable wrapper
        return json(
          {
            ok: true,
            proxyVersion,
            upstreamStatus: res.status,
            upstreamUrlUsed: upstreamUrl,
            triedUrls,
            data: parsed ?? text,
          },
          200,
          res.headers
        );
      }

      // Not ok — capture preview and continue trying if 404/405 (route mismatch)
      const preview = (text || "").slice(0, 2000);
      const shouldRetry = res.status === 404 || res.status === 405;

      lastErr = {
        ok: false,
        proxyVersion,
        upstreamStatus: res.status,
        upstreamUrlUsed: upstreamUrl,
        upstreamPreview: preview,
        triedUrls,
      };

      if (!shouldRetry) {
        // Don't keep trying on auth errors, server errors, etc.
        return json(lastErr, res.status, res.headers);
      }
    } catch (e) {
      lastErr = {
        ok: false,
        proxyVersion,
        upstreamStatus: 0,
        upstreamUrlUsed: upstreamUrl,
        upstreamPreview: String(e?.message || e),
        triedUrls,
      };
    }
  }

  // All attempts failed
  return json(
    lastErr || {
      ok: false,
      proxyVersion,
      error: "All upstream attempts failed",
      triedUrls,
    },
    502
  );
}

/** Helpers */
function corsHeaders(existingHeaders) {
  const h = new Headers(existingHeaders || {});
  h.set("Access-Control-Allow-Origin", "*");
  return h;
}

function json(obj, status = 200, existingHeaders) {
  const h = corsHeaders(existingHeaders);
  h.set("Content-Type", "application/json");
  return new Response(JSON.stringify(obj), { status, headers: h });
}
