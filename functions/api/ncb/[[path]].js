/**
 * Robust NoCodeBackend (NCB) Proxy for Cloudflare Pages
 * 
 * Features:
 * 1. Strict server-side environment variable usage
 * 2. Multi-pattern URL resolution for flexible API routing
 * 3. Fallback logic for 'read' vs 'readAll' endpoints
 * 4. Crash-proof JSON error reporting
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
    
    // 1. Extract Server-Side Env Vars
    const base = env.NCB_BASE_URL || "";
    const instance = env.NCB_INSTANCE || "";
    const apiKey = env.NCB_API_KEY || "";

    // 2. Resolve requested subpath
    const rawPath = params?.path;
    const subpath = Array.isArray(rawPath) ? rawPath.join("/") : (rawPath || "");

    // 3. Health Check / Root Endpoint
    if (!subpath || subpath === "health") {
      return json({
        ok: true,
        status: "operational",
        endpoint: "/api/ncb",
        config: {
          hasBase: !!base,
          hasInstance: !!instance,
          hasKey: !!apiKey
        }
      });
    }

    if (!base || !instance) {
      return json({
        ok: false,
        error: "Missing NCB_BASE_URL or NCB_INSTANCE in server environment",
        details: "Ensure NCB_BASE_URL and NCB_INSTANCE are set in Cloudflare Pages dashboard."
      }, 500);
    }

    const cleanBase = base.replace(/\/$/, "");
    
    // 4. Generate candidate URL patterns
    const patterns = [
      `${cleanBase}/${instance}/${subpath}`,
      `${cleanBase}/${instance}/api/${subpath}`,
      `${cleanBase}/api/${instance}/${subpath}`
    ];

    // Special handling for read/ -> readAll/ transformation
    if (subpath.startsWith("read/")) {
      const readAllPath = subpath.replace("read/", "readAll/");
      patterns.push(`${cleanBase}/${instance}/${readAllPath}`);
      patterns.push(`${cleanBase}/${instance}/api/${readAllPath}`);
    }

    // 5. Prepare Request Body & Headers
    const method = request.method.toUpperCase();
    const isBodyAllowed = !["GET", "HEAD"].includes(method);
    const bodyBuffer = isBodyAllowed ? await request.arrayBuffer() : null;

    const commonHeaders = {
      "Accept": "application/json",
      "x-api-key": apiKey
    };

    const requestContentType = request.headers.get("content-type");
    if (requestContentType) {
      commonHeaders["Content-Type"] = requestContentType;
    }

    // 6. Try URL patterns sequentially
    let lastResponse = null;
    let lastError = null;
    let lastUrlUsed = "";
    const triedUrls = [];

    for (const pattern of patterns) {
      const targetUrl = new URL(pattern);
      
      // Forward original query parameters
      url.searchParams.forEach((v, k) => {
        targetUrl.searchParams.set(k, v);
      });

      const currentUrl = targetUrl.toString();
      triedUrls.push(currentUrl);

      try {
        const response = await fetch(currentUrl, {
          method,
          headers: commonHeaders,
          body: bodyBuffer
        });

        lastResponse = response;
        lastUrlUsed = currentUrl;

        // If we get a successful response or a definitive 400/500 from the app, 
        // we stop. If it's a 404, we try the next pattern.
        if (response.status !== 404) {
          break;
        }
      } catch (err) {
        lastError = err;
        console.error(`Fetch failed for ${currentUrl}:`, err);
      }
    }

    if (!lastResponse) {
      return json({
        ok: false,
        error: "Failed to connect to any NCB upstream pattern",
        triedUrls,
        lastError: lastError ? String(lastError) : "No response"
      }, 502);
    }

    // 7. Process Upstream Response
    const upstreamText = await lastResponse.text();
    let parsedJson = null;
    try {
      parsedJson = JSON.parse(upstreamText);
    } catch (e) {
      parsedJson = null;
    }

    // 8. Return Standardized Output
    if (!lastResponse.ok) {
      return json({
        ok: false,
        error: "Upstream NCB request failed",
        upstreamStatus: lastResponse.status,
        upstreamUrlUsed: lastUrlUsed,
        upstreamPreview: upstreamText.slice(0, 250),
        upstreamJson: parsedJson,
        triedUrls
      }, 200); // Return 200 to ensure client gets the JSON body
    }

    return json({
      ok: true,
      upstreamStatus: lastResponse.status,
      data: parsedJson ?? upstreamText,
      url: lastUrlUsed
    });

  } catch (err) {
    return json({
      ok: false,
      error: "Cloudflare Function Exception",
      message: String(err),
      stack: err.stack
    }, 500);
  }
}