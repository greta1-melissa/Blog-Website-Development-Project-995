/**
 * SEO Friendly Slug Generation
 */
export const generateSlug = (text) => {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')     // Remove all non-word characters (except spaces and hyphens)
    .replace(/[\s_-]+/g, '-')     // Replace spaces and underscores with a single hyphen
    .replace(/^-+|-+$/g, '');     // Remove leading and trailing hyphens
};

/**
 * Ensures a slug is unique within a collection
 * If slug exists, appends - and 4 random characters
 */
export const ensureUniqueSlug = (title, existingItems = [], currentId = null) => {
  const baseSlug = generateSlug(title);
  
  // Ensure existingItems is an array
  const safeItems = Array.isArray(existingItems) ? existingItems : [];
  
  const exists = safeItems.some(item => item.slug === baseSlug && item.id !== currentId);
  
  if (!exists) return baseSlug;

  // Generate random 4 character string
  const randomChars = Math.random().toString(36).substring(2, 6);
  return `${baseSlug}-${randomChars}`;
};

/**
 * Calculate Read Time
 */
export const calculateReadTime = (content) => {
  if (!content) return '1 min read';
  // Remove HTML tags to count words accurately
  const plainText = content.replace(/<[^>]*>/g, '');
  const words = plainText.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.ceil(words / 200); // Average 200 words per minute
  return `${Math.max(1, minutes)} min read`;
};