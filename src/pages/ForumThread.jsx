import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForum } from '../contexts/ForumContext';
import { useAuth } from '../contexts/AuthContext';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiArrowLeft, FiMessageCircle, FiEye, FiClock, FiPin, FiLock, FiHeart, FiSend, FiUser, FiThumbsUp } = FiIcons;

const ForumThread = () => {
  const { threadId } = useParams();
  const { categories, getThread, getRepliesByThread, createReply, incrementViews, likeReply } = useForum();
  const { isAuthenticated, user } = useAuth();
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const thread = getThread(threadId);
  const replies = getRepliesByThread(threadId);
  const category = thread ? categories.find(cat => cat.id === thread.categoryId) : null;

  useEffect(() => {
    if (thread) {
      incrementViews(threadId);
    }
  }, [thread, threadId, incrementViews]);

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyContent.trim() || !isAuthenticated) return;

    setIsSubmitting(true);
    try {
      createReply(threadId, replyContent);
      setReplyContent('');
    } catch (error) {
      console.error('Error creating reply:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLikeReply = (replyId) => {
    if (isAuthenticated) {
      likeReply(replyId);
    }
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

  if (!thread) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Thread Not Found</h1>
        <p className="text-gray-600 mb-8">The discussion thread you're looking for doesn't exist.</p>
        <Link 
          to="/forums" 
          className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium"
        >
          <SafeIcon icon={FiArrowLeft} className="mr-2" /> Back to Forums
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
          <Link to="/forums" className="hover:text-purple-600">Forums</Link>
          <span>/</span>
          <Link to={`/forums/category/${category?.id}`} className="hover:text-purple-600">
            {category?.name}
          </Link>
          <span>/</span>
          <span className="text-gray-900">{thread.title}</span>
        </div>
      </motion.div>

      {/* Thread Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-white rounded-xl shadow-sm p-6 mb-6"
      >
        <div className="flex items-center space-x-2 mb-4">
          {thread.isPinned && (
            <SafeIcon icon={FiPin} className="text-yellow-500" />
          )}
          {thread.isLocked && (
            <SafeIcon icon={FiLock} className="text-gray-500" />
          )}
          <div className={`w-8 h-8 ${category?.color} rounded-lg flex items-center justify-center text-white text-sm`}>
            {category?.icon}
          </div>
          <span className="text-sm text-gray-600">{category?.name}</span>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{thread.title}</h1>
        
        <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <SafeIcon icon={FiUser} className="mr-1" /> {thread.author}
            </span>
            <span className="flex items-center">
              <SafeIcon icon={FiClock} className="mr-1" /> {formatDate(thread.createdAt)}
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <SafeIcon icon={FiMessageCircle} className="mr-1" /> {thread.replies} replies
            </span>
            <span className="flex items-center">
              <SafeIcon icon={FiEye} className="mr-1" /> {thread.views} views
            </span>
          </div>
        </div>

        <div className="prose max-w-none">
          {thread.content.split('\n').map((paragraph, index) => (
            <p key={index} className="mb-4 text-gray-700 leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>
      </motion.div>

      {/* Replies */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="space-y-6"
      >
        {replies.map((reply, index) => (
          <motion.div 
            key={reply.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <SafeIcon icon={FiUser} className="text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-gray-900">{reply.author}</span>
                    {reply.isHelpful && (
                      // Changed from Green to Fuchsia
                      <span className="bg-fuchsia-100 text-fuchsia-800 text-xs px-2 py-1 rounded-full">
                        Helpful
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">{formatDate(reply.createdAt)}</span>
                </div>
                
                <div className="prose max-w-none mb-4">
                  {reply.content.split('\n').map((paragraph, pIndex) => (
                    <p key={pIndex} className="mb-2 text-gray-700 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>

                <div className="flex items-center space-x-4">
                  <button 
                    onClick={() => handleLikeReply(reply.id)}
                    className="flex items-center space-x-1 text-sm text-gray-500 hover:text-purple-600 transition-colors"
                    disabled={!isAuthenticated}
                  >
                    <SafeIcon icon={FiThumbsUp} className="w-4 h-4" />
                    <span>{reply.likes}</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Reply Form */}
      {isAuthenticated && !thread.isLocked ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bg-white rounded-xl shadow-sm p-6 mt-8"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Reply to Thread</h3>
          <form onSubmit={handleReplySubmit}>
            <div className="mb-4">
              <textarea 
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Share your thoughts..."
                rows="4"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-vertical"
                required
              />
            </div>
            <div className="flex justify-end">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmitting || !replyContent.trim()}
                className="inline-flex items-center px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Posting...
                  </>
                ) : (
                  <>
                    <SafeIcon icon={FiSend} className="mr-2" /> Post Reply
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      ) : thread.isLocked ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bg-gray-50 rounded-xl p-6 mt-8 text-center"
        >
          <SafeIcon icon={FiLock} className="text-gray-400 text-2xl mb-2" />
          <p className="text-gray-600">This thread is locked and no longer accepting replies.</p>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bg-purple-50 rounded-xl p-6 mt-8 text-center"
        >
          <SafeIcon icon={FiHeart} className="text-purple-600 text-2xl mb-2" />
          <p className="text-gray-700 mb-4">Join our community to participate in discussions!</p>
          <Link 
            to="/login"
            className="inline-flex items-center px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
          >
            Sign In to Reply
          </Link>
        </motion.div>
      )}
    </div>
  );
};

export default ForumThread;