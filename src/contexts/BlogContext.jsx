import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { ncbReadAll, ncbCreate, ncbUpdate, ncbDelete } from '../services/nocodebackendClient';
import { normalizeImageUrl } from '../utils/media.js';
import { BLOG_PLACEHOLDER } from '../config/assets';

const BlogContext = createContext();

export const BlogProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [postsData, productsData] = await Promise.all([
        ncbReadAll('posts'),
        ncbReadAll('product_recommendations')
      ]);
      
      // Normalize posts
      const normalizedPosts = (postsData || []).map(post => ({
        ...post,
        // Ensure image_url is consistently used for rendering
        image: post.image_url || post.image || BLOG_PLACEHOLDER,
        created_at: post.created_at || new Date().toISOString()
      })).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      // Normalize products
      const normalizedProducts = (productsData || []).map(product => ({
        ...product,
        image_url: product.image_url || BLOG_PLACEHOLDER,
        created_at: product.created_at || new Date().toISOString()
      }));

      setPosts(normalizedPosts);
      setProducts(normalizedProducts);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Derived state for public views
  const publishedPosts = useMemo(() => 
    posts.filter(post => post.status === 'published'), 
  [posts]);

  const categories = useMemo(() => 
    [...new Set(publishedPosts.map(post => post.category).filter(Boolean))], 
  [publishedPosts]);

  // BLOG POST METHODS
  const addPost = async (postData) => {
    try {
      const result = await ncbCreate('posts', postData);
      await fetchData(); // Refresh local state
      return result;
    } catch (err) {
      console.error('Add Post Error:', err);
      throw err;
    }
  };

  const updatePost = async (id, postData) => {
    try {
      const result = await ncbUpdate('posts', id, postData);
      await fetchData(); // Refresh local state
      return result;
    } catch (err) {
      console.error('Update Post Error:', err);
      throw err;
    }
  };

  const deletePost = async (id) => {
    try {
      await ncbDelete('posts', id);
      await fetchData(); // Refresh local state
    } catch (err) {
      console.error('Delete Post Error:', err);
      throw err;
    }
  };

  // PRODUCT RECOMMENDATION METHODS
  const addProduct = async (productData) => {
    try {
      const result = await ncbCreate('product_recommendations', productData);
      await fetchData();
      return result;
    } catch (err) {
      throw err;
    }
  };

  const updateProduct = async (id, productData) => {
    try {
      const result = await ncbUpdate('product_recommendations', id, productData);
      await fetchData();
      return result;
    } catch (err) {
      throw err;
    }
  };

  const deleteProduct = async (id) => {
    try {
      await ncbDelete('product_recommendations', id);
      await fetchData();
    } catch (err) {
      throw err;
    }
  };

  const value = {
    posts,
    publishedPosts, // Exposed for Home and AllBlogs
    categories,     // Exposed for Filter
    products,
    loading,
    isLoading: loading, // Alias for Home.jsx
    error,
    addPost,
    updatePost,
    deletePost,
    addProduct,
    updateProduct,
    deleteProduct,
    refreshData: fetchData,
    fetchData, // Alias for Home.jsx
  };

  return <BlogContext.Provider value={value}>{children}</BlogContext.Provider>;
};

export const useBlog = () => {
  const context = useContext(BlogContext);
  if (!context) throw new Error('useBlog must be used within a BlogProvider');
  return context;
};