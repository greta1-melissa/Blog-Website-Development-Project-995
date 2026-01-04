import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { ncbCreate, ncbDelete, ncbUpdate } from '../services/nocodebackendClient';
import { normalizeDropboxImageUrl } from '../utils/media.js';

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

  const normalizePost = (post) => {
    const rawImage = post.image || post.image_url || '';
    const finalImage = normalizeDropboxImageUrl(rawImage);
    return {
      ...post,
      image: finalImage,
      image_url: finalImage,
      readTime: post.readtime || post.readTime || "1 min read",
      isHandPicked: post.ishandpicked === 1 || post.isHandPicked === true
    };
  };

  const fetchPosts = async () => {
    setIsLoading(true);
    setFetchError(null);
    setIsErrorDismissed(false);

    try {
      // REQUIRED IMPLEMENTATION: Preserve state on failure
      const res = await fetch('/api/ncb/read/posts');
      
      if (!res.ok) {
        throw new Error(`Upstream Error: ${res.status}`);
      }

      const json = await res.json();

      // Only update state if data is a valid array
      if (Array.isArray(json.data)) {
        const normalizedPosts = json.data.map(post => normalizePost(post));
        
        // Sorting by date DESC
        normalizedPosts.sort((a, b) => {
          const dateA = new Date(a.date || 0);
          const dateB = new Date(b.date || 0);
          return dateB - dateA;
        });
        
        setPosts(normalizedPosts);
      } else {
        console.error("[BlogContext] Invalid data format received:", json);
      }
    } catch (err) {
      // CRITICAL: posts state is NOT modified here, preserving previous data
      console.error('BlogContext fetch failed', err);
      setFetchError("Could not load posts from server. Showing cached content if available.");
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
    const { status, ...rest } = postData;
    const dbPayload = {
      ...rest,
      ishandpicked: 0,
      author: postData.author || "BangtanMom",
      date: postData.date || new Date().toISOString().split('T')[0],
      readtime: postData.readTime || "2 min read"
    };

    const savedPost = await ncbCreate('posts', dbPayload);
    const normalized = normalizePost(savedPost);
    setPosts(prev => [normalized, ...prev]);
    return normalized.id;
  };

  const updatePost = async (id, updatedFields) => {
    const { status, ...rest } = updatedFields;
    await ncbUpdate('posts', id, rest);
    setPosts(prev => prev.map(post => String(post.id) === String(id) ? { ...post, ...rest } : post));
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