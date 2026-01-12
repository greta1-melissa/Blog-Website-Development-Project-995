/**
 * Utility to generate and ensure unique slugs within a collection.
 * Follows strict URL-safe rules.
 */
export const generateSlug = (text) => {
  if (!text) return '';
  
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-')           // Replace spaces and underscores with hyphens
    .replace(/[^a-z0-9-]/g, '')        // Remove all non-alphanumeric chars except hyphens
    .replace(/--+/g, '-')              // Collapse multiple hyphens
    .replace(/^-+|-+$/g, '');          // Remove leading and trailing hyphens
};

/**
 * Ensures a slug is unique within a list of items.
 */
export const ensureUniqueSlug = (title, existingItems, currentId = null) => {
  let slug = generateSlug(title);
  
  // If title results in empty slug, use a generic one
  if (!slug) slug = 'drama';
  
  let finalSlug = slug;
  let counter = 2;

  const isSlugTaken = (s) => 
    existingItems.some(item => 
      String(item.slug || '').trim() === s && 
      String(item.id) !== String(currentId)
    );

  while (isSlugTaken(finalSlug)) {
    finalSlug = `${slug}-${counter}`;
    counter++;
  }
  
  return finalSlug;
};