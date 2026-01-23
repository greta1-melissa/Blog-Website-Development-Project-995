export async function onRequest({ env }) {
  return new Response(
    JSON.stringify({
      ok: true,
      route: "/api/ncb/health",
      hasNCB_BASE_URL: !!env.NCB_BASE_URL,
      hasNCB_INSTANCE: !!env.NCB_INSTANCE,
      hasNCB_API_KEY: !!env.NCB_API_KEY
    }),
    { headers: { "content-type": "application/json" } }
  );
}