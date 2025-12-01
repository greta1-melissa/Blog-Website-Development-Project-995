/**
 * NoCodeBackend (NCB) Client
 * Handles all REST API interactions with the NoCodeBackend service.
 * Updated to use openapi.nocodebackend.com endpoints.
 */

// 1. Update Base URL and instance handling
const rawUrl = import.meta.env.VITE_NCB_URL || 'https://openapi.nocodebackend.com';
const NCB_URL = rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl;

const NCB_INSTANCE = import.meta.env.VITE_NCB_INSTANCE || '54230_bangtan_mom_blog_site';
const NCB_API_KEY = import.meta.env.VITE_NCB_API_KEY;

// Headers are constant, can be defined once
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

// Helper to attach the Instance query parameter
function withInstanceParam(path, extraParams = {}) {
  const url = new URL(`${NCB_URL}${path}`);

  if (NCB_INSTANCE) {
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
    instance: NCB_INSTANCE, // Expose for debugging
    hasInstance: !!NCB_INSTANCE,
    hasApiKey: !!NCB_API_KEY,
    maskedInstance: NCB_INSTANCE ? `${NCB_INSTANCE.substring(0, 4)}...${NCB_INSTANCE.slice(-4)}` : 'Missing',
    maskedKey: NCB_API_KEY ? `${NCB_API_KEY.substring(0, 4)}...${NCB_API_KEY.slice(-4)}` : 'Missing'
  };
};

// --- New API Methods ---

export async function ncbReadAll(table, queryParams = {}) {
  const cleanTable = normalizeTableName(table);
  const url = withInstanceParam(`/read/${cleanTable}`, queryParams);

  try {
    const res = await fetch(url, { method: 'GET', headers });
    if (!res.ok) {
      console.error(`NCB: Read all ${cleanTable} failed:`, res.status, await res.text());
      return null;
    }
    const json = await res.json();
    return Array.isArray(json.data) ? json.data : [];
  } catch (error) {
    console.error(`NCB: Network error during read all for ${cleanTable}`, error);
    return null;
  }
}

export async function ncbReadOne(table, id) {
  const cleanTable = normalizeTableName(table);
  const url = withInstanceParam(`/read/${cleanTable}/${id}`);
  
  try {
    const res = await fetch(url, { method: 'GET', headers });
    if (!res.ok) {
      if (res.status === 404) return null;
      console.error(`NCB: Read ${cleanTable} by id failed:`, res.status, await res.text());
      return null;
    }
    const json = await res.json();
    return json.data || null;
  } catch (error) {
    console.error(`NCB: Network error during read one for ${cleanTable}`, error);
    return null;
  }
}

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
      const errorText = await res.text();
      console.error(`NCB: Create ${cleanTable} failed: ${res.status}`, errorText);
      throw new Error(`Server Error (${res.status}): ${errorText}`);
    }
    const json = await res.json();
    // Swagger: { status, message, id }
    return json;
  } catch (error) {
    console.error(`NCB: Create error ${cleanTable}`, error);
    throw error;
  }
}

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
      const errorText = await res.text();
      console.error(`NCB: Update ${cleanTable} failed:`, res.status, errorText);
      throw new Error(`NCB Update Error: ${res.status}`);
    }
    const json = await res.json().catch(() => ({}));
    return json || { status: 'success' };
  } catch (error) {
    console.error(`NCB: Update error ${cleanTable}`, error);
    throw error;
  }
}

export async function ncbDelete(table, id) {
  const cleanTable = normalizeTableName(table);
  const url = withInstanceParam(`/delete/${cleanTable}/${id}`);

  try {
    const res = await fetch(url, {
      method: 'DELETE',
      headers,
    });
    if (!res.ok) {
      console.error(`NCB: Delete ${cleanTable} failed:`, res.status, await res.text());
      return false;
    }
    return true;
  } catch (error) {
    console.error(`NCB: Delete error ${cleanTable}`, error);
    return false;
  }
}

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
      console.error(`NCB: Search ${cleanTable} failed:`, res.status, await res.text());
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