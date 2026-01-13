import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { ncbReadAll, ncbCreate, ncbUpdate, ncbDelete } from '../services/nocodebackendClient';
import { getImageSrc } from '../utils/media.js';
import { BLOG_PLACEHOLDER, PLACEHOLDER_IMAGE } from '../config/assets';

const BlogContext = createContext();

export const useBlog = () => {
  const context = useContext(BlogContext);
  if (!context) {
    throw new Error('useBlog must be used within a BlogProvider');
  }
  return context;
};

const SEED_PRODUCTS = [
  {
    id: 'p1',
    title: 'Laneige Lip Sleeping Mask',
    subcategory: 'Skincare',
    rating: 5,
    excerpt: 'The ultimate overnight treatment for soft, supple lips. A staple in my night routine.',
    content: 'Enriched with vitamin C and antioxidants, its Berry Mix Complex™ offers a nutritiously sweet and fragrant blend.',
    image: 'https://images.unsplash.com/photo-1591130901020-ef93581c8fb9?w=800&q=80',
    date: '2024-01-20',
    status: 'published'
  },
  {
    id: 'p2',
    title: 'BT21 Wireless Retro Keyboard',
    subcategory: 'Tech',
    rating: 4,
    excerpt: 'Add a pop of purple to your desk with this satisfyingly clicky mechanical keyboard.',
    content: 'Perfect for WFH moms! Features multi-device Bluetooth connectivity and a vintage typewriter feel.',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80',
    date: '2024-01-19',
    status: 'published'
  },
  {
    id: 'p3',
    title: 'Innisfree Green Tea Seed Serum',
    subcategory: 'Skincare',
    rating: 5,
    excerpt: 'A lightweight moisture-stabilizing serum that keeps my skin hydrated through the day.',
    content: 'Infused with organic Jeju green tea and green tea seeds, this serum hydrates from deep within.',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80',
    date: '2024-01-18',
    status: 'published'
  }
];

export const BlogProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const TABLES = {
    POSTS: 'posts',
    PRODUCTS: 'product_recommendations'
  };

  const normalizeItem = useCallback((item, type = 'post') => {
    const rawImage = item.image || item.image_url || item.featured_image_url || '';
    const fallback = type === 'post' ? BLOG_PLACEHOLDER : PLACEHOLDER_IMAGE;
    const cleanImage = getImageSrc(rawImage, fallback);
    const rawStatus = (item.status || 'published').toString().toLowerCase().trim();

    return {
      ...item,
      id: item.id,
      title: item.title || 'Untitled',
      status: rawStatus,
      category: item.category || (type === 'post' ? 'General' : 'Product'),
      excerpt: item.excerpt || item.summary || item.short_blurb || '',
      content: item.content || item.detailed_review || '',
      image: cleanImage,
      date: item.date || item.created_at || new Date().toISOString()
    };
  }, []);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Fetch Posts (Strictly stories)
      const postsRes = await ncbReadAll(TABLES.POSTS);
      const normalizedPosts = (Array.isArray(postsRes) ? postsRes : [])
        .filter(p => (p.category || '').trim() !== 'Product Recommendations')
        .map(p => normalizeItem(p, 'post'));

      // 2. Fetch Products
      const productsRes = await ncbReadAll(TABLES.PRODUCTS);
      let normalizedProducts = (Array.isArray(productsRes) ? productsRes : [])
        .map(p => normalizeItem(p, 'product'));

      if (normalizedProducts.length === 0) {
        normalizedProducts = SEED_PRODUCTS.map(p => normalizeItem(p, 'product'));
      }

      setPosts(normalizedPosts.sort((a,b) => new Date(b.date) - new Date(a.date)));
      setProducts(normalizedProducts.sort((a,b) => new Date(b.date) - new Date(a.date)));
    } catch (err) {
      console.error('BlogContext: Fetch failed', err);
      setError("Connection issue.");
    } finally {
      setIsLoading(false);
    }
  }, [normalizeItem]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Helper for public pages
  const publishedPosts = useMemo(() => 
    posts.filter(p => p.status === 'published'), 
  [posts]);

  // --- ACTIONS ---
  const addPost = async (data) => {
    const res = await ncbCreate(TABLES.POSTS, data);
    await fetchData();
    return res.id;
  };
  const updatePost = async (id, data) => {
    await ncbUpdate(TABLES.POSTS, id, data);
    await fetchData();
  };
  const deletePost = async (id) => {
    await ncbDelete(TABLES.POSTS, id);
    setPosts(prev => prev.filter(p => String(p.id) !== String(id)));
  };

  const addProduct = async (data) => {
    const res = await ncbCreate(TABLES.PRODUCTS, data);
    await fetchData();
    return res.id;
  };
  const updateProduct = async (id, data) => {
    await ncbUpdate(TABLES.PRODUCTS, id, data);
    await fetchData();
  };
  const deleteProduct = async (id) => {
    await ncbDelete(TABLES.PRODUCTS, id);
    setProducts(prev => prev.filter(p => String(p.id) !== String(id)));
  };

  const categories = useMemo(() => ['Health', 'Fam Bam', 'K-Drama', 'BTS', 'Career'], []);

  return (
    <BlogContext.Provider value={{
      posts,
      publishedPosts,
      products,
      isLoading,
      error,
      addPost,
      updatePost,
      deletePost,
      addProduct,
      updateProduct,
      deleteProduct,
      fetchData,
      categories,
      getPost: (id) => posts.find(p => String(p.id) === String(id)) || products.find(p => String(p.id) === String(id))
    }}>
      {children}
    </BlogContext.Provider>
  );
};