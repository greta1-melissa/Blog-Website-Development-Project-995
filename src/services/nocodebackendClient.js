/**
 * NoCodeBackend (NCB) Client
 * Handles all REST API interactions with the NoCodeBackend service.
 *
 * This implementation is aligned with the Swagger for instance:
 *   54230_bangtan_mom_blog_site
 *
 * Base URL:
 *   https://api.nocodebackend.com
 *
 * Endpoint patterns:
 *   /create/{table}?Instance=...
 *   /read/{table}?Instance=...
 *   /read/{table}/{id}?Instance=...
 *   /update/{table}/{id}?Instance=...
 *   /delete/{table}/{id}?Instance=...
 *   /search/{table}?Instance=...
 */

// -----------------------------------------------------------------------------
// Config
// -----------------------------------------------------------------------------

const rawUrl = import.meta.env.VITE_NCB_URL || 'https://api.nocodebackend.com';
const NCB_URL = rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl;

const NCB_INSTANCE = import.meta.env.VITE_NCB_INSTANCE || '54230_bangtan_mom_blog_site';
const NCB_API_KEY = import.meta.env.VITE_NCB_API_KEY;

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
 * Example result:
 *   https://api.nocodebackend.com/read/posts?Instance=54230_bangtan_mom_blog_site&page=1&limit=10
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
    const text = await res.text().catch(() => '');
    console.error('NCB: Request failed', {
      context,
      status: res.status,
      body: text,
    });
    return null;
  }

  // Most NCB endpoints return JSON
  const json = await res.json().catch(() => null);
  if (!json) {
    // Some endpoints might return 200 OK with empty body
    return {};
  }
  return json;
}

// -----------------------------------------------------------------------------
// Core CRUD helpers (table-based)
// -----------------------------------------------------------------------------

/**
 * READ all records from a table.
 * Uses: GET /read/{table}?Instance=...
 */
export async function ncbReadAll(table, queryParams = {}) {
  const cleanTable = normalizeTableName(table);
  const url = withInstanceParam(`/read/${cleanTable}`, queryParams);

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: buildHeaders(),
    });

    const json = await handleResponse(res, `readAll:${cleanTable}`);
    if (!json) return [];

    // Swagger: { status: string, data: [...] }
    return Array.isArray(json.data) ? json.data : [];
  } catch (error) {
    console.error(`NCB: Network error readAll:${cleanTable}`, error);
    return [];
  }
}

/**
 * READ single record by ID.
 * Uses: GET /read/{table}/{id}?Instance=...
 */
export async function ncbReadOne(table, id) {
  const cleanTable = normalizeTableName(table);
  const url = withInstanceParam(`/read/${cleanTable}/${id}`);

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: buildHeaders(),
    });

    const json = await handleResponse(res, `readOne:${cleanTable}:${id}`);
    if (!json) return null;

    return json.data || null;
  } catch (error) {
    console.error(`NCB: Network error readOne:${cleanTable}`, error);
    return null;
  }
}

/**
 * CREATE record in table.
 * Uses: POST /create/{table}?Instance=...
 *
 * Swagger create response:
 *   { status: "success", message: "...", id: <number> }
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
    if (!json) return null;

    // NCB returns 'id' at top level usually, but sometimes inside data
    const id = json.id ?? json.data?.id ?? null;
    if (id == null) {
      // Fallback: return raw json if id not present
      return json;
    }

    // Return object resembling the saved record for optimistic UI updates
    return { id, ...payload };
  } catch (error) {
    console.error(`NCB: Network error create:${cleanTable}`, error);
    throw error;
  }
}

/**
 * UPDATE record in table.
 * Uses: PUT /update/{table}/{id}?Instance=...
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

    const json = await handleResponse(res, `update:${cleanTable}:${id}`);
    return json || { status: 'success' };
  } catch (error) {
    console.error(`NCB: Network error update:${cleanTable}`, error);
    throw error;
  }
}

/**
 * DELETE record from table.
 * Uses: DELETE /delete/{table}/{id}?Instance=...
 */
export async function ncbDelete(table, id) {
  const cleanTable = normalizeTableName(table);
  const url = withInstanceParam(`/delete/${cleanTable}/${id}`);

  try {
    const res = await fetch(url, {
      method: 'DELETE',
      headers: buildHeaders(),
    });

    const json = await handleResponse(res, `delete:${cleanTable}:${id}`);
    return !!json || res.ok;
  } catch (error) {
    console.error(`NCB: Network error delete:${cleanTable}`, error);
    return false;
  }
}

/**
 * SEARCH records in table.
 * Uses: POST /search/{table}?Instance=...
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
    if (!json) return [];

    return Array.isArray(json.data) ? json.data : [];
  } catch (error) {
    console.error(`NCB: Network error search:${cleanTable}`, error);
    return [];
  }
}

/**
 * Backwards-compatible alias used by BlogContext and ForumContext
 * to "get everything from a table".
 */
export async function ncbGet(table, queryParams) {
  return ncbReadAll(table, queryParams);
}

// -----------------------------------------------------------------------------
// Status helper for NcbDebug page
// -----------------------------------------------------------------------------

/**
 * Check basic connectivity to NCB.
 * This is used by NcbDebug.jsx to show a friendly status dashboard.
 */
export async function getNcbStatus() {
  const status = {
    baseUrl: NCB_URL,
    url: NCB_URL, // Alias for UI compat
    instance: NCB_INSTANCE || null,
    hasApiKey: !!NCB_API_KEY,
    canReadPosts: false,
    canReadThreads: false,
    canReadReplies: false,
    lastError: null,
    // Debug UI Compatibility fields
    maskedInstance: NCB_INSTANCE ? `${NCB_INSTANCE.substring(0, 4)}...${NCB_INSTANCE.slice(-4)}` : 'Missing',
    maskedKey: NCB_API_KEY ? `${NCB_API_KEY.substring(0, 4)}...${NCB_API_KEY.slice(-4)}` : 'Missing',
    postCount: 0,
    message: ''
  };

  try {
    // Try to read 1 post
    const posts = await ncbReadAll('posts', { page: 1, limit: 1 });
    if (Array.isArray(posts)) {
      status.canReadPosts = true;
      // Note: This might only be the page length (1), not total, but confirms read access
      status.postCount = posts.length; 
      status.message = 'Connection successful';
    } else {
      status.message = 'Failed to read posts (Invalid response format)';
    }
  } catch (e) {
    status.lastError = e?.message || 'Failed to read posts';
    status.message = `Connection failed: ${status.lastError}`;
  }

  // Optional checks for other tables (non-blocking for main status)
  try {
    const threads = await ncbReadAll('threads', { page: 1, limit: 1 });
    status.canReadThreads = Array.isArray(threads);
  } catch (e) { /* ignore */ }

  try {
    const replies = await ncbReadAll('replies', { page: 1, limit: 1 });
    status.canReadReplies = Array.isArray(replies);
  } catch (e) { /* ignore */ }

  return status;
}