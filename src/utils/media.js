/**
 * Media Utility Functions
 */

/**
 * Checks if a URL is a Dropbox URL.
 * @param {string} url 
 * @returns {boolean}
 */
export const isDropboxUrl = (url) => {
  if (!url) return false;
  return String(url).includes('dropbox.com');
};

/**
 * Helper to generate a proxy URL.
 * @param {string} url 
 * @returns {string}
 */
export const toDropboxProxyUrl = (url) => {
  if (!url) return "";
  return `/api/media/dropbox?url=${encodeURIComponent(url)}`;
};

/**
 * Normalizes a Dropbox URL to ensure it is valid for storage.
 * - Replaces dl=0/1 with raw=1 (standardization)
 * - KEEPS 'st' (security token) and 'rlkey' (resource key) - CRITICAL for access
 * 
 * use this BEFORE saving to database if the user manualy inputs a URL.
 * 
 * @param {string} url - The raw URL input
 * @returns {string} - The normalized URL
 */
export const normalizeDropboxImageUrl = (url) => {
  if (!url) return "";
  const stringUrl = String(url).trim();
  
  if (!stringUrl.includes('dropbox.com')) return stringUrl;

  try {
    const urlObj = new URL(stringUrl);
    
    // 1. Ensure 'raw=1' for direct rendering (as a fallback/standard)
    // We do NOT remove 'st' or 'rlkey' anymore.
    
    // Remove 'dl' if present to avoid conflicts with raw
    urlObj.searchParams.delete('dl');
    
    // Set raw=1
    urlObj.searchParams.set('raw', '1');
    
    return urlObj.toString();
  } catch (e) {
    // Fallback for simple string replacement if URL parsing fails
    let newUrl = stringUrl;
    
    // Replace dl=0/1 with raw=1
    if (newUrl.includes('dl=0')) newUrl = newUrl.replace('dl=0', 'raw=1');
    if (newUrl.includes('dl=1')) newUrl = newUrl.replace('dl=1', 'raw=1');
    
    // Ensure raw=1 if not present
    if (!newUrl.includes('raw=1')) {
      const separator = newUrl.includes('?') ? '&' : '?';
      newUrl = `${newUrl}${separator}raw=1`;
    }
    
    return newUrl;
  }
};

/**
 * Resolves a stored URL to a displayable source.
 * Proxies Dropbox URLs through our API to avoid CORS, Hotlinking, and Expiration issues.
 * 
 * USE THIS in <img src={...} />
 * 
 * @param {string} storedUrl - The URL stored in the database
 * @returns {string} - The resolved image source (proxy URL or original)
 */
export const getImageSrc = (storedUrl) => {
  if (!storedUrl) return "";
  const stringUrl = String(storedUrl).trim();
  
  // If it's a Dropbox URL, route it through our proxy
  if (isDropboxUrl(stringUrl)) {
    return toDropboxProxyUrl(stringUrl);
  }
  
  return stringUrl;
};

// Export aliases
export const normalizeDropboxUrl = normalizeDropboxImageUrl;
export const toDirectImageUrl = getImageSrc; // Updated to use proxy