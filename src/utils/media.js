/**
 * Media Utility Functions
 */

/**
 * Resolves a stored URL to a displayable source.
 * Proxies Dropbox links through our API to avoid hotlinking issues.
 * 
 * @param {string} storedUrl - The URL stored in the database
 * @returns {string} - The resolved image source
 */
export const getImageSrc = (storedUrl) => {
  if (!storedUrl) return "";
  
  const cleanUrl = String(storedUrl).trim();
  if (!cleanUrl) return "";

  // If it's a Dropbox link, route through our proxy
  if (cleanUrl.includes('dropbox.com')) {
    return `/api/media/dropbox?url=${encodeURIComponent(cleanUrl)}`;
  }

  // Otherwise return original (e.g., Unsplash, other CDN)
  return cleanUrl;
};

/**
 * Normalizes a Dropbox URL to ensure it has raw=1.
 * Useful for saving clean URLs to the database from user input.
 * 
 * @param {string} url - The raw URL input
 * @returns {string} - The normalized URL
 */
export const normalizeDropboxUrl = (url) => {
  if (!url) return "";
  
  let newUrl = String(url).trim();
  if (!newUrl) return "";

  // Handle Dropbox links
  if (newUrl.includes('dropbox.com')) {
    // 1. Replace dl=0 or dl=1 with raw=1
    newUrl = newUrl.replace(/dl=[01]/g, 'raw=1');
    
    // 2. Replace raw=0 with raw=1
    newUrl = newUrl.replace(/raw=0/g, 'raw=1');
    
    // 3. If raw=1 is still missing, append it
    if (!newUrl.includes('raw=1')) {
      const separator = newUrl.includes('?') ? '&' : '?';
      newUrl = `${newUrl}${separator}raw=1`;
    }
  }

  return newUrl;
};

// Explicitly export alias to prevent build errors in files we haven't touched yet
export const toDirectImageUrl = normalizeDropboxUrl;