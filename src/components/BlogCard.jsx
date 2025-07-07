import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiClock, FiUser, FiTag } = FiIcons;

const BlogCard = ({ post, index }) => {
  const truncateContent = (content, maxLength = 150) => {
    if (content.length <= maxLength) return content;
    return content.substr(0, maxLength) + '...';
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Health':
        return 'bg-green-500';
      case 'Fam Bam':
        return 'bg-blue-500';
      case 'K-Drama':
        return 'bg-purple-500';
      case 'BTS':
        return 'bg-purple-500';
      case 'Product Recommendations':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden group"
    >
      <Link to={`/post/${post.id}`}>
        <div className="relative overflow-hidden">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-4 left-4">
            <span className={`${getCategoryColor(post.category)} text-white px-3 py-1 rounded-full text-sm font-medium`}>
              {post.category}
            </span>
          </div>
        </div>
      </Link>
      <div className="p-6">
        <div className="flex items-center text-sm text-gray-500 mb-3">
          <SafeIcon icon={FiUser} className="mr-1" />
          <span className="mr-4">{post.author}</span>
          <SafeIcon icon={FiClock} className="mr-1" />
          <span className="mr-4">{post.readTime}</span>
          <SafeIcon icon={FiTag} className="mr-1" />
          <span>{post.date}</span>
        </div>
        <Link to={`/post/${post.id}`}>
          <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">
            {post.title}
          </h3>
        </Link>
        <p className="text-gray-600 mb-4 leading-relaxed">
          {truncateContent(post.content)}
        </p>
        <Link
          to={`/post/${post.id}`}
          className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium transition-colors"
        >
          Read more
          <SafeIcon icon={FiIcons.FiArrowRight} className="ml-1" />
        </Link>
      </div>
    </motion.div>
  );
};

export default BlogCard;