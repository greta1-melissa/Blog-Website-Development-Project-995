/**
 * NoCodeBackend (NCB) Client
 * Handles all REST API interactions with the NoCodeBackend service.
 */
const NCB_URL = import.meta.env.VITE_NCB_URL || 'https://openapi.nocodebackend.com';
const NCB_INSTANCE = import.meta.env.VITE_NCB_INSTANCE;
const NCB_API_KEY = import.meta.env.VITE_NCB_API_KEY;

const getHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
  };
  if (NCB_API_KEY) {
    headers['Authorization'] = `Bearer ${NCB_API_KEY}`;
  }
  // Though we pass instance_id in query params, some versions might check headers too
  if (NCB_INSTANCE) {
    headers['Instance'] = NCB_INSTANCE;
  }
  return headers;
};

const buildUrl = (tableName, queryParams = {}) => {
  const url = new URL(`${NCB_URL}/api/v1/${tableName}`);
  // Ensure instance is passed if required
  if (NCB_INSTANCE) {
    url.searchParams.append('instance_id', NCB_INSTANCE);
  }
  Object.keys(queryParams).forEach((key) => {
    url.searchParams.append(key, queryParams[key]);
  });
  return url.toString();
};

export const ncbGet = async (tableName, queryParams = {}) => {
  try {
    const url = buildUrl(tableName, queryParams);
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      console.error(`NCB: Error fetching ${tableName}. Status: ${response.status}`);
      return [];
    }

    const json = await response.json();

    // Handle different response shapes
    if (Array.isArray(json)) {
      return json;
    } else if (json && Array.isArray(json.data)) {
      return json.data;
    } else {
      console.warn(`NCB: Unexpected response shape for ${tableName}`, json);
      return [];
    }
  } catch (error) {
    console.error(`NCB: Network/Parse error fetching ${tableName}`, error);
    // Return empty array to prevent UI crashes
    return [];
  }
};

export const ncbCreate = async (tableName, payload) => {
  try {
    const url = buildUrl(tableName);
    const response = await fetch(url, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error(`NCB: Create failed in ${tableName}. Status: ${response.status}`);
      throw new Error(`NCB Error: ${response.status}`);
    }

    const json = await response.json();
    
    // Handle wrapped response { success: true, data: {...} } vs flat object
    if (json && json.data) {
      return json.data;
    }
    return json;
  } catch (error) {
    console.error(`NCB: Error creating item in ${tableName}`, error);
    throw error;
  }
};

export const ncbUpdate = async (tableName, id, payload) => {
  try {
    const url = `${buildUrl(tableName)}/${id}`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error(`NCB: Update failed in ${tableName}. Status: ${response.status}`);
      throw new Error(`NCB Update Error: ${response.status}`);
    }
    
    const json = await response.json();
    if (json && json.data) {
      return json.data;
    }
    return json;
  } catch (error) {
    console.error(`NCB: Error updating ${tableName} ID ${id}`, error);
    throw error;
  }
};

export const ncbDelete = async (tableName, id) => {
  try {
    const url = `${buildUrl(tableName)}/${id}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    if (!response.ok) {
      console.error(`NCB: Delete failed in ${tableName}. Status: ${response.status}`);
      throw new Error(`NCB Delete Error: ${response.status}`);
    }

    const json = await response.json();
    if (json && json.data) {
      return json.data;
    }
    return json;
  } catch (error) {
    console.error(`NCB: Error deleting from ${tableName} ID ${id}`, error);
    throw error;
  }
};

/**
 * Debug helper to check NCB connection status.
 * WARNING: Do not expose sensitive values in the return object.
 */
export const getNcbStatus = async () => {
    const checks = {
        hasUrl: !!NCB_URL,
        hasInstance: !!NCB_INSTANCE,
        hasApiKey: !!NCB_API_KEY,
        canReadPosts: false,
        postCount: 0,
        message: ''
    };

    try {
        // Try to fetch posts as a connectivity test
        const posts = await ncbGet('posts');
        checks.canReadPosts = true;
        checks.postCount = Array.isArray(posts) ? posts.length : 0;
        checks.message = 'Connection successful';
    } catch (e) {
        checks.message = `Connection failed: ${e.message}`;
    }
    return checks;
};