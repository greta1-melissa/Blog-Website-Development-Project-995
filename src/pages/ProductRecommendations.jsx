import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useBlog } from '../contexts/BlogContext';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import SearchBar from '../components/SearchBar';
import ProductCard from '../components/ProductCard';

const { FiStar, FiShoppingBag, FiFilter, FiHeart, FiTag } = FiIcons;

const ProductRecommendations = () => {
  const { posts } = useBlog();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  // Filter posts that are only in the 'Product Recommendations' category
  const productPosts = useMemo(() => {
    return posts.filter(post => post.category === 'Product Recommendations');
  }, [posts]);
  
  // Extract product subcategories from the posts
  const productSubcategories = useMemo(() => {
    const categories = productPosts.reduce((acc, post) => {
      // Assuming each product post has a subcategory property
      // If not, we'll just group them generically
      const subcategory = post.subcategory || 'Other';
      if (!acc.includes(subcategory)) {
        acc.push(subcategory);
      }
      return acc;
    }, []);
    
    return categories;
  }, [productPosts]);
  
  // Filter posts based on search and category
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

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.6 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
    >
      {/* Header Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Product <span className="text-purple-600">Recommendations</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Discover my favorite products for moms, kids, and K-culture enthusiasts. 
          I only recommend items I've personally tried and loved!
        </p>
      </div>
      
      {/* Featured Product Section */}
      {productPosts.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-16"
        >
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl overflow-hidden shadow-lg">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="p-8 flex flex-col justify-center">
                <div className="flex items-center mb-2">
                  <SafeIcon icon={FiStar} className="text-yellow-300 mr-2" />
                  <span className="text-white text-sm font-medium">Featured Product</span>
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">{productPosts[0].title}</h2>
                <p className="text-purple-100 mb-6">
                  {productPosts[0].content.substring(0, 150)}...
                </p>
                <a 
                  href={`/post/${productPosts[0].id}`}
                  className="inline-flex items-center px-6 py-3 bg-white text-purple-600 rounded-lg hover:bg-purple-50 transition-colors font-medium self-start"
                >
                  Read Full Review
                </a>
              </div>
              <div className="relative">
                <img 
                  src={productPosts[0].image} 
                  alt={productPosts[0].title} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-transparent opacity-50 lg:opacity-0"></div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Search and Filter Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mb-12"
      >
        <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
        
        <div className="flex flex-wrap gap-3 mb-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedCategory('')}
            className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
              selectedCategory === '' 
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' 
                : 'bg-white text-gray-700 hover:bg-purple-50 border border-purple-200 hover:border-purple-300'
            }`}
          >
            All Products
          </motion.button>
          
          {productSubcategories.map(category => (
            <motion.button
              key={category}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                selectedCategory === category 
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' 
                  : 'bg-white text-gray-700 hover:bg-purple-50 border border-purple-200 hover:border-purple-300'
              }`}
            >
              {category}
            </motion.button>
          ))}
        </div>
      </motion.div>
      
      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center py-16"
        >
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <SafeIcon icon={FiShoppingBag} className="text-purple-600 text-xl" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm ? 'Try adjusting your search terms' : 'Product recommendations coming soon!'}
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      )}
      
      {/* Call to Action */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.6, delay: 0.5 }}
        className="mt-16 bg-purple-50 rounded-xl p-8 text-center"
      >
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <SafeIcon icon={FiHeart} className="text-purple-600 text-xl" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Have a product suggestion?</h3>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          Is there a product you'd like me to review? Or maybe you have a favorite item that other moms might love?
          I'm always looking for new recommendations to try and share!
        </p>
        <a 
          href="/contact"
          className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
        >
          Send a Suggestion
        </a>
      </motion.div>
    </motion.div>
  );
};

export default ProductRecommendations;