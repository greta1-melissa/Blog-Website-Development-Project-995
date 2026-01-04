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

// Initial seed data
const initialPosts = [
  {
    id: 7,
    title: "Starting Over at Forty (Something): Why I Finally Hit “Publish”",
    content: "Hi, I’m Melissa—mom of two, in my early forties, virtual assistant for the past 12 years... and a woman who can happily lose herself in a good K-drama or a BTS song.",
    author: "BangtanMom",
    date: "2025-12-02",
    category: "Health",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1493612276216-9c5907b65267?w=800&h=400&fit=crop",
    isHandPicked: true,
    status: 'published'
  },
  {
    id: 8,
    title: "How the Pandemic Changed Our Lives",
    content: "If you knew me before 2020, you’d probably describe me as a social butterfly. I’m the type of person who will happily strike up a conversation with a stranger in line at the grocery store.",
    author: "BangtanMom",
    date: "2025-12-02",
    category: "Fam Bam",
    readTime: "7 min read",
    image: "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800&h=400&fit=crop",
    isHandPicked: true,
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
  // Master list of ALL posts for Admin
  const [posts, setPosts] = useState(() => getLocalPosts() || initialPosts);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filtered list for PUBLIC-FACING components
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

  const normalizePost = (post) => {
    const rawImage = post.image || post.image_url || '';
    const finalImage = normalizeDropboxImageUrl(rawImage);
    return {
      ...post,
      image: finalImage,
      image_url: finalImage,
      readTime: post.readtime || post.readTime || "1 min read",
      // Map ishandpicked (0/1) from DB to boolean for UI
      isHandPicked: post.ishandpicked === 1 || post.isHandPicked === true,
      status: ['draft', 'scheduled', 'published'].includes(post.status) ? post.status : 'published'
    };
  };

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch ALL posts from server
      const serverData = await ncbGet('posts');
      const safeServerData = Array.isArray(serverData) ? serverData : [];
      
      // 2. Normalize and merge with local seeds/storage
      const normalizedServerPosts = safeServerData.map(post => normalizePost(post));
      let finalPosts = [...normalizedServerPosts];

      const serverIds = new Set(normalizedServerPosts.map(p => String(p.id)));
      
      // Add initial seeds if they don't exist on server
      initialPosts.forEach(seedPost => {
        if (!serverIds.has(String(seedPost.id))) {
          finalPosts.push(normalizePost(seedPost));
        }
      });

      // 3. ADMIN REQUIREMENT: Sort purely by Date DESC (Newest First)
      // We do NOT filter by isHandPicked here.
      finalPosts.sort((a, b) => new Date(b.date) - new Date(a.date));

      setPosts(finalPosts);
    } catch (error) {
      console.error("[BlogContext] fetchPosts failed.", error);
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
    const calcReadTime = `${Math.max(1, Math.ceil(wordCount / 200))} min read`;
    
    const dbPayload = {
      title: postData.title,
      content: postData.content,
      category: postData.category,
      image: postData.image || postData.image_url || '',
      author: postData.author || "BangtanMom",
      date: postData.date || new Date().toISOString().split('T')[0],
      readtime: postData.readTime || calcReadTime,
      ishandpicked: 0,
      status: postData.status || 'published'
    };

    try {
      const savedPost = await ncbCreate('posts', dbPayload);
      const realId = savedPost?.id || savedPost?._id || tempId;
      const normalized = normalizePost({ ...dbPayload, id: realId });
      setPosts(prev => [normalized, ...prev]);
      return realId;
    } catch (error) {
      console.error("Failed to save post:", error);
      throw error;
    }
  };

  const updatePost = async (id, updatedFields) => {
    const previousPosts = [...posts];
    setPosts(prev => prev.map(post => String(post.id) === String(id) ? { ...post, ...updatedFields } : post));

    try {
      const dbUpdates = {};
      if (updatedFields.title !== undefined) dbUpdates.title = updatedFields.title;
      if (updatedFields.content !== undefined) dbUpdates.content = updatedFields.content;
      if (updatedFields.category !== undefined) dbUpdates.category = updatedFields.category;
      if (updatedFields.image !== undefined) dbUpdates.image = updatedFields.image;
      if (updatedFields.image_url !== undefined) dbUpdates.image = updatedFields.image_url;
      if (updatedFields.date !== undefined) dbUpdates.date = updatedFields.date;
      if (updatedFields.status !== undefined) dbUpdates.status = updatedFields.status;
      
      const finalReadTime = updatedFields.readtime || updatedFields.readTime;
      if (finalReadTime !== undefined) dbUpdates.readtime = finalReadTime;

      if (updatedFields.isHandPicked !== undefined) {
        dbUpdates.ishandpicked = updatedFields.isHandPicked ? 1 : 0;
      }

      await ncbUpdate('posts', id, dbUpdates);
    } catch (error) {
      setPosts(previousPosts);
      throw error;
    }
  };

  const deletePost = async (id) => {
    const previousPosts = [...posts];
    setPosts(prev => prev.filter(post => String(post.id) !== String(id)));
    try {
      await ncbDelete('posts', id);
    } catch (error) {
      setPosts(previousPosts);
    }
  };

  const getPost = (id) => posts.find(post => String(post.id) === String(id));
  const getPostsByCategory = (category) => publishedPosts.filter(post => post.category === category);

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

  return <BlogContext.Provider value={value}>{children}</BlogContext.Provider>;
};