/**
 * Cloudflare Pages Function to handle file uploads to Dropbox.
 * Route: /api/upload-to-dropbox
 * 
 * STANDARDIZED: Returns exclusively proxy URLs for frontend consumption.
 */
export async function onRequest(context) {
  const { request, env } = context;

  // 1. CORS Preflight
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  // 2. Method Check
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ success: false, message: 'Method not allowed' }), {
      status: 405,
      headers: { "Content-Type": "application/json" }
    });
  }

  // 3. Auth Config Validation
  const { DROPBOX_APP_KEY, DROPBOX_APP_SECRET, DROPBOX_REFRESH_TOKEN } = env;
  if (!DROPBOX_APP_KEY || !DROPBOX_APP_SECRET || !DROPBOX_REFRESH_TOKEN) {
    return new Response(JSON.stringify({ success: false, message: 'Server Config Error: Missing Dropbox Credentials' }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    // 4. File Parsing
    const formData = await request.formData();
    const file = formData.get('file');
    if (!file) {
      return new Response(JSON.stringify({ success: false, message: 'No file provided in request' }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // 5. Get Access Token (Refresh Token Flow)
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
      const errText = await tokenRes.text();
      throw new Error(`Auth failed: ${tokenRes.status}`);
    }

    const { access_token } = await tokenRes.json();

    // 6. Upload File
    const filename = file.name || "upload.png";
    const safeFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const timestamp = Date.now();
    const uploadPath = `/uploads/${timestamp}_${safeFilename}`;
    const arrayBuffer = await file.arrayBuffer();

    const dbxArgs = {
      path: uploadPath,
      mode: 'add',
      autorename: true,
      mute: false,
      strict_conflict: false
    };

    const dbxResponse = await fetch('https://content.dropboxapi.com/2/files/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Dropbox-API-Arg': JSON.stringify(dbxArgs),
        'Content-Type': 'application/octet-stream'
      },
      body: arrayBuffer
    });

    if (!dbxResponse.ok) {
      throw new Error("Dropbox upload failed");
    }

    const dbxData = await dbxResponse.json();

    // 7. Create or Get Shared Link
    let publicUrl = '';
    const shareResponse = await fetch('https://api.dropboxapi.com/2/sharing/create_shared_link_with_settings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ path: dbxData.path_lower })
    });

    if (shareResponse.ok) {
      const shareData = await shareResponse.json();
      publicUrl = shareData.url;
    } else {
      const shareError = await shareResponse.json();
      if (shareError.error && shareError.error['.tag'] === 'shared_link_already_exists') {
        const listLinksResponse = await fetch('https://api.dropboxapi.com/2/sharing/list_shared_links', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ path: dbxData.path_lower })
        });
        if (listLinksResponse.ok) {
          const listData = await listLinksResponse.json();
          if (listData.links && listData.links.length > 0) {
            publicUrl = listData.links[0].url;
          }
        }
      }
    }

    if (!publicUrl) {
      throw new Error('Could not generate public link');
    }

    // 8. Prepare CANONICAL Response
    // We only return the proxyUrl and name. 
    // Raw URLs are excluded to prevent accidental persistence of non-proxied links.
    const proxyUrl = `/api/media/dropbox?url=${encodeURIComponent(publicUrl)}`;

    return new Response(JSON.stringify({
      success: true,
      proxyUrl: proxyUrl, // CANONICAL FORMAT
      name: dbxData.name,
      _metadata: {
         info: "Raw Dropbox URLs are deprecated. Use proxyUrl for all rendering and persistence."
      }
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error("Upload Function Error:", error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Internal Server Error',
      details: error.message
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}