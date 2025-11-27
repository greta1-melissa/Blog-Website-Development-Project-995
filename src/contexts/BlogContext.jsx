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

// Fallback data with 'isHandPicked' flag added for manual curation
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

// Helper to get local data
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
      // 1. Try fetching from API
      const data = await ncbGet('posts');
      
      if (data && Array.isArray(data) && data.length > 0) {
        // API success - Use this data
        setPosts(data);
      } else {
        // 2. API returned nothing/failed - Check if we have local data
        const localData = getLocalPosts();
        if (localData && localData.length > 0) {
          setPosts(localData);
        } else {
          // 3. No local data either - Use initial hardcoded data
          setPosts(initialPosts);
        }
      }
    } catch (error) {
      console.error("Failed to fetch posts:", error);
      // On error, rely on local data or fallback
      const localData = getLocalPosts();
      setPosts(localData || initialPosts);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch if we haven't initialized from local storage yet, or to refresh
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
      id: tempId, // Temporary ID
      date: new Date().toISOString().split('T')[0],
      readTime: readTime,
      author: post.author || "Melissa",
      isHandPicked: false
    };

    // Optimistic update - immediately saves to state (and thus localStorage via useEffect)
    setPosts(prev => [newPost, ...prev]);

    try {
      const result = await ncbCreate('posts', newPost);
      if (result && result.id) {
        // Update the post with the real ID from backend
        setPosts(prev => prev.map(p => p.id === tempId ? { ...p, id: result.id } : p));
        return result.id;
      }
      return tempId;
    } catch (error) {
      console.error("Failed to save post to backend:", error);
      // We don't revert the state here, so the post remains locally
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
      // If backend delete fails, we might want to revert, 
      // but for now we keep the local deletion to be responsive
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