import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiClock, FiUser, FiTag, FiArrowRight, FiHeart } = FiIcons;

const BlogCard = ({ post, index }) => {
  const truncateContent = (content, maxLength = 150) => {
    if (content.length <= maxLength) return content;
    return content.substr(0, maxLength) + '...';
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Health':
        return 'bg-gradient-to-r from-green-500 to-emerald-500';
      case 'Fam Bam':
        return 'bg-gradient-to-r from-blue-500 to-cyan-500';
      case 'K-Drama':
        return 'bg-gradient-to-r from-purple-500 to-pink-500';
      case 'BTS':
        return 'bg-gradient-to-r from-purple-600 to-indigo-600';
      case 'Product Recommendations':
        return 'bg-gradient-to-r from-orange-500 to-red-500';
      default:
        return 'bg-gradient-to-r from-gray-500 to-gray-600';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group border border-purple-100 hover:border-purple-200"
    >
      <Link to={`/post/${post.id}`}>
        <div className="relative overflow-hidden">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Category Badge */}
          <div className="absolute top-4 left-4">
            <span className={`${getCategoryColor(post.category)} text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg`}>
              {post.category}
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
        {/* Meta Information */}
        <div className="flex items-center text-sm text-gray-500 mb-3 space-x-4">
          <div className="flex items-center bg-purple-50 px-2 py-1 rounded-full">
            <SafeIcon icon={FiUser} className="mr-1 text-purple-600" />
            <span className="text-purple-800 font-medium">{post.author}</span>
          </div>
          <div className="flex items-center">
            <SafeIcon icon={FiClock} className="mr-1 text-purple-600" />
            <span>{post.readTime}</span>
          </div>
        </div>

        {/* Title */}
        <Link to={`/post/${post.id}`}>
          <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors line-clamp-2">
            {post.title}
          </h3>
        </Link>

        {/* Content Preview */}
        <p className="text-gray-600 mb-4 leading-relaxed line-clamp-3">
          {truncateContent(post.content)}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
            {post.date}
          </span>
          <Link
            to={`/post/${post.id}`}
            className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium transition-colors group"
          >
            <span>Read more</span>
            <SafeIcon icon={FiArrowRight} className="ml-1 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default BlogCard;