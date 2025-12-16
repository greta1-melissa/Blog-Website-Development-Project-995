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

  // Sync to LocalStorage whenever posts change
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
      // 1. Build a Set of IDs that exist on the server
      const safeServerData = Array.isArray(serverData) ? serverData : [];
      const serverIds = new Set(safeServerData.map(p => String(p.id)));

      // 2. Normalize server posts (ensure isLocalOnly is false)
      const normalizedServerPosts = safeServerData.map(post => ({ ...post, isLocalOnly: false }));
      finalPosts = [...normalizedServerPosts];

      // 3. Merge Seed Posts if missing from server
      // CRITICAL FIX: If seed posts aren't on server, mark them as isLocalOnly: true
      // This ensures deletePost won't try to delete them from server and fail.
      initialPosts.forEach(seedPost => {
        if (!serverIds.has(String(seedPost.id))) {
          // Check if we already have this seed post in finalPosts (unlikely but safe)
          const exists = finalPosts.some(p => String(p.id) === String(seedPost.id));
          if (!exists) {
            finalPosts.push({ ...seedPost, isLocalOnly: true });
          }
        }
      });

      // 4. Merge Local Drafts/Unsynced Posts
      // If a post exists locally but NOT on server, preserve it and mark as local-only
      if (localData.length > 0) {
        localData.forEach(localPost => {
          const idStr = String(localPost.id);
          // Only add if NOT on server and NOT one of the seed posts we already handled
          // This prevents duplicates if seed IDs match local IDs
          const isSeed = initialPosts.some(s => String(s.id) === idStr);
          
          if (!serverIds.has(idStr) && !isSeed) {
            // Deduplication: Ensure we haven't added this ID already
            const alreadyAdded = finalPosts.some(p => String(p.id) === idStr);
            if (!alreadyAdded) {
              finalPosts.push({ ...localPost, isLocalOnly: true });
            }
          }
        });
      }

      // 5. Data Sanitization: Ensure status exists
      finalPosts = finalPosts.map(p => ({
        ...p,
        status: ['draft', 'scheduled', 'published'].includes(p.status) ? p.status : 'published'
      }));

      // 6. Sort: Featured first, then Date Descending
      finalPosts.sort((a, b) => {
        if (a.isHandPicked && !b.isHandPicked) return -1;
        if (!a.isHandPicked && b.isHandPicked) return 1;
        return new Date(b.date) - new Date(a.date);
      });

      setPosts(finalPosts);

    } catch (error) {
      console.error("[BlogContext] Critical failure in fetchPosts.", error);
      // Fallback on critical error: use local data or initial seeds
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
    const tempId = Date.now(); // Temporary ID
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
      // CRITICAL FIX: Handle undefined content safely
      metaDescription: postData.metaDescription || (postData.content || "").substring(0, 160),
      focusKeyword: postData.focusKeyword || '',
      isLocalOnly: true // Initially local until synced
    };

    // Optimistic Update
    setPosts(prev => [newPost, ...prev]);

    try {
      // Remove local-only flags before sending to server
      const { id, isLocalOnly, ...postPayload } = newPost;
      
      const savedPost = await ncbCreate('posts', postPayload);
      
      if (!savedPost || (!savedPost.id && !savedPost._id)) {
        throw new Error("Database did not return a valid post with an ID.");
      }

      const realId = savedPost.id || savedPost._id;
      
      // CRITICAL: Update the specific post with the REAL ID from server
      // This prevents duplicates on next fetch (where server has RealID and local has TempID)
      setPosts(prev => prev.map(p => {
        if (p.id === tempId) {
          return { ...p, ...savedPost, id: realId, isLocalOnly: false };
        }
        return p;
      }));
      
      return realId;
    } catch (error) {
      console.error("[BlogContext] Failed to save post.", error);
      // We keep it in state as local-only. 
      // The user will see "Unsynced" badge and can try to save again later (logic to be added) or delete it.
      throw error;
    }
  };

  const updatePost = async (id, updatedFields) => {
    const previousPosts = [...posts];
    let updates = { ...updatedFields };

    // Recalculate read time if content changed
    if (updates.content) {
      const wordCount = updates.content.split(' ').length;
      updates.readTime = `${Math.max(1, Math.ceil(wordCount / 200))} min read`;
    }

    // Find target post using String comparison for safety
    const target = previousPosts.find(post => String(post.id) === String(id));
    if (!target) return;

    // Optimistic UI update
    setPosts(prev => prev.map(post => 
      String(post.id) === String(id) ? { ...post, ...updates } : post
    ));

    // If this is a local-only post, just update state + localStorage and skip NCB.
    if (target.isLocalOnly) {
      try {
        const local = localStorage.getItem('blog_posts');
        if (local) {
          const parsed = JSON.parse(local);
          const updatedLocal = parsed.map(p => 
            String(p.id) === String(id) ? { ...p, ...updates, isLocalOnly: true } : p
          );
          localStorage.setItem('blog_posts', JSON.stringify(updatedLocal));
        }
      } catch (e) {
        console.error('Error updating localStorage for local-only post', e);
      }
      return;
    }

    // For server posts, keep current NCB update behaviour.
    try {
      const response = await ncbUpdate('posts', id, updates);
      if (response && response.error) {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error('Failed to update post on server:', error);
      setPosts(previousPosts); // Revert optimistic update
      throw new Error('Update failed: ' + error.message);
    }
  };

  const deletePost = async (id) => {
    // 1. Find the post first to check if it's local
    const postToDelete = posts.find(post => String(post.id) === String(id));
    
    // Optimistic delete from state
    const previousPosts = [...posts];
    setPosts(prev => prev.filter(post => String(post.id) !== String(id)));

    // 2. If this was a local-only post (or seed post not on server), just remove it locally and return.
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
      return; // DONE - No server call
    }

    // 3. Otherwise, this post should exist on the server – call NoCodeBackend.
    try {
      const success = await ncbDelete('posts', id);
      if (!success) throw new Error('Delete operation returned false');
    } catch (error) {
      console.error('Failed to delete post from server:', error);
      // Restore the previous list because server delete failed
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