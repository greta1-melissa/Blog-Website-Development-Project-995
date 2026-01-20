/**
 * NoCodeBackend (NCB) Client
 * 
 * FRONTEND: Strictly calls the Cloudflare Pages Proxy (/api/ncb/*).
 * The proxy handles Instance ID and API Key injection server-side.
 */

const NCB_URL = '/api/ncb';

/**
 * Field allowlists for data integrity.
 * Updated to include the new Publishing, SEO, and Timestamp fields.
 */
export const NCB_ALLOWLISTS = {
  posts: [
    'id',
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
    'title', 
    'slug', 
    'category', 
    'rating', 
    'short_blurb', 
    'full_review', 
    'image', 
    'status', 
    'affiliate_url',
    'created_at', 
    'updated_at'
  ],
  kdrama_recommendations: [
    'title', 'slug', 'tags', 'synopsis_short', 'synopsis_long', 'my_two_cents', 
    'image_url', 'image', 'is_featured_on_home', 'display_order', 
    'status', 'created_at', 'updated_at'
  ]
};

/**
 * Normalizes a date string to YYYY-MM-DD for NCB DATE columns.
 */
export function normalizeNcbDate(dateValue) {
  if (!dateValue || dateValue === '') {
    return new Date().toISOString().split('T')[0];
  }

  if (dateValue instanceof Date) {
    if (isNaN(dateValue.getTime())) return null;
    return dateValue.toISOString().slice(0, 10);
  }

  const trimmed = String(dateValue).trim();
  if (!trimmed) return new Date().toISOString().split('T')[0];

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) {
    const [day, month, year] = trimmed.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  try {
    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) {
      return d.toISOString().split('T')[0];
    }
  } catch (e) {
    console.warn('Date normalization failed for:', dateValue);
  }

  return null;
}

/**
 * Helper to strip HTML and get plain text for meta descriptions
 */
const getPlainText = (html) => {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').trim();
};

/**
 * Sanitizes payload based on type and allowlist.
 * Ensures strict YYYY-MM-DD date format and mandatory defaults for the new schema.
 */
export function sanitizeNcbPayload(type, data) {
  const allowlist = NCB_ALLOWLISTS[type];
  if (!allowlist) return data;

  const sanitized = {};
  const now = new Date().toISOString();
  
  if (type === 'posts') {
    // 1. Publishing & Status
    sanitized.status = data.status || 'Draft';
    sanitized.slug = data.slug || '';
    
    // 2. Enforce strict Date Format (YYYY-MM-DD)
    const normalized = normalizeNcbDate(data.date);
    sanitized.date = normalized || new Date().toISOString().split('T')[0];

    // 3. Timestamps (Varchar 255 as requested)
    sanitized.updated_at = now;
    if (!data.id) {
      sanitized.created_at = now;
    } else {
      sanitized.created_at = data.created_at || now;
    }

    // 4. SEO Fields
    sanitized.meta_title = data.meta_title || data.title || '';
    sanitized.meta_keywords = data.meta_keywords || '';
    sanitized.og_image = data.og_image || data.image || '';
    
    if (!data.meta_description) {
      const plain = getPlainText(data.content);
      sanitized.meta_description = plain.substring(0, 160);
    } else {
      sanitized.meta_description = data.meta_description;
    }

    // 5. Core Defaults
    sanitized.author = data.author || 'Admin (BangtanMom)';
    sanitized.category = data.category || 'General';
  }

  // Map only allowed fields from the input data
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

function normalizeItem(item) {
  if (!item || typeof item !== 'object') return item;
  const id = item.id || item._id || item.ID || item.Id;
  return { ...item, id: id };
}

function normalizeArray(data) {
  const source = Array.isArray(data) ? data : (data?.data && Array.isArray(data.data) ? data.data : (data?.records && Array.isArray(data.records) ? data.records : []));
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
    if (context.startsWith('readAll')) return []; 
    throw new Error(errorMsg);
  }
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return await res.json().catch(() => ({}));
  }
  return { status: 'success' };
}

/**
 * Checks the connection status to NCB via the proxy.
 */
export async function getNcbStatus() {
  try {
    const posts = await ncbReadAll('posts', { _limit: 1 });
    return {
      canReadPosts: true,
      message: 'Successfully connected to NCB proxy and read posts table.',
      count: posts.length
    };
  } catch (error) {
    return {
      canReadPosts: false,
      message: `Failed to connect to NCB: ${error.message}`
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
    return [];
  }
}

export async function ncbCreate(table, payload) {
  const sanitized = sanitizeNcbPayload(table, payload);
  const url = buildProxyUrl(`/create/${table}`);
  const res = await fetch(url, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify(sanitized),
  });
  const json = await handleResponse(res, `create:${table}`);
  const data = json?.data || json;
  return normalizeItem(Array.isArray(data) ? data[0] : data);
}

export async function ncbUpdate(table, id, payload) {
  const sanitized = sanitizeNcbPayload(table, payload);
  const url = buildProxyUrl(`/update/${table}/${id}`);
  const res = await fetch(url, {
    method: 'PUT',
    headers: buildHeaders(),
    body: JSON.stringify(sanitized),
  });
  return await handleResponse(res, `update:${table}:${id}`);
}

export async function ncbDelete(table, id) {
  const url = buildProxyUrl(`/delete/${table}/${id}`);
  const res = await fetch(url, { method: 'DELETE', headers: buildHeaders() });
  await handleResponse(res, `delete:${table}:${id}`);
  return true;
}