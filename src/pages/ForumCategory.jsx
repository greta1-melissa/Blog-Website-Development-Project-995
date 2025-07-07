import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForum } from '../contexts/ForumContext';
import { useAuth } from '../contexts/AuthContext';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { 
  FiArrowLeft, 
  FiMessageCircle, 
  FiEye, 
  FiClock, 
  FiPin, 
  FiLock, 
  FiPlus,
  FiFilter,
  FiTrendingUp,
  FiActivity
} = FiIcons;

const ForumCategory = () => {
  const { categoryId } = useParams();
  const { categories, getThreadsByCategory } = useForum();
  const { isAuthenticated } = useAuth();
  const [sortBy, setSortBy] = useState('recent');

  const category = categories.find(cat => cat.id === parseInt(categoryId));
  const threads = getThreadsByCategory(categoryId);

  const sortedThreads = [...threads].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.updatedAt) - new Date(a.updatedAt);
      case 'popular':
        return b.views - a.views;
      case 'replies':
        return b.replies - a.replies;
      default:
        return new Date(b.updatedAt) - new Date(a.updatedAt);
    }
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  if (!category) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Category Not Found</h1>
        <p className="text-gray-600 mb-8">The forum category you're looking for doesn't exist.</p>
        <Link
          to="/forums"
          className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium"
        >
          <SafeIcon icon={FiArrowLeft} className="mr-2" />
          Back to Forums
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <Link
          to="/forums"
          className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium mb-4"
        >
          <SafeIcon icon={FiArrowLeft} className="mr-2" />
          Back to Forums
        </Link>
        
        <div className="flex items-center space-x-4 mb-4">
          <div className={`w-16 h-16 ${category.color} rounded-xl flex items-center justify-center text-white text-2xl`}>
            {category.icon}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{category.name}</h1>
            <p className="text-gray-600">{category.description}</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6 text-sm text-gray-600">
            <span className="flex items-center">
              <SafeIcon icon={FiMessageCircle} className="mr-1" />
              {threads.length} threads
            </span>
            <span className="flex items-center">
              <SafeIcon icon={FiActivity} className="mr-1" />
              {threads.reduce((sum, thread) => sum + thread.replies, 0)} replies
            </span>
          </div>
          
          {isAuthenticated && (
            <Link
              to={`/forums/new-thread?category=${categoryId}`}
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <SafeIcon icon={FiPlus} className="mr-2" />
              New Thread
            </Link>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Sort Options */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm p-4 mb-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <SafeIcon icon={FiFilter} className="text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-sm border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="recent">Most Recent</option>
                  <option value="popular">Most Popular</option>
                  <option value="replies">Most Replies</option>
                </select>
              </div>
              <span className="text-sm text-gray-500">
                {sortedThreads.length} threads
              </span>
            </div>
          </motion.div>

          {/* Threads List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white rounded-xl shadow-sm overflow-hidden"
          >
            {sortedThreads.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">💬</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No threads yet</h3>
                <p className="text-gray-600 mb-4">Be the first to start a discussion in this category!</p>
                {isAuthenticated && (
                  <Link
                    to={`/forums/new-thread?category=${categoryId}`}
                    className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <SafeIcon icon={FiPlus} className="mr-2" />
                    Start First Thread
                  </Link>
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {sortedThreads.map((thread, index) => (
                  <motion.div
                    key={thread.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="p-6 hover:bg-gray-50 transition-colors"
                  >
                    <Link to={`/forums/thread/${thread.id}`}>
                      <div className="flex items-start space-x-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            {thread.isPinned && (
                              <SafeIcon icon={FiPin} className="text-yellow-500" />
                            )}
                            {thread.isLocked && (
                              <SafeIcon icon={FiLock} className="text-gray-500" />
                            )}
                            <h3 className="text-lg font-semibold text-gray-900 hover:text-purple-600 transition-colors">
                              {thread.title}
                            </h3>
                          </div>
                          <p className="text-gray-600 mb-3 line-clamp-2">
                            {thread.content}
                          </p>
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <div className="flex items-center space-x-4">
                              <span>by {thread.author}</span>
                              <span className="flex items-center">
                                <SafeIcon icon={FiMessageCircle} className="mr-1" />
                                {thread.replies} replies
                              </span>
                              <span className="flex items-center">
                                <SafeIcon icon={FiEye} className="mr-1" />
                                {thread.views} views
                              </span>
                            </div>
                            <span className="flex items-center">
                              <SafeIcon icon={FiClock} className="mr-1" />
                              {formatDate(thread.updatedAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="space-y-6">
            {/* Category Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Threads</span>
                  <span className="font-semibold">{threads.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Replies</span>
                  <span className="font-semibold">{threads.reduce((sum, thread) => sum + thread.replies, 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Views</span>
                  <span className="font-semibold">{threads.reduce((sum, thread) => sum + thread.views, 0)}</span>
                </div>
              </div>
            </motion.div>

            {/* Popular in Category */}
            {threads.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="bg-white rounded-xl shadow-sm p-6"
              >
                <div className="flex items-center mb-4">
                  <SafeIcon icon={FiTrendingUp} className="text-purple-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Popular in Category</h3>
                </div>
                <div className="space-y-3">
                  {threads
                    .sort((a, b) => b.views - a.views)
                    .slice(0, 3)
                    .map((thread) => (
                      <Link
                        key={thread.id}
                        to={`/forums/thread/${thread.id}`}
                        className="block p-3 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <h4 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">
                          {thread.title}
                        </h4>
                        <div className="flex items-center text-xs text-gray-500">
                          <span className="flex items-center mr-3">
                            <SafeIcon icon={FiEye} className="mr-1" />
                            {thread.views}
                          </span>
                          <span className="flex items-center">
                            <SafeIcon icon={FiMessageCircle} className="mr-1" />
                            {thread.replies}
                          </span>
                        </div>
                      </Link>
                    ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForumCategory;