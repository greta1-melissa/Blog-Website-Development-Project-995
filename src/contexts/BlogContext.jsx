import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { ncbReadAll, ncbCreate, ncbUpdate, ncbDelete, sanitizeNcbPayload } from '../services/nocodebackendClient';
import { getImageSrc } from '../utils/media.js';
import { BLOG_PLACEHOLDER, PLACEHOLDER_IMAGE } from '../config/assets';

const BlogContext = createContext();
export const useBlog = () => useContext(BlogContext);

export const BlogProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const normalizeItem = useCallback((item, type = 'post') => {
    if (!item) return null;
    const rawImage = item.image || item.image_url || item.featured_image_url || '';
    const cleanImage = getImageSrc(rawImage, type === 'post' ? BLOG_PLACEHOLDER : PLACEHOLDER_IMAGE);
    
    // Lenient status: If not explicitly 'draft', it's published
    const status = (item.status || 'published').toString().toLowerCase().trim();
    const isPublished = status !== 'draft';

    return {
      ...item,
      id: item.id || item._id,
      title: item.title || 'Untitled',
      status: isPublished ? 'published' : 'draft',
      category: item.category || 'General',
      excerpt: item.excerpt || item.summary || '',
      content: item.content || '',
      image: cleanImage,
      date: item.date || item.created_at || new Date().toISOString()
    };
  }, []);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [pRes, prodRes] = await Promise.all([
        ncbReadAll('posts'),
        ncbReadAll('product_recommendations')
      ]);
      setPosts(pRes.map(p => normalizeItem(p, 'post')).filter(Boolean));
      setProducts(prodRes.map(p => normalizeItem(p, 'product')).filter(Boolean));
    } catch (err) {
      console.error('Fetch Failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, [normalizeItem]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <BlogContext.Provider value={{
      posts, products, isLoading, fetchData,
      publishedPosts: posts.filter(p => p.status === 'published'),
      addPost: async (d) => { await ncbCreate('posts', sanitizeNcbPayload('posts', d)); await fetchData(); },
      updatePost: async (id, d) => { await ncbUpdate('posts', id, sanitizeNcbPayload('posts', d)); await fetchData(); },
      deletePost: async (id) => { await ncbDelete('posts', id); await fetchData(); },
      addProduct: async (d) => { await ncbCreate('product_recommendations', sanitizeNcbPayload('product_recommendations', d)); await fetchData(); },
      updateProduct: async (id, d) => { await ncbUpdate('product_recommendations', id, sanitizeNcbPayload('product_recommendations', d)); await fetchData(); },
      deleteProduct: async (id) => { await ncbDelete('product_recommendations', id); await fetchData(); },
      getPost: (id) => posts.find(p => String(p.id) === String(id)) || products.find(p => String(p.id) === String(id)),
      categories: ['Health', 'Fam Bam', 'K-Drama', 'BTS', 'Career']
    }}>
      {children}
    </BlogContext.Provider>
  );
};