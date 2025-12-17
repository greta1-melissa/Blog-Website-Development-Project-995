/**
 * Media Utility Functions
 */

/**
 * Normalizes a Dropbox URL to ensure it is a direct image link.
 * - Replaces dl=0/1 with raw=1
 * - Adds raw=1 if missing
 * - Removes 'st' (security token?) parameters which expire
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
    
    // 1. Remove 'st' parameter
    urlObj.searchParams.delete('st');
    
    // 2. Remove 'dl' parameter
    urlObj.searchParams.delete('dl');
    
    // 3. Ensure 'raw=1'
    urlObj.searchParams.set('raw', '1');
    
    return urlObj.toString();
  } catch (e) {
    // Fallback for simple string replacement if URL parsing fails (e.g. valid domain but partial url?)
    // though dropbox URLs are usually absolute.
    let newUrl = stringUrl;
    
    // Replace dl=0/1 with raw=1
    newUrl = newUrl.replace(/([?&])dl=[01]/g, '$1raw=1');
    
    // Remove st=...
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
 * Uses the normalized direct Dropbox URL.
 * 
 * @param {string} storedUrl - The URL stored in the database
 * @returns {string} - The resolved image source
 */
export const getImageSrc = (storedUrl) => {
  return normalizeDropboxImageUrl(storedUrl);
};

// Export aliases for consistency across the app
export const normalizeDropboxUrl = normalizeDropboxImageUrl;
export const toDirectImageUrl = normalizeDropboxImageUrl;