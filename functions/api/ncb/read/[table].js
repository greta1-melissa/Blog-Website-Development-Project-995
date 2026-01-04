/**
 * Cloudflare Pages Function: NoCodeBackend Read Proxy
 * Route: /api/ncb/read/[table]
 * 
 * Injects the Instance parameter server-side to ensure NoCodeBackend
 * read requests succeed even if parameters are missing from the frontend.
 */

export async function onRequest({ params, env }) {
  const table = params.table;

  // Resolve Instance from environment variables
  const instance =
    env.VITE_NCB_INSTANCE ||
    env.VITE_NCB_INSTANCE_ID ||
    env.NCB_INSTANCE;

  if (!instance) {
    return new Response(
      JSON.stringify({ error: "Missing NCB Instance" }),
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }

  // Construct target URL with injected Instance parameter
  // We use the direct NoCodeBackend API endpoint for read operations
  const url = `https://api.nocodebackend.com/read/${table}?Instance=${instance}`;

  try {
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${env.NCB_API_KEY || env.VITE_NCB_API_KEY}`
      }
    });

    const body = await res.text();

    return new Response(body, {
      status: res.status,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*" 
      }
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: "Internal Proxy Error", details: e.message }),
      { 
        status: 502,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}