/** 
 * DEPRECATED – DO NOT USE
 * Status: 410 Gone
 * 
 * This endpoint has been decommissioned. 
 * Please use /api/upload-to-dropbox instead.
 */
export async function onRequest(context) {
  return new Response(
    JSON.stringify({
      error: "This endpoint is deprecated. Use /api/upload-to-dropbox instead."
    }), 
    {
      status: 410,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    }
  );
}