/**
 * Cloudflare Pages Function: NoCodeBackend Proxy (robust)
 *
 * Route: /api/ncb/*
 *
 * Goals:
 * - Always inject Instance from server env (do NOT trust client-provided Instance)
 * - Always send Instance as a QUERY param (NCB expects ?Instance=...)
 * - Be resilient if callers accidentally include the instance in the PATH:
 *     /api/ncb/54230_xxx/read/posts  ->  /read/posts?Instance=54230_xxx
 * - Return a stable wrapper shape:
 *     { ok:true, data:<upstream-json>, upstreamStatus, upstreamUrlUsed, proxyVersion }
 *     { ok:false, message, upstreamStatus, upstreamPreview, triedUrls, proxyVersion }
 */

const PROXY_VERSION = "2026-01-28-robust-ncb-proxy-v2";

function jsonResponse(body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-store",
      ...extraHeaders,
    },
  });
}

function looksLikeInstanceSegment(seg) {
  // Typical NCB instance ids are like: 54230_bangtanmom
  return typeof seg === "string" && /^\d+_[a-zA-Z0-9_-]+$/.test(seg);
}

function buildUpstreamUrl(origin, pathname, requestUrl, instance) {
  const u = new URL(origin + (pathname.startsWith("/") ? pathname : `/${pathname}`));

  // Copy query params EXCEPT: cache buster + any client-provided Instance
  requestUrl.searchParams.forEach((val, key) => {
    const k = key.toLowerCase();
    if (k === "_t") return;
    if (k === "instance") return;
    u.searchParams.set(key, val);
  });

  // Force server-side instance
  u.searchParams.set("Instance", instance);

  return u;
}

async function readRequestBody(request) {
  if (request.method === "GET" || request.method === "HEAD") return null;
  try {
    return await request.text();
  } catch {
    return null;
  }
}

async function fetchJsonOrText(url, request, headers, bodyText) {
  const upstreamReq = new Request(url.toString(), {
    method: request.method,
    headers,
    body: bodyText,
    redirect: "follow",
  });

  const resp = await fetch(upstreamReq);

  if ([101, 204, 205, 304].includes(resp.status)) {
    return { resp, text: "" };
  }

  const text = await resp.text();
  return { resp, text };
}

function safePreview(text, max = 800) {
  if (!text) return "";
  return text.length > max ? text.slice(0, max) + "…" : text;
}

export async function onRequest(context) {
  const { request, env, params } = context;

  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
        "Cache-Control": "no-store",
      },
    });
  }

  const instance = env.VITE_NCB_INSTANCE || env.VITE_NCB_INSTANCE_ID || env.NCB_INSTANCE;
  const apiKey = env.NCB_API_KEY || env.VITE_NCB_API_KEY;

  if (!instance) {
    return jsonResponse(
      { ok: false, message: "Missing NCB Instance in environment variables.", proxyVersion: PROXY_VERSION },
      500
    );
  }

  if (!apiKey) {
    return jsonResponse(
      { ok: false, message: "Missing NCB API key in environment variables.", proxyVersion: PROXY_VERSION },
      500
    );
  }

  // IMPORTANT: Only use the ORIGIN from NCB_URL (ignores any accidental path like /54230_xxx)
  let origin = "https://api.nocodebackend.com";
  try {
    origin = new URL(env.NCB_URL || origin).origin;
  } catch {
    origin = "https://api.nocodebackend.com";
  }

  let rawPath = "";
  if (Array.isArray(params.path)) rawPath = params.path.join("/");
  else rawPath = params.path || "";
  rawPath = String(rawPath || "").replace(/^\/+/, "");

  const segs = rawPath.split("/").filter(Boolean);

  // Strip instance if it shows up in the path (old/legacy callers)
  if (segs[0] === instance || looksLikeInstanceSegment(segs[0])) segs.shift();
  if (segs[0] === "api" && (segs[1] === instance || looksLikeInstanceSegment(segs[1]))) segs.splice(0, 2);

  const normalizedPath = segs.join("/");
  if (!normalizedPath) {
    return jsonResponse({ ok: false, message: "Missing path after /api/ncb/…", proxyVersion: PROXY_VERSION }, 400);
  }

  const headers = new Headers(request.headers);
  headers.set("Authorization", `Bearer ${apiKey}`);
  headers.set("Accept", "application/json");
  headers.delete("Host");

  const requestUrl = new URL(request.url);
  const bodyText = await readRequestBody(request);

  const triedUrls = [];
  const candidates = [];

  const addCandidate = (pathname) => {
    const u = buildUpstreamUrl(origin, pathname, requestUrl, instance);
    candidates.push(u);
    triedUrls.push(u.toString());
  };

  addCandidate(`/${normalizedPath}`);
  if (!normalizedPath.startsWith("api/")) addCandidate(`/api/${normalizedPath}`);

  if (normalizedPath.startsWith("read/")) {
    const rest = normalizedPath.slice("read/".length);
    addCandidate(`/readAll/${rest}`);
    addCandidate(`/api/readAll/${rest}`);
  } else if (normalizedPath.startsWith("readAll/")) {
    const rest = normalizedPath.slice("readAll/".length);
    addCandidate(`/read/${rest}`);
    addCandidate(`/api/read/${rest}`);
  }

  let lastErr = null;

  for (const url of candidates) {
    try {
      const { resp, text } = await fetchJsonOrText(url, request, headers, bodyText);

      const ct = (resp.headers.get("content-type") || "").toLowerCase();
      const isJson = ct.includes("application/json") || ct.includes("application/vnd.api+json");

      if (resp.ok) {
        let payload = text;
        if (isJson && text) {
          try {
            payload = JSON.parse(text);
          } catch {
            // Not JSON, keep as text
          }
        }

        if (payload && typeof payload === "object" && payload.ok === false) {
          return jsonResponse(
            {
              ok: false,
              message: payload.message || payload.error || "Upstream returned ok:false",
              upstreamStatus: resp.status,
              upstreamUrlUsed: url.toString(),
              upstreamPreview: safePreview(JSON.stringify(payload)),
              triedUrls,
              proxyVersion: PROXY_VERSION,
            },
            502
          );
        }

        return jsonResponse(
          {
            ok: true,
            data: payload,
            upstreamStatus: resp.status,
            upstreamUrlUsed: url.toString(),
            triedUrls,
            proxyVersion: PROXY_VERSION,
          },
          200
        );
      }

      lastErr = {
        ok: false,
        message: `Upstream error (${resp.status})`,
        upstreamStatus: resp.status,
        upstreamStatusText: resp.statusText,
        upstreamUrlUsed: url.toString(),
        upstreamPreview: safePreview(text),
      };
    } catch (e) {
      lastErr = { ok: false, message: e?.message || "Fetch failed", upstreamStatus: 0, upstreamUrlUsed: url.toString() };
    }
  }

  return jsonResponse(
    {
      ok: false,
      message: lastErr?.message || "All upstream attempts failed",
      upstreamStatus: lastErr?.upstreamStatus ?? 0,
      upstreamUrlUsed: lastErr?.upstreamUrlUsed,
      upstreamPreview: lastErr?.upstreamPreview,
      triedUrls,
      proxyVersion: PROXY_VERSION,
    },
    502
  );
}