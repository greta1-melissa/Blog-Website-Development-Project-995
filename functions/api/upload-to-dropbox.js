/**
 * Cloudflare Pages Function to handle file uploads to Dropbox.
 * Route: /api/upload-to-dropbox
 */
export async function onRequest(context) {
  const { request, env } = context;

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided' }), { status: 400 });
    }

    const filename = file.name;
    const arrayBuffer = await file.arrayBuffer();
    
    // Dropbox API requires the file path in a special header
    const dbxArgs = {
      path: `/Apps/BangtanMom/uploads/${Date.now()}_${filename}`,
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
      return new Response(JSON.stringify({ error: 'Dropbox upload failed', details: errorText }), { status: 502 });
    }

    const dbxData = await dbxResponse.json();

    // Create a shared link (optional, or use a temporary link)
    // For permanent usage, we usually create a shared link
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
      // Convert dl=0 to raw=1 for direct image display
      publicUrl = shareData.url.replace('dl=0', 'raw=1');
    } else {
      // Fallback or handle error - sometimes link already exists
      // Just return the path if sharing fails, frontend might handle differently
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
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}