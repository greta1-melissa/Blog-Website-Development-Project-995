/**
 * Cloudflare Pages Function to handle post image uploads to Dropbox.
 * Route: /api/dropbox/upload-post-image
 */
export async function onRequest(context) {
  const { request, env } = context;

  // 0. Method Check
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    // 1. Parse Multipart Form Data
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return new Response(JSON.stringify({ ok: false, error: 'No file provided' }), { status: 400 });
    }

    // 2. Auth Logic - Support both Refresh Token (Preferred) and Long-lived Token (Legacy/Simple)
    let accessToken = env.DROPBOX_ACCESS_TOKEN;

    // If Refresh Token vars are present, try to get a fresh access token
    if (env.DROPBOX_APP_KEY && env.DROPBOX_APP_SECRET && env.DROPBOX_REFRESH_TOKEN) {
      try {
        const tokenParams = new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: env.DROPBOX_REFRESH_TOKEN,
          client_id: env.DROPBOX_APP_KEY,
          client_secret: env.DROPBOX_APP_SECRET,
        });

        const tokenRes = await fetch('https://api.dropbox.com/oauth2/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: tokenParams,
        });

        if (tokenRes.ok) {
          const tokenData = await tokenRes.json();
          accessToken = tokenData.access_token;
        } else {
          console.warn('[Dropbox Auth] Refresh token failed, falling back to static token if available.');
        }
      } catch (e) {
        console.error('[Dropbox Auth] Error refreshing token', e);
      }
    }

    if (!accessToken) {
      return new Response(JSON.stringify({ ok: false, error: 'Dropbox authentication failed' }), { status: 500 });
    }

    // 3. Upload Helper Logic
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${timestamp}_${safeName}`;
    const folder = env.DROPBOX_POSTS_FOLDER || '/bangtanmom/posts';
    const path = `${folder}/${filename}`;

    const uploadArgs = {
      path,
      mode: 'add',
      autorename: true,
      mute: false
    };

    // Upload file
    const uploadRes = await fetch('https://content.dropboxapi.com/2/files/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Dropbox-API-Arg': JSON.stringify(uploadArgs),
        'Content-Type': 'application/octet-stream'
      },
      body: await file.arrayBuffer()
    });

    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      console.error('[Dropbox upload] Failed to upload file', errText);
      return new Response(JSON.stringify({ ok: false, error: 'Failed to upload image to Dropbox' }), { status: 502 });
    }

    const uploadData = await uploadRes.json();

    // 4. Get Public URL (Sharing)
    // Try creating a shared link first
    let shareRes = await fetch('https://api.dropboxapi.com/2/sharing/create_shared_link_with_settings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ path: uploadData.path_lower })
    });

    let publicUrl = '';

    if (shareRes.ok) {
      const shareData = await shareRes.json();
      publicUrl = shareData.url;
    } else {
      // If link exists (conflict), list existing links
      const listRes = await fetch('https://api.dropboxapi.com/2/sharing/list_shared_links', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ path: uploadData.path_lower })
      });

      if (listRes.ok) {
        const listData = await listRes.json();
        if (listData.links && listData.links.length > 0) {
          publicUrl = listData.links[0].url;
        }
      }
    }

    if (!publicUrl) {
      return new Response(JSON.stringify({ ok: false, error: 'Could not generate public URL' }), { status: 500 });
    }

    // 5. Transform URL for direct display (raw=1)
    const directUrl = publicUrl.replace('dl=0', 'raw=1');

    return new Response(JSON.stringify({
      ok: true,
      url: directUrl
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error('[Dropbox upload] Failed to upload post image', err);
    return new Response(JSON.stringify({
      ok: false,
      error: 'Internal Server Error'
    }), { status: 500 });
  }
}