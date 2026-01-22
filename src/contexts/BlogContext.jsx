import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { ncbReadAll, ncbCreate, ncbUpdate, ncbDelete } from '../services/nocodebackendClient';

const BlogContext = createContext();

export const BlogProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBlogData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch posts (replaces forum_posts as requested)
      const pData = await ncbReadAll('posts').catch(() => []);
      
      // Fetch product recommendations
      const prodData = await ncbReadAll('product_recommendations').catch(() => []);
      
      // Fetch categories from NCB as requested
      const catData = await ncbReadAll('categories').catch(() => []);

      // Graceful failure for other potential tables
      await ncbReadAll('forum_threads').catch(() => []);
      await ncbReadAll('kdramas').catch(() => []); // Replaces kdama_recommendations

      setPosts(pData || []);
      setProducts(prodData || []);
      
      // Use NCB categories or fallback to defaults
      if (catData && catData.length > 0) {
        setCategories(catData);
      } else {
        setCategories([
          { id: 1, name: 'Life' },
          { id: 2, name: 'BTS' },
          { id: 3, name: 'Parenting' },
          { id: 4, name: 'Self-Care' },
          { id: 5, name: 'K-Drama' },
          { id: 6, name: 'General' }
        ]);
      }
    } catch (error) {
      console.error('Error fetching blog data:', error);
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