/**
 * Frontend client for NoCodeBackend (NCB)
 * Interacts with /api/ncb proxy to inject secrets server-side
 */

const ALLOWED_TABLES = [
  'posts',
  'users',
  'kdrama_recommendations',
  'product_recommendations',
  'forum_categories',
  'forum_threads',
  'forum_posts'
];

/**
 * Normalizes various date inputs into strict YYYY-MM-DD format for NCB/SQL
 */
export const normalizeNcbDate = (dateInput) => {
  if (!dateInput) return null;
  try {
    let d;
    if (dateInput instanceof Date) {
      d = dateInput;
    } else if (typeof dateInput === 'string') {
      if (dateInput.includes('/')) {
        const parts = dateInput.split('/');
        if (parts.length === 3) {
          const day = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10) - 1;
          const year = parseInt(parts[2], 10);
          d = new Date(year, month, day);
        }
      } else {
        d = new Date(dateInput);
      }
    }
    if (d && !isNaN(d.getTime())) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  } catch (e) {
    console.error("Date normalization error:", e);
  }
  return null;
};

/**
 * Sanitizes payload for specific tables before sending to NCB
 */
export const sanitizeNcbPayload = (table, payload) => {
  if (!payload || typeof payload !== 'object') return payload;
  const sanitized = { ...payload };

  if (table === 'posts') {
    if (sanitized.date) {
      const normalized = normalizeNcbDate(sanitized.date);
      if (normalized) sanitized.date = normalized;
    }
    if (!sanitized.status) sanitized.status = 'Published';
    sanitized.meta_title = sanitized.meta_title || sanitized.title || '';
    sanitized.meta_description = sanitized.meta_description || '';
    sanitized.meta_keywords = sanitized.meta_keywords || '';
    sanitized.og_image = sanitized.og_image || sanitized.image || '';
  }
  return sanitized;
};

/**
 * READ ALL: Fetches records using /api/ncb/read/tableName
 */
export const ncbReadAll = async (table) => {
  if (!ALLOWED_TABLES.includes(table)) throw new Error(`Table ${table} is not allowed`);
  try {
    // ✅ Crucial: Standard NCB API for reading all records is /read/table
    const response = await fetch(`/api/ncb/read/${table}`);
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`NCB Read Error [${table}]: Status ${response.status}`, errorText);
      return [];
    }
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error(`NCB ReadAll Network Error (${table}):`, error);
    return [];
  }
};

/**
 * CREATE: Adds a new record using /api/ncb/create/tableName
 */
export const ncbCreate = async (table, data) => {
  if (!ALLOWED_TABLES.includes(table)) throw new Error(`Table ${table} is not allowed`);
  const sanitizedData = sanitizeNcbPayload(table, data);
  const response = await fetch(`/api/ncb/create/${table}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sanitizedData),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`NCB Create Error: ${errorText}`);
  }
  return response.json();
};

/**
 * UPDATE: Updates a record using /api/ncb/update/tableName/id
 */
export const ncbUpdate = async (table, id, data) => {
  if (!ALLOWED_TABLES.includes(table)) throw new Error(`Table ${table} is not allowed`);
  const sanitizedData = sanitizeNcbPayload(table, data);
  const response = await fetch(`/api/ncb/update/${table}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sanitizedData),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`NCB Update Error: ${errorText}`);
  }
  return response.json();
};

/**
 * DELETE: Removes a record using /api/ncb/delete/tableName/id
 */
export const ncbDelete = async (table, id) => {
  if (!ALLOWED_TABLES.includes(table)) throw new Error(`Table ${table} is not allowed`);
  const response = await fetch(`/api/ncb/delete/${table}/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`NCB Delete Error: ${errorText}`);
  }
  return response.json();
};

/**
 * Connectivity Check
 */
export const getNcbStatus = async () => {
  try {
    const test = await ncbReadAll('posts');
    return { ok: true, count: test.length };
  } catch (error) {
    return { ok: false, error: error.message };
  }
};