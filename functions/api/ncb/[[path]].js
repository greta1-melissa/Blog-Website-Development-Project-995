/**
 * Cloudflare Pages Function: NoCodeBackend Catch-all Proxy
 * Route: /api/ncb/*
 */
export async function onRequest(context) {
  try {
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

    // 1. Resolve & Validate Configuration
    const ncbBase = env.NCB_BASE_URL || "https://nocodebackend.com/api/v1";
    const instance = env.NCB_INSTANCE || env.NCB_INSTANCE_ID || env.VITE_NCB_INSTANCE_ID;
    const apiKey = env.NCB_API_KEY || env.VITE_NCB_API_KEY;

    const missing = [];
    if (!ncbBase) missing.push("NCB_BASE_URL");
    if (!instance) missing.push("NCB_INSTANCE");

    if (missing.length > 0) {
      return new Response(
        JSON.stringify({ 
          status: "failed", 
          reason: "Missing env var", 
          missing 
        }), 
        { status: 500, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
      );
    }

    const pathSegments = params.path || [];
    const pathStr = pathSegments.join("/");
    
    // 2. Construct Target URL
    let targetPath = pathStr;
    if (!pathStr.includes(`instance/${instance}`)) {
      targetPath = `instance/${instance}/${pathStr}`;
    }

    const cleanBase = ncbBase.replace(/\/$/, "");
    const targetUrl = new URL(`${cleanBase}/${targetPath}`);

    // Map query params from request URL
    const incomingUrl = new URL(request.url);
    incomingUrl.searchParams.forEach((val, key) => {
      if (key !== "_t") targetUrl.searchParams.set(key, val);
    });

    // 3. Prepare Headers
    const headers = new Headers(request.headers);
    if (apiKey) {
      headers.set("x-api-key", apiKey);
      headers.set("Authorization", `Bearer ${apiKey}`);
    }
    headers.delete("Host");
    headers.set("Accept", "application/json");

    // 4. Handle Body (Crucial: Never call request.json() on GET)
    let body = null;
    if (!["GET", "HEAD"].includes(request.method)) {
      body = await request.text();
    }

    // 5. Fetch from Upstream
    const response = await fetch(targetUrl.toString(), {
      method: request.method,
      headers: headers,
      body: body,
      redirect: "follow"
    });

    const contentType = response.headers.get("content-type") || "";

    // 6. Handle Non-JSON Responses
    if (!contentType.includes("application/json") && response.status !== 204) {
      const text = await response.text();
      return new Response(
        JSON.stringify({
          status: "failed",
          reason: "Upstream error",
          upstreamUrl: targetUrl.toString(),
          upstreamStatus: response.status,
          upstreamContentType: contentType,
          upstreamPreview: text.substring(0, 250)
        }),
        { 
          status: 502,
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
    // Top-level catch to prevent 502 crashes
    return new Response(
      JSON.stringify({ 
        status: "failed",
        reason: "Internal Proxy Crash", 
        message: err.message 
      }), 
      { status: 500, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
    );
  }
}