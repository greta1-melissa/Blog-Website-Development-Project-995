/**
 * Cloudflare Pages Function: NCB Read Proxy
 * Route: /api/ncb/read/[table]
 */
export async function onRequest(context) {
  try {
    const { request, params, env } = context;
    const table = params.table;

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

    // 2. Construct Target URL
    const cleanBase = ncbBase.replace(/\/$/, "");
    const ncbUrl = new URL(`${cleanBase}/instance/${instance}/read/${table}`);

    // Map query parameters from the incoming request
    const incomingUrl = new URL(request.url);
    incomingUrl.searchParams.forEach((value, key) => {
      // Exclude cache busters or internal params if necessary
      if (key !== "_t") {
        ncbUrl.searchParams.set(key, value);
      }
    });

    // 3. Prepare Headers
    const headers = {
      "Accept": "application/json",
      ...(apiKey ? { "x-api-key": apiKey, "Authorization": `Bearer ${apiKey}` } : {})
    };

    // 4. Fetch from Upstream
    const response = await fetch(ncbUrl.toString(), {
      method: "GET", // Read is always GET in this specific file
      headers: headers
    });

    const contentType = response.headers.get("content-type") || "";
    
    // 5. Handle Non-JSON Responses
    if (!contentType.includes("application/json")) {
      const text = await response.text();
      return new Response(
        JSON.stringify({
          status: "failed",
          reason: "Upstream error",
          upstreamUrl: ncbUrl.toString(),
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

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });

  } catch (error) {
    // Top-level catch to prevent 502 crashes
    return new Response(
      JSON.stringify({ 
        status: "failed",
        reason: "Internal Proxy Crash", 
        message: error.message 
      }), 
      { status: 500, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
    );
  }
}