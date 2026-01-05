/**
 * Utility to generate and ensure unique slugs within a collection.
 */
export const generateSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')     // Replace spaces with -
    .replace(/[^\w-]+/g, '')  // Remove all non-word chars
    .replace(/--+/g, '-')     // Replace multiple - with single -
    .replace(/^-+/, '')       // Trim - from start of text
    .replace(/-+$/, '');      // Trim - from end of text
};

export const ensureUniqueSlug = (title, existingItems, currentId = null) => {
  let slug = generateSlug(title);
  let finalSlug = slug;
  let counter = 2;

  const isSlugTaken = (s) => existingItems.some(item => 
    item.slug === s && String(item.id) !== String(currentId)
  );

  while (isSlugTaken(finalSlug)) {
    finalSlug = `${slug}-${counter}`;
    counter++;
  }

  return finalSlug;
};