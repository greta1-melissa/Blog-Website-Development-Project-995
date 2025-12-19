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
    content: "Hi, I’m Melissa—mom of two, in my early forties, virtual assistant for the past 12 years... and a woman who can happily lose herself in a good K-drama or a BTS song. For a long time, I’ve been helping others build their dreams, organize their lives, and manage their businesses. I love my work. I love the flexibility it gives me to be present for my kids. But somewhere along the way, I realized I had stopped creating for myself.",
    author: "BangtanMom",
    date: "2025-12-02",
    category: "Health",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1493612276216-9c5907b65267?w=800&h=400&fit=crop",
    image_url: "https://images.unsplash.com/photo-1493612276216-9c5907b65267?w=800&h=400&fit=crop",
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
    image_url: "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800&h=400&fit=crop",
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
    image_url: "https://images.unsplash.com/photo-1574155376612-c84efdd3fc71?w=800&h=400&fit=crop",
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

  // Sync to LocalStorage whenever posts change
  useEffect(() => {
    if (posts.length > 0) {
      localStorage.setItem('blog_posts', JSON.stringify(posts));
    }
  }, [posts]);

  // Helper to normalize a post object from server or local
  const normalizePost = (post) => {
    // Ensure image_url is the source of truth, fallback to image
    const rawImage = post.image_url || post.image || '';
    // Apply dropbox normalization
    const finalImage = normalizeDropboxImageUrl(rawImage);

    return {
      ...post,
      image: finalImage,
      // Keep for legacy compatibility
      image_url: finalImage, 
      // The DB column
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

      // 1. Normalize server posts
      const normalizedServerPosts = safeServerData.map(post => normalizePost({ ...post, isLocalOnly: false }));
      finalPosts = [...normalizedServerPosts];

      // 2. Merge Seed Posts if missing from server
      initialPosts.forEach(seedPost => {
        if (!serverIds.has(String(seedPost.id))) {
          const exists = finalPosts.some(p => String(p.id) === String(seedPost.id));
          if (!exists) {
            finalPosts.push(normalizePost({ ...seedPost, isLocalOnly: true }));
          }
        }
      });

      // 3. Merge Local Drafts/Unsynced Posts
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

      // 4. Sort
      finalPosts.sort((a, b) => {
        if (a.isHandPicked && !b.isHandPicked) return -1;
        if (!a.isHandPicked && b.isHandPicked) return 1;
        return new Date(b.date) - new Date(a.date);
      });

      setPosts(finalPosts);
    } catch (error) {
      console.error("[BlogContext] Critical failure in fetchPosts.", error);
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

    // CRITICAL: Ensure image_url is set for DB persistence
    const finalImage = normalizeDropboxImageUrl(postData.image || postData.image_url);

    // Internal state object (camelCase for React)
    const newPost = {
      ...postData,
      id: tempId,
      date: postDate,
      readTime: readTime,
      author: postData.author || "BangtanMom",
      isHandPicked: false,
      status: status,
      seoTitle: postData.seoTitle || postData.title,
      metaDescription: postData.metaDescription || (postData.content || "").substring(0, 160),
      focusKeyword: postData.focusKeyword || '',
      image: finalImage,
      // Local compat
      image_url: finalImage,
      // DB Column
      isLocalOnly: true
    };
    
    setPosts(prev => [newPost, ...prev]);

    try {
      // Construct DB-specific payload (lowercase/mapped keys)
      // Removed: slug, status, image_url
      // Added: readtime, ishandpicked
      const dbPayload = {
        title: newPost.title,
        content: newPost.content,
        category: newPost.category,
        image: newPost.image, // Use 'image', not 'image_url'
        author: newPost.author,
        date: newPost.date,
        readtime: newPost.readTime, // Map camelCase to lowercase
        ishandpicked: newPost.isHandPicked ? 1 : 0 // Map boolean to integer
      };

      console.log("[BlogContext] Create Payload:", dbPayload);
      const savedPost = await ncbCreate('posts', dbPayload);
      
      if (!savedPost || (!savedPost.id && !savedPost._id)) {
        throw new Error("Database did not return a valid post with an ID.");
      }

      const realId = savedPost.id || savedPost._id;
      
      // Update with real ID
      setPosts(prev => prev.map(p => {
        if (p.id === tempId) {
          return normalizePost({ ...p, ...savedPost, id: realId, isLocalOnly: false });
        }
        return p;
      }));
      
      return realId;
    } catch (error) {
      console.error("[BlogContext] Failed to save post.", error);
      throw error;
    }
  };

  const updatePost = async (id, updatedFields) => {
    const previousPosts = [...posts];
    const target = previousPosts.find(post => String(post.id) === String(id));
    
    if (!target) return;

    let updates = { ...updatedFields };

    // CRITICAL: Handle image persistence during updates
    // If 'image' or 'image_url' is provided in updates, normalize it.
    // If NOT provided, do NOT send empty string unless explicitly cleared.
    if (updates.image !== undefined || updates.image_url !== undefined) {
      const newImg = normalizeDropboxImageUrl(updates.image_url || updates.image);
      updates.image = newImg;
      updates.image_url = newImg;
    } else {
      // Ensure we don't accidentally wipe it by sending nothing, 
      // but if we are building a full payload, we might need it.
      // For PATCH/Update, NCB usually merges, so we are safe omitting if undefined.
      // However, let's be safe: if we have it in target, keep it consistent in local state.
    }

    if (updates.content) {
      const wordCount = updates.content.split(' ').length;
      updates.readTime = `${Math.max(1, Math.ceil(wordCount / 200))} min read`;
    }

    // Optimistic UI update
    setPosts(prev => prev.map(post => 
      String(post.id) === String(id) ? normalizePost({ ...post, ...updates }) : post
    ));

    if (target.isLocalOnly) {
      try {
        const local = localStorage.getItem('blog_posts');
        if (local) {
          const parsed = JSON.parse(local);
          const updatedLocal = parsed.map(p => 
            String(p.id) === String(id) ? normalizePost({ ...p, ...updates, isLocalOnly: true }) : p
          );
          localStorage.setItem('blog_posts', JSON.stringify(updatedLocal));
        }
      } catch (e) {
        console.error('Error updating localStorage for local-only post', e);
      }
      return;
    }

    try {
      console.log(`[BlogContext] Updating Post ${id}. Payload:`, updates);
      const response = await ncbUpdate('posts', id, updates);
      if (response && response.error) {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error('Failed to update post on server:', error);
      setPosts(previousPosts); // Revert
      throw new Error('Update failed: ' + error.message);
    }
  };

  const deletePost = async (id) => {
    const postToDelete = posts.find(post => String(post.id) === String(id));
    const previousPosts = [...posts];
    
    setPosts(prev => prev.filter(post => String(post.id) !== String(id)));

    if (postToDelete && postToDelete.isLocalOnly) {
      try {
        const local = localStorage.getItem('blog_posts');
        if (local) {
          const parsed = JSON.parse(local);
          const updated = parsed.filter(p => String(p.id) !== String(id));
          localStorage.setItem('blog_posts', JSON.stringify(updated));
        }
      } catch (e) {
        console.error('Error updating localStorage after local-only delete', e);
      }
      return;
    }

    try {
      const success = await ncbDelete('posts', id);
      if (!success) throw new Error('Delete operation returned false');
    } catch (error) {
      console.error('Failed to delete post from server:', error);
      setPosts(previousPosts);
      alert(`Failed to delete post from server: ${error.message || 'Unknown error'}. Restored.`);
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