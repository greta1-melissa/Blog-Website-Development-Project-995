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
 * Normalizes a Dropbox URL to ensure it is a direct image link for storage.
 * - Replaces dl=0/1 with raw=1 (standardization)
 * - Removes 'st' (security token) parameters which expire
 * 
 * use this BEFORE saving to database.
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
    
    // 1. Remove 'st' parameter (security token) - Critical for persistence
    urlObj.searchParams.delete('st');
    
    // 2. Remove 'dl' parameter to avoid conflicts
    urlObj.searchParams.delete('dl');
    
    // 3. Ensure 'raw=1' for direct rendering (fallback if proxy fails)
    urlObj.searchParams.set('raw', '1');
    
    return urlObj.toString();
  } catch (e) {
    // Fallback for simple string replacement if URL parsing fails
    let newUrl = stringUrl;
    
    // Replace dl=0/1 with raw=1
    newUrl = newUrl.replace(/([?&])dl=[01]/g, '$1raw=1');
    
    // Remove st=... parameter
    newUrl = newUrl.replace(/([?&])st=[^&]*&?/g, '$1');
    
    // Ensure raw=1 if not present
    if (!newUrl.includes('raw=1')) {
      const separator = newUrl.includes('?') ? '&' : '?';
      newUrl = `${newUrl}${separator}raw=1`;
    }
    
    // Cleanup trailing & or ?
    if (newUrl.endsWith('&') || newUrl.endsWith('?')) {
      newUrl = newUrl.slice(0, -1);
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
    return `/api/media/dropbox?url=${encodeURIComponent(stringUrl)}`;
  }
  
  return stringUrl;
};

// Export aliases
export const normalizeDropboxUrl = normalizeDropboxImageUrl;
export const toDirectImageUrl = getImageSrc; // Updated to use proxy