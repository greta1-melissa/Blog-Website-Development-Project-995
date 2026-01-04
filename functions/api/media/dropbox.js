/**
 * Cloudflare Pages Function: Dropbox Image Proxy
 * Route: /api/media/dropbox?url=...
 *
 * Proxies Dropbox shared links via server-side API calls.
 * Updated: Guaranteed JSON 500 error responses on any failure.
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
      throw new Error(`Token Refresh Failed (${tokenRes.status}): ${errText.substring(0, 100)}`);
    }

    const tokenData = await tokenRes.json();
    const access_token = tokenData.access_token;

    // 3. Clean the Target URL
    let cleanUrl = targetUrl;
    try {
      const u = new URL(targetUrl);
      u.searchParams.delete('dl');
      u.searchParams.delete('raw');
      cleanUrl = u.toString();
    } catch (e) {
      // If URL parsing fails, continue with original string
    }

    // 4. Fetch File Content
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

    // 5. Stream Response with Caching
    const originalHeaders = new Headers(fileRes.headers);
    const newHeaders = new Headers();
    
    if (originalHeaders.has('Content-Type')) {
      newHeaders.set('Content-Type', originalHeaders.get('Content-Type'));
    } else {
      newHeaders.set('Content-Type', 'image/jpeg');
    }

    newHeaders.set('Cache-Control', 'public, max-age=3600');
    newHeaders.set('Access-Control-Allow-Origin', '*');

    return new Response(fileRes.body, {
      status: 200,
      headers: newHeaders,
    });

  } catch (error) {
    // REQUIRED ERROR HANDLING CONTRACT
    const errorResponse = {
      ok: false,
      error: "dropbox proxy failure",
      message: error?.message ?? "unknown error",
      hostname: request.headers.get("host") || "unknown",
      hasDROPBOX_ACCESS_TOKEN: Boolean(env.DROPBOX_ACCESS_TOKEN),
      hasDROPBOX_REFRESH_TOKEN: Boolean(env.DROPBOX_REFRESH_TOKEN),
      hasDROPBOX_APP_KEY: Boolean(env.DROPBOX_APP_KEY),
      hasDROPBOX_APP_SECRET: Boolean(env.DROPBOX_APP_SECRET)
    };

    // Log the complete error object to the server console
    console.error(errorResponse);

    // Return strict JSON 500 response
    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-store"
      }
    });
  }
}