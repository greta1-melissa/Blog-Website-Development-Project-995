/**
 * Cloudflare Pages Function to handle file uploads to Dropbox.
 * Route: /api/upload-to-dropbox
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

  try {
    // 3. Environment Variable Validation
    if (!env.DROPBOX_ACCESS_TOKEN) {
      console.error("Missing DROPBOX_ACCESS_TOKEN");
      return new Response(JSON.stringify({ success: false, message: 'Configuration Error: Missing DROPBOX_ACCESS_TOKEN on server.' }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    // 4. File Parsing
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return new Response(JSON.stringify({ success: false, message: 'No file provided in request' }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const filename = file.name || "upload.png";
    const safeFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const timestamp = Date.now();
    // Use a clean path. If token is App Folder scoped, this is relative to the app folder.
    const uploadPath = `/uploads/${timestamp}_${safeFilename}`;
    
    const arrayBuffer = await file.arrayBuffer();

    // 5. Dropbox Upload
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
        'Authorization': `Bearer ${env.DROPBOX_ACCESS_TOKEN}`,
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

    // 6. Create or Get Shared Link
    let publicUrl = '';
    
    // Attempt to create a new link
    const shareResponse = await fetch('https://api.dropboxapi.com/2/sharing/create_shared_link_with_settings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.DROPBOX_ACCESS_TOKEN}`,
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
            'Authorization': `Bearer ${env.DROPBOX_ACCESS_TOKEN}`,
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

    // 7. Transform URL for Direct Display (raw=1)
    // Replace dl=0 or raw=0 with raw=1, or append it
    let directUrl = publicUrl;
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
      url: directUrl,
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