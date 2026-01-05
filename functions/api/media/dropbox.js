/**
 * Cloudflare Pages Function: Dropbox Image Proxy
 * Route: /api/media/dropbox?url=...
 * 
 * Proxies Dropbox shared links and forces inline browser rendering
 * instead of triggering a download.
 */
export async function onRequest(context) {
  const { request, env } = context;
  
  try {
    const url = new URL(request.url);
    const targetUrl = url.searchParams.get('url');

    if (!targetUrl) {
      throw new Error('Missing url parameter');
    }

    // 1. Auth Configuration
    const { DROPBOX_APP_KEY, DROPBOX_APP_SECRET, DROPBOX_REFRESH_TOKEN } = env;
    if (!DROPBOX_APP_KEY || !DROPBOX_APP_SECRET || !DROPBOX_REFRESH_TOKEN) {
      throw new Error('Missing Dropbox Credentials in environment variables');
    }

    // 2. Get Access Token (Refresh Token Flow)
    const tokenParams = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: DROPBOX_REFRESH_TOKEN,
      client_id: DROPBOX_APP_KEY.trim(),
      client_secret: DROPBOX_APP_SECRET.trim(),
    });

    const tokenRes = await fetch('https://api.dropbox.com/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: tokenParams.toString(),
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      throw new Error(`Token Refresh Failed: ${errText.substring(0, 150)}`);
    }

    const { access_token } = await tokenRes.json();

    // 3. Clean the Target URL
    let cleanUrl = targetUrl;
    try {
      const u = new URL(targetUrl);
      u.searchParams.delete('dl');
      u.searchParams.delete('raw');
      cleanUrl = u.toString();
    } catch (e) {
      // Continue with original string if URL parsing fails
    }

    // 4. Fetch File Content from Dropbox
    const fileRes = await fetch('https://content.dropboxapi.com/2/sharing/get_shared_link_file', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Dropbox-API-Arg': JSON.stringify({ url: cleanUrl }),
        'Content-Type': 'application/octet-stream'
      }
    });

    if (!fileRes.ok) {
      const errorText = await fileRes.text();
      throw new Error(`Dropbox API fetch failed (${fileRes.status}): ${errorText.substring(0, 100)}`);
    }

    // 5. Build Response Headers for Inline Display
    const newHeaders = new Headers();
    
    // Determine Content-Type
    let contentType = fileRes.headers.get('content-type');
    
    // If content-type is missing or generic, infer from URL extension
    if (!contentType || contentType.startsWith('application/octet-stream')) {
      const path = new URL(cleanUrl).pathname.toLowerCase();
      if (path.endsWith('.png')) contentType = 'image/png';
      else if (path.endsWith('.webp')) contentType = 'image/webp';
      else if (path.endsWith('.gif')) contentType = 'image/gif';
      else if (path.endsWith('.svg')) contentType = 'image/svg+xml';
      else if (path.endsWith('.jpg') || path.endsWith('.jpeg')) contentType = 'image/jpeg';
      else contentType = 'image/jpeg'; // Default fallback for blog visuals
    }

    newHeaders.set('Content-Type', contentType);
    
    // CRITICAL: Force inline display (overrides Dropbox's default attachment behavior)
    newHeaders.set('Content-Disposition', 'inline');
    
    // Caching and CORS
    newHeaders.set('Cache-Control', 'public, max-age=86400');
    newHeaders.set('Access-Control-Allow-Origin', '*');

    // 6. Return raw binary body directly to browser
    return new Response(fileRes.body, {
      status: 200,
      headers: newHeaders,
    });

  } catch (error) {
    // Error Response (JSON)
    return new Response(JSON.stringify({
      success: false,
      error: "dropbox_proxy_error",
      message: error.message
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-store"
      }
    });
  }
}