import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { ncbReadAll, ncbCreate, ncbUpdate, ncbDelete } from '../services/nocodebackendClient';
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const TABLE_NAME = 'posts';

  const normalizePost = useCallback((post) => {
    const rawImage = post.image || post.image_url || post.featured_image_url || '';
    const cleanImage = getImageSrc(rawImage, BLOG_PLACEHOLDER);
    
    // Support multiple field names for status and normalize to lowercase
    const rawStatus = (post.status || post.post_status || post.state || 'published').toString().toLowerCase().trim();
    
    // Support multiple field names for isHandPicked
    const isHandPicked = post.ishandpicked === 1 || 
                        post.ishandpicked === '1' || 
                        post.ishandpicked === true ||
                        post.isHandPicked === true ||
                        post.is_featured === true;

    return {
      ...post,
      id: post.id,
      title: post.title || 'Untitled Story',
      slug: post.slug || post.id || '',
      category: post.category || 'General',
      status: rawStatus,
      excerpt: post.excerpt || post.summary || '',
      content: post.content || '',
      image: cleanImage,
      image_url: cleanImage,
      featured_image_url: cleanImage,
      readTime: post.readtime || post.readTime || "3 min read",
      isHandPicked: isHandPicked,
      date: post.date || post.created_at || new Date().toISOString()
    };
  }, []);

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Direct call to read all posts
      const response = await ncbReadAll(TABLE_NAME);
      
      // NCB ReadAll returns the array directly via our proxy's handleResponse
      if (Array.isArray(response)) {
        const normalized = response.map(normalizePost).sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        console.log(`BlogContext: Successfully synced ${normalized.length} stories from database.`);
        setPosts(normalized);
      } else {
        console.warn('BlogContext: Received non-array response from database', response);
        setPosts([]);
      }
    } catch (err) {
      console.error('BlogContext: Fetch failed', err);
      setError("Failed to load stories.");
    } finally {
      setIsLoading(false);
    }
  }, [normalizePost]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const addPost = async (postData) => {
    try {
      const result = await ncbCreate(TABLE_NAME, postData);
      await fetchPosts();
      return result.id;
    } catch (err) {
      throw new Error("Failed to create post");
    }
  };

  const updatePost = async (id, updates) => {
    try {
      await ncbUpdate(TABLE_NAME, id, updates);
      await fetchPosts();
    } catch (err) {
      throw new Error("Failed to update post");
    }
  };

  const deletePost = async (id) => {
    try {
      await ncbDelete(TABLE_NAME, id);
      setPosts(prev => prev.filter(p => String(p.id) !== String(id)));
    } catch (err) {
      throw new Error("Failed to delete post");
    }
  };

  const categories = useMemo(() => {
    const unique = [...new Set(posts.map(p => p.category))].filter(Boolean);
    return unique.length > 0 ? unique : ['Health', 'Fam Bam', 'K-Drama', 'BTS', 'Product Recommendations', 'Career'];
  }, [posts]);

  // Use a more inclusive filter for 'published'
  const publishedPosts = useMemo(() => 
    posts.filter(p => p.status === 'published' || p.status === 'active' || p.status === ''), 
  [posts]);

  return (
    <BlogContext.Provider value={{
      posts,
      publishedPosts,
      categories,
      isLoading,
      error,
      addPost,
      updatePost,
      deletePost,
      fetchPosts,
      getPost: (id) => posts.find(p => String(p.id) === String(id))
    }}>
      {children}
    </BlogContext.Provider>
  );
};