import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { ncbReadAll, ncbCreate, ncbUpdate, ncbDelete, sanitizeNcbPayload } from '../services/nocodebackendClient';
import { getImageSrc } from '../utils/media.js';
import { BLOG_PLACEHOLDER, PLACEHOLDER_IMAGE } from '../config/assets';

const BlogContext = createContext();

export const useBlog = () => {
  const context = useContext(BlogContext);
  if (!context) {
    throw new Error('useBlog must be used within a BlogProvider');
  }
  return context;
};

export const BlogProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const TABLES = {
    POSTS: 'posts',
    PRODUCTS: 'product_recommendations'
  };

  const normalizeItem = useCallback((item, type = 'post') => {
    if (!item) return null;
    
    const rawImage = item.image || item.image_url || item.featured_image_url || '';
    const fallback = type === 'post' ? BLOG_PLACEHOLDER : PLACEHOLDER_IMAGE;
    const cleanImage = getImageSrc(rawImage, fallback);
    
    // Robust status handling: Treat missing, '1', or 'true' as published
    const rawStatus = (item.status || 'published').toString().toLowerCase().trim();
    const isPublished = rawStatus === 'published' || rawStatus === '1' || rawStatus === 'true';
    const cleanStatus = isPublished ? 'published' : 'draft';

    return {
      ...item,
      id: item.id || item._id,
      title: item.title || 'Untitled',
      status: cleanStatus,
      category: item.category || (type === 'post' ? 'General' : 'Product Recommendations'),
      excerpt: item.excerpt || item.summary || item.short_blurb || '',
      content: item.content || item.detailed_review || '',
      image: cleanImage,
      date: item.date || item.created_at || new Date().toISOString(),
      // SEO Fields
      seo_title: item.seo_title || item.title || '',
      meta_description: item.meta_description || item.seo_description || item.excerpt || '',
      focus_keyword: item.focus_keyword || item.seo_keywords || '',
      og_image_url: item.og_image_url || cleanImage,
      canonical_url: item.canonical_url || '',
      noindex: item.noindex === true || item.noindex === 'true' || item.noindex === 1
    };
  }, []);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const postsRes = await ncbReadAll(TABLES.POSTS);
      const normalizedPosts = (Array.isArray(postsRes) ? postsRes : [])
        .map(p => normalizeItem(p, 'post'))
        .filter(Boolean);

      const productsRes = await ncbReadAll(TABLES.PRODUCTS);
      const normalizedProducts = (Array.isArray(productsRes) ? productsRes : [])
        .map(p => normalizeItem(p, 'product'))
        .filter(Boolean);

      setPosts(normalizedPosts.sort((a,b) => new Date(b.date) - new Date(a.date)));
      setProducts(normalizedProducts.sort((a,b) => new Date(b.date) - new Date(a.date)));
    } catch (err) {
      console.error('BlogContext: Fetch failed', err);
      setError("Sync issue.");
    } finally {
      setIsLoading(false);
    }
  }, [normalizeItem, TABLES.POSTS, TABLES.PRODUCTS]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const publishedPosts = useMemo(() => 
    posts.filter(p => p.status === 'published'), 
  [posts]);

  const addPost = async (data) => {
    try {
      const payload = sanitizeNcbPayload('posts', data);
      const res = await ncbCreate(TABLES.POSTS, payload);
      await fetchData();
      return res;
    } catch (err) {
      console.error('Add Post Failed:', err);
      throw err;
    }
  };

  const updatePost = async (id, data) => {
    try {
      const payload = sanitizeNcbPayload('posts', data);
      await ncbUpdate(TABLES.POSTS, id, payload);
      await fetchData();
    } catch (err) {
      console.error('Update Post Failed:', err);
      throw err;
    }
  };

  const deletePost = async (id) => {
    try {
      await ncbDelete(TABLES.POSTS, id);
      await fetchData();
    } catch (err) {
      console.error('Delete Post Failed:', err);
      throw err;
    }
  };

  const addProduct = async (data) => {
    try {
      const payload = sanitizeNcbPayload('product_recommendations', data);
      const res = await ncbCreate(TABLES.PRODUCTS, payload);
      await fetchData();
      return res;
    } catch (err) {
      console.error('Add Product Failed:', err);
      throw err;
    }
  };

  const updateProduct = async (id, data) => {
    try {
      const payload = sanitizeNcbPayload('product_recommendations', data);
      await ncbUpdate(TABLES.PRODUCTS, id, payload);
      await fetchData();
    } catch (err) {
      console.error('Update Product Failed:', err);
      throw err;
    }
  };

  const deleteProduct = async (id) => {
    try {
      await ncbDelete(TABLES.PRODUCTS, id);
      await fetchData();
    } catch (err) {
      console.error('Delete Product Failed:', err);
      throw err;
    }
  };

  return (
    <BlogContext.Provider value={{
      posts, publishedPosts, products, isLoading, error,
      addPost, updatePost, deletePost, addProduct, updateProduct, deleteProduct,
      fetchData, categories: ['Health', 'Fam Bam', 'K-Drama', 'BTS', 'Career'],
      getPost: (id) => posts.find(p => String(p.id) === String(id)) || products.find(p => String(p.id) === String(id))
    }}>
      {children}
    </BlogContext.Provider>
  );
};