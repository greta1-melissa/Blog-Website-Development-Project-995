/**
 * NoCodeBackend (NCB) Client
 * Handles all REST API interactions with the NoCodeBackend service.
 *
 * This implementation is aligned with the Swagger for instance:
 * 54230_bangtan_mom_blog_site
 *
 * Base URL:
 * https://api.nocodebackend.com
 */

// -----------------------------------------------------------------------------
// Config
// -----------------------------------------------------------------------------
const env = import.meta.env || {};
const rawUrl = env.VITE_NCB_URL || 'https://api.nocodebackend.com';
const NCB_URL = rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl;
const NCB_INSTANCE = env.VITE_NCB_INSTANCE || '54230_bangtan_mom_blog_site';
const NCB_API_KEY = env.VITE_NCB_API_KEY;

// Debug config (helps in browser console)
console.log('[NCB config]', {
  url: NCB_URL,
  instance: NCB_INSTANCE,
  hasApiKey: !!NCB_API_KEY,
});

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------
function buildHeaders() {
  const headers = {
    'Content-Type': 'application/json',
  };
  if (NCB_API_KEY) {
    headers['Authorization'] = `Bearer ${NCB_API_KEY}`;
  }
  return headers;
}

function normalizeTableName(table) {
  return String(table).trim().toLowerCase();
}

/**
 * Attach Instance (capital I) and any extra query params.
 */
function withInstanceParam(path, extraParams = {}) {
  const url = new URL(`${NCB_URL}${path}`);
  if (NCB_INSTANCE) {
    // CRITICAL: query parameter, not header, capital I
    url.searchParams.set('Instance', NCB_INSTANCE);
  }
  Object.entries(extraParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  });
  return url.toString();
}

async function handleResponse(res, context) {
  if (!res.ok) {
    const errorBody = await res.text().catch(() => 'Could not read error body.');
    const errorMessage = `NCB Request Failed: ${context} (Status: ${res.status}). Body: ${errorBody.substring(0, 300)}`;
    console.error("[NCB Client Error]", errorMessage);
    throw new Error(errorMessage);
  }

  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return res.json().catch(() => ({}));
  }
  return { status: 'success' };
}

// -----------------------------------------------------------------------------
// Core CRUD helpers (table-based)
// -----------------------------------------------------------------------------

/**
 * READ all records from a table.
 */
export async function ncbReadAll(table, queryParams = {}) {
  const cleanTable = normalizeTableName(table);
  const url = withInstanceParam(`/read/${cleanTable}`, queryParams);
  try {
    const res = await fetch(url, { method: 'GET', headers: buildHeaders() });
    const json = await handleResponse(res, `readAll:${cleanTable}`);
    return Array.isArray(json.data) ? json.data : [];
  } catch (error) {
    console.error(`NCB: Network error readAll:${cleanTable}`, error);
    return [];
  }
}

/**
 * READ single record by ID.
 */
export async function ncbReadOne(table, id) {
  const cleanTable = normalizeTableName(table);
  const url = withInstanceParam(`/read/${cleanTable}/${id}`);
  try {
    const res = await fetch(url, { method: 'GET', headers: buildHeaders() });
    const json = await handleResponse(res, `readOne:${cleanTable}:${id}`);
    return json.data || null;
  } catch (error) {
    console.error(`NCB: Network error readOne:${cleanTable}`, error);
    return null;
  }
}

/**
 * CREATE record in table.
 */
export async function ncbCreate(table, payload) {
  const cleanTable = normalizeTableName(table);
  const url = withInstanceParam(`/create/${cleanTable}`);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify(payload),
    });
    const json = await handleResponse(res, `create:${cleanTable}`);
    // NCB create often returns the full object inside a 'data' property.
    if (json && json.data) {
      return Array.isArray(json.data) ? json.data[0] : json.data;
    }
    return json; // Fallback for other response structures
  } catch (error) {
    console.error(`NCB: Network error create:${cleanTable}`, error);
    throw error; // Re-throw to be caught by context/UI
  }
}

/**
 * UPDATE record in table.
 */
export async function ncbUpdate(table, id, payload) {
  const cleanTable = normalizeTableName(table);
  const url = withInstanceParam(`/update/${cleanTable}/${id}`);
  try {
    const res = await fetch(url, {
      method: 'PUT',
      headers: buildHeaders(),
      body: JSON.stringify(payload),
    });
    return await handleResponse(res, `update:${cleanTable}:${id}`);
  } catch (error) {
    console.error(`NCB: Network error update:${cleanTable}`, error);
    throw error;
  }
}

/**
 * DELETE record from table.
 */
export async function ncbDelete(table, id) {
  const cleanTable = normalizeTableName(table);
  const url = withInstanceParam(`/delete/${cleanTable}/${id}`);
  try {
    const res = await fetch(url, { method: 'DELETE', headers: buildHeaders() });
    await handleResponse(res, `delete:${cleanTable}:${id}`);
    return true;
  } catch (error) {
    console.error(`NCB: Network error delete:${cleanTable}`, error);
    return false;
  }
}

/**
 * SEARCH records in table.
 */
export async function ncbSearch(table, filters = {}) {
  const cleanTable = normalizeTableName(table);
  const url = withInstanceParam(`/search/${cleanTable}`);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify(filters),
    });
    const json = await handleResponse(res, `search:${cleanTable}`);
    return Array.isArray(json.data) ? json.data : [];
  } catch (error) {
    console.error(`NCB: Network error search:${cleanTable}`, error);
    return [];
  }
}

/**
 * Backwards-compatible alias.
 */
export async function ncbGet(table, queryParams) {
  return ncbReadAll(table, queryParams);
}

// -----------------------------------------------------------------------------
// Status helper for NcbDebug page
// -----------------------------------------------------------------------------
export async function getNcbStatus() {
  const status = {
    baseUrl: NCB_URL,
    url: NCB_URL,
    instance: NCB_INSTANCE || null,
    hasApiKey: !!NCB_API_KEY,
    canReadPosts: false,
    lastError: null,
    maskedInstance: NCB_INSTANCE ? `${NCB_INSTANCE.substring(0, 4)}...${NCB_INSTANCE.slice(-4)}` : 'Missing',
    maskedKey: NCB_API_KEY ? `${NCB_API_KEY.substring(0, 4)}...${NCB_API_KEY.slice(-4)}` : 'Missing',
    postCount: 0,
    message: ''
  };

  try {
    const posts = await ncbReadAll('posts', { page: 1, limit: 1 });
    if (Array.isArray(posts)) {
      status.canReadPosts = true;
      // To get total count, we'd need another call, but this confirms readability
      status.postCount = 'N/A'; // Count from a limited query is not total
      status.message = 'Connection successful for `posts` table.';
    } else {
      status.message = 'Failed to read `posts` table. Response was not an array.';
    }
  } catch (e) {
    status.lastError = e?.message || 'Failed to read posts';
    status.message = `Connection failed: ${status.lastError}`;
  }
  return status;
}