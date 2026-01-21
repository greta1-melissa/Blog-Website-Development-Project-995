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
      const pData = await ncbReadAll('posts').catch(err => {
        console.warn("Failed to load posts table:", err);
        return [];
      });
      
      const prodData = await ncbReadAll('product_recommendations').catch(err => {
        console.warn("Failed to load products table:", err);
        return [];
      });

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

  // Robust filtering: Handles case-sensitivity of column names and values
  const publishedPosts = useMemo(() => 
    (posts || [])
      .filter(p => {
        const status = (p.status || p.Status || 'Draft').toString().toLowerCase();
        return status === 'published';
      })
      .sort((a, b) => {
        const dateA = new Date(a.date || a.Date || 0);
        const dateB = new Date(b.date || b.Date || 0);
        return dateB - dateA;
      }),
  [posts]);

  const addPost = async (postData) => {
    const slug = postData.slug || ensureUniqueSlug(postData.title, posts);
    const readtime = calculateReadTime(postData.content);
    const finalData = { 
      ...postData, 
      slug, 
      readtime, 
      ishandpicked: postData.ishandpicked ? 1 : 0 
    };

    const newPost = await ncbCreate('posts', finalData);
    if (newPost) {
      setPosts(prev => [newPost, ...prev]);
      await fetchBlogData(); // Refresh to sync state
      return newPost;
    }
  };

  const updatePost = async (id, postData) => {
    const slug = postData.slug || ensureUniqueSlug(postData.title, posts, id);
    const readtime = calculateReadTime(postData.content);
    const finalData = { 
      ...postData, 
      slug, 
      readtime, 
      ishandpicked: postData.ishandpicked ? 1 : 0 
    };

    await ncbUpdate('posts', id, finalData);
    setPosts(prev => prev.map(p => p.id === id ? { ...p, ...finalData } : p));
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