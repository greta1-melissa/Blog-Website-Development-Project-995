import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useBlog } from '../contexts/BlogContext';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiArrowLeft, FiUser, FiClock, FiTag, FiCalendar } = FiIcons;

const BlogPost = () => {
  const { id } = useParams();
  const { getPost } = useBlog();
  const post = getPost(id);

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Post Not Found</h1>
        <p className="text-gray-600 mb-8">The blog post you're looking for doesn't exist.</p>
        <Link to="/" className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium">
          <SafeIcon icon={FiArrowLeft} className="mr-2" />
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
    >
      <Link to="/" className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium mb-8 transition-colors">
        <SafeIcon icon={FiArrowLeft} className="mr-2" />
        Back to Home
      </Link>

      <div className="mb-8">
        <img
          src={post.image}
          alt={post.title}
          className="w-full h-64 md:h-96 object-cover rounded-xl shadow-lg"
        />
      </div>

      <div className="mb-8">
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <SafeIcon icon={FiUser} className="mr-1" />
          <span className="mr-4">{post.author}</span>
          <SafeIcon icon={FiCalendar} className="mr-1" />
          <span className="mr-4">{post.date}</span>
          <SafeIcon icon={FiClock} className="mr-1" />
          <span className="mr-4">{post.readTime}</span>
          <SafeIcon icon={FiTag} className="mr-1" />
          <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
            {post.category}
          </span>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
          {post.title}
        </h1>
      </div>

      <div className="prose prose-lg max-w-none">
        {post.content.split('\n').map((paragraph, index) => (
          <p key={index} className="mb-6 text-gray-700 leading-relaxed">
            {paragraph}
          </p>
        ))}
      </div>

      <div className="mt-12 pt-8 border-t border-gray-200">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mr-4">
            <SafeIcon icon={FiUser} className="text-white text-lg" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{post.author}</h3>
            <p className="text-gray-600">Content Creator & Writer</p>
          </div>
        </div>
      </div>
    </motion.article>
  );
};

export default BlogPost;