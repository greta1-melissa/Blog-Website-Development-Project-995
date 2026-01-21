/**
 * NoCodeBackend (NCB) Client
 */

const NCB_URL = '/api/ncb';

/**
 * Field allowlists for data integrity.
 */
export const NCB_ALLOWLISTS = {
  posts: [
    'id', 'title', 'slug', 'content', 'category', 'author', 'date',
    'image', 'status', 'meta_title', 'meta_description', 'meta_keywords', 
    'og_image', 'readtime', 'ishandpicked', 'created_at', 'updated_at'
  ],
  product_recommendations: [
    'title', 'slug', 'category', 'rating', 'short_blurb', 'full_review', 
    'image', 'status', 'affiliate_url', 'created_at', 'updated_at'
  ],
  kdrama_recommendations: [
    'title', 'slug', 'tags', 'synopsis_short', 'synopsis_long', 'my_two_cents', 
    'image_url', 'image', 'is_featured_on_home', 'display_order', 
    'status', 'created_at', 'updated_at'
  ]
};

/**
 * Normalizes a date value to YYYY-MM-DD for NCB DATE columns.
 * Handles Date objects, DD/MM/YYYY, D/M/YYYY, and YYYY-MM-DD.
 */
export function normalizeNcbDate(dateValue) {
  if (!dateValue || dateValue === '') {
    return new Date().toISOString().split('T')[0];
  }

  if (dateValue instanceof Date) {
    if (isNaN(dateValue.getTime())) return null;
    return dateValue.toISOString().slice(0, 10);
  }

  const str = String(dateValue).trim();
  if (!str) return new Date().toISOString().split('T')[0];

  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return str;
  }

  const dmvRegex = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/;
  const match = str.match(dmvRegex);
  if (match) {
    const [_, d, m, y] = match;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  const d = new Date(str);
  return !isNaN(d.getTime()) ? d.toISOString().split('T')[0] : null;
}

const getPlainText = (html) => {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').trim();
};

export function sanitizeNcbPayload(type, data) {
  const allowlist = NCB_ALLOWLISTS[type];
  if (!allowlist) return data;

  const sanitized = {};
  const now = new Date().toISOString();
  
  if (type === 'posts') {
    sanitized.status = data.status || 'Draft';
    sanitized.date = normalizeNcbDate(data.date) || new Date().toISOString().split('T')[0];
    sanitized.updated_at = now;
    if (!data.id) sanitized.created_at = now;
    
    sanitized.meta_title = data.meta_title || data.title || '';
    sanitized.og_image = data.og_image || data.image || '';
    if (!data.meta_description) {
      sanitized.meta_description = getPlainText(data.content).substring(0, 160);
    }
  }

  allowlist.forEach(field => {
    if (data[field] !== undefined && sanitized[field] === undefined) {
      sanitized[field] = data[field];
    }
  });

  return sanitized;
}

async function handleResponse(res, context) {
  if (!res.ok) {
    const errorDetail = await res.text().catch(() => 'Unknown error');
    const errorMsg = `[NCB Error] ${context} (${res.status}): ${errorDetail}`;
    if (context.startsWith('readAll')) return []; 
    throw new Error(errorMsg);
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
    return { canReadPosts: true, message: 'Connected to NCB.' };
  } catch (error) {
    return { canReadPosts: false, message: error.message };
  }
}

export async function ncbReadAll(table, queryParams = {}) {
  const url = new URL(`${window.location.origin}${NCB_URL}/read/${table}`);
  Object.entries(queryParams).forEach(([k, v]) => url.searchParams.set(k, v));
  try {
    const res = await fetch(url.toString(), { method: 'GET' });
    const json = await handleResponse(res, `readAll:${table}`);
    const data = Array.isArray(json) ? json : (json.data || json.records || []);
    return data.map(item => ({ ...item, id: item.id || item._id }));
  } catch (error) { return []; }
}

export async function ncbCreate(table, payload) {
  const sanitized = sanitizeNcbPayload(table, payload);
  const res = await fetch(`${window.location.origin}${NCB_URL}/create/${table}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sanitized),
  });
  const json = await handleResponse(res, `create:${table}`);
  const data = json?.data || json;
  const item = Array.isArray(data) ? data[0] : data;
  return { ...item, id: item.id || item._id };
}

export async function ncbUpdate(table, id, payload) {
  const sanitized = sanitizeNcbPayload(table, payload);
  const res = await fetch(`${window.location.origin}${NCB_URL}/update/${table}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sanitized),
  });
  return await handleResponse(res, `update:${table}:${id}`);
}

export async function ncbDelete(table, id) {
  const res = await fetch(`${window.location.origin}${NCB_URL}/delete/${table}/${id}`, { method: 'DELETE' });
  return await handleResponse(res, `delete:${table}:${id}`);
}