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
    title: 'Laneige Lip Sleeping Mask',
    slug: 'laneige-lip-mask',
    category: 'Product Recommendations',
    subcategory: 'Skincare',
    rating: 5,
    excerpt: 'The ultimate overnight treatment for soft, supple lips. A staple in my night routine.',
    content: 'This mask has a softening balm texture that closely adheres to lips for quick absorption. Enriched with vitamin C and antioxidants, its Berry Mix Complex™ offers a nutritiously sweet and fragrant blend of raspberry, strawberry, cranberry, and blueberry extracts to indulge the senses.',
    image: 'https://images.unsplash.com/photo-1591130901020-ef93581c8fb9?w=800&q=80',
    date: '2024-01-20',
    status: 'published'
  },
  {
    id: 'prod-2',
    title: 'BT21 Wireless Retro Keyboard',
    slug: 'bt21-retro-keyboard',
    category: 'Product Recommendations',
    subcategory: 'Tech',
    rating: 4,
    excerpt: 'Add a pop of purple to your desk with this satisfyingly clicky mechanical keyboard.',
    content: 'Perfect for WFH moms! This keyboard features multi-device Bluetooth connectivity and a vintage typewriter feel. The round keys are not only cute but surprisingly comfortable for long writing sessions.',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80',
    date: '2024-01-19',
    status: 'published'
  },
  {
    id: 'prod-3',
    title: 'Innisfree Green Tea Seed Serum',
    slug: 'innisfree-green-tea-serum',
    category: 'Product Recommendations',
    subcategory: 'Skincare',
    rating: 5,
    excerpt: 'A lightweight moisture-stabilizing serum that keeps my skin hydrated through the day.',
    content: 'Infused with organic Jeju green tea and green tea seeds, this serum hydrates from deep within. It’s perfect for sensitive skin and layers beautifully under makeup without feeling sticky.',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80',
    date: '2024-01-18',
    status: 'published'
  },
  {
    id: 'prod-4',
    title: 'Dyson Airwrap Multi-Styler',
    slug: 'dyson-airwrap-styler',
    category: 'Product Recommendations',
    subcategory: 'Hair Care',
    rating: 5,
    excerpt: 'The only tool I need for a salon-quality blowout at home in less than 20 minutes.',
    content: 'It uses the Coanda effect to style hair without extreme heat. Whether you want voluminous curls or a smooth finish, this tool is worth every penny for busy moms who want to look put-together fast.',
    image: 'https://images.unsplash.com/photo-1522338140262-f46f5913618a?w=800&q=80',
    date: '2024-01-17',
    status: 'published'
  },
  {
    id: 'prod-5',
    title: 'BTS "Proof" Anthology Album',
    slug: 'bts-proof-album',
    category: 'Product Recommendations',
    subcategory: 'Collectibles',
    rating: 5,
    excerpt: 'A beautiful journey through Bangtan history. The perfect centerpiece for any ARMY shelf.',
    content: 'This anthology album embodies the history of BTS as they begin a new chapter as artists that have been active for nine years. Each CD is packed with hits, unreleased tracks, and solo favorites.',
    image: 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=800&q=80',
    date: '2024-01-16',
    status: 'published'
  },
  {
    id: 'prod-6',
    title: 'COSRX Snail Mucin Essence',
    slug: 'cosrx-snail-mucin',
    category: 'Product Recommendations',
    subcategory: 'Skincare',
    rating: 4,
    excerpt: 'The secret to the "glass skin" look. It’s slightly gooey but absorbs like magic.',
    content: 'Formulated with 96.3% Snail Secretion Filtrate, this essence protects the skin from moisture loss while improving skin elasticity. Snail mucin helps repair and soothes red, sensitive skin after breakouts by replenishing moisture.',
    image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&q=80',
    date: '2024-01-15',
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
      category: (post.category || 'General').trim(),
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
      
      const productsInDb = data.filter(p => (p.category || '').trim() === 'Product Recommendations');
      
      // Merge with seed data if database is lean on products
      if (productsInDb.length < 6) {
        const existingTitles = new Set(data.map(p => p.title.toLowerCase()));
        const uniqueSeeds = SEED_PRODUCTS.filter(s => !existingTitles.has(s.title.toLowerCase()));
        data = [...data, ...uniqueSeeds];
      }

      const normalized = data.map(normalizePost).sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setPosts(normalized);
    } catch (err) {
      console.error('BlogContext: Fetch failed', err);
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
      console.error("Add Post Error:", err);
      throw new Error(err.message || "Failed to create post. Please try again.");
    }
  };

  const updatePost = async (id, updates) => {
    try {
      await ncbUpdate(TABLE_NAME, id, updates);
      await fetchPosts();
    } catch (err) {
      console.error("Update Post Error:", err);
      throw new Error(err.message || "Failed to update post");
    }
  };

  const deletePost = async (id) => {
    try {
      await ncbDelete(TABLE_NAME, id);
      setPosts(prev => prev.filter(p => String(p.id) !== String(id)));
    } catch (err) {
      console.error("Delete Post Error:", err);
      throw new Error(err.message || "Failed to delete post");
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