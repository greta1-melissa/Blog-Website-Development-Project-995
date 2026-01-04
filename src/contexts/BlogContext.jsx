import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { ncbGet, ncbCreate, ncbDelete, ncbUpdate } from '../services/nocodebackendClient';
import { normalizeDropboxImageUrl } from '../utils/media.js';

const BlogContext = createContext();

export const useBlog = () => {
  const context = useContext(BlogContext);
  if (!context) {
    throw new Error('useBlog must be used within a BlogProvider');
  }
  return context;
};

const initialPosts = [
  { id: 7, title: "Starting Over at Forty (Something): Why I Finally Hit “Publish”", content: "Hi, I’m Melissa—mom of two, in my early forties...", author: "BangtanMom", date: "2025-12-02", category: "Health", readtime: "5 min read", image: "https://images.unsplash.com/photo-1493612276216-9c5907b65267?w=800&h=400&fit=crop", isHandPicked: true, status: 'published' }
];

export const BlogProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [isErrorDismissed, setIsErrorDismissed] = useState(false);

  const publishedPosts = useMemo(() => {
    const now = new Date();
    return posts.filter(post => {
      if (post.status === 'draft') return false;
      if (post.status === 'scheduled') {
        const postDate = new Date(post.date);
        return postDate <= now;
      }
      return true;
    });
  }, [posts]);

  const normalizePost = (post) => {
    const rawImage = post.image || post.image_url || '';
    const finalImage = normalizeDropboxImageUrl(rawImage);
    return {
      ...post,
      image: finalImage,
      image_url: finalImage,
      readTime: post.readtime || post.readTime || "1 min read",
      isHandPicked: post.ishandpicked === 1 || post.isHandPicked === true,
      status: ['draft', 'scheduled', 'published'].includes(post.status) ? post.status : 'published'
    };
  };

  const fetchPosts = async () => {
    setIsLoading(true);
    setFetchError(null);
    setIsErrorDismissed(false);
    
    try {
      const serverData = await ncbGet('posts');
      if (!Array.isArray(serverData)) {
        throw new Error("Invalid data format");
      }
      
      const normalizedServerPosts = serverData.map(post => normalizePost(post));
      
      if (normalizedServerPosts.length > 0) {
        normalizedServerPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
        setPosts(normalizedServerPosts);
      } else {
        // If server is empty, we still consider it "working" but empty
        setPosts([]);
      }
    } catch (error) {
      console.error("[BlogContext] fetchPosts failed:", error);
      // EXACT ERROR MESSAGE PER CONTRACT
      setFetchError("Could not load posts from server. Check Cloudflare runtime env vars (Production/Preview): NCB_API_KEY.");
      
      // Fallback to seeds so UI isn't broken
      if (posts.length === 0) {
        setPosts(initialPosts.map(p => normalizePost(p)));
      }
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
    const dbPayload = {
      ...postData,
      ishandpicked: 0,
      author: postData.author || "BangtanMom",
      date: postData.date || new Date().toISOString().split('T')[0],
      readtime: postData.readTime || "2 min read",
      status: postData.status || 'published'
    };
    const savedPost = await ncbCreate('posts', dbPayload);
    const normalized = normalizePost(savedPost);
    setPosts(prev => [normalized, ...prev]);
    return normalized.id;
  };

  const updatePost = async (id, updatedFields) => {
    await ncbUpdate('posts', id, updatedFields);
    setPosts(prev => prev.map(post => String(post.id) === String(id) ? { ...post, ...updatedFields } : post));
  };

  const deletePost = async (id) => {
    await ncbDelete('posts', id);
    setPosts(prev => prev.filter(post => String(post.id) !== String(id)));
  };

  const getPost = (id) => posts.find(post => String(post.id) === String(id));

  return (
    <BlogContext.Provider value={{
      posts, publishedPosts, categories, isLoading, 
      fetchError, isErrorDismissed, dismissError, retryFetch: fetchPosts,
      addPost, updatePost, deletePost, getPost
    }}>
      {children}
    </BlogContext.Provider>
  );
};