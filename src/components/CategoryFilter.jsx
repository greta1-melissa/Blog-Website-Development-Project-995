import React from 'react';
import { motion } from 'framer-motion';

const CategoryFilter = ({ categories, selectedCategory, onCategoryChange }) => {
  const getCategoryStyle = (categoryName) => {
    const isSelected = selectedCategory === categoryName;
    
    switch (categoryName) {
      case 'Health':
        return isSelected
          ? 'bg-purple-500 text-white shadow-lg shadow-purple-200'
          : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200';
      case 'Fam Bam':
        return isSelected
          ? 'bg-purple-600 text-white shadow-lg shadow-purple-200'
          : 'bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200';
      case 'K-Drama':
        return isSelected
          ? 'bg-purple-500 text-white shadow-lg shadow-purple-200'
          : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200';
      case 'BTS':
        return isSelected
          ? 'bg-purple-700 text-white shadow-lg shadow-purple-300'
          : 'bg-purple-100 text-purple-900 hover:bg-purple-200 border border-purple-300';
      default:
        return isSelected
          ? 'bg-purple-800 text-white shadow-lg shadow-purple-400'
          : 'bg-gray-50 text-gray-700 hover:bg-purple-50 border border-gray-200';
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
            ? 'bg-gradient-to-r from-purple-500 to-purple-700 text-white shadow-lg shadow-purple-200'
            : 'bg-white text-gray-700 hover:bg-purple-50 border border-purple-200 hover:border-purple-300'
        }`}
      >
        All Posts
      </motion.button>
      {categories.map(cat => {
        // Handle both objects and strings
        const name = typeof cat === 'string' ? cat : (cat.name || cat.category_name);
        if (!name) return null;
        
        return (
          <motion.button
            key={name}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onCategoryChange(name)}
            className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${getCategoryStyle(name)}`}
          >
            {name}
          </motion.button>
        );
      })}
    </div>
  );
};

export default CategoryFilter;