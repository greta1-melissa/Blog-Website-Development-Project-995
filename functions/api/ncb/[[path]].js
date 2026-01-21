/**
 * Cloudflare Pages Function: NoCodeBackend Proxy
 * Route: /api/ncb/*
 */
export async function onRequest(context) {
  const { request, env, params } = context;

  // Handle CORS Preflight
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
    const ncbBase = env.NCB_URL || "https://api.nocodebackend.com";
    const pathSegments = params.path || [];
    const pathStr = pathSegments.join("/");
    const targetUrl = new URL(`${ncbBase}/${pathStr}`);

    // Copy query parameters, excluding cache-busters that break NCB SQL
    const reqUrl = new URL(request.url);
    reqUrl.searchParams.forEach((val, key) => {
      if (key === "_t") return; 
      targetUrl.searchParams.set(key, val);
    });

    // Resolve Instance ID (Priority: VITE_ > Direct Env)
    const instance =
      env.VITE_NCB_INSTANCE ||
      env.VITE_NCB_INSTANCE_ID ||
      env.NCB_INSTANCE ||
      env.NCB_INSTANCE_ID ||
      env.NCB_INSTANCE_ID_PROD; // Added extra variant for production reliability

    if (!instance) {
      return new Response(
        JSON.stringify({
          error: "Missing NCB Instance",
          details: "Check Cloudflare Pages Environment Variables for NCB_INSTANCE_ID",
        }),
        { status: 500, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
      );
    }

    targetUrl.searchParams.set("Instance", instance);

    const headers = new Headers(request.headers);
    const ncbApiKey = env.VITE_NCB_API_KEY || env.NCB_API_KEY;

    if (ncbApiKey) {
      headers.set("Authorization", `Bearer ${ncbApiKey}`);
    }
    
    headers.delete("Host");

    let rawBody = null;
    if (request.method !== "GET" && request.method !== "HEAD") {
      try {
        rawBody = await request.text();
      } catch (e) {
        // Body reading failed, likely empty or invalid
        console.warn("Proxy: Failed to read request body", e);
      }
    }

    const proxyReq = new Request(targetUrl.toString(), {
      method: request.method,
      headers: headers,
      body: rawBody,
      redirect: "follow",
    });

    const response = await fetch(proxyReq);
    const newHeaders = new Headers(response.headers);
    newHeaders.set("Access-Control-Allow-Origin", "*");

    if ([101, 204, 205, 304].includes(response.status)) {
      return new Response(null, { status: response.status, headers: newHeaders });
    }

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(
        JSON.stringify({
          upstreamStatus: response.status,
          upstreamBody: errorText,
          proxyTarget: targetUrl.pathname
        }),
        { status: response.status, headers: { ...Object.fromEntries(newHeaders), "Content-Type": "application/json" } }
      );
    }

    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const jsonText = await response.text();
      return new Response(jsonText, { status: response.status, headers: newHeaders });
    }

    return new Response(response.body, { status: response.status, headers: newHeaders });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
  }
}