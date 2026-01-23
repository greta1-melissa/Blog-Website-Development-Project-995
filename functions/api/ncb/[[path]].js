function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "access-control-allow-origin": "*",
    },
  });
}

export async function onRequest(context) {
  const { request, params } = context;

  try {
    const env = context.env || {};

    const base = (env.NCB_BASE_URL || "https://api.nocodebackend.com").replace(/\/$/, "");
    const instance = env.NCB_INSTANCE;
    const apiKey = env.NCB_API_KEY;

    if (!instance) return json({ status: "failed", error: "Missing NCB_INSTANCE" }, 500);
    if (!apiKey) return json({ status: "failed", error: "Missing NCB_API_KEY" }, 500);

    let path = params?.path;
    if (Array.isArray(path)) path = path.join("/");
    path = (path || "").toString();

    const urlObj = new URL(request.url);
    const upstreamUrl = `${base}/${instance}/${path}${urlObj.search}`;

    const upstreamRes = await fetch(upstreamUrl, {
      method: request.method,
      headers: { "X-API-Key": apiKey },
    });

    const ct = upstreamRes.headers.get("content-type") || "";
    const text = await upstreamRes.text();

    if (ct.includes("application/json")) {
      try {
        return json(JSON.parse(text), upstreamRes.status);
      } catch {
        return json({
          status: "failed",
          error: "Upstream JSON parse failed",
          upstreamUrl,
          upstreamStatus: upstreamRes.status,
          sample: text.slice(0, 250),
        }, 502);
      }
    }

    return json({
      status: "failed",
      error: "Upstream returned non-JSON",
      upstreamUrl,
      upstreamStatus: upstreamRes.status,
      contentType: ct,
      sample: text.slice(0, 250),
    }, upstreamRes.status >= 400 ? upstreamRes.status : 502);

  } catch (err) {
    return json({
      status: "failed",
      error: "Function crashed",
      message: String(err?.message || err),
    }, 500);
  }
}