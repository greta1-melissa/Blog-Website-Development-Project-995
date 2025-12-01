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

// Fallback data
const initialPosts = [
  {
    id: 1,
    title: "Why 'Our Beloved Summer' is the Comfort Watch We All Need",
    content: "I recently re-watched 'Our Beloved Summer'...",
    author: "Melissa",
    date: "2024-02-28",
    category: "K-Drama",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1517604931442-71053e6e2306?w=800&h=400&fit=crop",
    isHandPicked: false
  },
  // ... (keeping other initial posts abbreviated for clarity)
];

// Helper to get local data safely
const getLocalPosts = () => {
  try {
    const local = localStorage.getItem('blog_posts');
    return local ? JSON.parse(local) : null;
  } catch (e) {
    console.error("Error parsing local posts", e);
    return null;
  }
};

export const BlogProvider = ({ children }) => {
  const [posts, setPosts] = useState(() => getLocalPosts() || []);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Save to local storage whenever posts change
  useEffect(() => {
    if (posts.length > 0) {
      localStorage.setItem('blog_posts', JSON.stringify(posts));
    }
  }, [posts]);

  // Fetch posts from backend
  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const serverData = await ncbGet('posts');
      let mergedPosts = [];

      if (serverData !== null) {
        // SUCCESS: We connected to the server!
        // Even if serverData is [], it means we have 0 posts on server.
        
        const localData = getLocalPosts() || [];
        // Detect local drafts: Items in local storage that aren't on server
        // We assume server items have string UUIDs or distinct IDs compared to Date.now()
        // Simple check: If ID is in serverData, it's synced.
        
        const serverIds = new Set(serverData.map(p => String(p.id)));
        const localDrafts = localData.filter(p => !serverIds.has(String(p.id)));
        
        mergedPosts = [...localDrafts, ...serverData];
        
        if (mergedPosts.length === 0 && serverData.length === 0) {
             console.log("No posts on server or local. Starting fresh.");
             // Optional: Uncomment next line if you WANT dummy data when everything is empty
             // mergedPosts = initialPosts; 
        }
      } else {
        // FAILURE: Network error or bad config.
        console.warn("Using offline/fallback mode due to API error.");
        const localData = getLocalPosts();
        mergedPosts = (localData && localData.length > 0) ? localData : initialPosts;
      }

      // Sort: Newest First
      mergedPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
      setPosts(mergedPosts);
    } catch (error) {
      console.error("NoCodeBackend: Critical failure in fetchPosts.", error);
      const localData = getLocalPosts();
      setPosts(localData && localData.length > 0 ? localData : initialPosts);
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

  const addPost = async (post) => {
    const tempId = Date.now();
    const wordCount = post.content ? post.content.split(' ').length : 0;
    const readTime = `${Math.max(1, Math.ceil(wordCount / 200))} min read`;

    const newPost = {
      ...post,
      id: tempId, // Temporary ID for UI only
      date: new Date().toISOString().split('T')[0],
      readTime: readTime,
      author: post.author || "Melissa",
      isHandPicked: false
    };

    // Optimistic update
    setPosts(prev => [newPost, ...prev]);

    try {
      // Remove 'id' before sending to backend to avoid conflicts
      const { id, ...postPayload } = newPost;
      
      const result = await ncbCreate('posts', postPayload);
      
      if (result && result.id) {
        // Update state with REAL ID from backend
        setPosts(prev => prev.map(p => p.id === tempId ? { ...p, id: result.id } : p));
        return result.id;
      }
      return tempId;
    } catch (error) {
      console.error("NoCodeBackend: Failed to save post.", error);
      // We explicitly throw here so the UI knows it failed
      throw error;
    }
  };

  const deletePost = async (id) => {
    setPosts(prev => prev.filter(post => post.id !== id));
    try {
      await ncbDelete('posts', id);
    } catch (error) {
      console.error("Failed to delete post:", error);
    }
  };

  const getPost = (id) => {
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
    deletePost,
    getPost,
    getPostsByCategory
  };

  return (
    <BlogContext.Provider value={value}>
      {children}
    </BlogContext.Provider>
  );
};