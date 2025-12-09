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

// CRITICAL: Exact data matching the Live Site screenshot requirements
// Updated Images to match the specific story themes better
const initialPosts = [
  {
    id: 7,
    title: "Starting Over at Forty (Something): Why I Finally Hit “Publish”",
    content: "Hi, I’m Melissa—mom of two, in my early forties, virtual assistant for the past 12 years... and a woman who can happily lose herself in a good K-drama or a BTS song. For a long time, I’ve been helping others build their dreams, organize their lives, and manage their businesses. I love my work. I love the flexibility it gives me to be present for my kids. But somewhere along the way, I realized I had stopped creating for myself.",
    author: "BangtanMom",
    date: "2025-12-02",
    category: "Health",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1493612276216-9c5907b65267?w=800&h=400&fit=crop", // Cozy aesthetic workspace
    isHandPicked: true, // FEATURED
    status: 'published',
    seoTitle: "Starting Over at Forty (Something): Why I Finally Hit “Publish”",
    metaDescription: "Hi, I’m Melissa—mom of two, in my early forties. Here is why I finally started this blog."
  },
  {
    id: 8,
    title: "How the Pandemic Changed Our Lives (and Made Me Appreciate My Work Even More)",
    content: "If you knew me before 2020, you’d probably describe me as a social butterfly. I’m the type of person who will happily strike up a conversation with a stranger in line at the grocery store. I thrive on connection. So, when the world shut down, it felt like a part of me shut down too. Suddenly, my world shrank to the four walls of our home.",
    author: "BangtanMom",
    date: "2025-12-02",
    category: "Fam Bam",
    readTime: "7 min read",
    image: "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800&h=400&fit=crop", // Warm family/home life
    isHandPicked: true, // FEATURED
    status: 'published',
    seoTitle: "How the Pandemic Changed Our Lives and Work",
    metaDescription: "Reflecting on how the pandemic changed our family life and my appreciation for my work."
  },
  {
    id: 9,
    title: "How I Found BTS: From K-Dramas to Becoming an ARMY Mom (And Learning to Love Myself)",
    content: "If you’d known me a few years ago, you’d have found me happily immersed in K-dramas, especially anything starring IU. It was my escape, my little bubble of joy after the kids went to bed. I knew *of* K-pop, of course. You can’t watch dramas without hearing the OSTs or seeing idols act. But I wasn’t *in* it. Then came 'Dynamite'.",
    author: "BangtanMom",
    date: "2025-12-02",
    category: "BTS",
    readTime: "10 min read",
    image: "https://images.unsplash.com/photo-1574155376612-c84efdd3fc71?w=800&h=400&fit=crop", // Distinct Purple/Concert aesthetic
    isHandPicked: true, // FEATURED
    status: 'published',
    seoTitle: "My Journey to Becoming an ARMY Mom",
    metaDescription: "From K-Dramas to BTS: How I found music, joy, and learned to love myself."
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
  const [posts, setPosts] = useState(() => getLocalPosts() || initialPosts);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Derived state for public viewing
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

  useEffect(() => {
    if (posts.length > 0) {
      localStorage.setItem('blog_posts', JSON.stringify(posts));
    }
  }, [posts]);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const serverData = await ncbGet('posts');
      let currentPosts = [];

      // 1. Get Server Data
      if (serverData && Array.isArray(serverData)) {
        currentPosts = serverData;
      }

      // 2. Get Local Drafts (that are not on server)
      const localData = getLocalPosts() || [];
      const serverIds = new Set(currentPosts.map(p => String(p.id)));
      const localDrafts = localData.filter(p => !serverIds.has(String(p.id)));

      // 3. Merge Server and Local
      let merged = [...localDrafts, ...currentPosts];

      // 4. CRITICAL: FORCE SEED DATA FOR FEATURED STORIES
      // This ensures the 3 specific featured stories ALWAYS appear, 
      // overwriting any old/conflicting data from server or local.
      const seedIds = initialPosts.map(p => String(p.id));
      
      // Remove any existing versions of seed posts from 'merged' to avoid dupes/conflicts
      merged = merged.filter(p => !seedIds.includes(String(p.id)));
      
      // Add the mandated Seed Posts
      merged = [...merged, ...initialPosts];

      // 5. Sort: Featured First, then Newest Date
      merged.sort((a, b) => {
        // Prioritize HandPicked
        if (a.isHandPicked && !b.isHandPicked) return -1;
        if (!a.isHandPicked && b.isHandPicked) return 1;
        // Then by Date
        return new Date(b.date) - new Date(a.date);
      });
      
      setPosts(merged);
    } catch (error) {
      console.error("NoCodeBackend: Critical failure in fetchPosts.", error);
      // Fallback: Ensure initialPosts are at least present
      setPosts(initialPosts);
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
    
    const postDate = postData.date || new Date().toISOString().split('T')[0];
    
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
      author: postData.author || "BangtanMom",
      isHandPicked: false,
      status: status,
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
    posts,
    publishedPosts,
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