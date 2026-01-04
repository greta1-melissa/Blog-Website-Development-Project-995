/**
 * Media Utility Functions - Optimized for CDN delivery
 */

/**
 * Checks if a URL is a Dropbox URL (Legacy).
 */
export const isDropboxUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  return url.includes('dropbox.com');
};

/**
 * Normalizes an Image URL for CDN optimization.
 * If Unsplash, adds size parameters. If Dropbox, marks for proxying.
 */
export const normalizeImageUrl = (url) => {
  if (!url || typeof url !== 'string') return "";
  const cleanUrl = url.trim();

  // Handle Unsplash Optimization
  if (cleanUrl.includes('images.unsplash.com')) {
    try {
      const u = new URL(cleanUrl);
      // Ensure we have reasonable defaults for web performance
      if (!u.searchParams.has('w')) u.searchParams.set('w', '1200');
      if (!u.searchParams.has('q')) u.searchParams.set('q', '80');
      if (!u.searchParams.has('auto')) u.searchParams.set('auto', 'format');
      return u.toString();
    } catch (e) {
      return cleanUrl;
    }
  }

  return cleanUrl;
};

/**
 * Resolves any URL to a displayable source.
 * MIGRATION NOTICE: Moving away from Dropbox proxying for new content.
 */
export const getImageSrc = (url) => {
  if (!url) return "";
  const normalized = normalizeImageUrl(url);

  // If it's already a relative API path or local asset, return it
  if (normalized.startsWith('/api/') || normalized.startsWith('/src/')) return normalized;

  // Legacy Dropbox Proxying
  if (isDropboxUrl(normalized)) {
    return `/api/media/dropbox?url=${encodeURIComponent(normalized)}`;
  }

  return normalized;
};

/**
 * Legacy normalization for Dropbox links before they reach the DB
 */
export const normalizeDropboxImageUrl = (url) => {
  if (!url || typeof url !== 'string' || !url.includes('dropbox.com')) return url;
  try {
    const urlObj = new URL(url);
    urlObj.searchParams.delete('dl');
    urlObj.searchParams.set('raw', '1');
    return urlObj.toString();
  } catch (e) {
    return url;
  }
};

export const normalizeDropboxUrl = normalizeDropboxImageUrl;