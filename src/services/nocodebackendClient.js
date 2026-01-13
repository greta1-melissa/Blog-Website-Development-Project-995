/**
 * NoCodeBackend (NCB) Client
 * 
 * FRONTEND: Strictly calls the Cloudflare Pages Proxy (/api/ncb/*).
 * The proxy handles Instance ID and API Key injection server-side.
 */

const NCB_URL = '/api/ncb';

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
 */
function buildProxyUrl(path, extraParams = {}) {
  const url = new URL(`${window.location.origin}${NCB_URL}${path}`);
  
  Object.entries(extraParams).forEach(([key, value]) => {
    if (key.toLowerCase() !== 'instance' && value !== undefined && value !== null && value !== '') {
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
  // Robust check: NoCodeBackend sometimes returns the array directly, 
  // sometimes wrapped in a .data property.
  const source = Array.isArray(data) ? data : (data?.data && Array.isArray(data.data) ? data.data : []);
  return source.map(normalizeItem);
}

async function handleResponse(res, context) {
  if (!res.ok) {
    const errorBody = await res.text().catch(() => 'Could not read error body.');
    throw new Error(`${context} Failed (${res.status}): ${errorBody.substring(0, 100)}`);
  }
  
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    const json = await res.json().catch(() => ({}));
    // If the top level is the array, return it directly for normalizeArray to handle
    return json;
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
    return normalizeArray(json);
  } catch (error) {
    console.error(`NCB: Error readAll:${cleanTable}`, error);
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
    console.error(`NCB: Error create:${cleanTable}`, error);
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
    console.error(`NCB: Error delete:${cleanTable}`, error);
    return false;
  }
}

export async function ncbGet(table, queryParams) {
  return ncbReadAll(table, queryParams);
}

export async function getNcbStatus() {
  try {
    const posts = await ncbReadAll('posts', { limit: 1 });
    return {
      canReadPosts: Array.isArray(posts),
      message: 'Proxy connection successful.'
    };
  } catch (e) {
    return {
      canReadPosts: false,
      message: `Connection failed: ${e.message}`
    };
  }
}