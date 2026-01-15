/**
 * NoCodeBackend Client Service
 * Handles all interactions with the /api/ncb proxy
 */

const API_BASE = '/api/ncb';

// Field allowlists for sanitization
const ALLOWED_FIELDS = {
  posts: [
    'title', 'slug', 'content', 'excerpt', 'category', 'image', 'image_url', 
    'author', 'status', 'created_at', 'seo_title', 'meta_description', 
    'focus_keyword', 'og_image_url', 'canonical_url', 'noindex'
  ],
  product_recommendations: [
    'name', 'slug', 'category', 'subcategory', 'price', 'rating', 'image_url', 
    'affiliate_link', 'review', 'is_featured', 'created_at', 'seo_title', 
    'meta_description', 'focus_keyword', 'og_image_url', 'canonical_url', 'noindex'
  ],
  kdramas: [
    'title', 'slug', 'rating', 'genre', 'status', 'image_url', 'synopsis_short', 
    'synopsis_long', 'my_two_cents', 'watch_where', 'is_featured_on_home', 
    'created_at', 'seo_title', 'meta_description', 'focus_keyword', 
    'og_image_url', 'canonical_url', 'noindex'
  ]
};

/**
 * Strips unnecessary HTML tags and attributes to keep content clean
 */
export const cleanHtmlContent = (html) => {
  if (!html || typeof html !== 'string') return html;
  
  return html
    // Remove style attributes
    .replace(/ style="[^"]*"/gi, '')
    // Remove class attributes
    .replace(/ class="[^"]*"/gi, '')
    // Convert divs to p tags (often happens on paste)
    .replace(/<div/gi, '<p')
    .replace(/<\/div>/gi, '</p>')
    // Strip spans but keep content
    .replace(/<span[^>]*>/gi, '')
    .replace(/<\/span>/gi, '')
    // Remove empty paragraphs
    .replace(/<p><\/p>/gi, '')
    // Clean up multiple spaces
    .replace(/&nbsp;/g, ' ')
    .trim();
};

/**
 * Prepares and sanitizes payload for NCB
 */
export const sanitizeNcbPayload = (table, data) => {
  const allowed = ALLOWED_FIELDS[table] || [];
  const sanitized = {};

  // Copy allowed fields
  allowed.forEach(field => {
    if (data[field] !== undefined) {
      let value = data[field];
      
      // Clean HTML for content fields
      if (['content', 'review', 'synopsis_long', 'my_two_cents'].includes(field)) {
        value = cleanHtmlContent(value);
      }
      
      sanitized[field] = value;
    }
  });

  // CRITICAL: Standardize blog image field for Posts
  if (table === 'posts') {
    // If 'image' is provided but 'image_url' isn't, map it
    if (sanitized.image && !sanitized.image_url) {
      sanitized.image_url = sanitized.image;
    }
    // Remove 'image' if 'image_url' exists to avoid column conflicts
    if (sanitized.image_url) {
      delete sanitized.image;
    }
  }

  // Ensure created_at for new records
  if (!sanitized.created_at) {
    sanitized.created_at = new Date().toISOString();
  }

  return sanitized;
};

export const ncbReadAll = async (table) => {
  try {
    const response = await fetch(`${API_BASE}/read/${table}`);
    if (!response.ok) throw new Error(`Failed to fetch ${table}`);
    return await response.json();
  } catch (error) {
    console.error(`NCB Read Error (${table}):`, error);
    throw error;
  }
};

export const ncbCreate = async (table, data) => {
  try {
    const payload = sanitizeNcbPayload(table, data);
    const response = await fetch(`${API_BASE}/${table}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to create record in ${table}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`NCB Create Error (${table}):`, error);
    throw error;
  }
};

export const ncbUpdate = async (table, id, data) => {
  try {
    const payload = sanitizeNcbPayload(table, data);
    const response = await fetch(`${API_BASE}/${table}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to update record in ${table}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`NCB Update Error (${table}):`, error);
    throw error;
  }
};

export const ncbDelete = async (table, id) => {
  try {
    const response = await fetch(`${API_BASE}/${table}/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error(`Failed to delete record from ${table}`);
    return true;
  } catch (error) {
    console.error(`NCB Delete Error (${table}):`, error);
    throw error;
  }
};

/**
 * Diagnostic helper to check NCB proxy connectivity
 */
export const getNcbStatus = async () => {
  try {
    const response = await fetch(`${API_BASE}/read/posts`);
    if (response.ok) {
      return { 
        canReadPosts: true, 
        message: 'Successfully connected to NCB proxy and read posts table.' 
      };
    } else {
      let errorMessage = 'Unknown error';
      try {
        const error = await response.json();
        errorMessage = error.message || response.statusText;
      } catch (e) {
        errorMessage = response.statusText;
      }
      return { 
        canReadPosts: false, 
        message: `Proxy connected but NCB returned an error: ${errorMessage}` 
      };
    }
  } catch (error) {
    return { 
      canReadPosts: false, 
      message: `Failed to connect to proxy: ${error.message}` 
    };
  }
};