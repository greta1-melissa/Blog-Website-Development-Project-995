import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { ncbGet, ncbCreate, ncbUpdate } from '../services/nocodebackendClient';

const ForumContext = createContext();

export const useForum = () => {
  const context = useContext(ForumContext);
  if (!context) {
    throw new Error('useForum must be used within a ForumProvider');
  }
  return context;
};

// All colors updated to Purple shades
const defaultCategories = [
  { id: 1, name: 'Mom Life & Parenting', description: 'Share your parenting journey', color: 'bg-purple-500', icon: '👶' },
  { id: 2, name: 'K-Drama & Entertainment', description: 'Discuss your favorite K-dramas', color: 'bg-purple-600', icon: '📺' },
  { id: 3, name: 'BTS & K-Pop', description: 'ARMY unite!', color: 'bg-purple-700', icon: '🎵' },
  { id: 4, name: 'Health & Wellness', description: 'Wellness tips', color: 'bg-purple-400', icon: '🧘‍♀️' },
  { id: 5, name: 'Product Reviews', description: 'Amazing products', color: 'bg-purple-500', icon: '🛍️' },
  { id: 6, name: 'General Chat', description: 'Random thoughts', color: 'bg-purple-300', icon: '💬' }
];

export const ForumProvider = ({ children }) => {
  const { user } = useAuth();
  const [categories, setCategories] = useState(defaultCategories);
  const [threads, setThreads] = useState([]);
  const [replies, setReplies] = useState([]);

  const fetchData = async () => {
    try {
      const [fetchedThreads, fetchedReplies] = await Promise.all([
        ncbGet('threads'),
        ncbGet('replies')
      ]);
      if (Array.isArray(fetchedThreads)) setThreads(fetchedThreads);
      if (Array.isArray(fetchedReplies)) setReplies(fetchedReplies);
    } catch (error) {
      console.error("Error fetching forum data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const createThread = async (categoryId, threadData) => {
    const newThread = {
      categoryId: parseInt(categoryId),
      title: threadData.title,
      content: threadData.content,
      author: user?.name || 'Anonymous',
      authorId: user?.id || 'anonymous',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      replies: 0,
      views: 0,
      isPinned: false,
      isLocked: false
    };

    const tempId = Date.now();
    setThreads(prev => [{...newThread, id: tempId}, ...prev]);

    try {
      const savedThread = await ncbCreate('threads', newThread);
      if (savedThread) {
        setThreads(prev => prev.map(t => t.id === tempId ? {...t, id: savedThread.id} : t));
        return savedThread.id;
      }
      return tempId;
    } catch (e) {
      console.error("Save failed", e);
      return tempId;
    }
  };

  const createReply = async (threadId, content) => {
    const newReply = {
      threadId: parseInt(threadId),
      content,
      author: user?.name || 'Anonymous',
      authorId: user?.id || 'anonymous',
      createdAt: new Date().toISOString(),
      isHelpful: false,
      likes: 0
    };

    setReplies(prev => [...prev, { ...newReply, id: Date.now() }]);
    setThreads(prev => prev.map(thread => 
      String(thread.id) === String(threadId) 
        ? { ...thread, replies: (thread.replies || 0) + 1, updatedAt: new Date().toISOString() } 
        : thread
    ));

    try {
      await ncbCreate('replies', newReply);
      const thread = threads.find(t => String(t.id) === String(threadId));
      if (thread) {
        await ncbUpdate('threads', threadId, { replies: (thread.replies || 0) + 1 });
      }
    } catch (e) {
      console.error("Reply save failed", e);
    }
  };

  const getThreadsByCategory = (categoryId) => {
    return threads.filter(thread => String(thread.categoryId) === String(categoryId));
  };

  const getThread = (threadId) => {
    return threads.find(thread => String(thread.id) === String(threadId));
  };

  const getRepliesByThread = (threadId) => {
    return replies.filter(reply => String(reply.threadId) === String(threadId));
  };

  const incrementViews = (threadId) => {
    setThreads(prev => prev.map(thread => 
      String(thread.id) === String(threadId)
        ? { ...thread, views: (thread.views || 0) + 1 }
        : thread
    ));
  };

  const likeReply = (replyId) => {
    setReplies(prev => prev.map(reply => 
      String(reply.id) === String(replyId)
        ? { ...reply, likes: (reply.likes || 0) + 1 }
        : reply
    ));
  };

  const value = {
    categories,
    threads,
    replies,
    createThread,
    createReply,
    getThreadsByCategory,
    getThread,
    getRepliesByThread,
    incrementViews,
    likeReply
  };

  return (
    <ForumContext.Provider value={value}>
      {children}
    </ForumContext.Provider>
  );
};