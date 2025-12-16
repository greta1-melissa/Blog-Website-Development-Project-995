/**
 * Cloudflare Pages Function: Dropbox Image Proxy
 * Route: /api/media/dropbox?url=...
 * 
 * Proxies Dropbox shared links via server-side API calls to avoid 
 * hotlinking limits and CORS issues.
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
    return new Response('Server Config Error: Missing Dropbox Credentials', { status: 500 });
  }

  try {
    // 2. Get Access Token (Refresh Token Flow)
    const tokenParams = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: DROPBOX_REFRESH_TOKEN,
      client_id: DROPBOX_APP_KEY,
      client_secret: DROPBOX_APP_SECRET,
    });

    const tokenRes = await fetch('https://api.dropbox.com/oauth2/token', {
      method: 'POST',
      body: tokenParams,
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      console.error('Dropbox Token Refresh Failed:', err);
      return new Response('Failed to authenticate with Dropbox', { status: 502 });
    }

    const { access_token } = await tokenRes.json();

    // 3. Fetch File Content
    // Use get_shared_link_file to download directly from the link
    const fileRes = await fetch('https://content.dropboxapi.com/2/sharing/get_shared_link_file', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Dropbox-API-Arg': JSON.stringify({ url: targetUrl }),
      },
    });

    if (!fileRes.ok) {
      if (fileRes.status === 404 || fileRes.status === 409) {
        return new Response('Image not found', { status: 404 });
      }
      return new Response('Error fetching image from Dropbox', { status: 502 });
    }

    // 4. Stream Response with Caching
    const originalHeaders = new Headers(fileRes.headers);
    const newHeaders = new Headers();
    
    // Copy content type (e.g., image/jpeg)
    if (originalHeaders.has('Content-Type')) {
      newHeaders.set('Content-Type', originalHeaders.get('Content-Type'));
    }
    
    // Cache for 1 hour
    newHeaders.set('Cache-Control', 'public, max-age=3600');
    newHeaders.set('Access-Control-Allow-Origin', '*');

    return new Response(fileRes.body, {
      status: 200,
      headers: newHeaders,
    });

  } catch (err) {
    console.error('Proxy Error:', err);
    return new Response('Internal Server Error', { status: 500 });
  }
}