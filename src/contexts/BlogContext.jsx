import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { ncbReadAll, ncbCreate, ncbUpdate, ncbDelete } from '../services/nocodebackendClient';
import { stripHtml } from '../utils/textUtils';

const BlogContext = createContext();

export const BlogProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const normalizePostData = useCallback((rawPosts, currentCategories) => {
    return rawPosts.map(post => {
      // 1. Determine Display Image (Priority: URL > Dropbox > Legacy)
      const displayImage = post.featured_image_url || post.featured_image_dropbox_url || post.image || post.image_url || '';
      
      // 2. Map Category Name
      let categoryName = 'General';
      if (post.category_id) {
        const cat = currentCategories.find(c => String(c.id) === String(post.category_id));
        if (cat) categoryName = cat.name || cat.category_name;
      } else if (post.category) {
        categoryName = typeof post.category === 'string' ? post.category : (post.category.name || post.category.category_name || 'General');
      }

      // 3. Ensure excerpt exists
      const excerpt = post.excerpt || (post.content_html ? stripHtml(post.content_html).substring(0, 150) : '');

      return {
        ...post,
        displayImage,
        categoryName,
        excerpt
      };
    });
  }, []);

  const fetchBlogData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Categories first for mapping
      const catData = await ncbReadAll('categories').catch(() => []);
      const finalCategories = catData && catData.length > 0 ? catData : [
        { id: 1, name: 'Life' },
        { id: 2, name: 'BTS' },
        { id: 3, name: 'Parenting' },
        { id: 4, name: 'Self-Care' },
        { id: 5, name: 'K-Drama' },
        { id: 6, name: 'General' }
      ];
      setCategories(finalCategories);

      // 2. Fetch Posts
      const pData = await ncbReadAll('posts').catch(() => []);
      const normalizedPosts = normalizePostData(pData || [], finalCategories);
      setPosts(normalizedPosts);
      
      // 3. Fetch product recommendations
      const prodData = await ncbReadAll('product_recommendations').catch(() => []);
      setProducts(prodData || []);

    } catch (error) {
      console.error('Error fetching blog data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [normalizePostData]);

  useEffect(() => {
    fetchBlogData();
  }, [fetchBlogData]);

  const publishedPosts = useMemo(() => 
    (posts || [])
      .filter(p => {
        const status = (p.status || p.Status || 'Draft').toString().toLowerCase();
        return status === 'published';
      })
      .sort((a, b) => {
        const dateA = new Date(a.published_at || a.created_at || a.date || 0);
        const dateB = new Date(b.published_at || b.created_at || b.date || 0);
        return dateB - dateA;
      }),
  [posts]);

  const addPost = async (postData) => {
    const newPost = await ncbCreate('posts', postData);
    if (newPost) {
      await fetchBlogData(); // Refresh to get normalized version
      return newPost;
    }
  };

  const updatePost = async (id, postData) => {
    await ncbUpdate('posts', id, postData);
    await fetchBlogData(); // Refresh to get normalized version
  };

  const deletePost = async (id) => {
    await ncbDelete('posts', id);
    setPosts(prev => prev.filter(p => p.id !== id));
  };

  return (
    <BlogContext.Provider value={{ 
      posts: posts || [], 
      publishedPosts: publishedPosts || [], 
      products: products || [], 
      categories,
      isLoading, 
      addPost, 
      updatePost, 
      deletePost,
      refreshData: fetchBlogData 
    }}>
      {children}
    </BlogContext.Provider>
  );
};

export const useBlog = () => useContext(BlogContext);