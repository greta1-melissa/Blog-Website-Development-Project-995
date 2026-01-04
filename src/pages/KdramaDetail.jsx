import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useForum } from '../contexts/ForumContext';
import { useKdrama } from '../contexts/KdramaContext';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import SafeImage from '../common/SafeImage';
import { KDRAMA_PLACEHOLDER } from '../config/assets';

const { FiArrowLeft, FiMessageCircle, FiClock, FiSend, FiThumbsUp } = FiIcons;

const KdramaDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { getThreadByTitle, createThread, createReply, getRepliesByThread, likeReply } = useForum();
  const { getKdramaBySlug, isLoading } = useKdrama();
  const [drama, setDrama] = useState(null);
  const [activeThread, setActiveThread] = useState(null);
  const [replies, setReplies] = useState([]);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      const found = getKdramaBySlug(id);
      setDrama(found);
    }
  }, [id, isLoading, getKdramaBySlug]);

  useEffect(() => {
    if (drama) {
      const existingThread = getThreadByTitle(drama.title);
      if (existingThread) {
        setActiveThread(existingThread);
        setReplies(getRepliesByThread(existingThread.id));
      }
    }
  }, [drama, getThreadByTitle, getRepliesByThread]);

  useEffect(() => {
    if (activeThread) {
      setReplies(getRepliesByThread(activeThread.id));
    }
  }, [activeThread, getRepliesByThread]);

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setIsSubmitting(true);
    try {
      let threadId = activeThread?.id;
      if (!threadId) {
        threadId = await createThread(2, { 
          title: drama.title, 
          content: `Discussion thread for ${drama.title}. ${drama.synopsis_short}` 
        });
        setActiveThread({ id: threadId, title: drama.title });
      }
      await createReply(threadId, replyContent);
      setReplyContent('');
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLikeReply = (replyId) => {
    if (isAuthenticated) likeReply(replyId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!drama) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Drama Not Found</h1>
        <Link to="/kdrama-recommendations" className="text-purple-600 hover:underline">Back to List</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="relative h-[400px] lg:h-[500px] overflow-hidden bg-purple-900">
        <div className="absolute inset-0">
          <SafeImage 
            src={drama.image_url || drama.image} 
            alt={drama.title} 
            fallback={KDRAMA_PLACEHOLDER}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent" />
        </div>
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 lg:p-20 text-white z-10">
          <div className="max-w-7xl mx-auto">
            <Link to="/kdrama-recommendations" className="inline-flex items-center text-purple-200 hover:text-white mb-6 transition-colors font-medium">
              <SafeIcon icon={FiArrowLeft} className="mr-2" /> Back to Recommendations
            </Link>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex flex-wrap gap-2 mb-4">
                {drama.tags && Array.isArray(drama.tags) && drama.tags.map((tag, idx) => (
                  <span key={idx} className="px-3 py-1 bg-purple-600/80 backdrop-blur-sm rounded-full text-xs font-bold uppercase tracking-wide border border-purple-400/30">
                    {tag}
                  </span>
                ))}
              </div>
              <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6 leading-tight">{drama.title}</h1>
              <p className="text-lg md:text-xl text-gray-200 max-w-3xl leading-relaxed">{drama.synopsis_long || drama.synopsis_short}</p>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative -mt-10 z-20">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-12 border border-purple-50">
          <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-full">
                <SafeIcon icon={FiMessageCircle} className="text-2xl text-purple-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Community Discussion</h2>
                <p className="text-sm text-gray-500">Join the conversation about {drama.title}</p>
              </div>
            </div>
          </div>

          <div className="space-y-8 mb-12">
            {replies.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <p className="text-gray-500">Be the first to share your thoughts!</p>
              </div>
            ) : (
              replies.map((reply) => (
                <div key={reply.id} className="flex gap-4">
                  <div className="flex-grow">
                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-gray-900">{reply.author || 'Anonymous'}</span>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{reply.content}</p>
                    </div>
                    <div className="flex items-center gap-4 mt-2 ml-2">
                      <button onClick={() => handleLikeReply(reply.id)} className="text-xs font-medium text-gray-500 hover:text-purple-600 flex items-center">
                        <SafeIcon icon={FiThumbsUp} className="mr-1" /> {reply.likes || 0} Likes
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {isAuthenticated ? (
            <form onSubmit={handleReplySubmit} className="relative">
              <textarea 
                value={replyContent} 
                onChange={(e) => setReplyContent(e.target.value)} 
                placeholder="Share your thoughts..." 
                className="w-full bg-white border border-gray-200 rounded-xl p-4 pr-12 focus:ring-2 focus:ring-purple-500 outline-none min-h-[120px]" 
                required 
              />
              <button type="submit" disabled={isSubmitting || !replyContent.trim()} className="absolute bottom-3 right-3 bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-all">
                {isSubmitting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <SafeIcon icon={FiSend} />}
              </button>
            </form>
          ) : (
            <div className="bg-purple-50 rounded-xl p-6 text-center">
              <Link to="/login" className="bg-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors inline-block">Sign In to Comment</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KdramaDetail;