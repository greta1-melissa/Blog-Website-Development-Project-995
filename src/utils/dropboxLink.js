/**
 * Normalizes Dropbox shared links to ensure they render inline (images)
 * instead of triggering a browser download.
 * 
 * Rules:
 * - Only affects dropbox.com or www.dropbox.com domains.
 * - Converts dl=0 or dl=1 to raw=1.
 * - Ignores proxy URLs (/api/media/dropbox).
 * - Preserves other query params and fragments.
 */
export const normalizeDropboxSharedUrl = (inputUrl) => {
  if (!inputUrl || typeof inputUrl !== 'string') return '';

  // 1. Ignore existing proxy URLs
  if (inputUrl.includes('/api/media/dropbox')) {
    return inputUrl;
  }

  try {
    // Attempt to parse as absolute URL
    const url = new URL(inputUrl);
    const host = url.hostname.toLowerCase();

    // 2. Only modify true Dropbox domains
    if (host === 'dropbox.com' || host === 'www.dropbox.com') {
      
      // 3. If raw=1 already exists, leave it alone
      if (url.searchParams.get('raw') === '1') {
        return inputUrl;
      }

      // 4. Convert dl=0/1 to raw=1
      if (url.searchParams.has('dl')) {
        url.searchParams.delete('dl');
        url.searchParams.set('raw', '1');
        return url.toString();
      }

      // 5. If it's a dropbox link without dl or raw, add raw=1 for safety
      if (!url.searchParams.has('raw')) {
        url.searchParams.set('raw', '1');
        return url.toString();
      }
    }
  } catch (e) {
    // Not a valid absolute URL, return as-is
    return inputUrl;
  }

  return inputUrl;
};