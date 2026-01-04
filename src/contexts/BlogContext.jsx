import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { ncbCreate, ncbDelete, ncbUpdate } from '../services/nocodebackendClient';
import { getImageSrc } from '../utils/media.js';
import { BLOG_PLACEHOLDER } from '../config/assets';

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
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [isErrorDismissed, setIsErrorDismissed] = useState(false);

  const publishedPosts = useMemo(() => {
    return posts;
  }, [posts]);

  /**
   * Normalizes post data coming from the database.
   * CRITICAL: Sanitizes image URLs immediately.
   */
  const normalizePost = (post) => {
    const rawImage = post.image || post.image_url || '';
    
    // Normalize image using global utility
    const cleanImage = getImageSrc(rawImage, BLOG_PLACEHOLDER);
    
    return {
      ...post,
      image: cleanImage,
      image_url: cleanImage,
      readTime: post.readtime || post.readTime || "1 min read",
      isHandPicked: post.ishandpicked === 1 || post.isHandPicked === true
    };
  };

  const fetchPosts = async () => {
    setIsLoading(true);
    setFetchError(null);
    setIsErrorDismissed(false);
    try {
      const res = await fetch('/api/ncb/read/posts');
      if (!res.ok) {
        throw new Error(`Upstream Error: ${res.status}`);
      }
      const json = await res.json();
      
      if (Array.isArray(json.data)) {
        const normalizedPosts = json.data.map(post => normalizePost(post));
        normalizedPosts.sort((a, b) => {
          const dateA = new Date(a.date || 0);
          const dateB = new Date(b.date || 0);
          return dateB - dateA;
        });
        setPosts(normalizedPosts);
      }
    } catch (err) {
      console.error('BlogContext fetch failed', err);
      setFetchError("Could not load posts from server.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    if (posts.length > 0) {
      const uniqueCategories = [...new Set(posts.map(post => post.category))].filter(Boolean);
      setCategories(uniqueCategories);
    }
  }, [posts]);

  const dismissError = () => setIsErrorDismissed(true);

  const addPost = async (postData) => {
    const savedPost = await ncbCreate('posts', postData);
    const normalized = normalizePost(savedPost);
    setPosts(prev => [normalized, ...prev]);
    return normalized.id;
  };

  const updatePost = async (id, updatedFields) => {
    await ncbUpdate('posts', id, updatedFields);
    setPosts(prev => prev.map(post => String(post.id) === String(id) ? normalizePost({ ...post, ...updatedFields }) : post));
  };

  const deletePost = async (id) => {
    await ncbDelete('posts', id);
    setPosts(prev => prev.filter(post => String(post.id) !== String(id)));
  };

  const getPost = (id) => posts.find(post => String(post.id) === String(id));

  return (
    <BlogContext.Provider value={{
      posts, 
      publishedPosts, 
      categories, 
      isLoading, 
      fetchError, 
      isErrorDismissed, 
      dismissError, 
      retryFetch: fetchPosts, 
      addPost, 
      updatePost, 
      deletePost, 
      getPost
    }}>
      {children}
    </BlogContext.Provider>
  );
};