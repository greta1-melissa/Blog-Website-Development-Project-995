export async function onRequest({ env }) {
  const instance = env.NCB_INSTANCE || env.NCB_INSTANCE_ID || env.VITE_NCB_INSTANCE || env.VITE_NCB_INSTANCE_ID;
  const apiKey = env.NCB_API_KEY || env.VITE_NCB_API_KEY;
  
  return new Response(
    JSON.stringify({
      ok: true,
      route: "/api/ncb/health",
      config: {
        hasInstance: !!instance,
        hasKey: !!apiKey,
        instanceId: instance ? `${instance.substring(0, 5)}...` : null
      }
    }, null, 2),
    { headers: { "Content-Type": "application/json" } }
  );
}