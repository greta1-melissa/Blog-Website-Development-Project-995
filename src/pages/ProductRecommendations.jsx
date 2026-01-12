import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useBlog } from '../contexts/BlogContext';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import SearchBar from '../components/SearchBar';
import ProductCard from '../components/ProductCard';

const { FiShoppingBag, FiStar, FiFilter } = FiIcons;

const ProductRecommendations = () => {
  const { publishedPosts: posts, isLoading } = useBlog();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Filter only for Product Recommendations
  const productPosts = useMemo(() => {
    return posts.filter(post => 
      (post.category || '').trim() === 'Product Recommendations'
    );
  }, [posts]);

  // Extract unique subcategories (e.g., Skincare, Tech, Home)
  const productSubcategories = useMemo(() => {
    const subs = productPosts.map(post => post.subcategory || 'General');
    return [...new Set(subs)];
  }, [productPosts]);

  // Apply search and subcategory filters
  const filteredProducts = useMemo(() => {
    return productPosts.filter(post => {
      const matchesSearch = searchTerm === '' || 
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        post.content.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === '' || 
        (post.subcategory && post.subcategory === selectedCategory);
      
      return matchesSearch && matchesCategory;
    });
  }, [productPosts, searchTerm, selectedCategory]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500 font-sans font-medium">Curating your recommendations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center justify-center p-3 bg-purple-100 rounded-2xl mb-6 shadow-sm"
          >
            <SafeIcon icon={FiShoppingBag} className="text-3xl text-purple-600" />
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-gray-900 mb-6">
            Product <span className="bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">Recommendations</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto font-sans leading-relaxed">
            A handpicked collection of things that bring joy to my daily life, from skincare essentials to tech favorites.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-12 space-y-8">
          <div className="max-w-2xl mx-auto">
            <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 border ${
                selectedCategory === '' 
                ? 'bg-purple-600 text-white border-purple-600 shadow-lg shadow-purple-200' 
                : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300 hover:bg-purple-50'
              }`}
            >
              All Picks
            </button>
            {productSubcategories.map(sub => (
              <button
                key={sub}
                onClick={() => setSelectedCategory(sub)}
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 border ${
                  selectedCategory === sub 
                  ? 'bg-purple-600 text-white border-purple-600 shadow-lg shadow-purple-200' 
                  : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>

        {/* Masonry Grid Layout */}
        {filteredProducts.length > 0 ? (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
            {filteredProducts.map((product, index) => (
              <div key={product.id} className="break-inside-avoid">
                <ProductCard product={product} index={index} />
              </div>
            ))}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24 bg-white rounded-[3rem] border border-dashed border-purple-200 shadow-inner"
          >
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <SafeIcon icon={FiFilter} className="text-3xl text-gray-300" />
            </div>
            <h3 className="text-2xl font-serif font-bold text-gray-900 mb-2">No matches found</h3>
            <p className="text-gray-500 font-sans">Try adjusting your filters or search terms to find what you're looking for.</p>
            <button 
              onClick={() => {setSearchTerm(''); setSelectedCategory('');}}
              className="mt-8 px-8 py-3 bg-purple-600 text-white rounded-full font-bold hover:bg-purple-700 transition-all shadow-lg shadow-purple-200"
            >
              Reset Filters
            </button>
          </motion.div>
        )}

        {/* Affiliate Disclaimer */}
        <div className="mt-24 p-8 bg-purple-50 rounded-[2.5rem] border border-purple-100 text-center max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-4 text-purple-600">
            <SafeIcon icon={FiStar} className="fill-current" />
            <span className="font-bold uppercase tracking-widest text-[10px] font-sans">Affiliate Disclosure</span>
            <SafeIcon icon={FiStar} className="fill-current" />
          </div>
          <p className="text-sm text-purple-800 leading-relaxed font-sans italic">
            Some of the links on this page are affiliate links, meaning I may earn a small commission if you make a purchase through them, at no additional cost to you. I only recommend products I truly love and use myself!
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductRecommendations;