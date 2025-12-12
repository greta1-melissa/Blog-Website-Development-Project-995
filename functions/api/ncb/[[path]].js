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
    // We check both naming conventions to be safe
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
    
    // Ensure Host header is not forwarded (Cloudflare/Fetch handles this)
    headers.delete('Host');

    // 4. Forward the Request
    const proxyReq = new Request(targetUrl.toString(), {
      method: request.method,
      headers: headers,
      body: request.body,
      redirect: 'follow'
    });

    const response = await fetch(proxyReq);

    // 5. Return Response
    // We clone the response to modify headers if needed (mostly for CORS)
    const newHeaders = new Headers(response.headers);
    newHeaders.set("Access-Control-Allow-Origin", "*");

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