/**
 * Cloudflare Pages Function: Dropbox Upload
 * Route: /api/media/dropbox-upload
 * 
 * Handles file uploads, saves to Dropbox, creates a shared link,
 * and returns it for the frontend to store.
 */
export async function onRequest(context) {
  const { request, env } = context;

  // CORS Preflight
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
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  // 1. Auth Config
  const { DROPBOX_APP_KEY, DROPBOX_APP_SECRET, DROPBOX_REFRESH_TOKEN } = env;

  if (!DROPBOX_APP_KEY || !DROPBOX_APP_SECRET || !DROPBOX_REFRESH_TOKEN) {
    return new Response(JSON.stringify({ error: 'Server Config Error' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // 2. Parse File
    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided' }), { status: 400 });
    }

    // 3. Get Access Token
    const tokenParams = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: DROPBOX_REFRESH_TOKEN,
      client_id: DROPBOX_APP_KEY,
      client_secret: DROPBOX_APP_SECRET,
    });

    const tokenRes = await fetch('https://api.dropbox.com/oauth2/token', { method: 'POST', body: tokenParams });
    if (!tokenRes.ok) throw new Error('Auth Failed');
    const { access_token } = await tokenRes.json();

    // 4. Upload File
    const filename = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const uploadPath = `/uploads/${filename}`;
    
    const uploadArgs = {
      path: uploadPath,
      mode: 'add',
      autorename: true,
      mute: false
    };

    const uploadRes = await fetch('https://content.dropboxapi.com/2/files/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Dropbox-API-Arg': JSON.stringify(uploadArgs),
        'Content-Type': 'application/octet-stream'
      },
      body: await file.arrayBuffer()
    });

    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      return new Response(JSON.stringify({ error: 'Upload failed', details: errText }), { status: 502 });
    }

    const uploadData = await uploadRes.json();

    // 5. Create Shared Link
    const shareRes = await fetch('https://api.dropboxapi.com/2/sharing/create_shared_link_with_settings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ path: uploadData.path_lower })
    });

    let sharedLink = '';
    
    if (shareRes.ok) {
      const shareData = await shareRes.json();
      sharedLink = shareData.url;
    } else {
      // Handle existing link
      const errorData = await shareRes.json();
      if (errorData.error && errorData.error['.tag'] === 'shared_link_already_exists') {
        const listRes = await fetch('https://api.dropboxapi.com/2/sharing/list_shared_links', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${access_token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: uploadData.path_lower })
        });
        if (listRes.ok) {
          const listData = await listRes.json();
          if (listData.links?.length) sharedLink = listData.links[0].url;
        }
      }
    }

    if (!sharedLink) throw new Error('Could not generate public link');

    // Return JSON with shared_link
    return new Response(JSON.stringify({ shared_link: sharedLink }), {
      headers: { 'Content-Type': 'application/json', "Access-Control-Allow-Origin": "*" }
    });

  } catch (err) {
    console.error('Upload Error:', err);
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}