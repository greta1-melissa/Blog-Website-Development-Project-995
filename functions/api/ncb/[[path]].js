/**
 * Cloudflare Pages Function: NoCodeBackend Proxy
 * 
 * FAIL-SAFE: Automatically injects the default Instance ID if missing or empty.
 * This ensures incognito and authenticated sessions read the same data.
 * 
 * Route: /api/ncb/*
 */
export async function onRequest(context) {
  const { request, env, params } = context;
  
  // Canonical fallback instance
  const FALLBACK_INSTANCE = '54230_bangtan_mom_blog_site';

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
    const ncbBase = env.NCB_URL || 'https://api.nocodebackend.com';
    const pathSegments = params.path || [];
    const pathStr = pathSegments.join('/');
    
    // Construct the destination URL
    const targetUrl = new URL(`${ncbBase}/${pathStr}`);

    // Copy all query parameters from the original request
    const reqUrl = new URL(request.url);
    reqUrl.searchParams.forEach((val, key) => {
      targetUrl.searchParams.append(key, val);
    });

    // 3. ENFORCE INSTANCE PARAMETER (Server Side Fail-safe)
    // Rules:
    // - Check if Instance exists and is not an empty string.
    // - If missing/empty, use env.NCB_INSTANCE or env.VITE_NCB_INSTANCE or hardcoded fallback.
    const currentInstance = targetUrl.searchParams.get('Instance');
    if (!currentInstance || currentInstance.trim() === '') {
      const defaultInstance = env.NCB_INSTANCE || env.VITE_NCB_INSTANCE || FALLBACK_INSTANCE;
      targetUrl.searchParams.set('Instance', defaultInstance);
    }

    // 4. Prepare Headers
    const headers = new Headers(request.headers);
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

    headers.set('Authorization', `Bearer ${secretKey}`);
    headers.delete('Host');

    // 5. Body Buffering
    let rawBody = null;
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      try {
        rawBody = await request.text();
      } catch (e) {
        console.error("Proxy: Failed to read request body", e);
      }
    }

    // 6. Forward the Request
    const proxyReq = new Request(targetUrl.toString(), {
      method: request.method,
      headers: headers,
      body: rawBody,
      redirect: 'follow'
    });

    const response = await fetch(proxyReq);

    // 7. Handle Response
    const newHeaders = new Headers(response.headers);
    newHeaders.set("Access-Control-Allow-Origin", "*");

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(JSON.stringify({
        upstreamStatus: response.status,
        upstreamStatusText: response.statusText,
        upstreamBody: errorText,
        path: targetUrl.pathname,
        instance: targetUrl.searchParams.get('Instance'),
        method: request.method
      }), {
        status: response.status,
        headers: {
          ...Object.fromEntries(newHeaders),
          "Content-Type": "application/json"
        }
      });
    }

    if (response.status === 204 || response.status === 304 || !response.body) {
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