/**
 * Cloudflare Pages Function to handle file uploads to Dropbox.
 * Route: /api/upload-to-dropbox
 */
export async function onRequest(context) {
  const { request, env } = context;

  // 1. CORS Preflight (Optional but good practice if calling from different origin)
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
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Configuration Error: Missing DROPBOX_ACCESS_TOKEN on server.' 
      }), { status: 500, headers: { "Content-Type": "application/json" } });
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
    const arrayBuffer = await file.arrayBuffer();

    // 5. Dropbox Upload
    // Dropbox API requires the file path in a special header
    const dbxArgs = {
      path: `/Apps/BangtanMom/uploads/${Date.now()}_${safeFilename}`,
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
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Dropbox upload failed', 
        details: errorText 
      }), { status: 502, headers: { "Content-Type": "application/json" } });
    }

    const dbxData = await dbxResponse.json();

    // 6. Create Shared Link
    const shareResponse = await fetch('https://api.dropboxapi.com/2/sharing/create_shared_link_with_settings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.DROPBOX_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ path: dbxData.path_lower })
    });

    let publicUrl = '';
    
    if (shareResponse.ok) {
      const shareData = await shareResponse.json();
      // CRITICAL: Convert dl=0 to raw=1 for direct image display
      publicUrl = shareData.url.replace('dl=0', 'raw=1');
    } else {
      // If link exists, Dropbox returns error (shared_link_already_exists)
      // We attempt to list existing links
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
           publicUrl = listData.links[0].url.replace('dl=0', 'raw=1');
        }
      }
      
      if (!publicUrl) {
         console.error("Dropbox Sharing Failed:", await shareResponse.text());
         // We uploaded but couldn't share. Return success false to trigger fallback or error.
         return new Response(JSON.stringify({ 
           success: false, 
           message: 'File uploaded but public link creation failed.' 
         }), { status: 500, headers: { "Content-Type": "application/json" } });
      }
    }

    return new Response(JSON.stringify({
      success: true,
      path: dbxData.path_lower,
      url: publicUrl,
      name: dbxData.name
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error("Server Function Error:", error);
    return new Response(JSON.stringify({ 
      success: false, 
      message: 'Internal Server Error', 
      details: error.message 
    }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}