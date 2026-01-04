import { PLACEHOLDER_IMAGE } from '../config/assets';

// Registry to prevent console spam for blocked URLs in development
const blockedRegistry = new Set();

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
 * Normalizes an Image URL for CDN optimization and security.
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
 * 2. Dropbox -> Fallback (Logged only in development)
 * 3. Relative -> Resolved to /assets/ (e.g., "logo.png" -> "/assets/logo.png")
 * 4. Invalid External -> Fallback
 */
export const getImageSrc = (url, fallback = PLACEHOLDER_IMAGE) => {
  if (!url || typeof url !== 'string' || url.trim() === "") {
    return fallback;
  }
  
  const normalized = normalizeImageUrl(url);

  // 1. BLOCKADE: Detect and short-circuit Dropbox links
  if (isDropboxUrl(normalized)) {
    // Only log in Development to keep Production console clean
    if (import.meta.env.DEV && !blockedRegistry.has(normalized)) {
      console.warn(`[Security] Blocked Dropbox URL at runtime: ${normalized}. Replaced with fallback.`);
      blockedRegistry.add(normalized);
    }
    return fallback;
  }

  // 2. RELATIVE PATHS: If it doesn't look like a URL or an absolute path, assume it's an asset
  if (!normalized.startsWith('http') && !normalized.startsWith('/') && !normalized.startsWith('data:')) {
    return `/assets/${normalized}`;
  }

  // 3. VALIDATION: If it's supposed to be an absolute URL, check if it's valid
  if (normalized.startsWith('http') && !isValidAbsoluteUrl(normalized)) {
    return fallback;
  }

  return normalized;
};

/**
 * Legacy support - strictly returns empty if Dropbox to trigger fallbacks in older components.
 */
export const normalizeDropboxUrl = (url) => {
  if (isDropboxUrl(url)) return "";
  return url;
};

export const normalizeDropboxImageUrl = normalizeDropboxUrl;