import React from 'react';
import { motion } from 'framer-motion';

const CategoryFilter = ({ categories, selectedCategory, onCategoryChange }) => {
  const getCategoryColor = (category) => {
    switch (category) {
      case 'Health':
        return selectedCategory === category 
          ? 'bg-green-500 text-white' 
          : 'bg-green-100 text-green-700 hover:bg-green-200';
      case 'Fam Bam':
        return selectedCategory === category 
          ? 'bg-blue-500 text-white' 
          : 'bg-blue-100 text-blue-700 hover:bg-blue-200';
      case 'K-Drama':
        return selectedCategory === category 
          ? 'bg-purple-500 text-white' 
          : 'bg-purple-100 text-purple-700 hover:bg-purple-200';
      case 'BTS':
        return selectedCategory === category 
          ? 'bg-purple-500 text-white' 
          : 'bg-purple-100 text-purple-700 hover:bg-purple-200';
      case 'Product Recommendations':
        return selectedCategory === category 
          ? 'bg-orange-500 text-white' 
          : 'bg-orange-100 text-orange-700 hover:bg-orange-200';
      default:
        return selectedCategory === category 
          ? 'bg-gray-500 text-white' 
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200';
    }
  };

  return (
    <div className="flex flex-wrap gap-2 mb-8">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onCategoryChange('')}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
          selectedCategory === '' 
            ? 'bg-purple-500 text-white' 
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
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
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${getCategoryColor(
            category
          )}`}
        >
          {category}
        </motion.button>
      ))}
    </div>
  );
};

export default CategoryFilter;