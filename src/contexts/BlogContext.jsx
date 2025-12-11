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

// Initial seed data
const initialPosts = [
  {
    id: 7,
    title: "Starting Over at Forty (Something): Why I Finally Hit “Publish”",
    content: "Hi, I’m Melissa—mom of two, in my early forties, virtual assistant for the past 12 years... and a woman who can happily lose herself in a good K-drama or a BTS song. For a long time, I’ve been helping others build their dreams, organize their lives, and manage their businesses. I love my work. I love the flexibility it gives me to be present for my kids. But somewhere along the way, I realized I had stopped creating for myself.",
    author: "BangtanMom",
    date: "2025-12-02",
    category: "Health",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1493612276216-9c5907b65267?w=800&h=400&fit=crop",
    isHandPicked: true,
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
    image: "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800&h=400&fit=crop",
    isHandPicked: true,
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
    image: "https://images.unsplash.com/photo-1574155376612-c84efdd3fc71?w=800&h=400&fit=crop",
    isHandPicked: true,
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
      const localData = getLocalPosts() || [];
      let finalPosts = [];

      if (serverData && Array.isArray(serverData) && serverData.length > 0) {
        finalPosts = [...serverData];
        const serverIds = new Set(finalPosts.map(p => String(p.id)));

        // 1. Merge Seed Posts if missing from server
        initialPosts.forEach(seedPost => {
          if (!serverIds.has(String(seedPost.id))) {
            finalPosts.push(seedPost);
          }
        });

        // 2. Merge Local Drafts/Unsynced Posts
        // If a post exists locally but NOT on server, preserve it (it might be a draft or failed sync)
        if (localData.length > 0) {
            localData.forEach(localPost => {
                if (!serverIds.has(String(localPost.id))) {
                    finalPosts.push({ ...localPost, isLocalOnly: true });
                }
            });
        }
      } else {
        // Fallback: Use local data if server empty/fails, otherwise seed data
        finalPosts = (localData.length > 0) ? localData : initialPosts;
      }

      // 3. Data Sanitization: Ensure status exists
      finalPosts = finalPosts.map(p => ({
          ...p,
          status: ['draft', 'scheduled', 'published'].includes(p.status) ? p.status : 'published'
      }));

      // 4. Sort: Featured first, then Date Descending
      finalPosts.sort((a, b) => {
        if (a.isHandPicked && !b.isHandPicked) return -1;
        if (!a.isHandPicked && b.isHandPicked) return 1;
        return new Date(b.date) - new Date(a.date);
      });

      setPosts(finalPosts);
    } catch (error) {
      console.error("[BlogContext] Critical failure in fetchPosts.", error);
      // Fallback on critical error
      const localData = getLocalPosts();
      setPosts((localData && localData.length > 0) ? localData : initialPosts);
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
      const savedPost = await ncbCreate('posts', postPayload);

      if (!savedPost || !savedPost.id) {
        throw new Error("Database did not return a valid post with an ID.");
      }
      
      setPosts(prev => prev.map(p => (p.id === tempId ? savedPost : p)));
      return savedPost.id;
    } catch (error) {
      console.error("[BlogContext] Failed to save post.", error);
      // Keep the post in state but maybe flag it? For now leaving it as isLocalOnly implicitly
      setPosts(prev => prev.filter(p => p.id !== tempId)); // Revert for now based on strict instructions, or keep? Instructions say "Remove optimistic post".
      throw error;
    }
  };

  const updatePost = async (id, updatedFields) => {
    const previousPosts = [...posts];
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
      setPosts(previousPosts);
      throw error;
    }
  };

  const deletePost = async (id) => {
    const previousPosts = [...posts];
    setPosts(prev => prev.filter(post => post.id !== id));

    try {
      const success = await ncbDelete('posts', id);
      if (!success) throw new Error("Delete failed on server");
    } catch (error) {
      console.error("Failed to delete post:", error);
      setPosts(previousPosts);
      alert("Failed to delete post from server. Restored.");
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