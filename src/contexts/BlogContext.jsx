import React, { createContext, useContext, useState, useEffect } from 'react';
import { ncbGet, ncbCreate, ncbDelete } from '../services/nocodebackendClient';

const BlogContext = createContext();

export const useBlog = () => {
  const context = useContext(BlogContext);
  if (!context) {
    throw new Error('useBlog must be used within a BlogProvider');
  }
  return context;
};

// Fallback data for initial load or if backend is empty
const initialPosts = [
  {
    id: 1,
    title: "Morning Wellness Routine: How I Start My Day as a Busy Mom",
    content: "Being a mom means juggling countless responsibilities...",
    author: "Melissa",
    date: "2024-01-15",
    category: "Health",
    readTime: "4 min read",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop"
  }
];

export const BlogProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const data = await ncbGet('posts');
      if (data && Array.isArray(data) && data.length > 0) {
        setPosts(data);
      } else {
        setPosts(initialPosts); // Fallback if DB is empty
      }
    } catch (error) {
      console.error("Failed to fetch posts:", error);
      setPosts(initialPosts); // Fallback on error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    const uniqueCategories = [...new Set(posts.map(post => post.category))];
    setCategories(uniqueCategories);
  }, [posts]);

  const addPost = async (post) => {
    const newPost = {
      ...post,
      date: new Date().toISOString().split('T')[0],
      readTime: `${Math.ceil(post.content.split(' ').length / 200)} min read`,
      author: "Melissa" // In real app, get from AuthContext
    };

    try {
      // Optimistic update
      setPosts(prev => [newPost, ...prev]);
      
      // Persist to NCB
      const result = await ncbCreate('posts', newPost);
      if (result && result.id) {
        // Update with real ID if needed
        setPosts(prev => prev.map(p => p === newPost ? { ...p, id: result.id } : p));
        return result.id;
      }
      return Date.now(); // Fallback ID
    } catch (error) {
      console.error("Failed to save post:", error);
      // Revert on failure would go here
      return null;
    }
  };

  const getPost = (id) => {
    // Handle both string/number IDs
    return posts.find(post => String(post.id) === String(id));
  };

  const getPostsByCategory = (category) => {
    return posts.filter(post => post.category === category);
  };

  const value = {
    posts,
    categories,
    isLoading,
    addPost,
    getPost,
    getPostsByCategory
  };

  return (
    <BlogContext.Provider value={value}>
      {children}
    </BlogContext.Provider>
  );
};