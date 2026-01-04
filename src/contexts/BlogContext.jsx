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

  const normalizePost = (post) => {
    const rawImage = post.image || post.image_url || '';
    const finalImage = normalizeDropboxImageUrl(rawImage);
    return {
      ...post,
      image: finalImage,
      image_url: finalImage,
      readTime: post.readtime || post.readTime || "1 min read",
      isHandPicked: post.ishandpicked === 1 || post.isHandPicked === true,
      isLocalOnly: post.isLocalOnly === true,
      status: ['draft', 'scheduled', 'published'].includes(post.status) ? post.status : 'published'
    };
  };

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const serverData = await ncbGet('posts');
      const localData = getLocalPosts() || [];
      
      let finalPosts = [];
      const safeServerData = Array.isArray(serverData) ? serverData : [];
      const serverIds = new Set(safeServerData.map(p => String(p.id)));

      const normalizedServerPosts = safeServerData.map(post => normalizePost({ ...post, isLocalOnly: false }));
      finalPosts = [...normalizedServerPosts];

      initialPosts.forEach(seedPost => {
        if (!serverIds.has(String(seedPost.id))) {
          const exists = finalPosts.some(p => String(p.id) === String(seedPost.id));
          if (!exists) {
            finalPosts.push(normalizePost({ ...seedPost, isLocalOnly: true }));
          }
        }
      });

      if (localData.length > 0) {
        localData.forEach(localPost => {
          const idStr = String(localPost.id);
          const isSeed = initialPosts.some(s => String(s.id) === idStr);
          if (!serverIds.has(idStr) && !isSeed) {
            const alreadyAdded = finalPosts.some(p => String(p.id) === idStr);
            if (!alreadyAdded) {
              finalPosts.push(normalizePost({ ...localPost, isLocalOnly: true }));
            }
          }
        });
      }

      finalPosts.sort((a, b) => {
        if (a.isHandPicked && !b.isHandPicked) return -1;
        if (!a.isHandPicked && b.isHandPicked) return 1;
        return new Date(b.date) - new Date(a.date);
      });

      setPosts(finalPosts);
    } catch (error) {
      console.error("[BlogContext] fetchPosts failed.", error);
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
    const calcReadTime = `${Math.max(1, Math.ceil(wordCount / 200))} min read`;
    const postDate = postData.date || new Date().toISOString().split('T')[0];
    
    const rawImage = (postData.image || postData.image_url || '').trim();
    if (rawImage.startsWith('data:image')) {
      throw new Error("Base64 images are not allowed. Please upload the file.");
    }
    const finalImage = normalizeDropboxImageUrl(rawImage);

    const newPost = {
      ...postData,
      id: tempId,
      date: postDate,
      readTime: postData.readTime || postData.readtime || calcReadTime,
      author: postData.author || "BangtanMom",
      isHandPicked: false,
      status: postData.status || 'published',
      image: finalImage,
      image_url: finalImage,
      isLocalOnly: true
    };

    setPosts(prev => [newPost, ...prev]);

    try {
      // PAYLOAD STANDARDIZATION: Strictly use lowercase 'readtime'
      const dbPayload = {
        title: newPost.title,
        content: newPost.content,
        category: newPost.category,
        image: newPost.image,
        author: newPost.author,
        date: newPost.date,
        readtime: newPost.readTime, // Correct lowercase key
        ishandpicked: 0
      };

      const savedPost = await ncbCreate('posts', dbPayload);
      if (!savedPost || (!savedPost.id && !savedPost._id)) throw new Error("DB creation failed.");
      
      const realId = savedPost.id || savedPost._id;
      setPosts(prev => prev.map(p => 
        p.id === tempId ? normalizePost({ ...p, ...savedPost, id: realId, isLocalOnly: false }) : p
      ));
      return realId;
    } catch (error) {
      throw error;
    }
  };

  const updatePost = async (id, updatedFields) => {
    const previousPosts = [...posts];
    const target = previousPosts.find(post => String(post.id) === String(id));
    if (!target) return;

    let updates = { ...updatedFields };

    if (updates.image !== undefined || updates.image_url !== undefined) {
      const imgVal = (updates.image_url !== undefined ? updates.image_url : updates.image || '').trim();
      if (imgVal.startsWith('data:image')) {
        throw new Error("Base64 images are not allowed. Please upload the file.");
      }
      const newImg = normalizeDropboxImageUrl(imgVal);
      updates.image = newImg;
      updates.image_url = newImg;
    }

    if (updates.content && !updates.readTime && !updates.readtime) {
      const wordCount = updates.content.split(' ').length;
      updates.readTime = `${Math.max(1, Math.ceil(wordCount / 200))} min read`;
    }

    setPosts(prev => prev.map(post => 
      String(post.id) === String(id) ? normalizePost({ ...post, ...updates }) : post
    ));

    if (target.isLocalOnly) return;

    try {
      // PAYLOAD STANDARDIZATION: Map readTime -> readtime
      const dbUpdates = {};
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.content !== undefined) dbUpdates.content = updates.content;
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      if (updates.image !== undefined) dbUpdates.image = updates.image;
      if (updates.author !== undefined) dbUpdates.author = updates.author;
      if (updates.date !== undefined) dbUpdates.date = updates.date;
      
      // Support both readTime and readtime from the source
      const finalReadTime = updates.readtime !== undefined ? updates.readtime : updates.readTime;
      if (finalReadTime !== undefined) dbUpdates.readtime = finalReadTime;

      if (updates.isHandPicked !== undefined) dbUpdates.ishandpicked = updates.isHandPicked ? 1 : 0;

      await ncbUpdate('posts', id, dbUpdates);
    } catch (error) {
      setPosts(previousPosts);
      throw error;
    }
  };

  const deletePost = async (id) => {
    const postToDelete = posts.find(post => String(post.id) === String(id));
    const previousPosts = [...posts];
    setPosts(prev => prev.filter(post => String(post.id) !== String(id)));

    if (postToDelete && postToDelete.isLocalOnly) return;

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