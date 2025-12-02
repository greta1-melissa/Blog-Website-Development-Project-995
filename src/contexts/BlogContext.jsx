import React, { createContext, useContext, useState, useEffect } from 'react';
import { ncbGet, ncbCreate, ncbDelete, ncbUpdate } from '../services/nocodebackendClient';

const BlogContext = createContext();

export const useBlog = () => {
  const context = useContext(BlogContext);
  if (!context) {
    throw new Error('useBlog must be used within a BlogProvider');
  }
  return context;
};

// Fallback data - Standardized for initial view
const initialPosts = [
  {
    id: 1,
    title: "Why 'Our Beloved Summer' is the Comfort Watch We All Need",
    content: "I recently re-watched 'Our Beloved Summer' and it hit differently this time. The way it portrays the messy, non-linear nature of growth and relationships is just... *chef's kiss*. It’s a reminder that it’s okay to not have everything figured out.",
    author: "Melissa",
    date: "2024-02-28",
    category: "K-Drama",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1517604931442-71053e6e2306?w=800&h=400&fit=crop",
    isHandPicked: true
  },
  {
    id: 2,
    title: "Surviving the Toddler Sleep Regression (Again)",
    content: "Just when I thought we were in the clear, the 2-year sleep regression hit us like a truck. Here are the 3 things keeping me sane (and caffeinated) this week.",
    author: "Melissa",
    date: "2024-02-25",
    category: "Fam Bam",
    readTime: "4 min read",
    image: "https://images.unsplash.com/photo-1522771753062-5887739e6583?w=800&h=400&fit=crop",
    isHandPicked: true
  },
  {
    id: 3,
    title: "Top 5 Skincare Finds from Olive Young Global",
    content: "My latest haul just arrived! I'm breaking down which viral products are actually worth the hype and which ones you can skip.",
    author: "Melissa",
    date: "2024-02-20",
    category: "Product Recommendations",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&h=400&fit=crop",
    isHandPicked: false
  },
  {
    id: 4,
    title: "BTS 'Golden' Album Review: A Mom's Perspective",
    content: "Jungkook's solo album is finally here, and I have thoughts. Let's talk about how the golden maknae has grown up.",
    author: "Melissa",
    date: "2024-02-15",
    category: "BTS",
    readTime: "8 min read",
    image: "https://images.unsplash.com/photo-1516280440614-6697288d5d38?w=800&h=400&fit=crop",
    isHandPicked: false
  }
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
        const serverIds = new Set(serverData.map(p => String(p.id)));
        const localDrafts = localData.filter(p => !serverIds.has(String(p.id)));
        
        mergedPosts = [...localDrafts, ...serverData];

        // If both server and local are empty, use initialPosts to populate the UI
        if (mergedPosts.length === 0 && serverData.length === 0) {
          console.log("No posts on server or local. Using initial content.");
          mergedPosts = initialPosts;
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

  const updatePost = async (id, updatedFields) => {
    // Recalculate readTime if content changed
    let updates = { ...updatedFields };
    if (updates.content) {
      const wordCount = updates.content.split(' ').length;
      updates.readTime = `${Math.max(1, Math.ceil(wordCount / 200))} min read`;
    }

    // Optimistic update
    setPosts(prev => prev.map(post => 
      String(post.id) === String(id) ? { ...post, ...updates } : post
    ));

    try {
      await ncbUpdate('posts', id, updates);
    } catch (error) {
      console.error("Failed to update post on server:", error);
      // Ideally we would revert state here, but for now we keep the optimistic update locally
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
    updatePost,
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