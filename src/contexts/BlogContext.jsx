import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { ncbReadAll, ncbCreate, ncbUpdate, ncbDelete } from '../services/nocodebackendClient';
import { ensureUniqueSlug, calculateReadTime } from '../utils/slugUtils';

const BlogContext = createContext();

export const BlogProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categories] = useState(['Life', 'BTS', 'Parenting', 'Self-Care', 'K-Drama', 'General']);

  const fetchBlogData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Use logical OR with empty arrays to ensure we never have undefined data
      const [pData, prodData] = await Promise.all([
        ncbReadAll('posts').catch(() => []),
        ncbReadAll('product_recommendations').catch(() => [])
      ]);
      setPosts(pData || []);
      setProducts(prodData || []);
    } catch (error) {
      console.error('Error fetching blog data:', error);
      // Ensure state is at least empty arrays on total failure
      setPosts(prev => prev || []);
      setProducts(prev => prev || []);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBlogData();
  }, [fetchBlogData]);

  // Public filtering: Only show published posts
  const publishedPosts = useMemo(() => 
    (posts || []).filter(p => p.status === 'Published').sort((a, b) => new Date(b.date) - new Date(a.date)),
  [posts]);

  // --- Post Methods ---
  const addPost = async (postData) => {
    const slug = postData.slug || ensureUniqueSlug(postData.title, posts);
    const readtime = calculateReadTime(postData.content);
    const finalData = { ...postData, slug, readtime, ishandpicked: postData.ishandpicked ? 1 : 0 };

    const newPost = await ncbCreate('posts', finalData);
    if (newPost) {
      setPosts(prev => [newPost, ...(prev || [])]);
      return newPost;
    }
  };

  const updatePost = async (id, postData) => {
    const slug = postData.slug || ensureUniqueSlug(postData.title, posts, id);
    const readtime = calculateReadTime(postData.content);
    const finalData = { ...postData, slug, readtime, ishandpicked: postData.ishandpicked ? 1 : 0 };

    await ncbUpdate('posts', id, finalData);
    setPosts(prev => (prev || []).map(p => p.id === id ? { ...p, ...finalData } : p));
  };

  const deletePost = async (id) => {
    await ncbDelete('posts', id);
    setPosts(prev => (prev || []).filter(p => p.id !== id));
  };

  // --- Product Methods ---
  const addProduct = async (prodData) => {
    const newProd = await ncbCreate('product_recommendations', prodData);
    if (newProd) {
      setProducts(prev => [newProd, ...(prev || [])]);
      return newProd;
    }
  };

  const updateProduct = async (id, prodData) => {
    await ncbUpdate('product_recommendations', id, prodData);
    setProducts(prev => (prev || []).map(p => p.id === id ? { ...p, ...prodData } : p));
  };

  const deleteProduct = async (id) => {
    await ncbDelete('product_recommendations', id);
    setProducts(prev => (prev || []).filter(p => p.id !== id));
  };

  return (
    <BlogContext.Provider value={{ 
      posts: posts || [], 
      publishedPosts: publishedPosts || [], 
      products: products || [], 
      categories,
      isLoading, 
      addPost, 
      updatePost, 
      deletePost,
      addProduct,
      updateProduct,
      deleteProduct,
      refreshData: fetchBlogData 
    }}>
      {children}
    </BlogContext.Provider>
  );
};

export const useBlog = () => useContext(BlogContext);