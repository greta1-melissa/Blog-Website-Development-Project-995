/**
 * Frontend client for NoCodeBackend (NCB)
 * Interacts with /api/ncb proxy to inject secrets server-side
 */

const ALLOWED_TABLES = [
  'posts',
  'users',
  'kdramas',
  'categories',
  'product_recommendations',
  'forum_categories',
  'forum_threads',
  'forum_posts'
];

/**
 * Normalizes various date inputs into strict YYYY-MM-DD format for NCB/SQL
 * @deprecated Prefer toISOString() for timestamp fields as per latest requirements
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
 * Enforces exact field names and ISO formats required by the database schema
 */
export const sanitizeNcbPayload = (table, payload) => {
  if (!payload || typeof payload !== 'object') return payload;
  const sanitized = { ...payload };

  // Helper to convert empty values to null
  const toNull = (val) => (val === undefined || val === '' || val === null) ? null : val;

  if (table === 'posts') {
    const now = new Date().toISOString();
    
    // Ensure slug is unique by appending timestamp
    let finalSlug = toNull(sanitized.slug);
    if (!finalSlug && sanitized.title) {
      finalSlug = sanitized.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    
    // Always append timestamp to ensure uniqueness as per DB constraint
    if (finalSlug) {
      // If it already has a long timestamp at the end, don't append another one
      const timestampRegex = /-\d{13,}$/;
      if (!timestampRegex.test(finalSlug)) {
        finalSlug = `${finalSlug}-${Date.now()}`;
      }
    }

    const finalPayload = {
      title: toNull(sanitized.title),
      slug: finalSlug,
      excerpt: toNull(sanitized.excerpt),
      content_html: toNull(sanitized.content_html || sanitized.content),
      featured_image_dropbox_url: toNull(sanitized.featured_image_dropbox_url),
      featured_image_url: toNull(sanitized.featured_image_url || sanitized.image),
      category_id: (sanitized.category_id !== undefined && sanitized.category_id !== null && sanitized.category_id !== '') ? Number(sanitized.category_id) : null,
      author_name: toNull(sanitized.author_name || sanitized.author),
      author_email: toNull(sanitized.author_email),
      status: (sanitized.status || 'draft').toLowerCase(),
      created_at: toNull(sanitized.created_at) || now,
      updated_at: now
    };

    // Set published_at based on status
    if (finalPayload.status === 'published') {
      finalPayload.published_at = toNull(sanitized.published_at) || now;
    } else {
      finalPayload.published_at = null;
    }

    return finalPayload;
  }
  
  return sanitized;
};

/**
 * READ ALL: Fetches records using /api/ncb/read/tableName
 */
export const ncbReadAll = async (table) => {
  if (!ALLOWED_TABLES.includes(table)) throw new Error(`Table ${table} is not allowed`);
  try {
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
  
  // Debug log as requested
  console.log(`NCB Create [${table}] Payload:`, sanitizedData);
  
  const response = await fetch(`/api/ncb/create/${table}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sanitizedData),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`NCB Create [${table}] Error (Status ${response.status}):`, errorText);
    
    let parsedError;
    try {
      parsedError = JSON.parse(errorText);
    } catch (e) {
      parsedError = errorText;
    }
    
    throw new Error(typeof parsedError === 'object' ? JSON.stringify(parsedError) : errorText || response.statusText);
  }
  return response.json();
};

/**
 * UPDATE: Updates a record using /api/ncb/update/tableName/id
 */
export const ncbUpdate = async (table, id, data) => {
  if (!ALLOWED_TABLES.includes(table)) throw new Error(`Table ${table} is not allowed`);
  const sanitizedData = sanitizeNcbPayload(table, data);
  
  // Debug log as requested
  console.log(`NCB Update [${table}: ${id}] Payload:`, sanitizedData);
  
  const response = await fetch(`/api/ncb/update/${table}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sanitizedData),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`NCB Update [${table}] Error:`, errorText);
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