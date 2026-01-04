/**
 * NoCodeBackend (NCB) Client
 * 
 * FRONTEND: Simplified to call the Cloudflare Pages Proxy (/api/ncb/*).
 * The proxy function handles the injection of the NCB Instance ID and API Key.
 */

const NCB_URL = '/api/ncb';

/**
 * Defensive check to prevent FormData from being sent to NCB.
 */
function validatePayload(payload, context) {
  if (payload instanceof FormData) {
    const errorMsg = `NCB Client Error [${context}]: FormData is NOT allowed. Use plain objects.`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }
}

function buildHeaders() {
  return {
    'Content-Type': 'application/json'
  };
}

function normalizeTableName(table) {
  return String(table).trim().toLowerCase();
}

/**
 * Build the URL for the proxy.
 * Does NOT append Instance ID; relies on server-side injection.
 */
function buildProxyUrl(path, extraParams = {}) {
  const url = new URL(`${window.location.origin}${NCB_URL}${path}`);
  
  // Apply filters, pagination, etc.
  Object.entries(extraParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  });

  // Cache Busting
  url.searchParams.set('_t', Date.now());
  
  return url.toString();
}

function normalizeItem(item) {
  if (!item || typeof item !== 'object') return item;
  const id = item.id || item._id || item.ID || item.Id;
  return { ...item, id: id };
}

function normalizeArray(data) {
  if (!Array.isArray(data)) return [];
  return data.map(normalizeItem);
}

async function handleResponse(res, context) {
  if (!res.ok) {
    if (res.status === 405) throw new Error('405_METHOD_NOT_ALLOWED');
    const errorBody = await res.text().catch(() => 'Could not read error body.');
    throw new Error(`${context} Failed (${res.status}): ${errorBody.substring(0, 100)}`);
  }
  
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return res.json().catch(() => ({}));
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
    return normalizeArray(json.data);
  } catch (error) {
    console.error(`NCB: Error readAll:${cleanTable}`, error);
    return [];
  }
}

export async function ncbReadOne(table, id) {
  const cleanTable = normalizeTableName(table);
  const url = buildProxyUrl(`/read/${cleanTable}/${id}`);
  
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: buildHeaders()
    });
    const json = await handleResponse(res, `readOne:${cleanTable}:${id}`);
    return normalizeItem(json.data || null);
  } catch (error) {
    console.error(`NCB: Error readOne:${cleanTable}`, error);
    return null;
  }
}

export async function ncbCreate(table, payload) {
  const cleanTable = normalizeTableName(table);
  validatePayload(payload, `create:${cleanTable}`);
  
  const url = buildProxyUrl(`/create/${cleanTable}`);
  
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify(payload),
    });
    const json = await handleResponse(res, `create:${cleanTable}`);
    const item = (json && json.data) ? (Array.isArray(json.data) ? json.data[0] : json.data) : json;
    return normalizeItem(item);
  } catch (error) {
    console.error(`NCB: Error create:${cleanTable}`, error);
    throw error;
  }
}

export async function ncbUpdate(table, id, payload) {
  const cleanTable = normalizeTableName(table);
  validatePayload(payload, `update:${cleanTable}`);
  
  const url = buildProxyUrl(`/update/${cleanTable}/${id}`);
  
  try {
    const res = await fetch(url, {
      method: 'PUT',
      headers: buildHeaders(),
      body: JSON.stringify(payload),
    });
    return await handleResponse(res, `update:${cleanTable}:${id}`);
  } catch (error) {
    // Some NCB configurations require POST for updates
    if (error.message === '405_METHOD_NOT_ALLOWED') {
      const res = await fetch(url, {
        method: 'POST',
        headers: buildHeaders(),
        body: JSON.stringify(payload),
      });
      return await handleResponse(res, `update-post:${cleanTable}:${id}`);
    }
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
    console.error(`NCB: Error delete:${cleanTable}`, error);
    return false;
  }
}

export async function ncbSearch(table, filters = {}) {
  const cleanTable = normalizeTableName(table);
  validatePayload(filters, `search:${cleanTable}`);
  
  const url = buildProxyUrl(`/search/${cleanTable}`);
  
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify(filters),
    });
    const json = await handleResponse(res, `search:${cleanTable}`);
    return normalizeArray(Array.isArray(json.data) ? json.data : []);
  } catch (error) {
    console.error(`NCB: Error search:${cleanTable}`, error);
    return [];
  }
}

export async function ncbGet(table, queryParams) {
  return ncbReadAll(table, queryParams);
}

/**
 * Checks connectivity to the proxy.
 */
export async function getNcbStatus() {
  const status = {
    canReadPosts: false,
    message: ''
  };
  
  try {
    const posts = await ncbReadAll('posts', { limit: 1 });
    if (Array.isArray(posts)) {
      status.canReadPosts = true;
      status.message = 'Proxy connection successful.';
    }
  } catch (e) {
    status.message = `Connection failed: ${e.message}`;
  }
  return status;
}