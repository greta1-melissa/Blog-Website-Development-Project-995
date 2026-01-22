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
      // Prevent unrelated NCB read errors from blocking post creation/loading
      const pData = await ncbReadAll('posts').catch(err => {
        console.warn("Failed to load posts table:", err);
        return [];
      });
      
      const prodData = await ncbReadAll('product_recommendations').catch(err => {
        console.warn("Failed to load products table:", err);
        return [];
      });

      // Added graceful failure for other potential tables mentioned by user
      await ncbReadAll('forum_threads').catch(() => []);
      await ncbReadAll('forum_posts').catch(() => []);
      await ncbReadAll('kdrama_recommendations').catch(() => []);

      setPosts(pData || []);
      setProducts(prodData || []);
    } catch (error) {
      console.error('CRITICAL: Error fetching blog data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBlogData();
  }, [fetchBlogData]);

  const publishedPosts = useMemo(() => 
    (posts || [])
      .filter(p => {
        const status = (p.status || p.Status || 'Draft').toString().toLowerCase();
        return status === 'published';
      })
      .sort((a, b) => {
        const dateA = new Date(a.published_at || a.created_at || a.date || 0);
        const dateB = new Date(b.published_at || b.created_at || b.date || 0);
        return dateB - dateA;
      }),
  [posts]);

  const addPost = async (postData) => {
    // Note: Sanitization and final payload mapping happens in nocodebackendClient.js
    const newPost = await ncbCreate('posts', postData);
    if (newPost) {
      setPosts(prev => [newPost, ...prev]);
      return newPost;
    }
  };

  const updatePost = async (id, postData) => {
    await ncbUpdate('posts', id, postData);
    setPosts(prev => prev.map(p => p.id === id ? { ...p, ...postData } : p));
  };

  const deletePost = async (id) => {
    await ncbDelete('posts', id);
    setPosts(prev => prev.filter(p => p.id !== id));
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
      refreshData: fetchBlogData 
    }}>
      {children}
    </BlogContext.Provider>
  );
};

export const useBlog = () => useContext(BlogContext);