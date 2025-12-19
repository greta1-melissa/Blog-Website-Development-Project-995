/**
 * Cloudflare Pages Function: Dropbox Image Proxy
 * Route: /api/media/dropbox?url=...
 * 
 * Proxies Dropbox shared links via server-side API calls to avoid
 * hotlinking limits, CORS issues, and link rot.
 */
export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const targetUrl = url.searchParams.get('url');

  if (!targetUrl) {
    return new Response('Missing url param', { status: 400 });
  }

  // 1. Auth Configuration
  const { DROPBOX_APP_KEY, DROPBOX_APP_SECRET, DROPBOX_REFRESH_TOKEN } = env;

  if (!DROPBOX_APP_KEY || !DROPBOX_APP_SECRET || !DROPBOX_REFRESH_TOKEN) {
    console.error('[Dropbox Proxy] Missing credentials in environment variables.');
    return new Response('Server Config Error: Missing Dropbox Credentials', { status: 500 });
  }

  try {
    // 2. Get Access Token (Refresh Token Flow)
    // CRITICAL FIX: Use explicit headers and string body for reliable OAuth call
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
      const err = await tokenRes.text();
      console.error(`[Dropbox Proxy] Token Refresh Failed (Status: ${tokenRes.status}):`, err.substring(0, 300));
      return new Response(`Failed to authenticate with Dropbox (Status: ${tokenRes.status}) - ${err.substring(0, 200)}`, { status: 502 });
    }

    const tokenData = await tokenRes.json();
    const access_token = tokenData.access_token;

    // 3. Clean the Target URL
    // Dropbox API get_shared_link_file expects the clean shared link (with rlkey), 
    // but modifiers like raw=1 or dl=0 in the 'url' arg can sometimes cause issues.
    // CRITICAL: Do NOT remove 'st' or 'rlkey' as they are required for access.
    let cleanUrl = targetUrl;
    try {
      const u = new URL(targetUrl);
      // Remove modifiers that are for browser behavior, but keep rlkey/st for access
      u.searchParams.delete('dl');
      u.searchParams.delete('raw');
      cleanUrl = u.toString();
    } catch (e) {
      console.warn('[Dropbox Proxy] Failed to clean URL, using original:', e);
    }

    // 4. Fetch File Content
    // Use get_shared_link_file to download directly from the link
    const fileRes = await fetch('https://content.dropboxapi.com/2/sharing/get_shared_link_file', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Dropbox-API-Arg': JSON.stringify({ url: cleanUrl }),
        'Content-Type': 'application/octet-stream' // Required by content.dropboxapi.com endpoints
      },
      // Body is intentionally empty for this endpoint
    });

    if (!fileRes.ok) {
      const errorText = await fileRes.text();
      console.error(`[Dropbox Proxy] Fetch failed for URL: ${cleanUrl} (Status: ${fileRes.status})`, errorText.substring(0, 300));
      
      if (fileRes.status === 404 || fileRes.status === 409) {
        return new Response('Image not found on Dropbox', { status: 404 });
      }
      return new Response(`Error fetching image from Dropbox (Status: ${fileRes.status})`, { status: 502 });
    }

    // 5. Stream Response with Caching
    const originalHeaders = new Headers(fileRes.headers);
    const newHeaders = new Headers();

    // Copy content type (e.g., image/jpeg)
    if (originalHeaders.has('Content-Type')) {
      newHeaders.set('Content-Type', originalHeaders.get('Content-Type'));
    } else {
      newHeaders.set('Content-Type', 'image/jpeg'); // Default fallback
    }

    // Cache for 1 hour locally, enable CORS
    newHeaders.set('Cache-Control', 'public, max-age=3600');
    newHeaders.set('Access-Control-Allow-Origin', '*');

    return new Response(fileRes.body, {
      status: 200,
      headers: newHeaders,
    });

  } catch (err) {
    console.error('[Dropbox Proxy] Internal Server Error:', err);
    return new Response('Internal Server Error: ' + err.message, { status: 500 });
  }
}