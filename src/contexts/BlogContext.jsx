import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
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

  const normalizePost = (post) => {
    const rawImage = post.image || post.image_url || post.featured_image_url || '';
    const cleanImage = getImageSrc(rawImage, BLOG_PLACEHOLDER);
    
    return {
      ...post,
      id: post.id,
      title: post.title || 'Untitled',
      slug: post.slug || '',
      category: post.category || 'General',
      status: post.status || 'published',
      excerpt: post.excerpt || post.summary || '',
      content: post.content || '',
      image: cleanImage,
      image_url: cleanImage,
      featured_image_url: cleanImage,
      readTime: post.readtime || post.readTime || "1 min read",
      isHandPicked: post.ishandpicked === 1 || post.isHandPicked === true || post.ishandpicked === '1',
      date: post.date || post.created_at || new Date().toISOString()
    };
  };

  const fetchPosts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await ncbReadAll(TABLE_NAME);
      if (Array.isArray(data)) {
        const normalized = data.map(normalizePost).sort((a, b) => 
          new Date(b.date) - new Date(a.date)
        );
        setPosts(normalized);
      }
    } catch (err) {
      console.error('BlogContext: Fetch failed', err);
      setError("Failed to load blog posts.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

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
      setPosts(prev => prev.map(p => 
        String(p.id) === String(id) ? normalizePost({ ...p, ...updates }) : p
      ));
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

  const publishedPosts = useMemo(() => posts.filter(p => p.status === 'published'), [posts]);

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