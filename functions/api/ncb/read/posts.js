function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" }
  });
}

export async function onRequest({ request, env }) {
  try {
    const url = new URL(request.url);

    const base = (env.NCB_BASE_URL || "").replace(/\/$/, "");
    const instance = env.NCB_INSTANCE || "";
    const apiKey = env.NCB_API_KEY || "";

    if (!base || !instance) {
      return json({ ok: false, error: "Missing NCB_BASE_URL or NCB_INSTANCE" });
    }

    const upstream = `${base}/${instance}/read/posts`;

    const res = await fetch(upstream, {
      method: "GET",
      headers: {
        "accept": "application/json",
        "x-api-key": apiKey,
        "authorization": `Bearer ${apiKey}`
      }
    });

    const text = await res.text();

    let parsed = null;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      console.warn("JSON parse failed", e);
    }

    return json({
      ok: res.ok,
      upstreamStatus: res.status,
      upstreamPreview: parsed ? undefined : text.slice(0, 250),
      data: parsed ?? text
    });

  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}