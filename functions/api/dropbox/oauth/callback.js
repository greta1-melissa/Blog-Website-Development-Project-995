/**
 * Cloudflare Pages Function: Dropbox OAuth2 Callback Handler
 * 
 * Exchanges an authorization code for a long-lived refresh token.
 * Route: /api/dropbox/oauth/callback
 */
export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  // Cache-Control headers to prevent sensitive info from being stored
  const noCacheHeaders = {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    "Pragma": "no-cache",
    "Expires": "0"
  };

  // 1. Check for valid code
  if (!code) {
    return new Response(`
      <html>
        <head><title>Auth Error</title><style>body{font-family:sans-serif;padding:40px;text-align:center;color:#333;}</style></head>
        <body>
          <h1>Missing Authorization Code</h1>
          <p>The "code" parameter is missing. Please restart the Dropbox authorization flow.</p>
          <a href="/">Return Home</a>
        </body>
      </html>
    `, { status: 400, headers: noCacheHeaders });
  }

  try {
    // 2. Resolve Environment Variables
    const appKey = (env.DROPBOX_APP_KEY || "").trim();
    const appSecret = (env.DROPBOX_APP_SECRET || "").trim();
    const redirectUri = "https://blog-website-development-project-995.pages.dev/api/dropbox/oauth/callback";

    if (!appKey || !appSecret) {
      throw new Error("Missing DROPBOX_APP_KEY or DROPBOX_APP_SECRET in environment variables.");
    }

    // 3. Exchange Code for Token
    const tokenParams = new URLSearchParams({
      code: code,
      grant_type: 'authorization_code',
      client_id: appKey,
      client_secret: appSecret,
      redirect_uri: redirectUri
    });

    const tokenRes = await fetch('https://api.dropboxapi.com/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: tokenParams.toString()
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok) {
      return new Response(`
        <html>
          <head><title>Dropbox Error</title><style>body{font-family:sans-serif;padding:40px;color:#333;}pre{background:#f4f4f4;padding:15px;border-radius:8px;overflow-x:auto;}</style></head>
          <body>
            <h1 style="color:#dc2626">Token Exchange Failed</h1>
            <p><strong>Status:</strong> ${tokenRes.status}</p>
            <p><strong>Error:</strong> ${tokenData.error || 'Unknown'}</p>
            <p><strong>Description:</strong> ${tokenData.error_description || 'No description provided'}</p>
            <hr/>
            <p>Ensure your App Key and App Secret are correct in Cloudflare and that the Redirect URI matches exactly.</p>
          </body>
        </html>
      `, { status: 500, headers: noCacheHeaders });
    }

    // 4. Return Success Page with Token
    const refreshToken = tokenData.refresh_token;

    return new Response(`
      <html>
        <head>
          <title>Auth Success</title>
          <style>
            body { font-family: -apple-system, system-ui, sans-serif; line-height: 1.6; padding: 40px; max-width: 600px; margin: 0 auto; color: #1f2937; }
            .card { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
            .success-icon { color: #059669; font-size: 48px; margin-bottom: 16px; }
            h1 { margin-top: 0; color: #111827; }
            .token-box { background: #f9fafb; border: 1px solid #d1d5db; padding: 16px; border-radius: 8px; font-family: monospace; word-break: break-all; margin: 20px 0; font-size: 14px; position: relative; }
            .warning { background: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px; color: #92400e; font-size: 14px; margin-top: 24px; }
            button { background: #7c3aed; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 600; margin-top: 10px; }
            button:active { transform: scale(0.98); }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="success-icon">✓</div>
            <h1>Authentication Successful</h1>
            <p>Your Dropbox Refresh Token has been generated. Copy the value below and add it to your <strong>DROPBOX_REFRESH_TOKEN</strong> environment variable in Cloudflare.</p>
            
            <div class="token-box" id="token">${refreshToken}</div>
            <button onclick="copyToken()">Copy Token</button>

            <div class="warning">
              <strong>Warning:</strong> Treat this token like a password. Do not share it, commit it to GitHub, or leave this page open on public computers.
            </div>
          </div>

          <script>
            function copyToken() {
              const token = document.getElementById('token').innerText;
              navigator.clipboard.writeText(token);
              alert('Token copied to clipboard!');
            }
          </script>
        </body>
      </html>
    `, { status: 200, headers: noCacheHeaders });

  } catch (error) {
    return new Response(`
      <html>
        <head><title>Internal Error</title></head>
        <body>
          <h1>Internal Server Error</h1>
          <p>${error.message}</p>
        </body>
      </html>
    `, { status: 500, headers: noCacheHeaders });
  }
}