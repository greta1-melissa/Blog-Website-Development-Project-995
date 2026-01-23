export async function onRequest(context) {
  return new Response(
    JSON.stringify({
      status: "ok",
      message: "Functions are working",
      hasNCB_BASE_URL: !!context.env.NCB_BASE_URL,
      hasNCB_INSTANCE: !!context.env.NCB_INSTANCE,
      hasNCB_API_KEY: !!context.env.NCB_API_KEY
    }),
    { 
      headers: { 
        "Content-Type": "application/json",
        "Cache-Control": "no-store"
      } 
    }
  );
}