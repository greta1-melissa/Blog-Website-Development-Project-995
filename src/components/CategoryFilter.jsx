import React from 'react';
import { motion } from 'framer-motion';

const CategoryFilter = ({ categories, selectedCategory, onCategoryChange }) => {
  const getCategoryStyle = (category) => {
    const isSelected = selectedCategory === category;
    
    switch (category) {
      case 'Health':
        return isSelected 
          ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg' 
          : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200';
      case 'Fam Bam':
        return isSelected 
          ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg' 
          : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200';
      case 'K-Drama':
        return isSelected 
          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' 
          : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200';
      case 'BTS':
        return isSelected 
          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg' 
          : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200';
      case 'Product Recommendations':
        return isSelected 
          ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg' 
          : 'bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200';
      default:
        return isSelected 
          ? 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg' 
          : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200';
    }
  };

  return (
    <div className="flex flex-wrap gap-3 mb-8">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onCategoryChange('')}
        className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
          selectedCategory === '' 
            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' 
            : 'bg-white text-gray-700 hover:bg-purple-50 border border-purple-200 hover:border-purple-300'
        }`}
      >
        All Posts
      </motion.button>
      
      {categories.map(category => (
        <motion.button
          key={category}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onCategoryChange(category)}
          className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${getCategoryStyle(category)}`}
        >
          {category}
        </motion.button>
      ))}
    </div>
  );
};

export default CategoryFilter;