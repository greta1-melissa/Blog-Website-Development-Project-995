import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { ncbGet, ncbCreate, ncbDelete, ncbUpdate } from '../services/nocodebackendClient';

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
    content: "I recently re-watched 'Our Beloved Summer' and it hit differently this time. The way it portrays the messy, non-linear nature of growth and relationships is just... *chef's kiss*. It’s a reminder that it’s okay to not have everything figured out.",
    author: "Melissa",
    date: "2024-02-28",
    category: "K-Drama",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1517604931442-71053e6e2306?w=800&h=400&fit=crop",
    isHandPicked: true,
    status: 'published'
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
    isHandPicked: true,
    status: 'published'
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
    isHandPicked: false,
    status: 'published'
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
    isHandPicked: false,
    status: 'published'
  }
];

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

  // Derived state for public viewing
  const publishedPosts = useMemo(() => {
    const now = new Date();
    return posts.filter(post => {
      // 1. Must not be a draft
      if (post.status === 'draft') return false;
      
      // 2. If scheduled, date must be in the past
      if (post.status === 'scheduled') {
        const postDate = new Date(post.date);
        return postDate <= now;
      }
      
      // 3. Default (legacy posts without status) are visible
      return true;
    });
  }, [posts]);

  useEffect(() => {
    if (posts.length > 0) {
      localStorage.setItem('blog_posts', JSON.stringify(posts));
    }
  }, [posts]);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const serverData = await ncbGet('posts');
      let mergedPosts = [];

      if (serverData !== null) {
        const localData = getLocalPosts() || [];
        const serverIds = new Set(serverData.map(p => String(p.id)));
        const localDrafts = localData.filter(p => !serverIds.has(String(p.id)));
        mergedPosts = [...localDrafts, ...serverData];

        if (mergedPosts.length === 0 && serverData.length === 0) {
          mergedPosts = initialPosts;
        }
      } else {
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

  const addPost = async (postData) => {
    const tempId = Date.now();
    const wordCount = postData.content ? postData.content.split(' ').length : 0;
    const readTime = `${Math.max(1, Math.ceil(wordCount / 200))} min read`;
    
    // Determine status and date
    // If specific date provided, use it. Otherwise today.
    const postDate = postData.date || new Date().toISOString().split('T')[0];
    
    // If status isn't explicitly set, determine based on date
    let status = postData.status;
    if (!status) {
        const isFuture = new Date(postDate) > new Date();
        status = isFuture ? 'scheduled' : 'published';
    }

    const newPost = {
      ...postData,
      id: tempId,
      date: postDate,
      readTime: readTime,
      author: postData.author || "Melissa",
      isHandPicked: false,
      status: status,
      // Ensure SEO fields are preserved
      seoTitle: postData.seoTitle || postData.title,
      metaDescription: postData.metaDescription || postData.content.substring(0, 160),
      focusKeyword: postData.focusKeyword || ''
    };

    setPosts(prev => [newPost, ...prev]);

    try {
      const { id, ...postPayload } = newPost;
      const result = await ncbCreate('posts', postPayload);
      if (result && result.id) {
        setPosts(prev => prev.map(p => p.id === tempId ? { ...p, id: result.id } : p));
        return result.id;
      }
      return tempId;
    } catch (error) {
      console.error("NoCodeBackend: Failed to save post.", error);
      throw error;
    }
  };

  const updatePost = async (id, updatedFields) => {
    let updates = { ...updatedFields };
    if (updates.content) {
      const wordCount = updates.content.split(' ').length;
      updates.readTime = `${Math.max(1, Math.ceil(wordCount / 200))} min read`;
    }

    setPosts(prev => prev.map(post => 
      String(post.id) === String(id) ? { ...post, ...updates } : post
    ));

    try {
      await ncbUpdate('posts', id, updates);
    } catch (error) {
      console.error("Failed to update post on server:", error);
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
    return publishedPosts.filter(post => post.category === category);
  };

  const value = {
    posts, // All posts (for admin)
    publishedPosts, // Only visible posts (for frontend)
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