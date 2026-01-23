export async function onRequestGet(context) {
  const { params, env } = context;
  const table = params.table;

  // Search for the instance ID in environment variables
  const instanceId = env.NCB_INSTANCE_ID || env.NCB_INSTANCE || env.VITE_NCB_INSTANCE_ID;
  const apiKey = env.NCB_API_KEY || env.VITE_NCB_API_KEY;

  if (!instanceId) {
    return new Response(JSON.stringify({ error: "Missing NCB Instance ID" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  const ncbUrl = `https://nocodebackend.com/api/v1/instance/${instanceId}/read/${table}`;

  try {
    const response = await fetch(ncbUrl, {
      headers: {
        ...(apiKey ? { "x-api-key": apiKey } : {})
      }
    });

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}