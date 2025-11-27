import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiClock, FiUser, FiArrowRight } = FiIcons;

const BlogCard = ({ post, index }) => {
  const getCategoryColor = (category) => {
    // All shades of purple
    switch (category) {
      case 'Health': return 'bg-purple-100 text-purple-800';
      case 'Fam Bam': return 'bg-purple-200 text-purple-900';
      case 'K-Drama': return 'bg-indigo-100 text-indigo-800'; // Mapped to purple
      case 'BTS': return 'bg-purple-300 text-purple-900';
      default: return 'bg-purple-100 text-purple-800';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group flex flex-col h-full bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-purple-100 hover:border-purple-300"
    >
      <Link to={`/post/${post.id}`} className="relative overflow-hidden aspect-[4/3]">
        <img
          src={post.image}
          alt={post.title}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-in-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-purple-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase backdrop-blur-md ${getCategoryColor(post.category)}`}>
            {post.category}
          </span>
        </div>
      </Link>
      <div className="flex-1 p-6 flex flex-col">
        <div className="flex items-center text-xs text-gray-500 mb-4 space-x-3 font-medium">
          <span className="flex items-center text-purple-600 bg-purple-50 px-2 py-1 rounded-md">
            <SafeIcon icon={FiUser} className="mr-1" /> {post.author}
          </span>
          <span className="w-1 h-1 bg-purple-200 rounded-full"></span>
          <span className="flex items-center">
            <SafeIcon icon={FiClock} className="mr-1 text-purple-400" /> {post.readTime}
          </span>
        </div>
        <Link to={`/post/${post.id}`} className="block mb-3">
          <h3 className="text-xl font-serif font-bold text-gray-900 group-hover:text-purple-600 transition-colors leading-tight">
            {post.title}
          </h3>
        </Link>
        <p className="text-gray-600 text-sm leading-relaxed mb-6 line-clamp-3 flex-1">
          {post.content.substring(0, 120)}...
        </p>
        <div className="pt-4 border-t border-purple-50 flex items-center justify-between mt-auto">
          <span className="text-xs text-gray-400 font-medium">{post.date}</span>
          <Link
            to={`/post/${post.id}`}
            className="inline-flex items-center text-sm font-semibold text-purple-600 group-hover:translate-x-1 transition-transform duration-300"
          >
            Read Article <SafeIcon icon={FiArrowRight} className="ml-1" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default BlogCard;