/**
 * Cloudflare Pages Function: NCB Read Proxy
 * Route: /api/ncb/read/[table]
 */
export async function onRequestGet(context) {
  const { params, env } = context;
  const table = params.table;

  // 1. Resolve Configuration using server-side env vars (Priority: Requested > Fallbacks)
  const ncbBase = env.NCB_BASE_URL || "https://nocodebackend.com/api/v1";
  const instance = env.NCB_INSTANCE || env.NCB_INSTANCE_ID || env.VITE_NCB_INSTANCE_ID;
  const apiKey = env.NCB_API_KEY || env.VITE_NCB_API_KEY;

  if (!instance) {
    return new Response(
      JSON.stringify({ 
        error: "Missing NCB Instance ID", 
        details: "Configure NCB_INSTANCE in Cloudflare dashboard." 
      }), 
      { status: 400, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
    );
  }

  // Ensure ncbBase doesn't have trailing slash for consistency
  const cleanBase = ncbBase.replace(/\/$/, "");
  const ncbUrl = `${cleanBase}/instance/${instance}/read/${table}`;

  try {
    const response = await fetch(ncbUrl, {
      headers: {
        ...(apiKey ? { "x-api-key": apiKey, "Authorization": `Bearer ${apiKey}` } : {})
      }
    });

    const contentType = response.headers.get("content-type") || "";
    
    // 2. Handle Non-JSON Responses (Fixes the "Unexpected token <" error)
    if (!contentType.includes("application/json")) {
      const text = await response.text();
      return new Response(
        JSON.stringify({
          error: "Upstream returned non-JSON content",
          upstreamUrl: ncbUrl,
          upstreamStatus: response.status,
          upstreamContentType: contentType,
          preview: text.substring(0, 250)
        }),
        { 
          status: 502, // Bad Gateway
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
    return new Response(
      JSON.stringify({ 
        error: "Proxy internal failure", 
        message: error.message,
        target: ncbUrl
      }), 
      { status: 500, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
    );
  }
}