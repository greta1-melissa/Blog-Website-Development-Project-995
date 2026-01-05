import { PLACEHOLDER_IMAGE } from '../config/assets';
import { normalizeDropboxSharedUrl } from './dropboxLink';

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

  // Apply Dropbox Normalization (dl -> raw)
  const dropboxNormalized = normalizeDropboxSharedUrl(cleanUrl);

  // Handle Unsplash Optimization
  if (dropboxNormalized.includes('images.unsplash.com')) {
    try {
      const u = new URL(dropboxNormalized);
      if (!u.searchParams.has('w')) u.searchParams.set('w', '1200');
      if (!u.searchParams.has('q')) u.searchParams.set('q', '80');
      if (!u.searchParams.has('auto')) u.searchParams.set('auto', 'format');
      return u.toString();
    } catch (e) {
      return dropboxNormalized;
    }
  }
  return dropboxNormalized;
};

/**
 * Resolves any input URL to a safe, displayable source.
 */
export const getImageSrc = (url, fallback = PLACEHOLDER_IMAGE) => {
  if (!url || typeof url !== 'string' || url.trim() === "") {
    return fallback;
  }

  // Normalization handles Dropbox conversion and Unsplash optimization
  const normalized = normalizeImageUrl(url);

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