function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store"
    }
  });
}

export async function onRequest(context) {
  const { request, env, params } = context;

  try {
    const url = new URL(request.url);
    const debug = url.searchParams.get("debug") === "1";

    // ✅ Use server env vars (preferred)
    const base =
      env.NCB_BASE_URL ||
      env.VITE_NCB_BASE_URL ||
      env.VITE_NCB_URL ||
      "";

    const instance =
      env.NCB_INSTANCE ||
      env.VITE_NCB_INSTANCE ||
      env.VITE_NCB_INSTANCE_ID ||
      "";

    const apiKey =
      env.NCB_API_KEY || ""; // ✅ server-only secret

    // ✅ Handle Cloudflare optional catch-all param safely
    const rawPath = params?.path;
    const path = Array.isArray(rawPath)
      ? rawPath.join("/")
      : (rawPath || "");

    if (!base || !instance) {
      return json({
        ok: false,
        error: "Missing NCB_BASE_URL or NCB_INSTANCE",
        hasNCB_BASE_URL: !!base,
        hasNCB_INSTANCE: !!instance,
        hasNCB_API_KEY: !!apiKey
      }, 200);
    }

    const cleanBase = base.replace(/\/$/, "");
    const upstreamUrl = new URL(`${cleanBase}/${instance}/${path}`);

    // ✅ Forward query params
    url.searchParams.forEach((v, k) => {
      upstreamUrl.searchParams.set(k, v);
    });

    // ✅ Forward method + body
    const method = request.method.toUpperCase();
    let body;
    if (method !== "GET" && method !== "HEAD") {
      body = await request.arrayBuffer();
    }

    const headers = new Headers();
    headers.set("Accept", "application/json");

    // Forward content-type for POST/PUT/PATCH
    const contentType = request.headers.get("content-type");
    if (contentType) headers.set("content-type", contentType);

    // ✅ Send API key using common header styles
    if (apiKey) {
      headers.set("x-api-key", apiKey);
      headers.set("authorization", `Bearer ${apiKey}`);
    }

    const upstreamRes = await fetch(upstreamUrl.toString(), {
      method,
      headers,
      body
    });

    const upstreamText = await upstreamRes.text();
    const upstreamCT = upstreamRes.headers.get("content-type") || "";

    // ✅ Try parse JSON if possible
    let parsed = null;
    try {
      parsed = JSON.parse(upstreamText);
    } catch (_) {
      parsed = null;
    }

    // ✅ Always return JSON to the browser (avoid Cloudflare HTML 502 page)
    if (!upstreamRes.ok) {
      return json({
        ok: false,
        error: "Upstream NCB request failed",
        upstreamStatus: upstreamRes.status,
        upstreamContentType: upstreamCT,
        upstreamUrl: debug ? upstreamUrl.toString() : undefined,
        upstreamPreview: upstreamText.slice(0, 250),
        upstreamJson: parsed
      }, 200);
    }

    return json({
      ok: true,
      upstreamStatus: upstreamRes.status,
      data: parsed ?? upstreamText
    }, 200);

  } catch (err) {
    // ✅ Never crash (crash = Cloudflare Bad Gateway)
    return json({
      ok: false,
      error: "Function crashed",
      message: String(err)
    }, 200);
  }
}