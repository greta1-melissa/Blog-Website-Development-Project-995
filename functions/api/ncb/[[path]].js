/**
 * Cloudflare Pages Function: NoCodeBackend Proxy
 *
 * This function intercepts requests to /api/ncb/* and forwards them to the real NCB API.
 * It securely injects the Authorization header server-side.
 * 
 * Route: /api/ncb/*
 */
export async function onRequest(context) {
  const { request, env, params } = context;

  // 1. Handle CORS Preflight
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  try {
    // 2. Resolve Target URL
    // Default to production API if env var is missing
    const ncbBase = env.NCB_URL || 'https://api.nocodebackend.com';
    const pathSegments = params.path || [];
    const pathStr = pathSegments.join('/');
    
    // Construct the destination URL
    const targetUrl = new URL(`${ncbBase}/${pathStr}`);
    
    // Copy all query parameters from the original request (e.g., ?Instance=...)
    const reqUrl = new URL(request.url);
    reqUrl.searchParams.forEach((val, key) => {
      targetUrl.searchParams.append(key, val);
    });

    // 3. Prepare Headers
    const headers = new Headers(request.headers);
    
    // SECURITY: Inject the Secret Key from Server Env
    const secretKey = env.NCB_API_KEY || env.VITE_NCB_API_KEY;
    if (!secretKey) {
      return new Response(JSON.stringify({ 
        status: 'error', 
        message: 'Proxy Error: Missing NCB_API_KEY on server.' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Overwrite/Add Authorization header
    headers.set('Authorization', `Bearer ${secretKey}`);
    // Ensure Host header is not forwarded
    headers.delete('Host');

    // 4. Body Buffering
    // Read the body once into a variable so we don't pass a stream that might fail or be empty.
    let rawBody = null;
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      try {
        rawBody = await request.text();
      } catch (e) {
        console.error("Proxy: Failed to read request body", e);
      }
    }

    // 5. Forward the Request
    const proxyReq = new Request(targetUrl.toString(), {
      method: request.method,
      headers: headers,
      body: rawBody, // Use the buffered text body
      redirect: 'follow'
    });

    const response = await fetch(proxyReq);

    // 6. Handle Response
    const newHeaders = new Headers(response.headers);
    newHeaders.set("Access-Control-Allow-Origin", "*");

    // ERROR HANDLING: If upstream fails, capture details for debugging
    if (!response.ok) {
      const errorText = await response.text();
      // Return a structured JSON error even if upstream returned HTML/Text
      return new Response(JSON.stringify({
        upstreamStatus: response.status,
        upstreamStatusText: response.statusText,
        upstreamBody: errorText,
        path: targetUrl.pathname,
        method: request.method,
        proxyMessage: "Upstream NCB API Error",
        // Debug Fields
        debugBodyLength: rawBody ? rawBody.length : 0,
        debugContentType: request.headers.get("content-type"),
        debugHasAuthHeader: headers.has("Authorization")
      }), {
        status: response.status, // Keep original status code
        statusText: response.statusText,
        headers: {
          ...Object.fromEntries(newHeaders),
          "Content-Type": "application/json"
        }
      });
    }

    // FIX: Handle Null Body Status Codes (204, 304, etc.)
    // These status codes MUST NOT have a body, or fetch will throw an error.
    if (
      response.status === 204 ||
      response.status === 304 ||
      response.status === 205 ||
      response.status === 101 ||
      !response.body
    ) {
      return new Response(null, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders
      });
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders
    });

  } catch (err) {
    return new Response(JSON.stringify({ 
      status: 'error', 
      message: `Proxy Internal Error: ${err.message}` 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}