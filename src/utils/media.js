import { PLACEHOLDER_IMAGE } from '../config/assets';

/**
 * Checks if a string is a Dropbox URL.
 */
export const isDropboxUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  const lowerUrl = url.toLowerCase();
  return lowerUrl.includes('dropbox.com') || lowerUrl.includes('dl.dropbox');
};

/**
 * Validates if a string is a valid absolute URL.
 */
const isValidAbsoluteUrl = (str) => {
  try {
    new URL(str);
    return true;
  } catch (_) {
    return false;
  }
};

/**
 * Normalizes an Image URL for CDN optimization.
 */
export const normalizeImageUrl = (url) => {
  if (!url || typeof url !== 'string') return "";
  const cleanUrl = url.trim();

  // Handle Unsplash Optimization
  if (cleanUrl.includes('images.unsplash.com')) {
    try {
      const u = new URL(cleanUrl);
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
 * Resolves any input URL to a safe, displayable source.
 * 
 * Rules:
 * 1. Empty/Invalid -> Fallback
 * 2. Dropbox (with raw=1) -> Allowed Direct
 * 3. Relative -> Resolved to /assets/
 */
export const getImageSrc = (url, fallback = PLACEHOLDER_IMAGE) => {
  if (!url || typeof url !== 'string' || url.trim() === "") {
    return fallback;
  }
  
  const normalized = normalizeImageUrl(url);

  // Allow direct Dropbox URLs if they have the raw=1 parameter
  if (isDropboxUrl(normalized)) {
    try {
      const u = new URL(normalized);
      if (u.searchParams.get('raw') === '1') {
        return normalized;
      }
      // If it's a dropbox link but missing raw=1, we still allow it 
      // but the browser might not render it as an image unless raw=1 is present.
      return normalized;
    } catch (e) {
      return normalized;
    }
  }

  // Relative paths assumed to be in public assets
  if (!normalized.startsWith('http') && !normalized.startsWith('/') && !normalized.startsWith('data:')) {
    return `/assets/${normalized}`;
  }

  // Validation for absolute URLs
  if (normalized.startsWith('http') && !isValidAbsoluteUrl(normalized)) {
    return fallback;
  }

  return normalized;
};

/**
 * Normalizes Dropbox URL - now permissive.
 */
export const normalizeDropboxUrl = (url) => {
  return url || "";
};

export const normalizeDropboxImageUrl = normalizeDropboxUrl;