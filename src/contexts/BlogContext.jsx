import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { ncbReadAll, ncbCreate, ncbUpdate, ncbDelete } from '../services/nocodebackendClient';
import { getImageSrc } from '../utils/media.js';
import { BLOG_PLACEHOLDER } from '../config/assets';

const BlogContext = createContext();

export const useBlog = () => {
  const context = useContext(BlogContext);
  if (!context) {
    throw new Error('useBlog must be used within a BlogProvider');
  }
  return context;
};

// --- START SEED DATA ---
const SEED_PRODUCTS = [
  {
    id: 'prod-1',
    title: 'Laneige Sleep Mask',
    category: 'Product Recommendations',
    subcategory: 'Skincare',
    rating: 5,
    content: 'The ultimate hydration booster. Wake up with glowing, plump skin thanks to this overnight miracle worker. It’s light, non-greasy, and smells like a dream.',
    image: 'https://images.unsplash.com/photo-1591130901020-ef93581c8fb9?w=800&q=80',
    date: '2024-01-20',
    status: 'published'
  },
  {
    id: 'prod-2',
    title: 'Mediheal Pads',
    category: 'Product Recommendations',
    subcategory: 'Skincare',
    rating: 4,
    content: 'Convenient and effective. These toner pads are soaked in essence to calm and prep your skin in seconds. Perfect for busy mornings when you need a quick refresh.',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=80',
    date: '2024-01-19',
    status: 'published'
  },
  {
    id: 'prod-3',
    title: 'BT21 Royce Computer Desk Lamp',
    category: 'Product Recommendations',
    subcategory: 'Home & Tech',
    rating: 5,
    content: 'The cutest desk companion. This BT21 lamp offers multiple brightness levels and adds a touch of magic to any workspace. A must-have for any ARMY home office.',
    image: 'https://images.unsplash.com/photo-1534073828943-f801091bb18c?w=800&q=80',
    date: '2024-01-18',
    status: 'published'
  },
  {
    id: 'prod-4',
    title: 'The Creme Shop BT21 Make Up Brush',
    category: 'Product Recommendations',
    subcategory: 'Beauty',
    rating: 5,
    content: 'Soft, synthetic bristles that blend like a dream. Plus, the BT21 character designs are absolutely adorable. High quality meets high cuteness.',
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80',
    date: '2024-01-17',
    status: 'published'
  },
  {
    id: 'prod-5',
    title: 'CosRX Sun Block',
    category: 'Product Recommendations',
    subcategory: 'Skincare',
    rating: 5,
    content: 'No white cast, no stickiness. Just pure protection. The Aloe Soothing Sun Cream is a cult favorite for a reason—it feels just like a moisturizer.',
    image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&q=80',
    date: '2024-01-16',
    status: 'published'
  },
  {
    id: 'prod-6',
    title: 'Dyson Airwrap Multi-Styler',
    category: 'Product Recommendations',
    subcategory: 'Hair Care',
    rating: 5,
    content: 'An absolute game changer for busy mornings. It dries and styles simultaneously using air, not extreme heat. Perfect for achieving that salon blowout look in half the time.',
    image: 'https://images.unsplash.com/photo-1522338140262-f46f5913618a?w=800&q=80',
    date: '2024-01-15',
    status: 'published'
  },
  {
    id: 'prod-7',
    title: 'BT21 Cooky Plush Pillow',
    category: 'Product Recommendations',
    subcategory: 'Collectibles',
    rating: 5,
    content: 'Soft, squishy, and impossibly pink! This Cooky plush is the perfect cuddle companion for K-drama marathons. High-quality stitching and super soft fabric.',
    image: 'https://images.unsplash.com/photo-1559449182-2624ca46a8ce?w=800&q=80',
    date: '2024-01-14',
    status: 'published'
  },
  {
    id: 'prod-8',
    title: 'Innisfree Green Tea Seed Serum',
    category: 'Product Recommendations',
    subcategory: 'Skincare',
    rating: 4,
    content: 'A lightweight, moisture-stabilizing serum that keeps your skin hydrated all day. Formulated with Jeju Green Tea, it absorbs instantly without any sticky residue.',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80',
    date: '2024-01-13',
    status: 'published'
  }
];
// --- END SEED DATA ---

export const BlogProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const TABLE_NAME = 'posts';

  const normalizePost = useCallback((post) => {
    const rawImage = post.image || post.image_url || post.featured_image_url || '';
    const cleanImage = getImageSrc(rawImage, BLOG_PLACEHOLDER);
    const rawStatus = (post.status || post.post_status || post.state || 'published').toString().toLowerCase().trim();
    const isHandPicked = post.ishandpicked === 1 || post.ishandpicked === '1' || post.ishandpicked === true || post.isHandPicked === true || post.is_featured === true;

    return {
      ...post,
      id: post.id,
      title: post.title || 'Untitled Story',
      slug: post.slug || post.id || '',
      category: post.category || 'General',
      subcategory: post.subcategory || '',
      rating: post.rating || 5,
      status: rawStatus,
      excerpt: post.excerpt || post.summary || '',
      content: post.content || '',
      image: cleanImage,
      image_url: cleanImage,
      featured_image_url: cleanImage,
      readTime: post.readtime || post.readTime || "3 min read",
      isHandPicked: isHandPicked,
      date: post.date || post.created_at || new Date().toISOString()
    };
  }, []);

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await ncbReadAll(TABLE_NAME);
      let data = Array.isArray(response) ? response : [];
      
      // If database is empty, use seed products as a starting point
      if (data.length === 0) {
        data = SEED_PRODUCTS;
      }

      const normalized = data.map(normalizePost).sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setPosts(normalized);
    } catch (err) {
      console.error('BlogContext: Fetch failed', err);
      // Fallback to seed data on error so the UI isn't empty
      setPosts(SEED_PRODUCTS.map(normalizePost));
      setError("Using sample data (Database connection issue).");
    } finally {
      setIsLoading(false);
    }
  }, [normalizePost]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const addPost = async (postData) => {
    try {
      const result = await ncbCreate(TABLE_NAME, postData);
      await fetchPosts();
      return result.id;
    } catch (err) {
      throw new Error("Failed to create post");
    }
  };

  const updatePost = async (id, updates) => {
    try {
      await ncbUpdate(TABLE_NAME, id, updates);
      await fetchPosts();
    } catch (err) {
      throw new Error("Failed to update post");
    }
  };

  const deletePost = async (id) => {
    try {
      await ncbDelete(TABLE_NAME, id);
      setPosts(prev => prev.filter(p => String(p.id) !== String(id)));
    } catch (err) {
      throw new Error("Failed to delete post");
    }
  };

  const categories = useMemo(() => {
    const unique = [...new Set(posts.map(p => p.category))].filter(Boolean);
    return unique.length > 0 ? unique : ['Health', 'Fam Bam', 'K-Drama', 'BTS', 'Product Recommendations', 'Career'];
  }, [posts]);

  const publishedPosts = useMemo(() => 
    posts.filter(p => p.status === 'published' || p.status === 'active' || p.status === ''), 
    [posts]
  );

  return (
    <BlogContext.Provider value={{
      posts, 
      publishedPosts, 
      categories, 
      isLoading, 
      error, 
      addPost, 
      updatePost, 
      deletePost, 
      fetchPosts,
      getPost: (id) => posts.find(p => String(p.id) === String(id))
    }}>
      {children}
    </BlogContext.Provider>
  );
};