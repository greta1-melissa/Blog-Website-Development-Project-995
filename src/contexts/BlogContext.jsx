import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { ncbReadAll, ncbCreate, ncbUpdate, ncbDelete } from '../services/nocodebackendClient';
import { BLOG_PLACEHOLDER } from '../config/assets';

const BlogContext = createContext();

export const BlogProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper to extract array from NCB response
  const extractArray = (res) => {
    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res.data)) return res.data;
    if (res && Array.isArray(res.results)) return res.results;
    return [];
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [postsRes, productsRes] = await Promise.all([
        ncbReadAll('posts'),
        ncbReadAll('product_recommendations')
      ]);
      
      const postsData = extractArray(postsRes);
      const productsData = extractArray(productsRes);
      
      // Normalize posts
      const normalizedPosts = postsData.map(post => {
        // Ensure status is lowercase and trimmed
        const status = (post.status || 'published').toString().toLowerCase().trim();
        
        return {
          ...post,
          title: post.title || 'Untitled Post',
          category: post.category || 'General',
          status: status,
          // Ensure image_url is consistently used for rendering
          image: post.image_url || post.image || BLOG_PLACEHOLDER,
          created_at: post.created_at || new Date().toISOString()
        };
      }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      // Normalize products
      const normalizedProducts = productsData.map(product => ({
        ...product,
        name: product.name || 'Untitled Product',
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

  // Derive categories from ALL posts for Admin use
  const categories = useMemo(() => {
    const detected = [...new Set(posts.map(post => post.category).filter(Boolean))];
    const defaults = ['Health', 'Fam Bam', 'K-Drama', 'BTS', 'Career', 'General'];
    return detected.length > 0 ? detected : defaults;
  }, [posts]);

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
    publishedPosts, 
    categories,     
    products,
    loading,
    isLoading: loading, 
    error,
    addPost,
    updatePost,
    deletePost,
    addProduct,
    updateProduct,
    deleteProduct,
    refreshData: fetchData,
    fetchData, 
  };

  return <BlogContext.Provider value={value}>{children}</BlogContext.Provider>;
};

export const useBlog = () => {
  const context = useContext(BlogContext);
  if (!context) throw new Error('useBlog must be used within a BlogProvider');
  return context;
};