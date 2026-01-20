/**
 * NoCodeBackend (NCB) Client
 * 
 * FRONTEND: Strictly calls the Cloudflare Pages Proxy (/api/ncb/*).
 * The proxy handles Instance ID and API Key injection server-side.
 */

const NCB_URL = '/api/ncb';

/**
 * Field allowlists for data integrity
 * Updated with SEO and Publishing status columns
 */
export const NCB_ALLOWLISTS = {
  posts: [
    'title', 
    'slug', 
    'content', 
    'category', 
    'author', 
    'date',
    'image', 
    'status', 
    'meta_title', 
    'meta_description', 
    'meta_keywords', 
    'og_image',
    'readtime',
    'ishandpicked',
    'created_at', 
    'updated_at'
  ],
  product_recommendations: [
    'title', 'slug', 'subcategory', 'rating', 'excerpt', 'content', 
    'image', 'image_url', 'status', 'created_at', 'updated_at', 
    'published_at', 'author', 'date', 'short_blurb', 'review', 'my_two_cents', 'tags'
  ],
  kdrama_recommendations: [
    'title', 'slug', 'tags', 'synopsis_short', 'synopsis_long', 'my_two_cents', 
    'image_url', 'image', 'is_featured_on_home', 'display_order', 
    'status', 'created_at', 'updated_at'
  ]
};

/**
 * Helper to strip HTML and get plain text
 */
const getPlainText = (html) => {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').trim();
};

/**
 * Sanitizes payload based on type and allowlist.
 * Adds defaults, timestamps, and formatting rules.
 */
export function sanitizeNcbPayload(type, data) {
  const allowlist = NCB_ALLOWLISTS[type];
  if (!allowlist) return data;

  const sanitized = {};
  const now = new Date().toISOString();
  
  // 1. Core Logic for Posts
  if (type === 'posts') {
    // Status Logic
    sanitized.status = data.status || 'Draft';
    
    // Date Logic: Force YYYY-MM-DD
    const rawDate = data.date || new Date();
    const d = new Date(rawDate);
    sanitized.date = isNaN(d.getTime()) 
      ? new Date().toISOString().split('T')[0] 
      : d.toISOString().split('T')[0];

    // Timestamps
    sanitized.updated_at = now;
    if (!data.id) sanitized.created_at = now;

    // Default SEO Mapping
    sanitized.meta_title = data.meta_title || data.title;
    sanitized.og_image = data.og_image || data.image;
    
    if (!data.meta_description) {
      const plain = getPlainText(data.content);
      sanitized.meta_description = plain.substring(0, 160);
    }

    // Default Author
    sanitized.author = data.author || 'Admin (BangtanMom)';
    sanitized.category = data.category || 'General';
  }

  // 2. Map Allowlist Fields
  allowlist.forEach(field => {
    if (data[field] !== undefined && sanitized[field] === undefined) {
      sanitized[field] = data[field];
    }
  });

  return sanitized;
}

function buildHeaders() {
  return { 'Content-Type': 'application/json' };
}

function buildProxyUrl(path, extraParams = {}) {
  const url = new URL(`${window.location.origin}${NCB_URL}${path}`);
  Object.entries(extraParams).forEach(([key, value]) => {
    if (key.toLowerCase() !== 'instance' && value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  });
  url.searchParams.set('_t', Date.now());
  return url.toString();
}

/**
 * Normalizes individual items (IDs and parsing)
 */
function normalizeItem(item) {
  if (!item || typeof item !== 'object') return item;
  const id = item.id || item._id || item.ID || item.Id;
  
  // Ensure status is readable for frontend
  if (item.status) {
    item.status = item.status === 'Published' || item.status === 'published' ? 'Published' : 'Draft';
  }
  
  return { ...item, id: id };
}

function normalizeArray(data) {
  const source = Array.isArray(data) ? data : (data?.data && Array.isArray(data.data) ? data.data : []);
  return source.map(normalizeItem);
}

async function handleResponse(res, context) {
  if (!res.ok) {
    let errorDetail = '';
    try {
      const errorJson = await res.json();
      errorDetail = JSON.stringify(errorJson);
    } catch (e) {
      errorDetail = await res.text().catch(() => 'Unknown error');
    }
    const errorMsg = `[NCB Error] ${context} (${res.status}): ${errorDetail}`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return await res.json().catch(() => ({}));
  }
  return { status: 'success' };
}

/**
 * Debug function to check NCB connectivity via proxy
 */
export async function getNcbStatus() {
  try {
    const posts = await ncbReadAll('posts', { limit: 1 });
    return {
      success: true,
      canReadPosts: true,
      message: `Successfully connected to NCB. Found ${posts.length} posts.`,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      canReadPosts: false,
      message: `Failed to connect to NCB: ${error.message}`,
      timestamp: new Date().toISOString()
    };
  }
}

export async function ncbReadAll(table, queryParams = {}) {
  const url = buildProxyUrl(`/read/${table}`, queryParams);
  try {
    const res = await fetch(url, { method: 'GET', headers: buildHeaders() });
    const json = await handleResponse(res, `readAll:${table}`);
    return normalizeArray(json);
  } catch (error) {
    console.error(`NCB Read Failed: ${table}`, error);
    return [];
  }
}

export async function ncbCreate(table, payload) {
  const sanitized = sanitizeNcbPayload(table, payload);
  const url = buildProxyUrl(`/create/${table}`);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify(sanitized),
    });
    const json = await handleResponse(res, `create:${table}`);
    const data = json?.data || json;
    return normalizeItem(Array.isArray(data) ? data[0] : data);
  } catch (error) {
    throw error;
  }
}

export async function ncbUpdate(table, id, payload) {
  const sanitized = sanitizeNcbPayload(table, payload);
  const url = buildProxyUrl(`/update/${table}/${id}`);
  try {
    const res = await fetch(url, {
      method: 'PUT',
      headers: buildHeaders(),
      body: JSON.stringify(sanitized),
    });
    return await handleResponse(res, `update:${table}:${id}`);
  } catch (error) {
    throw error;
  }
}

export async function ncbDelete(table, id) {
  const url = buildProxyUrl(`/delete/${table}/${id}`);
  try {
    const res = await fetch(url, { method: 'DELETE', headers: buildHeaders() });
    await handleResponse(res, `delete:${table}:${id}`);
    return true;
  } catch (error) {
    throw error;
  }
}