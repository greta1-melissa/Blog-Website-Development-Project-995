/**
 * Canonical NoCodeBackend (NCB) Proxy for Cloudflare Pages
 * Handles all CRUD operations via a single robust catch-all handler.
 */

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      "Access-Control-Allow-Origin": "*"
    }
  });
}

export async function onRequest(context) {
  const { request, env, params } = context;

  try {
    const url = new URL(request.url);
    
    // 1. Extract Environment Variables
    const instance = env.NCB_INSTANCE || env.NCB_INSTANCE_ID || env.VITE_NCB_INSTANCE || env.VITE_NCB_INSTANCE_ID;
    const apiKey = env.NCB_API_KEY || env.VITE_NCB_API_KEY;
    
    // Ensure we only use the protocol and host from the NCB URL, dropping any pathname
    const rawBase = (env.NCB_URL || env.NCB_BASE_URL || "https://api.nocodebackend.com").trim();
    let ncbHost = "https://api.nocodebackend.com";
    try {
      const u = new URL(rawBase);
      ncbHost = `${u.protocol}//${u.host}`;
    } catch (e) {
      ncbHost = "https://api.nocodebackend.com";
    }

    // 2. Resolve requested path parts [operation, table, id]
    // Strip instance from the start of the path if it appears there
    let pathSegments = params?.path || [];
    if (instance && pathSegments[0] === instance) {
      pathSegments = pathSegments.slice(1);
    }
    
    const [operation, table, id] = pathSegments;

    // 3. Health Check / Root Endpoint
    if (!operation || operation === "health") {
      return json({
        ok: true,
        status: "operational",
        config: {
          hasInstance: !!instance,
          hasKey: !!apiKey,
          ncbHost
        }
      });
    }

    if (!instance || !apiKey) {
      return json({
        ok: false,
        error: "Missing NCB configuration (Instance or API Key) in environment variables."
      }, 500);
    }

    if (!table) {
      return json({ ok: false, error: "Missing table name in request path." }, 400);
    }

    // 4. Build Canonical Upstream URL
    // Format: https://api.nocodebackend.com/<operation>/<table>[/id]?Instance=<INSTANCE>
    let upstreamPath = `${operation}/${table}`;
    if (id) {
      upstreamPath += `/${id}`;
    }

    const targetUrl = new URL(`${ncbHost}/${upstreamPath}`);
    targetUrl.searchParams.set("Instance", instance);

    // Forward original query parameters (limit, offset, etc.)
    url.searchParams.forEach((v, k) => {
      const lowerK = k.toLowerCase();
      // Don't duplicate Instance; don't forward cache-busters like _t
      if (lowerK !== "instance" && lowerK !== "_t") {
        targetUrl.searchParams.set(k, v);
      }
    });

    const finalUrl = targetUrl.toString();

    // 5. Prepare Proxy Request
    const method = request.method.toUpperCase();
    const headers = {
      "Accept": "application/json",
      "Authorization": `Bearer ${apiKey}`
    };

    const contentType = request.headers.get("content-type");
    if (contentType) {
      headers["Content-Type"] = contentType;
    }

    // Read body if applicable
    let body = null;
    if (!["GET", "HEAD"].includes(method)) {
      body = await request.arrayBuffer();
    }

    // 6. Execute Upstream Request
    let response;
    try {
      response = await fetch(finalUrl, {
        method,
        headers,
        body
      });
    } catch (fetchErr) {
      return json({
        ok: false,
        error: "Failed to connect to NCB upstream server.",
        details: String(fetchErr)
      }, 502);
    }

    // 7. Process Response
    const responseText = await response.text();
    let responseJson = null;
    try {
      responseJson = JSON.parse(responseText);
    } catch (e) {
      responseJson = null;
    }

    // 8. Return Standardized Output
    if (!response.ok) {
      return json({
        ok: false,
        error: "Upstream NCB request failed.",
        upstreamStatus: response.status,
        upstreamUrlUsed: finalUrl,
        upstreamPreview: responseText.slice(0, 300)
      }, 200); // Return 200 so the client can parse the JSON error
    }

    return json({
      ok: true,
      data: responseJson ?? responseText,
      upstreamStatus: response.status,
      upstreamUrlUsed: finalUrl
    });

  } catch (err) {
    return json({
      ok: false,
      error: "Cloudflare Proxy Function Exception",
      message: String(err)
    }, 500);
  }
}