/**
 * NoCodeBackend (NCB) Client
 * Handles all REST API interactions with the NoCodeBackend service.
 * Updated to match Swagger: api.nocodebackend.com
 * Ensures Instance is passed as a query parameter (capital I).
 * Never sends Instance in headers.
 */

// 1. Config and headers
const rawUrl = import.meta.env.VITE_NCB_URL || 'https://api.nocodebackend.com';
const NCB_URL = rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl;

const NCB_INSTANCE = import.meta.env.VITE_NCB_INSTANCE || '54230_bangtan_mom_blog_site';
const NCB_API_KEY = import.meta.env.VITE_NCB_API_KEY;

const headers = {
  'Content-Type': 'application/json',
};

if (NCB_API_KEY) {
  headers['Authorization'] = `Bearer ${NCB_API_KEY}`;
}

// Debug config log
console.log('[NCB config]', {
  url: NCB_URL,
  instance: NCB_INSTANCE,
  hasApiKey: !!NCB_API_KEY,
});

// 2. URL helper with Instance query param
function withInstanceParam(path, extraParams = {}) {
  const url = new URL(`${NCB_URL}${path}`);

  if (NCB_INSTANCE) {
    url.searchParams.set('Instance', NCB_INSTANCE); // exact name, capital I
  }

  Object.entries(extraParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value));
    }
  });

  return url.toString();
}

function normalizeTableName(table) {
  return String(table).trim().toLowerCase();
}

// 3. Use the correct endpoints and improved error logging

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
  return res.json().catch(() => ({})); // Handle empty bodies gracefully if needed, though usually JSON
}

// READ all
export async function ncbReadAll(table, queryParams = {}) {
  const cleanTable = normalizeTableName(table);
  const url = withInstanceParam(`/read/${cleanTable}`, queryParams);

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers,
    });

    const json = await handleResponse(res, `readAll:${cleanTable}`);
    if (!json) return [];

    return Array.isArray(json.data) ? json.data : [];
  } catch (err) {
    console.error(`NCB: Network error readAll:${cleanTable}`, err);
    return [];
  }
}

// READ one by id
export async function ncbReadOne(table, id) {
  const cleanTable = normalizeTableName(table);
  const url = withInstanceParam(`/read/${cleanTable}/${id}`);

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers,
    });

    const json = await handleResponse(res, `readOne:${cleanTable}:${id}`);
    return json?.data || null;
  } catch (err) {
    console.error(`NCB: Network error readOne:${cleanTable}`, err);
    return null;
  }
}

// CREATE
export async function ncbCreate(table, payload) {
  const cleanTable = normalizeTableName(table);
  const url = withInstanceParam(`/create/${cleanTable}`);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    return handleResponse(res, `create:${cleanTable}`);
  } catch (err) {
    console.error(`NCB: Network error create:${cleanTable}`, err);
    throw err;
  }
}

// UPDATE
export async function ncbUpdate(table, id, payload) {
  const cleanTable = normalizeTableName(table);
  const url = withInstanceParam(`/update/${cleanTable}/${id}`);

  try {
    const res = await fetch(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify(payload),
    });

    return handleResponse(res, `update:${cleanTable}:${id}`);
  } catch (err) {
    console.error(`NCB: Network error update:${cleanTable}`, err);
    throw err;
  }
}

// DELETE
export async function ncbDelete(table, id) {
  const cleanTable = normalizeTableName(table);
  const url = withInstanceParam(`/delete/${cleanTable}/${id}`);

  try {
    const res = await fetch(url, {
      method: 'DELETE',
      headers,
    });

    const json = await handleResponse(res, `delete:${cleanTable}:${id}`);
    return !!json || res?.ok;
  } catch (err) {
    console.error(`NCB: Network error delete:${cleanTable}`, err);
    return false;
  }
}

// SEARCH
export async function ncbSearch(table, filters = {}) {
  const cleanTable = normalizeTableName(table);
  const url = withInstanceParam(`/search/${cleanTable}`);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(filters),
    });

    const json = await handleResponse(res, `search:${cleanTable}`);
    if (!json) return [];
    return Array.isArray(json.data) ? json.data : [];
  } catch (err) {
    console.error(`NCB: Network error search:${cleanTable}`, err);
    return [];
  }
}

// Backwards compatibility
export async function ncbGet(table, queryParams) {
  return ncbReadAll(table, queryParams);
}

// --- Debugging Helpers (Preserved) ---
export const getNcbConfig = () => {
  return {
    url: NCB_URL,
    instance: NCB_INSTANCE,
    hasInstance: !!NCB_INSTANCE,
    hasApiKey: !!NCB_API_KEY,
    maskedInstance: NCB_INSTANCE ? `${NCB_INSTANCE.substring(0, 4)}...${NCB_INSTANCE.slice(-4)}` : 'Missing',
    maskedKey: NCB_API_KEY ? `${NCB_API_KEY.substring(0, 4)}...${NCB_API_KEY.slice(-4)}` : 'Missing'
  };
};

export const getNcbStatus = async () => {
  const config = getNcbConfig();
  const checks = {
    ...config,
    canReadPosts: false,
    postCount: 0,
    message: ''
  };

  try {
    const posts = await ncbReadAll('posts');
    
    if (posts && Array.isArray(posts)) {
        checks.canReadPosts = true;
        checks.postCount = posts.length;
        checks.message = 'Connection successful';
    } else {
        checks.canReadPosts = false;
        checks.message = 'Connection failed (See console for details)';
    }
  } catch (e) {
    checks.message = `Connection failed: ${e.message}`;
  }

  return checks;
};