/**
 * SEO Friendly Slug Generation
 */
export const generateSlug = (text) => {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // remove non-word chars
    .replace(/[\s_-]+/g, '-') // replace spaces/underscores with hyphens
    .replace(/^-+|-+$/g, ''); // trim leading/trailing hyphens
};

/**
 * Ensures a slug is unique within a collection
 */
export const ensureUniqueSlug = (title, existingItems = [], currentId = null) => {
  const baseSlug = generateSlug(title);
  let slug = baseSlug;
  let counter = 1;

  while (existingItems.some(item => item.slug === slug && item.id !== currentId)) {
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
  const plainText = content.replace(/<[^>]*>/g, '');
  const words = plainText.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / 200);
  return `${Math.max(1, minutes)} min read`;
};