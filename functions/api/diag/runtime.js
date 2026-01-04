/**
 * Cloudflare Pages Function: Runtime Diagnostics
 * 
 * Provides a safe way to verify environment variable presence 
 * and configuration status without exposing secret values.
 * 
 * Route: /api/diag/runtime
 */
export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  // Determine current instance from various possible env sources
  const instance = env.VITE_NCB_INSTANCE || env.NCB_INSTANCE || "";

  const diagnostics = {
    ok: true,
    hasNCB_API_KEY: !!env.NCB_API_KEY,
    hasVITE_NCB_API_KEY: !!env.VITE_NCB_API_KEY,
    hasVITE_NCB_INSTANCE: !!env.VITE_NCB_INSTANCE,
    instance: instance,
    hostname: url.hostname,
    timestamp: new Date().toISOString()
  };

  return new Response(JSON.stringify(diagnostics, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-store, no-cache, must-revalidate"
    }
  });
}