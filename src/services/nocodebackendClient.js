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
  
  if (NCB_INSTANCE) {
    headers['Instance'] = NCB_INSTANCE;
  }
  
  return headers;
};

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`NCB API Error: ${response.status} ${response.statusText} - ${errorText}`);
  }
  return response.json();
};

const buildUrl = (tableName, queryParams = {}) => {
  const url = new URL(`${NCB_URL}/api/v1/${tableName}`);
  
  // Ensure instance is passed if required by specific API flavor, 
  // though header is usually sufficient.
  if (NCB_INSTANCE) {
    url.searchParams.append('instance_id', NCB_INSTANCE);
  }
  
  Object.keys(queryParams).forEach(key => {
    url.searchParams.append(key, queryParams[key]);
  });
  
  return url.toString();
};

export const ncbGet = async (tableName, queryParams = {}) => {
  try {
    const response = await fetch(buildUrl(tableName, queryParams), {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(response);
  } catch (error) {
    console.error(`Error fetching from ${tableName}:`, error);
    // Return empty array to prevent UI crashes on fetch failure
    return [];
  }
};

export const ncbCreate = async (tableName, payload) => {
  try {
    const response = await fetch(buildUrl(tableName), {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(response);
  } catch (error) {
    console.error(`Error creating in ${tableName}:`, error);
    throw error;
  }
};

export const ncbUpdate = async (tableName, id, payload) => {
  try {
    const response = await fetch(`${buildUrl(tableName)}/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(response);
  } catch (error) {
    console.error(`Error updating ${tableName} ID ${id}:`, error);
    throw error;
  }
};

export const ncbDelete = async (tableName, id) => {
  try {
    const response = await fetch(`${buildUrl(tableName)}/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(response);
  } catch (error) {
    console.error(`Error deleting from ${tableName} ID ${id}:`, error);
    throw error;
  }
};