/**
 * NoCodeBackend (NCB) Client
 * 
 * FRONTEND: Strictly calls the Cloudflare Pages Proxy.
 * Fixed to always use the apex domain to ensure data loads on www subdomain.
 */

const NCB_URL = 'https://bangtanmom.com/api/ncb';

/**
 * Field allowlists for data integrity
 */
export const NCB_ALLOWLISTS = {
  posts: [
    'title', 'slug', 'content', 'excerpt', 'tags', 'category', 'status', 
    'created_at', 'updated_at', 'published_at', 'author', 'date',
    'image', 'image_url', 'featured_image_url',
    'seo_title', 'meta_description', 'focus_keyword', 'og_image_url', 'canonical_url', 'noindex'
  ],
  product_recommendations: [
    'title', 'slug', 'subcategory', 'rating', 'excerpt', 'content', 
    'image', 'image_url', 'status', 'created_at', 'updated_at', 
    'published_at', 'author', 'date', 'short_blurb', 'review', 'my_two_cents', 'tags',
    'seo_title', 'meta_description', 'focus_keyword', 'og_image_url', 'canonical_url', 'noindex'
  ],
  kdrama_recommendations: [
    'title', 'slug', 'tags', 'synopsis_short', 'synopsis_long', 'my_two_cents', 
    'image_url', 'image', 'is_featured_on_home', 'display_order', 
    'status', 'created_at', 'updated_at', 'published_at', 'author', 'date',
    'seo_title', 'meta_description', 'focus_keyword', 'og_image_url', 'canonical_url', 'noindex'
  ]
};

/**
 * Sanitizes payload based on type and allowlist.
 * Adds defaults and timestamps.
 */
export function sanitizeNcbPayload(type, data) {
  const allowlist = NCB_ALLOWLISTS[type];
  if (!allowlist) return data;

  const sanitized = {};
  const now = new Date().toISOString();
  const today = now.split('T')[0];

  // 1. Apply Defaults & Timestamps
  const status = (data.status || 'draft').toString().toLowerCase().trim();
  sanitized.status = status;
  sanitized.updated_at = now;
  
  if (!data.id) { // New record
    sanitized.created_at = data.created_at || now;
    sanitized.author = data.author || 'BangtanMom';
    sanitized.date = data.date || today;
  }

  if (status === 'published' && !data.published_at) {
    sanitized.published_at = now;
  }

  // 2. Map Allowlist Fields
  allowlist.forEach(field => {
    if (data[field] !== undefined && data[field] !== null && data[field] !== '') {
      // Specialized handling for booleans
      if (field === 'noindex' || field === 'is_featured_on_home') {
        sanitized[field] = data[field] === true || data[field] === 'true' || data[field] === 1 || data[field] === '1';
      } else {
        sanitized[field] = data[field];
      }
    } else if (field === 'noindex' || field === 'is_featured_on_home') {
      // Ensure booleans are always false if missing/empty
      sanitized[field] = false;
    }
  });

  return sanitized;
}

function buildHeaders() {
  return {
    'Content-Type': 'application/json'
  };
}

function normalizeTableName(table) {
  return String(table).trim().toLowerCase();
}

function buildProxyUrl(path, extraParams = {}) {
  // Use the absolute NCB_URL to prevent issues on subdomains like www
  const url = new URL(`${NCB_URL}${path}`);
  
  Object.entries(extraParams).forEach(([key, value]) => {
    if (key.toLowerCase() !== 'instance' && value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  });

  url.searchParams.set('_t', Date.now());
  return url.toString();
}

function normalizeItem(item) {
  if (!item || typeof item !== 'object') return item;
  const id = item.id || item._id || item.ID || item.Id || item.pk;
  return { ...item, id: id };
}

/**
 * Smarter normalization for NCB arrays.
 */
function normalizeArray(data, tableName) {
  if (Array.isArray(data)) return data.map(normalizeItem);
  
  const source = 
    (tableName && Array.isArray(data?.[tableName])) ? data[tableName] :
    (Array.isArray(data?.data)) ? data.data :
    (Array.isArray(data?.records)) ? data.records :
    (data?.data && Array.isArray(data.data.records)) ? data.data.records :
    [];
    
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

export async function ncbReadAll(table, queryParams = {}) {
  const cleanTable = normalizeTableName(table);
  const url = buildProxyUrl(`/read/${cleanTable}`, queryParams);
  
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: buildHeaders()
    });
    const json = await handleResponse(res, `readAll:${cleanTable}`);
    return normalizeArray(json, cleanTable);
  } catch (error) {
    console.error(`NCB Read Failed: ${cleanTable}`, error);
    return [];
  }
}

export async function ncbCreate(table, payload) {
  const cleanTable = normalizeTableName(table);
  const url = buildProxyUrl(`/create/${cleanTable}`);
  
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify(payload),
    });
    const json = await handleResponse(res, `create:${cleanTable}`);
    const data = json?.data || json;
    return normalizeItem(Array.isArray(data) ? data[0] : data);
  } catch (error) {
    throw error;
  }
}

export async function ncbUpdate(table, id, payload) {
  const cleanTable = normalizeTableName(table);
  const url = buildProxyUrl(`/update/${cleanTable}/${id}`);
  
  try {
    const res = await fetch(url, {
      method: 'PUT',
      headers: buildHeaders(),
      body: JSON.stringify(payload),
    });
    return await handleResponse(res, `update:${cleanTable}:${id}`);
  } catch (error) {
    throw error;
  }
}

export async function ncbDelete(table, id) {
  const cleanTable = normalizeTableName(table);
  const url = buildProxyUrl(`/delete/${cleanTable}/${id}`);
  
  try {
    const res = await fetch(url, {
      method: 'DELETE',
      headers: buildHeaders()
    });
    await handleResponse(res, `delete:${cleanTable}:${id}`);
    return true;
  } catch (error) {
    throw error;
  }
}

export async function ncbGet(table, queryParams) {
  return ncbReadAll(table, queryParams);
}

/**
 * Diagnostic function for NcbDebug page
 */
export async function getNcbStatus() {
  try {
    const res = await ncbReadAll('posts', { limit: 1 });
    return {
      success: true,
      canReadPosts: true,
      message: 'NCB Connection successful via absolute apex domain.'
    };
  } catch (error) {
    return {
      success: false,
      canReadPosts: false,
      message: `NCB Connection failed: ${error.message}`
    };
  }
}