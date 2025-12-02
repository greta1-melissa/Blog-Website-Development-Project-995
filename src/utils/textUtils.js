/**
 * Utility function to strip HTML tags from a string.
 * Useful for generating plain text previews from Rich Text content.
 */
export const stripHtml = (html) => {
  if (!html) return '';
  
  // Check if we are in a browser environment
  if (typeof document !== 'undefined') {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  }
  
  // Fallback for non-browser environments (though this app is client-side)
  return html.replace(/<[^>]*>?/gm, '');
};