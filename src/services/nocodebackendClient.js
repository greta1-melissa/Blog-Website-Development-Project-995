/**
 * NoCodeBackend (NCB) Client
 * 
 * UPDATED: Uses local proxy /api/ncb to secure the API Key.
 * Includes Cache Busting to ensure fresh data for updates.
 * Includes ID Normalization to prevent duplicates and persistence errors.
 */

// -----------------------------------------------------------------------------
// Config
// -----------------------------------------------------------------------------
const env = import.meta.env || {};

// CRITICAL CHANGE: Point to local proxy instead of external URL
const NCB_URL = '/api/ncb'; 

const NCB_INSTANCE = env.VITE_NCB_INSTANCE || '54230_bangtan_mom_blog_site';

// Debug config
console.log('[NCB Client]', {
  mode: 'Proxy Mode',
  proxyUrl: NCB_URL,
  instance: NCB_INSTANCE
});

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function buildHeaders() {
  // We NO LONGER inject the API Key here. 
  // The /api/ncb proxy adds it server-side.
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
 * Checks id, _id, ID, Id in that order.
 */
function normalizeItem(item) {
  if (!item || typeof item !== 'object') return item;
  
  // Find the ID
  const id = item.id || item._id || item.ID || item.Id;
  
  // Return shallow copy with normalized id
  // We keep original _id fields just in case, but ensure 'id' exists
  return { ...item, id: id };
}

/**
 * Normalizes an array of items.
 */
function normalizeArray(data) {
  if (!Array.isArray(data)) return [];
  return data.map(normalizeItem);
}

async function handleResponse(res, context) {
  if (!res.ok) {
    // Special handling for 405 Method Not Allowed - handled in caller
    if (res.status === 405) {
      throw new Error('405_METHOD_NOT_ALLOWED');
    }

    const errorBody = await res.text().catch(() => 'Could not read error body.');
    const errorMessage = `NCB Request Failed: ${context} (Status: ${res.status}). Body: ${errorBody.substring(0, 300)}`;
    console.error("[NCB Client Error]", errorMessage);
    
    // Try to parse JSON error for cleaner message
    try {
        const jsonErr = JSON.parse(errorBody);
        if(jsonErr.message) {
             throw new Error(`${context}: ${jsonErr.message}`);
        }
    } catch(e) {
        // ignore
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
    const res = await fetch(url, { method: 'GET', headers: buildHeaders() });
    const json = await handleResponse(res, `readAll:${cleanTable}`);
    // Normalize response data
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
    const res = await fetch(url, { method: 'GET', headers: buildHeaders() });
    const json = await handleResponse(res, `readOne:${cleanTable}:${id}`);
    // Normalize single item
    return normalizeItem(json.data || null);
  } catch (error) {
    console.error(`NCB: Network error readOne:${cleanTable}`, error);
    return null;
  }
}

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
    
    if (json && json.data) {
      const item = Array.isArray(json.data) ? json.data[0] : json.data;
      return normalizeItem(item);
    }
    return normalizeItem(json);
  } catch (error) {
    console.error(`NCB: Network error create:${cleanTable}`, error);
    throw error;
  }
}

export async function ncbUpdate(table, id, payload) {
  const cleanTable = normalizeTableName(table);
  const url = withInstanceParam(`/update/${cleanTable}/${id}`);
  
  console.log(`[NCB Update] Table: ${cleanTable}, ID: ${id}`);

  try {
    // Attempt 1: PUT
    const res = await fetch(url, {
      method: 'PUT',
      headers: buildHeaders(),
      body: JSON.stringify(payload),
    });
    return await handleResponse(res, `update:${cleanTable}:${id}`);
  } catch (error) {
    if (error.message === '405_METHOD_NOT_ALLOWED') {
      console.warn(`[NCB Update] PUT 405 for ${id}. Retrying with POST...`);
      // Attempt 2: POST (Fallback)
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: buildHeaders(),
          body: JSON.stringify(payload),
        });
        return await handleResponse(res, `update-post:${cleanTable}:${id}`);
      } catch (retryError) {
        console.error(`NCB: Update Retry failed for ${id}`, retryError);
        throw retryError;
      }
    }
    console.error(`NCB: Network error update:${cleanTable}`, error);
    throw error;
  }
}

export async function ncbDelete(table, id) {
  const cleanTable = normalizeTableName(table);
  const url = withInstanceParam(`/delete/${cleanTable}/${id}`);
  
  console.log(`[NCB Delete] Table: ${cleanTable}, ID: ${id}`);

  try {
    // Attempt 1: DELETE
    const res = await fetch(url, { method: 'DELETE', headers: buildHeaders() });
    await handleResponse(res, `delete:${cleanTable}:${id}`);
    return true;
  } catch (error) {
    if (error.message === '405_METHOD_NOT_ALLOWED') {
       console.warn(`[NCB Delete] DELETE 405 for ${id}. Retrying with POST...`);
       // Attempt 2: POST (Fallback)
       try {
         const res = await fetch(url, { method: 'POST', headers: buildHeaders() });
         await handleResponse(res, `delete-post:${cleanTable}:${id}`);
         return true;
       } catch (retryError) {
         console.error(`NCB: Delete Retry failed for ${id}`, retryError);
         return false;
       }
    }
    console.error(`NCB: Network error delete:${cleanTable}`, error);
    return false;
  }
}

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
    return normalizeArray(Array.isArray(json.data) ? json.data : []);
  } catch (error) {
    console.error(`NCB: Network error search:${cleanTable}`, error);
    return [];
  }
}

// Alias
export async function ncbGet(table, queryParams) {
  return ncbReadAll(table, queryParams);
}

// Status helper
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