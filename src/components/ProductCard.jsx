import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiStar, FiDollarSign, FiExternalLink, FiShoppingBag, FiHeart } = FiIcons;

const ProductCard = ({ product, index }) => {
  // Create a rating display based on the product rating (assuming it's stored in the post content)
  const getRatingStars = (rating = 5) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <SafeIcon 
          key={i} 
          icon={FiStar} 
          className={`${i < rating ? 'text-yellow-400' : 'text-gray-300'} text-sm`} 
        />
      );
    }
    return stars;
  };

  // Extract price from content if available (this is a simple implementation)
  const extractPrice = (content) => {
    const priceMatch = content.match(/\$\d+(\.\d{2})?/);
    return priceMatch ? priceMatch[0] : null;
  };

  // Extract subcategory if available
  const subcategory = product.subcategory || 'General';
  
  // Get price if available in the content
  const price = extractPrice(product.content);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group border border-purple-100 hover:border-purple-200"
    >
      <Link to={`/post/${product.id}`}>
        <div className="relative overflow-hidden">
          <img 
            src={product.image} 
            alt={product.title} 
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Subcategory Badge */}
          <div className="absolute top-4 left-4">
            <span className="bg-white/80 backdrop-blur-sm text-purple-800 px-3 py-1 rounded-full text-sm font-medium shadow-sm">
              {subcategory}
            </span>
          </div>
          
          {/* Heart Icon */}
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-full">
              <SafeIcon icon={FiHeart} className="text-white text-lg" />
            </div>
          </div>
        </div>
      </Link>
      
      <div className="p-6">
        {/* Price and Rating */}
        <div className="flex items-center justify-between mb-3">
          {price && (
            <div className="flex items-center bg-green-50 px-3 py-1 rounded-full">
              <SafeIcon icon={FiDollarSign} className="mr-1 text-green-600" />
              <span className="text-green-800 font-medium">{price}</span>
            </div>
          )}
          
          <div className="flex items-center">
            {getRatingStars(4)}
          </div>
        </div>
        
        {/* Title */}
        <Link to={`/post/${product.id}`}>
          <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors line-clamp-2">
            {product.title}
          </h3>
        </Link>
        
        {/* Content Preview */}
        <p className="text-gray-600 mb-4 leading-relaxed line-clamp-3">
          {product.content.substring(0, 150)}...
        </p>
        
        {/* Footer */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
            {product.date}
          </span>
          
          <div className="flex space-x-2">
            <Link 
              to={`/post/${product.id}`} 
              className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium transition-colors group px-3 py-1 bg-purple-50 rounded-full"
            >
              <span>Review</span>
              <SafeIcon 
                icon={FiExternalLink} 
                className="ml-1 group-hover:translate-x-1 transition-transform" 
              />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;