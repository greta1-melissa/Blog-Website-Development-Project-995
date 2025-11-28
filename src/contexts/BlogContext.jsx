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
    content: "I recently re-watched 'Our Beloved Summer' and fell in love with Choi Woo Sik all over again. The cinematography, the subtle emotions, the soundtrack—it's a masterpiece of nostalgia. As a mom, I appreciate dramas that don't rely on heavy villains but rather explore the complexities of human relationships. Watching Yeon-su and Ung find their way back to each other reminded me that love is often about timing and growth. Plus, the aesthetic of this show is just...",
    author: "Melissa",
    date: "2024-02-28",
    category: "K-Drama",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1517604931442-71053e6e2306?w=800&h=400&fit=crop",
    isHandPicked: false
  },
  {
    id: 2,
    title: "Finding My Magic Shop: How BTS Helped Me Reclaim My Identity",
    content: "Before I was a mom, I had so many hobbies. Somewhere between diaper changes and school runs, I lost a bit of myself. Then I discovered BTS. Their lyrics about self-love and perseverance resonated so deeply. 'Magic Shop' isn't just a song; it's a reminder that it's okay to not be okay, and that there's a door in your heart you can open towards comfort. Now, blasting 'Mic Drop' while doing laundry is my form of therapy!",
    author: "Melissa",
    date: "2024-02-18",
    category: "BTS",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=400&fit=crop",
    isHandPicked: true
  },
  {
    id: 3,
    title: "Morning Wellness Routine: How I Start My Day as a Busy Mom",
    content: "Being a mom means juggling countless responsibilities, from packing lunches to managing schedules. But I've learned that if I don't fill my own cup first, I can't pour into others. My morning routine isn't about perfection; it's about grounding. I start with 10 minutes of stretching (usually while listening to 'Zero O'Clock'), followed by a warm cup of barley tea. It's these small moments of peace that help me tackle the chaos...",
    author: "Melissa",
    date: "2024-01-15",
    category: "Health",
    readTime: "4 min read",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop",
    isHandPicked: false
  },
  {
    id: 4,
    title: "5 Kitchen Gadgets That Saved My Weeknight Dinners",
    content: "Let's be real, cooking dinner every single night is exhausting. I used to dread the 5 PM question: 'Mom, what's for dinner?' Over the years, I've curated a few tools that make prep faster and cleanup easier. From my beloved air fryer (seriously, how did we live without them?) to a high-quality rice cooker that sings when it's done, here are the products that keep my kitchen running smoothly...",
    author: "Melissa",
    date: "2024-02-22",
    category: "Product Recommendations",
    readTime: "7 min read",
    image: "https://images.unsplash.com/photo-1556910103-1c02745a30bf?w=800&h=400&fit=crop",
    isHandPicked: true
  },
  {
    id: 5,
    title: "Weekend Getaway: Creating Memories with the Fam Bam",
    content: "We decided to take a spontaneous road trip last weekend. No strict itinerary, just snacks, a good playlist, and the open road. It wasn't perfect—there were tantrums and spilled juice—but those messy moments are the ones we laugh about later. We visited a local farm, picked strawberries, and just enjoyed being present without screens. Here is why I think unstructured play is vital for kids (and parents!)...",
    author: "Melissa",
    date: "2024-02-25",
    category: "Fam Bam",
    readTime: "4 min read",
    image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&h=400&fit=crop",
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
  // Initialize from local storage if available to prevent flash of default content
  const [posts, setPosts] = useState(() => getLocalPosts() || []);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Save to local storage whenever posts change
  useEffect(() => {
    if (posts.length > 0) {
      localStorage.setItem('blog_posts', JSON.stringify(posts));
    }
  }, [posts]);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch from API (NCB)
      // ncbGet now guarantees an array return, even on error (returns [])
      const serverData = await ncbGet('posts');
      
      let mergedPosts = [];

      if (serverData && serverData.length > 0) {
        // We have data from the server!
        
        // 2. Handle Local Drafts
        // We only want to keep local posts that have 'temporary' IDs not present on the server.
        // This handles the case where you created a post but it hasn't synced yet.
        const localData = getLocalPosts() || [];
        const serverIds = new Set(serverData.map(p => String(p.id)));
        
        const localDrafts = localData.filter(p => !serverIds.has(String(p.id)));
        
        // Merge: Local drafts + Server posts
        mergedPosts = [...localDrafts, ...serverData];
        
      } else {
        // No server data (or API failed). Fallback logic.
        console.warn("NoCodeBackend: No posts returned. Falling back to local/seed data.");
        
        const localData = getLocalPosts();
        if (localData && localData.length > 0) {
          mergedPosts = localData;
        } else {
          mergedPosts = initialPosts;
        }
      }
      
      // 3. Sort by Date (Newest First)
      mergedPosts.sort((a, b) => new Date(b.date) - new Date(a.date));

      setPosts(mergedPosts);

    } catch (error) {
      console.error("NoCodeBackend: Critical failure in fetchPosts.", error);
      // Fallback to local data on critical error
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
        const uniqueCategories = [...new Set(posts.map(post => post.category))];
        setCategories(uniqueCategories);
    }
  }, [posts]);

  const addPost = async (post) => {
    const tempId = Date.now();
    const wordCount = post.content ? post.content.split(' ').length : 0;
    const readTime = `${Math.max(1, Math.ceil(wordCount / 200))} min read`;

    const newPost = {
      ...post,
      id: tempId, // Temporary ID (Timestamp)
      date: new Date().toISOString().split('T')[0],
      readTime: readTime,
      author: post.author || "Melissa",
      isHandPicked: false
    };

    // Optimistic update - immediately saves to state
    setPosts(prev => [newPost, ...prev]);

    try {
      // Attempt to save to backend
      const result = await ncbCreate('posts', newPost);
      
      // Check if we got a valid ID back
      if (result && result.id) {
        // Update the post in state with the REAL ID from backend
        setPosts(prev => prev.map(p => p.id === tempId ? { ...p, id: result.id } : p));
        return result.id;
      }
      
      // If result exists but no ID (unlikely with NCB), just return tempId
      return tempId;
      
    } catch (error) {
      console.error("NoCodeBackend: Failed to save post.", error);
      // We do NOT revert the state, keeping the post locally so user work isn't lost.
      // It will have the tempId.
      return tempId;
    }
  };

  const deletePost = async (id) => {
    // Optimistic update
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