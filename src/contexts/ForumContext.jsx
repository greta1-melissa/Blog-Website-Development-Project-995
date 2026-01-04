import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { ncbCreate, ncbUpdate } from '../services/nocodebackendClient';

const ForumContext = createContext();

export const useForum = () => {
  const context = useContext(ForumContext);
  if (!context) {
    throw new Error('useForum must be used within a ForumProvider');
  }
  return context;
};

const defaultCategories = [
  { id: 1, name: 'Mom Life & Parenting', description: 'Share your parenting journey', color: 'bg-purple-500', icon: '👶' },
  { id: 2, name: 'K-Drama & Entertainment', description: 'Discuss your favorite K-dramas', color: 'bg-purple-600', icon: '📺' },
  { id: 3, name: 'BTS & K-Pop', description: 'ARMY unite!', color: 'bg-purple-700', icon: '🎵' },
  { id: 4, name: 'Health & Wellness', description: 'Wellness tips', color: 'bg-purple-400', icon: '🧘‍♀️' },
  { id: 5, name: 'Product Reviews', description: 'Amazing products', color: 'bg-purple-500', icon: '🛍️' },
  { id: 6, name: 'General Chat', description: 'Random thoughts', color: 'bg-purple-300', icon: '💬' }
];

const getLocalData = (key) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

export const ForumProvider = ({ children }) => {
  const { user } = useAuth();
  const [categories] = useState(defaultCategories);
  const [threads, setThreads] = useState(() => getLocalData('forum_threads'));
  const [replies, setReplies] = useState(() => getLocalData('forum_replies'));

  useEffect(() => {
    if (threads.length > 0) localStorage.setItem('forum_threads', JSON.stringify(threads));
  }, [threads]);

  useEffect(() => {
    if (replies.length > 0) localStorage.setItem('forum_replies', JSON.stringify(replies));
  }, [replies]);

  const fetchData = async () => {
    try {
      // Standardized NCB Read Pattern: threads
      const threadsRes = await fetch('/api/ncb/read/threads');
      if (threadsRes.ok) {
        const threadsJson = await threadsRes.json();
        if (Array.isArray(threadsJson.data)) {
          const serverThreads = threadsJson.data;
          const localThreads = getLocalData('forum_threads');
          const serverIds = new Set(serverThreads.map(t => String(t.id)));
          const localOnly = localThreads.filter(t => !serverIds.has(String(t.id)));
          const merged = [...localOnly, ...serverThreads];
          merged.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
          setThreads(merged);
        }
      }

      // Standardized NCB Read Pattern: replies
      const repliesRes = await fetch('/api/ncb/read/replies');
      if (repliesRes.ok) {
        const repliesJson = await repliesRes.json();
        if (Array.isArray(repliesJson.data)) {
          const serverReplies = repliesJson.data;
          const localReplies = getLocalData('forum_replies');
          const serverIds = new Set(serverReplies.map(r => String(r.id)));
          const localOnly = localReplies.filter(r => !serverIds.has(String(r.id)));
          setReplies([...localOnly, ...serverReplies]);
        }
      }
    } catch (error) {
      // PRESERVE STATE: Do not wipe threads/replies on transient error
      console.error("ForumContext fetch failed", error);
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
    setThreads(prev => [{ ...newThread, id: tempId }, ...prev]);

    try {
      const savedThread = await ncbCreate('threads', newThread);
      if (savedThread) {
        setThreads(prev => prev.map(t => t.id === tempId ? { ...t, id: savedThread.id } : t));
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

  const getThreadsByCategory = (categoryId) => threads.filter(thread => String(thread.categoryId) === String(categoryId));
  const getThread = (threadId) => threads.find(thread => String(thread.id) === String(threadId));
  const getThreadByTitle = (title) => {
    if (!title) return null;
    return threads.find(t => t.title.toLowerCase().trim() === title.toLowerCase().trim());
  };
  const getRepliesByThread = (threadId) => replies.filter(reply => String(reply.threadId) === String(threadId));
  
  const incrementViews = (threadId) => {
    setThreads(prev => prev.map(thread => 
      String(thread.id) === String(threadId) ? { ...thread, views: (thread.views || 0) + 1 } : thread
    ));
    const thread = threads.find(t => String(t.id) === String(threadId));
    if (thread) {
      ncbUpdate('threads', threadId, { views: (thread.views || 0) + 1 }).catch(e => console.error(e));
    }
  };

  const likeReply = async (replyId) => {
    const reply = replies.find(r => String(r.id) === String(replyId));
    const newLikes = (reply?.likes || 0) + 1;
    setReplies(prev => prev.map(r => String(r.id) === String(replyId) ? { ...r, likes: newLikes } : r));
    try {
      await ncbUpdate('replies', replyId, { likes: newLikes });
    } catch (e) {
      console.error("Like save failed", e);
    }
  };

  return (
    <ForumContext.Provider value={{ 
      categories, threads, replies, createThread, createReply, 
      getThreadsByCategory, getThread, getThreadByTitle, getRepliesByThread, 
      incrementViews, likeReply 
    }}>
      {children}
    </ForumContext.Provider>
  );
};