/**
 * NoCodeBackend (NCB) Client
 * 
 * HARDENED: Strict JSON-only payloads for /api/ncb/*
 * Disallows FormData to ensure stable database saves.
 */

// -----------------------------------------------------------------------------
// Config
// -----------------------------------------------------------------------------
const env = import.meta.env || {};
const NCB_URL = '/api/ncb';
const NCB_INSTANCE = env.VITE_NCB_INSTANCE || '54230_bangtan_mom_blog_site';

// Set to true to enable verbose logging for debugging save failures
const DEBUG_NCB_OPERATIONS = true;

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

/**
 * Defensive check to prevent FormData from being sent to NCB.
 * NCB expects pure JSON objects.
 */
function validatePayload(payload, context) {
  if (payload instanceof FormData) {
    const errorMsg = `NCB Client Error [${context}]: FormData is NOT allowed for NoCodeBackend requests. 
    Please convert to a plain object. File uploads should be handled via the separate Dropbox API.`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }
}

function buildHeaders() {
  // Always enforce application/json for NCB proxy
  return {
    'Content-Type': 'application/json',
  };
}

function normalizeTableName(table) {
  return String(table).trim().toLowerCase();
}

/**
 * Attach Instance and query params.
 * Adds timestamp to prevent caching on GET requests.
 */
function withInstanceParam(path, extraParams = {}) {
  const url = new URL(`${window.location.origin}${NCB_URL}${path}`);
  if (NCB_INSTANCE) {
    url.searchParams.set('Instance', NCB_INSTANCE);
  }
  
  // Cache Busting: Always add a timestamp
  url.searchParams.set('_t', Date.now());

  Object.entries(extraParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  });

  return url.toString();
}

/**
 * Normalizes an item to ensure it has a consistent 'id' property.
 */
function normalizeItem(item) {
  if (!item || typeof item !== 'object') return item;
  const id = item.id || item._id || item.ID || item.Id;
  return { ...item, id: id };
}

function normalizeArray(data) {
  if (!Array.isArray(data)) return [];
  return data.map(normalizeItem);
}

async function handleResponse(res, context, url = '', payload = null) {
  if (!res.ok) {
    if (res.status === 405) {
      throw new Error('405_METHOD_NOT_ALLOWED');
    }
    
    const errorBody = await res.text().catch(() => 'Could not read error body.');
    
    if (DEBUG_NCB_OPERATIONS) {
      console.group(`[NCB Debug] Failure: ${context}`);
      console.error(`URL: ${url}`);
      console.error(`Status: ${res.status} ${res.statusText}`);
      if (payload) {
        console.error('Payload:', JSON.stringify(payload, null, 2));
      }
      console.error('Upstream Error Body:', errorBody);
      console.groupEnd();
    }

    const errorMessage = `NCB Request Failed: ${context} (Status: ${res.status}). Body: ${errorBody.substring(0, 300)}`;
    
    try {
      const jsonErr = JSON.parse(errorBody);
      if (jsonErr.message) {
        throw new Error(`${context}: ${jsonErr.message}`);
      }
    } catch (e) {
      // Ignore JSON parse error if body is not JSON (e.g. HTML error page)
    }

    // For POST/PUT/DELETE, we want a user-friendly error
    if (['create', 'update', 'delete'].some(op => context.includes(op))) {
      throw new Error("Save failed. Please check required fields.");
    }

    throw new Error(errorMessage);
  }

  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return res.json().catch(() => ({}));
  }
  return { status: 'success' };
}

// -----------------------------------------------------------------------------
// Core CRUD helpers
// -----------------------------------------------------------------------------

export async function ncbReadAll(table, queryParams = {}) {
  const cleanTable = normalizeTableName(table);
  const url = withInstanceParam(`/read/${cleanTable}`, queryParams);
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: buildHeaders()
    });
    const json = await handleResponse(res, `readAll:${cleanTable}`, url);
    return normalizeArray(json.data);
  } catch (error) {
    console.error(`NCB: Network error readAll:${cleanTable}`, error);
    return [];
  }
}

export async function ncbReadOne(table, id) {
  const cleanTable = normalizeTableName(table);
  const url = withInstanceParam(`/read/${cleanTable}/${id}`);
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: buildHeaders()
    });
    const json = await handleResponse(res, `readOne:${cleanTable}:${id}`, url);
    return normalizeItem(json.data || null);
  } catch (error) {
    console.error(`NCB: Network error readOne:${cleanTable}`, error);
    return null;
  }
}

export async function ncbCreate(table, payload) {
  const cleanTable = normalizeTableName(table);
  
  // HARDENING: Validate payload type
  validatePayload(payload, `create:${cleanTable}`);

  const url = withInstanceParam(`/create/${cleanTable}`);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify(payload), // STRICT JSON
    });
    const json = await handleResponse(res, `create:${cleanTable}`, url, payload);
    if (json && json.data) {
      const item = Array.isArray(json.data) ? json.data[0] : json.data;
      return normalizeItem(item);
    }
    return normalizeItem(json);
  } catch (error) {
    console.error(`NCB: Error during create:${cleanTable}`, error);
    throw error;
  }
}

export async function ncbUpdate(table, id, payload) {
  const cleanTable = normalizeTableName(table);
  
  // HARDENING: Validate payload type
  validatePayload(payload, `update:${cleanTable}`);

  const url = withInstanceParam(`/update/${cleanTable}/${id}`);
  
  try {
    // Attempt 1: PUT
    const res = await fetch(url, {
      method: 'PUT',
      headers: buildHeaders(),
      body: JSON.stringify(payload), // STRICT JSON
    });
    return await handleResponse(res, `update:${cleanTable}:${id}`, url, payload);
  } catch (error) {
    if (error.message === '405_METHOD_NOT_ALLOWED') {
      // Attempt 2: POST (Fallback for certain NCB configurations)
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: buildHeaders(),
          body: JSON.stringify(payload), 
        });
        return await handleResponse(res, `update-post:${cleanTable}:${id}`, url, payload);
      } catch (retryError) {
        throw retryError;
      }
    }
    throw error;
  }
}

export async function ncbDelete(table, id) {
  const cleanTable = normalizeTableName(table);
  const url = withInstanceParam(`/delete/${cleanTable}/${id}`);
  try {
    const res = await fetch(url, {
      method: 'DELETE',
      headers: buildHeaders()
    });
    await handleResponse(res, `delete:${cleanTable}:${id}`, url);
    return true;
  } catch (error) {
    if (error.message === '405_METHOD_NOT_ALLOWED') {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: buildHeaders()
        });
        await handleResponse(res, `delete-post:${cleanTable}:${id}`, url);
        return true;
      } catch (retryError) {
        return false;
      }
    }
    return false;
  }
}

export async function ncbSearch(table, filters = {}) {
  const cleanTable = normalizeTableName(table);
  
  // HARDENING: Validate payload type
  validatePayload(filters, `search:${cleanTable}`);

  const url = withInstanceParam(`/search/${cleanTable}`);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify(filters),
    });
    const json = await handleResponse(res, `search:${cleanTable}`, url, filters);
    return normalizeArray(Array.isArray(json.data) ? json.data : []);
  } catch (error) {
    console.error(`NCB: Network error search:${cleanTable}`, error);
    return [];
  }
}

export async function ncbGet(table, queryParams) {
  return ncbReadAll(table, queryParams);
}

export async function getNcbStatus() {
  const status = {
    baseUrl: NCB_URL,
    usingProxy: true,
    instance: NCB_INSTANCE,
    canReadPosts: false,
    message: ''
  };

  try {
    const posts = await ncbReadAll('posts', { page: 1, limit: 1 });
    if (Array.isArray(posts)) {
      status.canReadPosts = true;
      status.message = 'Proxy connection successful.';
    } else {
      status.message = 'Proxy connected, but response format invalid.';
    }
  } catch (e) {
    status.message = `Connection failed: ${e.message}`;
  }
  return status;
}