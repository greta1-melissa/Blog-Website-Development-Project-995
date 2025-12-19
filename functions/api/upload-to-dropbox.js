/**
 * Cloudflare Pages Function to handle file uploads to Dropbox.
 * Route: /api/upload-to-dropbox
 *
 * Uses Refresh Token flow for continuous authentication.
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
    // FIX: Added headers and toString() for body
    const tokenParams = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: DROPBOX_REFRESH_TOKEN,
      client_id: DROPBOX_APP_KEY,
      client_secret: DROPBOX_APP_SECRET,
    });

    const tokenRes = await fetch('https://api.dropbox.com/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: tokenParams.toString(),
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      console.error('Dropbox Token Refresh Failed:', errText.substring(0, 200));
      throw new Error(`Failed to authenticate with Dropbox: ${tokenRes.status}`);
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
      const errorText = await dbxResponse.text();
      console.error("Dropbox Upload Failed:", errorText);
      return new Response(JSON.stringify({ success: false, message: 'Dropbox upload failed', details: errorText }), {
        status: 502,
        headers: { "Content-Type": "application/json" }
      });
    }

    const dbxData = await dbxResponse.json();

    // 7. Create or Get Shared Link
    let publicUrl = '';

    // Attempt to create a new link
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
      // If link exists, Dropbox returns an error. We must fetch the existing link.
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
      return new Response(JSON.stringify({ success: false, message: 'File uploaded but could not generate public link.' }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    // 8. Prepare Response
    // We return the ORIGINAL url (for saving) and a directUrl (just in case)
    let directUrl = publicUrl;
    // Replace dl=0 or raw=0 with raw=1 for the direct variant
    if (directUrl.includes('dl=0')) {
      directUrl = directUrl.replace('dl=0', 'raw=1');
    } else if (directUrl.includes('raw=0')) {
      directUrl = directUrl.replace('raw=0', 'raw=1');
    } else if (!directUrl.includes('raw=1')) {
      const separator = directUrl.includes('?') ? '&' : '?';
      directUrl = `${directUrl}${separator}raw=1`;
    }

    return new Response(JSON.stringify({
      success: true,
      path: dbxData.path_lower,
      url: publicUrl,       // Save this one (contains st/rlkey)
      directUrl: directUrl, // Use this if direct access is needed
      name: dbxData.name
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error("Server Function Error:", error);
    return new Response(JSON.stringify({ success: false, message: 'Internal Server Error', details: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}