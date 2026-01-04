/**
 * Cloudflare Pages Function: Standardized Dropbox Upload
 * Route: /api/upload-to-dropbox
 * 
 * FINAL CONTRACT:
 * Success (200/201): { success: true, proxyUrl: string, name: string }
 * Failure (4xx/5xx): { success: false, message: string }
 */
export async function onRequest(context) {
  const { request, env } = context;

  // 1. CORS & Method Guard
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ success: false, message: 'Method not allowed' }), {
      status: 405,
      headers: { "Content-Type": "application/json" }
    });
  }

  // 2. Env Validation
  const { DROPBOX_APP_KEY, DROPBOX_APP_SECRET, DROPBOX_REFRESH_TOKEN } = env;
  if (!DROPBOX_APP_KEY || !DROPBOX_APP_SECRET || !DROPBOX_REFRESH_TOKEN) {
    return new Response(JSON.stringify({ success: false, message: 'Server configuration error' }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    // 3. Request Parsing
    const formData = await request.formData();
    const file = formData.get('file');
    if (!file) {
      return new Response(JSON.stringify({ success: false, message: 'No file provided' }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // 4. Token Refresh (Existing Logic)
    const tokenRes = await fetch('https://api.dropbox.com/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: DROPBOX_REFRESH_TOKEN,
        client_id: DROPBOX_APP_KEY,
        client_secret: DROPBOX_APP_SECRET,
      }).toString(),
    });

    if (!tokenRes.ok) throw new Error(`Auth failed: ${tokenRes.status}`);
    const { access_token } = await tokenRes.json();

    // 5. File Upload (Existing Logic)
    const filename = file.name || "upload.png";
    const safeFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uploadPath = `/uploads/${Date.now()}_${safeFilename}`;
    const arrayBuffer = await file.arrayBuffer();

    const dbxResponse = await fetch('https://content.dropboxapi.com/2/files/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Dropbox-API-Arg': JSON.stringify({ path: uploadPath, mode: 'add', autorename: true }),
        'Content-Type': 'application/octet-stream'
      },
      body: arrayBuffer
    });

    if (!dbxResponse.ok) throw new Error("Dropbox internal upload failed");
    const dbxData = await dbxResponse.json();

    // 6. Shared Link Logic (Normalization Source)
    let rawSharedUrl = '';
    
    // Path A: Try creating a new link
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
      rawSharedUrl = shareData.url;
    } else {
      // Path B: Link exists, retrieve it
      const shareError = await shareResponse.json();
      if (shareError.error && shareError.error['.tag'] === 'shared_link_already_exists') {
        const listLinksRes = await fetch('https://api.dropboxapi.com/2/sharing/list_shared_links', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ path: dbxData.path_lower })
        });
        if (listLinksRes.ok) {
          const listData = await listLinksRes.json();
          if (listData.links && listData.links.length > 0) {
            rawSharedUrl = listData.links[0].url;
          }
        }
      }
    }

    if (!rawSharedUrl) {
      throw new Error('Failed to generate sharing URL');
    }

    // 7. CANONICAL RESPONSE CONSTRUCTION
    // We enforce the proxyUrl format required by the frontend guards.
    const proxyUrl = `/api/media/dropbox?url=${encodeURIComponent(rawSharedUrl)}`;

    return new Response(JSON.stringify({
      success: true,
      proxyUrl: proxyUrl, // Canonical field
      name: dbxData.name  // Actual name (account for autorename)
    }), {
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: error.message || 'Internal upload error'
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}