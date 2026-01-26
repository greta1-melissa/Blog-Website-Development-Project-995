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
 * Helper to handle Cloudflare Proxy responses and NCB inner results
 */
const handleNcbResponse = (result) => {
  // 1. Check for proxy-level error (even if HTTP 200)
  if (result && result.ok === false) {
    const errorMsg = result.error || result.message || (result.upstreamPreview ? `Upstream error: ${result.upstreamPreview}` : 'NCB Proxy error');
    throw new Error(errorMsg);
  }

  // 2. Unwrap proxy data if present (the proxy wraps upstream response in "data")
  let data = (result && result.ok === true && result.data !== undefined) ? result.data : result;
  
  return data;
};

/**
 * Sanitizes payload for specific tables before sending to NCB
 */
export const sanitizeNcbPayload = (table, payload) => {
  if (!payload || typeof payload !== 'object') return payload;
  const sanitized = { ...payload };

  const toNull = (val) => (val === undefined || val === '' || val === null) ? null : val;

  if (table === 'posts') {
    const now = new Date().toISOString();
    
    let finalSlug = toNull(sanitized.slug);
    if (!finalSlug && sanitized.title) {
      finalSlug = sanitized.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    
    if (finalSlug) {
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
    
    const rawResult = await response.json();
    
    // 1. Detect and handle proxy errors/wrapping
    const result = handleNcbResponse(rawResult);
    
    // 2. Handle NCB "status: success" wrapper
    if (result && result.status === 'success' && Array.isArray(result.data)) {
      return result.data;
    }
    
    // 3. Handle direct array (some endpoints might return raw array)
    if (Array.isArray(result)) {
      return result;
    }
    
    return [];
  } catch (error) {
    console.error(`NCB ReadAll Exception (${table}):`, error);
    return [];
  }
};

/**
 * CREATE: Adds a new record
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
    throw new Error(errorText || response.statusText);
  }
  
  const rawResult = await response.json();
  const result = handleNcbResponse(rawResult);
  
  // Detect NCB-level failure
  if (result && result.status === 'failed') {
    throw new Error(result.message || result.error || 'NCB Creation failed');
  }
  
  return result;
};

/**
 * UPDATE: Updates a record
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
  
  const rawResult = await response.json();
  const result = handleNcbResponse(rawResult);
  
  // Detect NCB-level failure
  if (result && result.status === 'failed') {
    throw new Error(result.message || result.error || 'NCB Update failed');
  }
  
  return result;
};

/**
 * DELETE: Removes a record
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
  
  const rawResult = await response.json();
  const result = handleNcbResponse(rawResult);
  
  // Detect NCB-level failure
  if (result && result.status === 'failed') {
    throw new Error(result.message || result.error || 'NCB Delete failed');
  }
  
  return result;
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