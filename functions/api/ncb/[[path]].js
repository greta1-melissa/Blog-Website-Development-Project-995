/**
 * Cloudflare Pages Function: NoCodeBackend Proxy
 * 
 * Route: /api/ncb/*
 * 
 * This proxy ensures that the NCB Instance ID is always injected from 
 * server-side environment variables, preventing failures due to missing 
 * client-side parameters.
 */
export async function onRequest(context) {
  const { request, env, params } = context;

  // 1. Handle CORS Preflight
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
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

    // 3. ENFORCE INSTANCE PARAMETER (Server Side Injection)
    // Priority: VITE_NCB_INSTANCE > VITE_NCB_INSTANCE_ID > NCB_INSTANCE
    const instance = 
      env.VITE_NCB_INSTANCE || 
      env.VITE_NCB_INSTANCE_ID || 
      env.NCB_INSTANCE;

    if (!instance) {
      console.error("[NCB Proxy] Missing NCB Instance in environment variables.");
      return new Response(JSON.stringify({ 
        error: "Missing NCB Instance",
        details: "Server configuration error: Instance ID not found in environment."
      }), { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Force override/injection of the Instance parameter
    targetUrl.searchParams.set('Instance', instance);

    // 4. Prepare Headers & AUTH RESOLUTION
    const headers = new Headers(request.headers);
    const ncbApiKey = env.NCB_API_KEY || env.VITE_NCB_API_KEY;
    
    if (!ncbApiKey) {
      return new Response(JSON.stringify({ error: "Missing NCB API key" }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    headers.set('Authorization', `Bearer ${ncbApiKey}`);
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
        instance: instance
      }), { 
        status: response.status, 
        headers: {
          ...Object.fromEntries(newHeaders),
          "Content-Type": "application/json"
        }
      });
    }

    // Buffer JSON bodies for reliable client-side parsing
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const jsonText = await response.text();
      return new Response(jsonText, {
        status: response.status,
        headers: newHeaders
      });
    }

    return new Response(response.body, {
      status: response.status,
      headers: newHeaders
    });

  } catch (err) {
    console.error("Proxy Internal Error:", err);
    return new Response(JSON.stringify({
      status: 'error',
      message: `Proxy Internal Error: ${err.message}`
    }), { 
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}