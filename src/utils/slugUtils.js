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
 */
export const ensureUniqueSlug = (title, existingItems = [], currentId = null) => {
  const baseSlug = generateSlug(title);
  let slug = baseSlug;
  let counter = 1;

  // Ensure existingItems is an array
  const safeItems = Array.isArray(existingItems) ? existingItems : [];

  while (safeItems.some(item => item.slug === slug && item.id !== currentId)) {
    counter++;
    slug = `${baseSlug}-${counter}`;
  }

  return slug;
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