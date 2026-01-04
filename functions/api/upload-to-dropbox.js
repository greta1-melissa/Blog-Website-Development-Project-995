/**
 * Cloudflare Pages Function: Dropbox Upload API
 * 
 * Performs a 3-step process:
 * 1. Refreshes OAuth2 access token using Refresh Token flow.
 * 2. Uploads file to /Apps/BangtanMom/uploads.
 * 3. Creates/Retrieves a shared link.
 * 4. Returns a PROXY URL to prevent direct Dropbox rendering.
 * 
 * Route: /api/upload-to-dropbox
 */
export async function onRequest(context) {
  const { request, env } = context;

  // 1. Handle CORS Preflight
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { 
      status: 405,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    // 2. Validate Environment
    const { DROPBOX_APP_KEY, DROPBOX_APP_SECRET, DROPBOX_REFRESH_TOKEN } = env;
    if (!DROPBOX_APP_KEY || !DROPBOX_APP_SECRET || !DROPBOX_REFRESH_TOKEN) {
      throw new Error("Missing Dropbox credentials in environment variables.");
    }

    // 3. Extract File from Request
    const formData = await request.formData();
    const file = formData.get('file');
    if (!file) throw new Error("No file provided in request");

    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const fileBuffer = await file.arrayBuffer();

    // 4. Step 1: Get Access Token (Refresh Flow)
    const tokenParams = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: DROPBOX_REFRESH_TOKEN,
      client_id: DROPBOX_APP_KEY,
      client_secret: DROPBOX_APP_SECRET,
    });

    const tokenRes = await fetch('https://api.dropbox.com/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: tokenParams.toString(),
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      throw new Error(`Token Refresh Failed: ${err}`);
    }
    const { access_token } = await tokenRes.json();

    // 5. Step 2: Upload File to Dropbox
    const uploadRes = await fetch('https://content.dropboxapi.com/2/files/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Dropbox-API-Arg': JSON.stringify({
          path: `/uploads/${fileName}`,
          mode: 'add',
          autorename: true,
          mute: false
        }),
        'Content-Type': 'application/octet-stream'
      },
      body: fileBuffer
    });

    if (!uploadRes.ok) {
      const err = await uploadRes.text();
      throw new Error(`Upload Failed: ${err}`);
    }
    const uploadData = await uploadRes.json();
    const filePath = uploadData.path_display;

    // 6. Step 3: Create Shared Link
    const shareRes = await fetch('https://api.dropboxapi.com/2/sharing/create_shared_link_with_settings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        path: filePath,
        settings: { requested_visibility: 'public' }
      })
    });

    let sharedUrl = '';
    if (shareRes.status === 409) {
      const listRes = await fetch('https://api.dropboxapi.com/2/sharing/list_shared_links', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ path: filePath, direct_only: true })
      });
      const listData = await listRes.json();
      sharedUrl = listData.links[0].url;
    } else if (!shareRes.ok) {
      const err = await shareRes.text();
      throw new Error(`Sharing Failed: ${err}`);
    } else {
      const shareData = await shareRes.json();
      sharedUrl = shareData.url;
    }

    // 7. SECURE RESPONSE CONTRACT
    // We return a proxy URL that points back to our own worker.
    // This worker will handle the Dropbox stream server-side.
    const proxyUrl = `/api/media/dropbox?url=${encodeURIComponent(sharedUrl)}`;

    return new Response(JSON.stringify({
      success: true,
      publicUrl: sharedUrl, // Original Dropbox link for reference only
      proxyUrl: proxyUrl,   // THE LINK FRONTEND MUST USE
      fileName: fileName
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });

  } catch (error) {
    console.error(`[Upload API Error]: ${error.message}`);
    return new Response(JSON.stringify({
      success: false,
      message: error.message
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
}