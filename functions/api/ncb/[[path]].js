export async function onRequest(context) {
  const { request, env, params } = context;
  const url = new URL(request.url);

  const json = (obj, status = 200) =>
    new Response(JSON.stringify(obj, null, 2), {
      status,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store",
      },
    });

  // Use ONLY server-side context.env values
  const base = String(env.NCB_BASE_URL || "https://api.nocodebackend.com").trim().replace(/\/+$/, "");
  const instance = String(env.NCB_INSTANCE || "").trim();
  const apiKey = String(env.NCB_API_KEY || "").trim();

  const relPath = Array.isArray(params.path)
    ? params.path.join("/")
    : String(params.path || "").replace(/^\/+/, "");

  const method = request.method.toUpperCase();

  // Logging requested path and env status
  console.log(`[NCB Proxy] Path: ${relPath} | Method: ${method}`);
  console.log(`[NCB Proxy] API Key Exists: ${!!apiKey}`);
  console.log(`[NCB Proxy] Instance: ${instance}`);

  if (!apiKey) {
    return json({ status: "failed", error: "NCB_API_KEY missing in server env" }, 500);
  }

  if (!instance) {
    return json({ status: "failed", error: "NCB_INSTANCE missing in server env" }, 500);
  }

  // Primary upstream URL
  const upstreamUrl = `${base}/${instance}/${relPath}${url.search}`;
  console.log(`[NCB Proxy] Upstream URL: ${upstreamUrl}`);

  try {
    const bodyBuf = (method === "GET" || method === "HEAD") ? null : await request.arrayBuffer();
    
    const headers = new Headers();
    headers.set("accept", "application/json");
    
    const ct = request.headers.get("content-type");
    if (ct) headers.set("content-type", ct);

    // Auth headers
    headers.set("x-api-key", apiKey);
    headers.set("authorization", `Bearer ${apiKey}`);

    const upstreamRes = await fetch(upstreamUrl, {
      method,
      headers,
      body: bodyBuf,
    });

    const upstreamContentType = upstreamRes.headers.get("content-type") || "";
    const upstreamText = await upstreamRes.text();

    console.log(`[NCB Proxy] Upstream Status: ${upstreamRes.status}`);
    console.log(`[NCB Proxy] Upstream Content-Type: ${upstreamContentType}`);

    // Try to return the upstream response as JSON
    try {
      const parsed = JSON.parse(upstreamText);
      return json(parsed, upstreamRes.status);
    } catch {
      // If parsing fails, return the text wrapped in JSON for debugging
      return json({
        status: upstreamRes.ok ? "success" : "failed",
        upstreamStatus: upstreamRes.status,
        upstreamContentType,
        data: upstreamText.slice(0, 1000)
      }, upstreamRes.status);
    }

  } catch (err) {
    console.error(`[NCB Proxy] Fatal Error:`, err);
    return json({
      status: "failed",
      error: "Proxy internal error",
      message: String(err)
    }, 500);
  }
}