import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useBlog } from '../contexts/BlogContext';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import SafeImage from '../common/SafeImage';
import SearchBar from '../components/SearchBar';
import ProductCard from '../components/ProductCard';
import { PLACEHOLDER_IMAGE } from '../config/assets';

const { FiStar, FiShoppingBag, FiHeart } = FiIcons;

const ProductRecommendations = () => {
  const { publishedPosts: posts } = useBlog();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const productPosts = useMemo(() => {
    return posts.filter(post => post.category === 'Product Recommendations');
  }, [posts]);

  const productSubcategories = useMemo(() => {
    return [...new Set(productPosts.map(post => post.subcategory || 'Other'))];
  }, [productPosts]);

  const filteredProducts = useMemo(() => {
    return productPosts.filter(post => {
      const matchesSearch = searchTerm === '' || post.title.toLowerCase().includes(searchTerm.toLowerCase()) || post.content.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === '' || (post.subcategory && post.subcategory === selectedCategory);
      return matchesSearch && matchesCategory;
    });
  }, [productPosts, searchTerm, selectedCategory]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Product <span className="text-purple-600">Recommendations</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          I only recommend items I've personally tried and loved!
        </p>
      </div>

      {productPosts.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="mb-16">
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl overflow-hidden shadow-lg">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="p-8 flex flex-col justify-center">
                <div className="flex items-center mb-2">
                  <SafeIcon icon={FiStar} className="text-yellow-300 mr-2" />
                  <span className="text-white text-sm font-medium">Featured Product</span>
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">{productPosts[0].title}</h2>
                <a href={`/post/${productPosts[0].id}`} className="inline-flex items-center px-6 py-3 bg-white text-purple-600 rounded-lg hover:bg-purple-50 transition-colors font-medium self-start">
                  Read Full Review
                </a>
              </div>
              <div className="relative h-64 lg:h-auto bg-gray-100">
                <SafeImage 
                  src={productPosts[0].image || productPosts[0].image_url} 
                  alt={productPosts[0].title} 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <div className="mb-12">
        <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
        <div className="flex flex-wrap gap-3 mt-8">
          <button 
            onClick={() => setSelectedCategory('')}
            className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${selectedCategory === '' ? 'bg-purple-600 text-white shadow-lg' : 'bg-white text-gray-700 border border-purple-200 hover:bg-purple-50'}`}
          >
            All Products
          </button>
          {productSubcategories.map(category => (
            <button key={category} onClick={() => setSelectedCategory(category)} className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${selectedCategory === category ? 'bg-purple-600 text-white shadow-lg' : 'bg-white text-gray-700 border border-purple-200 hover:bg-purple-50'}`}>
              {category}
            </button>
          ))}
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <SafeIcon icon={FiShoppingBag} className="text-purple-600 text-xl" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default ProductRecommendations;