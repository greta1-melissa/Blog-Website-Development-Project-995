/**
 * Cloudflare Pages Function: NoCodeBackend Catch-all Proxy
 * Route: /api/ncb/*
 */
export async function onRequest(context) {
  const { request, env, params } = context;

  // Handle CORS
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type,Authorization,x-api-key",
      },
    });
  }

  try {
    // 1. Resolve Configuration
    const ncbBase = env.NCB_BASE_URL || "https://nocodebackend.com/api/v1";
    const instance = env.NCB_INSTANCE || env.NCB_INSTANCE_ID || env.VITE_NCB_INSTANCE_ID;
    const apiKey = env.NCB_API_KEY || env.VITE_NCB_API_KEY;

    if (!instance) {
      return new Response(
        JSON.stringify({ error: "Missing NCB Instance ID" }),
        { status: 500, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
      );
    }

    const pathSegments = params.path || [];
    const pathStr = pathSegments.join("/");
    
    // Construct Target URL
    // If the path already includes 'instance', use it as is, otherwise inject it
    let targetPath = pathStr;
    if (!pathStr.includes(`instance/${instance}`)) {
      targetPath = `instance/${instance}/${pathStr}`;
    }

    const cleanBase = ncbBase.replace(/\/$/, "");
    const targetUrl = new URL(`${cleanBase}/${targetPath}`);

    // Map query params
    const reqUrl = new URL(request.url);
    reqUrl.searchParams.forEach((val, key) => {
      if (key !== "_t") targetUrl.searchParams.set(key, val);
    });

    const headers = new Headers(request.headers);
    if (apiKey) {
      headers.set("x-api-key", apiKey);
      headers.set("Authorization", `Bearer ${apiKey}`);
    }
    headers.delete("Host");

    let body = null;
    if (!["GET", "HEAD"].includes(request.method)) {
      body = await request.text();
    }

    const response = await fetch(targetUrl.toString(), {
      method: request.method,
      headers: headers,
      body: body,
      redirect: "follow"
    });

    const contentType = response.headers.get("content-type") || "";

    // 2. Handle Non-JSON Responses
    if (!contentType.includes("application/json") && response.status !== 204) {
      const text = await response.text();
      return new Response(
        JSON.stringify({
          error: "Upstream returned non-JSON content",
          upstreamUrl: targetUrl.toString(),
          upstreamStatus: response.status,
          upstreamContentType: contentType,
          preview: text.substring(0, 250)
        }),
        { 
          status: response.status >= 400 ? response.status : 502,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
        }
      );
    }

    const resBody = response.status === 204 ? null : await response.text();
    
    return new Response(resBody, {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });

  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Proxy Exception", message: err.message }), 
      { status: 500, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
    );
  }
}