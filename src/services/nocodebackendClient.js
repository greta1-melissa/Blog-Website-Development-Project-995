/**
 * NoCodeBackend (NCB) Client
 * 
 * FRONTEND: Strictly calls the Cloudflare Pages Proxy.
 * Forced to use the absolute apex domain to ensure data loads on www.
 */

const NCB_URL = 'https://bangtanmom.com/api/ncb';

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

export function sanitizeNcbPayload(type, data) {
  const allowlist = NCB_ALLOWLISTS[type];
  if (!allowlist) return data;
  const sanitized = {};
  const now = new Date().toISOString();
  const status = (data.status || 'published').toString().toLowerCase().trim();
  sanitized.status = status;
  sanitized.updated_at = now;
  if (!data.id) {
    sanitized.created_at = data.created_at || now;
    sanitized.author = data.author || 'BangtanMom';
    sanitized.date = data.date || now.split('T')[0];
  }
  allowlist.forEach(field => {
    if (data[field] !== undefined && data[field] !== null) {
      sanitized[field] = data[field];
    }
  });
  return sanitized;
}

function buildProxyUrl(path, extraParams = {}) {
  const baseUrl = NCB_URL.startsWith('http') ? NCB_URL : `${window.location.origin}${NCB_URL}`;
  const url = new URL(`${baseUrl}${path}`);
  Object.entries(extraParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
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
    const err = await res.text().catch(() => 'Unknown');
    throw new Error(`[NCB Error] ${context} (${res.status}): ${err}`);
  }
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return await res.json().catch(() => ({}));
  }
  return { status: 'success' };
}

export async function getNcbStatus() {
  try {
    const posts = await ncbReadAll('posts', { _limit: 1 });
    return { canReadPosts: true, message: `Connected. Found ${posts.length} posts.` };
  } catch (error) {
    return { canReadPosts: false, message: error.message };
  }
}

export async function ncbReadAll(table, queryParams = {}) {
  const cleanTable = table.trim().toLowerCase();
  const url = buildProxyUrl(`/read/${cleanTable}`, queryParams);
  try {
    const res = await fetch(url);
    const json = await handleResponse(res, `read:${cleanTable}`);
    return normalizeArray(json, cleanTable);
  } catch (error) {
    console.error(`NCB Read Failed: ${cleanTable}`, error);
    return [];
  }
}

export async function ncbCreate(table, payload) {
  const url = buildProxyUrl(`/create/${table.trim().toLowerCase()}`);
  const res = await fetch(url, { method: 'POST', body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' } });
  const json = await handleResponse(res, `create:${table}`);
  return normalizeItem(json?.data || json);
}

export async function ncbUpdate(table, id, payload) {
  const url = buildProxyUrl(`/update/${table.trim().toLowerCase()}/${id}`);
  const res = await fetch(url, { method: 'PUT', body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' } });
  return await handleResponse(res, `update:${table}:${id}`);
}

export async function ncbDelete(table, id) {
  const url = buildProxyUrl(`/delete/${table.trim().toLowerCase()}/${id}`);
  const res = await fetch(url, { method: 'DELETE' });
  return await handleResponse(res, `delete:${table}:${id}`);
}