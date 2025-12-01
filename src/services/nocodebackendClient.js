/**
 * NoCodeBackend (NCB) Client
 * Handles all REST API interactions with the NoCodeBackend service.
 * Updated to match Swagger: api.nocodebackend.com
 * Ensures Instance is passed as a query parameter (capital I).
 */

// 1. Base URL and Instance Configuration
const rawUrl = import.meta.env.VITE_NCB_URL || 'https://api.nocodebackend.com';
// Ensure no trailing slash
const NCB_URL = rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl;

const NCB_INSTANCE = import.meta.env.VITE_NCB_INSTANCE || '54230_bangtan_mom_blog_site';
const NCB_API_KEY = import.meta.env.VITE_NCB_API_KEY;

// Headers - API Key is Bearer token.
// CRITICAL: Instance is NOT sent in headers, only in query params.
const headers = {
  'Content-Type': 'application/json',
};

if (NCB_API_KEY) {
  headers['Authorization'] = `Bearer ${NCB_API_KEY}`;
} else {
  if (import.meta.env.DEV) {
    console.warn("NCB: VITE_NCB_API_KEY is missing! API calls will likely fail.");
  }
}

// Helper to attach the Instance query parameter and others
function withInstanceParam(path, extraParams = {}) {
  const url = new URL(`${NCB_URL}${path}`);

  if (NCB_INSTANCE) {
    // Match Swagger: ?Instance=54230_bangtan_mom_blog_site (Capital 'I')
    url.searchParams.set('Instance', NCB_INSTANCE);
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

// --- Debugging Helper ---
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

// --- CRUD Helpers Matching Swagger ---

// READ all records from a table
// Endpoint: GET /read/{table}?Instance=...
export async function ncbReadAll(table, queryParams = {}) {
  const cleanTable = normalizeTableName(table);
  const url = withInstanceParam(`/read/${cleanTable}`, queryParams);

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.error(`NCB: Read all ${cleanTable} failed:`, res.status, text);
      return null;
    }

    const json = await res.json();
    // Swagger response shape: { status: string, data: [...] }
    return Array.isArray(json.data) ? json.data : [];
  } catch (error) {
    console.error(`NCB: Network error during read all for ${cleanTable}`, error);
    return null;
  }
}

// READ a single record by id
// Endpoint: GET /read/{table}/{id}?Instance=...
export async function ncbReadOne(table, id) {
  const cleanTable = normalizeTableName(table);
  const url = withInstanceParam(`/read/${cleanTable}/${id}`);

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!res.ok) {
      if (res.status === 404) {
        return null;
      }
      const text = await res.text().catch(() => '');
      console.error(`NCB: Read ${cleanTable} by id failed:`, res.status, text);
      return null;
    }

    const json = await res.json();
    // Swagger response shape: { status: string, data: { ... } }
    return json.data || null;
  } catch (error) {
    console.error(`NCB: Network error during read one for ${cleanTable}`, error);
    return null;
  }
}

// CREATE a record
// Endpoint: POST /create/{table}?Instance=...
export async function ncbCreate(table, payload) {
  const cleanTable = normalizeTableName(table);
  const url = withInstanceParam(`/create/${cleanTable}`);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.error(`NCB: Create ${cleanTable} failed:`, res.status, text);
      throw new Error(`Server Error (${res.status}): ${text}`);
    }

    const json = await res.json();
    // Swagger response shape: { status, message, id }
    return json;
  } catch (error) {
    console.error(`NCB: Create error ${cleanTable}`, error);
    throw error;
  }
}

// UPDATE a record
// Endpoint: PUT /update/{table}/{id}?Instance=...
export async function ncbUpdate(table, id, payload) {
  const cleanTable = normalizeTableName(table);
  const url = withInstanceParam(`/update/${cleanTable}/${id}`);

  try {
    const res = await fetch(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.error(`NCB: Update ${cleanTable} failed:`, res.status, text);
      throw new Error(`NCB Update Error: ${res.status} - ${text}`);
    }

    const json = await res.json().catch(() => ({}));
    return json || { status: 'success' };
  } catch (error) {
    console.error(`NCB: Update error ${cleanTable}`, error);
    throw error;
  }
}

// DELETE a record
// Endpoint: DELETE /delete/{table}/{id}?Instance=...
export async function ncbDelete(table, id) {
  const cleanTable = normalizeTableName(table);
  const url = withInstanceParam(`/delete/${cleanTable}/${id}`);

  try {
    const res = await fetch(url, {
      method: 'DELETE',
      headers,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.error(`NCB: Delete ${cleanTable} failed:`, res.status, text);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`NCB: Delete error ${cleanTable}`, error);
    return false;
  }
}

// SEARCH records (optional helper)
// Endpoint: POST /search/{table}?Instance=...
export async function ncbSearch(table, filters = {}) {
  const cleanTable = normalizeTableName(table);
  const url = withInstanceParam(`/search/${cleanTable}`);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(filters),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.error(`NCB: Search ${cleanTable} failed:`, res.status, text);
      return [];
    }

    const json = await res.json();
    return Array.isArray(json.data) ? json.data : [];
  } catch (error) {
    console.error(`NCB: Network error during search for ${cleanTable}`, error);
    return [];
  }
}

// --- Backwards Compatibility ---
// Alias ncbGet to ncbReadAll so we don't break existing calls in the app
export async function ncbGet(table, queryParams) {
  return ncbReadAll(table, queryParams);
}

// --- Status Check ---
export const getNcbStatus = async () => {
  const config = getNcbConfig();
  const checks = {
    ...config,
    canReadPosts: false,
    postCount: 0,
    message: ''
  };

  try {
    // Uses the new ncbReadAll helper internally
    const posts = await ncbReadAll('posts');
    
    if (posts === null) {
        checks.canReadPosts = false;
        checks.message = 'Connection failed (Network or Auth Error)';
    } else {
        checks.canReadPosts = true;
        checks.postCount = Array.isArray(posts) ? posts.length : 0;
        checks.message = 'Connection successful';
    }
  } catch (e) {
    checks.message = `Connection failed: ${e.message}`;
  }

  return checks;
};