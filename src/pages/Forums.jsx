import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForum } from '../contexts/ForumContext';
import { useAuth } from '../contexts/AuthContext';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiMessageCircle, FiUsers, FiEye, FiClock, FiPin, FiLock, FiPlus, FiArrowRight, FiTrendingUp, FiActivity } = FiIcons;

const Forums = () => {
  const { categories, threads } = useForum();
  const { isAuthenticated } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredThreads = selectedCategory === 'all' 
    ? threads 
    : threads.filter(thread => thread.categoryId === parseInt(selectedCategory));

  const getRecentThreads = () => {
    return threads
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 5);
  };

  const getPopularThreads = () => {
    return threads
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);
  };

  const getCategoryById = (categoryId) => {
    return categories.find(cat => cat.id === categoryId);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const getTotalThreads = () => threads.length;
  const getTotalReplies = () => threads.reduce((sum, thread) => sum + thread.replies, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Community <span className="text-purple-600">Forums</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
          A welcoming space for guests and friends to share experiences, discuss K-dramas, and connect with other moms!
        </p>

        {/* Stats */}
        <div className="flex justify-center space-x-8 mb-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{getTotalThreads()}</div>
            <div className="text-sm text-gray-600">Discussions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{getTotalReplies()}</div>
            <div className="text-sm text-gray-600">Replies</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{categories.length}</div>
            <div className="text-sm text-gray-600">Categories</div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Categories Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Forum Categories</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.map((category) => {
                const categoryThreads = threads.filter(t => t.categoryId === category.id);
                const totalReplies = categoryThreads.reduce((sum, thread) => sum + thread.replies, 0);
                const latestThread = categoryThreads.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0];

                return (
                  <motion.div
                    key={category.id}
                    whileHover={{ scale: 1.02 }}
                    className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100"
                  >
                    <Link to={`/forums/category/${category.id}`}>
                      <div className="flex items-start space-x-4">
                        <div className={`w-12 h-12 ${category.color} rounded-xl flex items-center justify-center text-white text-xl flex-shrink-0`}>
                          {category.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-purple-600 transition-colors">
                            {category.name}
                          </h3>
                          <p className="text-gray-600 text-sm mb-3">{category.description}</p>
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <div className="flex items-center space-x-4">
                              <span className="flex items-center">
                                <SafeIcon icon={FiMessageCircle} className="mr-1" />
                                {categoryThreads.length} threads
                              </span>
                              <span className="flex items-center">
                                <SafeIcon icon={FiUsers} className="mr-1" />
                                {totalReplies} replies
                              </span>
                            </div>
                            {latestThread && (
                              <span className="text-xs">
                                {formatDate(latestThread.updatedAt)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Recent Discussions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Recent Discussions</h2>
              {isAuthenticated && (
                <Link 
                  to="/forums/new-thread"
                  className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <SafeIcon icon={FiPlus} className="mr-2" />
                  New Thread
                </Link>
              )}
            </div>
            
            <div className="space-y-4">
              {getRecentThreads().map((thread) => {
                const category = getCategoryById(thread.categoryId);
                return (
                  <motion.div
                    key={thread.id}
                    whileHover={{ scale: 1.01 }}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <Link to={`/forums/thread/${thread.id}`}>
                      <div className="flex items-start space-x-4">
                        <div className={`w-8 h-8 ${category?.color} rounded-lg flex items-center justify-center text-white text-sm flex-shrink-0`}>
                          {category?.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
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
                          <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                            {thread.content}
                          </p>
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <div className="flex items-center space-x-4">
                              <span>by {thread.author}</span>
                              <span className="flex items-center">
                                <SafeIcon icon={FiMessageCircle} className="mr-1" />
                                {thread.replies}
                              </span>
                              <span className="flex items-center">
                                <SafeIcon icon={FiEye} className="mr-1" />
                                {thread.views}
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
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="space-y-6">
            {/* Popular Threads */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <div className="flex items-center mb-4">
                <SafeIcon icon={FiTrendingUp} className="text-purple-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Popular Threads</h3>
              </div>
              <div className="space-y-3">
                {getPopularThreads().map((thread) => (
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

            {/* Forum Guidelines */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="bg-purple-50 rounded-xl p-6"
            >
              <div className="flex items-center mb-4">
                <SafeIcon icon={FiActivity} className="text-purple-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Forum Guidelines</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Be respectful and kind to all members</li>
                <li>• Stay on topic within each category</li>
                <li>• No spam or self-promotion</li>
                <li>• Share experiences and support others</li>
                <li>• Report inappropriate content</li>
              </ul>
            </motion.div>

            {/* Join Community CTA */}
            {!isAuthenticated && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 1.0 }}
                className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white"
              >
                <h3 className="text-lg font-semibold mb-2">Join Our Community</h3>
                <p className="text-sm text-purple-100 mb-4">
                  Sign up to start discussions, reply to threads, and connect with amazing moms!
                </p>
                <Link 
                  to="/login"
                  className="inline-flex items-center px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-gray-100 transition-colors font-medium"
                >
                  Sign Up Now <SafeIcon icon={FiArrowRight} className="ml-2" />
                </Link>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Forums;