/**
 * Media Utility Functions
 */

/**
 * Converts a URL into a direct display URL.
 * Specifically handles Dropbox links to ensure they render directly (raw=1).
 * 
 * @param {string} url - The raw URL string
 * @returns {string} - The normalized direct URL or empty string
 */
export const toDirectImageUrl = (url) => {
  if (!url) return "";
  
  let newUrl = String(url).trim();
  if (!newUrl) return "";

  // Handle Dropbox links
  if (newUrl.includes('dropbox.com')) {
    // 1. Replace dl=0 or dl=1 with raw=1
    if (newUrl.includes('dl=0')) {
      newUrl = newUrl.replace('dl=0', 'raw=1');
    } else if (newUrl.includes('dl=1')) {
      newUrl = newUrl.replace('dl=1', 'raw=1');
    } 
    // 2. Replace raw=0 with raw=1
    else if (newUrl.includes('raw=0')) {
      newUrl = newUrl.replace('raw=0', 'raw=1');
    }
    
    // 3. If raw=1 is still missing, append it
    if (!newUrl.includes('raw=1')) {
      const separator = newUrl.includes('?') ? '&' : '?';
      newUrl = `${newUrl}${separator}raw=1`;
    }
  }

  return newUrl;
};