export async function onRequest(context) {
  const { request, env } = context;

  // CORS / preflight
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  const url = new URL(request.url);

  // Allow overriding instance via query param for debugging/migration:
  // /api/ncb/read/posts?instance=54230_bangtan_mom_blog_site
  const instance =
    url.searchParams.get("instance") ||
    env.VITE_NCB_INSTANCE ||
    env.NCB_INSTANCE ||
    "";

  const apiKey =
    env.NCB_API_KEY ||
    env.VITE_NCB_API_KEY ||
    "";

  // Use origin only (prevents accidentally embedding instance in the path)
  let ncbOrigin = "https://api.nocodebackend.com";
  try {
    if (env.NCB_URL) ncbOrigin = new URL(env.NCB_URL).origin;
  } catch (_) {
    // console.warn("Invalid NCB_URL, using default.");
  }

  if (!instance) {
    return jsonResponse(
      {
        ok: false,
        error: "Missing NCB instance. Set VITE_NCB_INSTANCE (or pass ?instance=...).",
        proxyVersion: "read-posts-explicit-v1",
      },
      500
    );
  }

  const triedUrls = [];

  // Try the modern patterns first (Instance in query string)
  const candidates = [
    `${ncbOrigin}/read/posts`,
    `${ncbOrigin}/api/read/posts`,
    `${ncbOrigin}/readAll/posts`,
    `${ncbOrigin}/api/readAll/posts`,
  ];

  for (const base of candidates) {
    const u = new URL(base);
    // Preserve any query params the user passed (except we ensure Instance)
    for (const [k, v] of url.searchParams.entries()) {
      if (k.toLowerCase() === "instance") continue; // our override param
      u.searchParams.set(k, v);
    }
    u.searchParams.set("Instance", instance);

    triedUrls.push(u.toString());

    try {
      const resp = await fetch(u.toString(), {
        method: "GET",
        headers: {
          "Accept": "application/json",
          ...(apiKey ? { "Authorization": apiKey } : {}),
        },
      });

      const contentType = resp.headers.get("content-type") || "";
      const bodyText = await resp.text();

      // If upstream succeeded, return wrapped success so frontend can unwrap reliably
      if (resp.ok) {
        let parsed = bodyText;
        if (contentType.includes("application/json")) {
          try {
            parsed = JSON.parse(bodyText);
          } catch (_) {
            // Not JSON, keep as text
          }
        }

        return jsonResponse(
          {
            ok: true,
            data: parsed,
            upstreamStatus: resp.status,
            upstreamUrlUsed: u.toString(),
            triedUrls,
            proxyVersion: "read-posts-explicit-v1",
          },
          200
        );
      }

      // Non-OK: keep trying the next candidate
    } catch (e) {
      // Network error: keep trying the next candidate
    }
  }

  // If all candidates failed:
  return jsonResponse(
    {
      ok: false,
      error: "All upstream URL patterns failed for posts.",
      upstreamStatus: 404,
      upstreamPreview: "Cannot GET /{instance}/read/posts usually means an old URL pattern is being used somewhere. This route forces the modern ?Instance= format.",
      triedUrls,
      proxyVersion: "read-posts-explicit-v1",
    },
    502
  );
}

function jsonResponse(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
    },
  });
}