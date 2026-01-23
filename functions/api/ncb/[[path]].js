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

  const baseRaw =
    env.NCB_BASE_URL ||
    env.VITE_NCB_BASE_URL ||
    env.VITE_NCB_URL ||
    "https://api.nocodebackend.com";

  const base = String(baseRaw).trim().replace(/\/+$/, "");
  const instance = String(
    env.NCB_INSTANCE || env.VITE_NCB_INSTANCE || env.VITE_NCB_INSTANCE_ID || ""
  ).trim();

  const apiKey = String(env.NCB_API_KEY || "").trim();

  const relPath = Array.isArray(params.path)
    ? params.path.join("/")
    : String(params.path || "").replace(/^\/+/, "");

  const method = request.method.toUpperCase();

  // Read body ONCE so we can reuse it in multiple attempts
  const bodyBuf =
    method === "GET" || method === "HEAD" ? null : await request.arrayBuffer();

  if (!instance || !apiKey) {
    console.log("[NCB] Missing env vars", {
      base,
      instance,
      hasKey: !!apiKey,
    });

    return json(
      {
        ok: false,
        error: "Missing server env vars for NCB",
        expected: ["NCB_BASE_URL", "NCB_INSTANCE", "NCB_API_KEY"],
        have: {
          NCB_BASE_URL: base || null,
          NCB_INSTANCE: instance || null,
          NCB_API_KEY_present: !!apiKey,
        },
      },
      200
    );
  }

  // Try multiple upstream patterns (we’ll see which one works)
  const candidates = [
    `${base}/${instance}/${relPath}`,
    `${base}/api/${instance}/${relPath}`,
    `${base}/api/v1/${instance}/${relPath}`,
    `${base}/v1/${instance}/${relPath}`,
  ];

  const attempts = [];

  for (const upstreamBase of candidates) {
    const upstreamUrl = upstreamBase + url.search;

    try {
      const headers = new Headers();

      // Force JSON
      headers.set("accept", "application/json");

      // Keep content-type for POST/PUT
      const ct = request.headers.get("content-type");
      if (ct) headers.set("content-type", ct);

      // Auth headers (NCB can vary; we send both)
      headers.set("x-api-key", apiKey);
      headers.set("authorization", `Bearer ${apiKey}`);

      const upstreamRes = await fetch(upstreamUrl, {
        method,
        headers,
        body: bodyBuf,
      });

      const upstreamContentType = upstreamRes.headers.get("content-type") || "";
      const upstreamText = await upstreamRes.text();
      const sample = upstreamText.slice(0, 250);

      console.log("[NCB] Attempt result", {
        upstreamUrl,
        status: upstreamRes.status,
        upstreamContentType,
      });

      attempts.push({
        upstreamUrl,
        status: upstreamRes.status,
        upstreamContentType,
        sample,
      });

      // Try parse JSON even if content-type is wrong
      let parsed = null;
      try {
        parsed = JSON.parse(upstreamText);
      } catch (err) {
        console.warn("JSON parse failed", err);
      }

      if (parsed !== null) {
        return json(
          {
            ok: upstreamRes.ok,
            upstreamUrl,
            upstreamStatus: upstreamRes.status,
            data: parsed,
            attempts,
          },
          200
        );
      }

      // If not JSON, return debug payload anyway (still JSON response)
      if (upstreamRes.ok) {
        return json(
          {
            ok: true,
            upstreamUrl,
            upstreamStatus: upstreamRes.status,
            upstreamContentType,
            upstreamTextPreview: sample,
            attempts,
          },
          200
        );
      }
    } catch (err) {
      console.log("[NCB] Fetch error", { upstreamUrl, err: String(err) });

      attempts.push({
        upstreamUrl,
        status: "fetch_error",
        error: String(err),
      });
    }
  }

  // If we reach here, everything failed — return JSON debug instead of 502 HTML
  return json(
    {
      ok: false,
      error: "All upstream attempts failed or returned non-JSON",
      base,
      instance,
      relPath,
      method,
      attempts,
    },
    200
  );
}