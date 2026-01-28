const PROXY_VERSION = "2026-01-28-proxy-hardened";

const KNOWN_OPS = new Set([
  "read",
  "readAll",
  "create",
  "update",
  "delete",
  "insert",
  "upsert",
]);

function normalizeSegments(paramsPath) {
  if (Array.isArray(paramsPath)) return paramsPath.filter(Boolean);
  if (!paramsPath) return [];
  return String(paramsPath).split("/").filter(Boolean);
}

function looksLikeRouteMissing(status, text) {
  if (status === 404 || status === 405) return true;
  return /Cannot\s+(GET|POST|PUT|DELETE|PATCH)\b/i.test(text || "");
}

function preview(text, limit = 4000) {
  const t = typeof text === "string" ? text : String(text ?? "");
  return t.length > limit ? t.slice(0, limit) : t;
}

export async function onRequest(context) {
  const { request, env, params } = context;
  const reqUrl = new URL(request.url);

  const apiKey = (env.NCB_API_KEY || env.VITE_NCB_API_KEY || "").trim();
  const instance = (env.NCB_INSTANCE || env.VITE_NCB_INSTANCE || "").trim();

  const rawBase = (env.NCB_BASE_URL || env.NCB_URL || "https://api.nocodebackend.com").trim();
  let ncbHost = "https://api.nocodebackend.com";
  try {
    ncbHost = new URL(rawBase).origin; // strips any accidental /<instance> path
  } catch (e) {
    // Fallback to default host if URL is invalid
    console.warn("Invalid NCB_BASE_URL provided, using default.", e);
  }

  const headersOut = {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { headers: headersOut });
  }

  if (!apiKey || !instance) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: "Missing NCB configuration (need NCB_API_KEY and NCB_INSTANCE or VITE_NCB_INSTANCE).",
        proxyVersion: PROXY_VERSION,
        hasKey: !!apiKey,
        hasInstance: !!instance,
      }),
      { status: 500, headers: headersOut }
    );
  }

  // Normalize and sanitize path segments
  let segs = normalizeSegments(params?.path);

  // Strip leading "api" if present
  if (segs[0] === "api") segs = segs.slice(1);

  // IMPORTANT HARDENING:
  // If path looks like /api/ncb/<something>/<op>/<table> then strip the first segment
  if (segs.length >= 2 && KNOWN_OPS.has(segs[1]) && !KNOWN_OPS.has(segs[0])) {
    segs = segs.slice(1);
  }

  // Strip env instance if present (best-case)
  if (segs[0] === instance) segs = segs.slice(1);

  const seg0 = segs[0];
  const seg1 = segs[1];
  const seg2 = segs[2];

  const operation = KNOWN_OPS.has(seg0) ? seg0 : "read";
  const table = KNOWN_OPS.has(seg0) ? seg1 : seg0;
  const id = KNOWN_OPS.has(seg0) ? seg2 : seg1;

  if (!table) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: "Missing table name. Expected /api/ncb/<op>/<table> (e.g. /api/ncb/read/posts).",
        proxyVersion: PROXY_VERSION,
        requestInfo: { segs, operation, table, id },
      }),
      { status: 200, headers: headersOut }
    );
  }

  // Build upstream candidates
  const candidates = [];
  const add = (p) => candidates.push(p);

  if (operation === "read" || operation === "readAll") {
    if (id) {
      add(`read/${table}/${id}`);
      add(`api/read/${table}/${id}`);
    } else {
      add(`read/${table}`);
      add(`readAll/${table}`);
      add(`api/readAll/${table}`);
      add(`api/read/${table}`);
    }
  } else if (operation === "create" || operation === "insert") {
    add(`create/${table}`);
    add(`insert/${table}`);
    add(`api/create/${table}`);
    add(`api/insert/${table}`);
  } else if (operation === "update" || operation === "upsert") {
    if (id) {
      add(`update/${table}/${id}`);
      add(`api/update/${table}/${id}`);
    }
    add(`update/${table}`);
    add(`api/update/${table}`);
  } else if (operation === "delete") {
    if (id) {
      add(`delete/${table}/${id}`);
      add(`api/delete/${table}/${id}`);
    }
    add(`delete/${table}`);
    add(`api/delete/${table}`);
  }

  // Forward body for non-GET requests
  const method = request.method.toUpperCase();
  const body =
    method === "GET" || method === "HEAD" ? undefined : await request.arrayBuffer();

  // Copy query params (except cache busters), enforce Instance
  const qp = new URLSearchParams(reqUrl.searchParams);
  qp.delete("_t");
  qp.delete("Instance");
  qp.set("Instance", instance);

  // Build headers for upstream
  const upstreamHeaders = new Headers();
  upstreamHeaders.set("Authorization", `Bearer ${apiKey}`);
  upstreamHeaders.set("Accept", "application/json");

  const incomingCT = request.headers.get("content-type");
  if (incomingCT && method !== "GET" && method !== "HEAD") {
    upstreamHeaders.set("content-type", incomingCT);
  }

  const triedUrls = [];
  let lastStatus = 0;
  let lastPreview = "";
  let lastUpstreamUrl = "";

  for (const path of candidates) {
    const upstreamUrl = new URL(`${ncbHost.replace(/\/$/, "")}/${path}`);
    upstreamUrl.search = qp.toString();
    const upstreamUrlStr = upstreamUrl.toString();

    triedUrls.push(upstreamUrlStr);
    lastUpstreamUrl = upstreamUrlStr;

    let res;
    try {
      res = await fetch(upstreamUrlStr, {
        method,
        headers: upstreamHeaders,
        body,
        redirect: "follow",
      });
    } catch (e) {
      lastPreview = preview(e?.message || String(e));
      continue;
    }

    lastStatus = res.status;
    const text = await res.text();
    const ct = res.headers.get("content-type") || "";

    // Try JSON parse if likely JSON
    const looksJson = ct.includes("application/json") || text.trim().startsWith("{") || text.trim().startsWith("[");
    if (looksJson) {
      try {
        const jsonBody = JSON.parse(text);

        // Treat NCB "status":"success" as success
        const isSuccess =
          res.ok &&
          (jsonBody?.ok === true ||
            jsonBody?.status === "success" ||
            Array.isArray(jsonBody?.data) ||
            typeof jsonBody?.data !== "undefined");

        if (isSuccess) {
          return new Response(
            JSON.stringify({
              ok: true,
              data: jsonBody,
              upstreamStatus: res.status,
              upstreamUrlUsed: upstreamUrlStr,
              proxyVersion: PROXY_VERSION,
              triedUrls,
              requestInfo: { segs, operation, table, id },
            }),
            { status: 200, headers: headersOut }
          );
        }

        const jprev = preview(JSON.stringify(jsonBody));
        if (looksLikeRouteMissing(res.status, jprev)) {
          lastPreview = jprev;
          continue;
        }

        return new Response(
          JSON.stringify({
            ok: false,
            error: jsonBody?.error || jsonBody?.message || "Upstream error",
            upstreamStatus: res.status,
            upstreamUrlUsed: upstreamUrlStr,
            upstreamPreview: jprev,
            proxyVersion: PROXY_VERSION,
            triedUrls,
            requestInfo: { segs, operation, table, id },
          }),
          { status: 200, headers: headersOut }
        );
      } catch (e) {
        lastPreview = preview(text);
        if (looksLikeRouteMissing(res.status, lastPreview)) continue;
        return new Response(
          JSON.stringify({
            ok: false,
            error: "Upstream returned invalid JSON",
            upstreamStatus: res.status,
            upstreamUrlUsed: upstreamUrlStr,
            upstreamPreview: lastPreview,
            proxyVersion: PROXY_VERSION,
            triedUrls,
            requestInfo: { segs, operation, table, id },
          }),
          { status: 200, headers: headersOut }
        );
      }
    }

    const prev = preview(text);
    lastPreview = prev;
    if (looksLikeRouteMissing(res.status, prev)) {
      continue;
    }

    return new Response(
      JSON.stringify({
        ok: false,
        error: "Upstream returned non-JSON response",
        upstreamStatus: res.status,
        upstreamUrlUsed: upstreamUrlStr,
        upstreamPreview: prev,
        proxyVersion: PROXY_VERSION,
        triedUrls,
        requestInfo: { segs, operation, table, id },
      }),
      { status: 200, headers: headersOut }
    );
  }

  return new Response(
    JSON.stringify({
      ok: false,
      error: "All upstream route candidates failed (likely route mismatch or wrong instance).",
      upstreamStatus: lastStatus || 0,
      upstreamUrlUsed: lastUpstreamUrl || null,
      upstreamPreview: lastPreview || null,
      proxyVersion: PROXY_VERSION,
      triedUrls,
      requestInfo: { segs, operation, table, id },
    }),
    { status: 200, headers: headersOut }
  );
}