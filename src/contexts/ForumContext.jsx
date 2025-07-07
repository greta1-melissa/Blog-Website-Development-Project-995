import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const ForumContext = createContext();

export const useForum = () => {
  const context = useContext(ForumContext);
  if (!context) {
    throw new Error('useForum must be used within a ForumProvider');
  }
  return context;
};

const initialForumData = {
  categories: [
    {
      id: 1,
      name: 'Mom Life & Parenting',
      description: 'Share your parenting journey, tips, and experiences',
      color: 'bg-blue-500',
      icon: '👶',
      threads: []
    },
    {
      id: 2,
      name: 'K-Drama & Entertainment',
      description: 'Discuss your favorite K-dramas, reviews, and recommendations',
      color: 'bg-purple-500',
      icon: '📺',
      threads: []
    },
    {
      id: 3,
      name: 'BTS & K-Pop',
      description: 'ARMY unite! Share your love for BTS and K-pop',
      color: 'bg-pink-500',
      icon: '🎵',
      threads: []
    },
    {
      id: 4,
      name: 'Health & Wellness',
      description: 'Wellness tips, mental health, and self-care for busy moms',
      color: 'bg-green-500',
      icon: '🧘‍♀️',
      threads: []
    },
    {
      id: 5,
      name: 'Product Reviews',
      description: 'Share and discover amazing products for moms and families',
      color: 'bg-orange-500',
      icon: '🛍️',
      threads: []
    },
    {
      id: 6,
      name: 'General Chat',
      description: 'Random thoughts, daily life, and casual conversations',
      color: 'bg-gray-500',
      icon: '💬',
      threads: []
    }
  ],
  threads: [
    {
      id: 1,
      categoryId: 1,
      title: 'How do you handle toddler tantrums?',
      content: 'My 2-year-old has been having major meltdowns lately. Any tips from experienced moms?',
      author: 'Sarah_Mom',
      authorId: 'user1',
      createdAt: '2024-01-20T10:30:00Z',
      updatedAt: '2024-01-20T10:30:00Z',
      replies: 12,
      views: 45,
      isPinned: false,
      isLocked: false
    },
    {
      id: 2,
      categoryId: 2,
      title: 'Queen of Tears - Episode 12 Discussion',
      content: 'Just finished watching episode 12 and I\'m SOBBING! Anyone else emotionally destroyed by this show?',
      author: 'KDramaAddict',
      authorId: 'user2',
      createdAt: '2024-01-19T20:15:00Z',
      updatedAt: '2024-01-19T20:15:00Z',
      replies: 8,
      views: 67,
      isPinned: true,
      isLocked: false
    },
    {
      id: 3,
      categoryId: 3,
      title: 'BTS Comeback Theories - What do you think?',
      content: 'With all the hints they\'ve been dropping, what are your theories about their next album?',
      author: 'PurpleMom',
      authorId: 'user3',
      createdAt: '2024-01-18T14:22:00Z',
      updatedAt: '2024-01-18T14:22:00Z',
      replies: 23,
      views: 89,
      isPinned: false,
      isLocked: false
    }
  ],
  replies: [
    {
      id: 1,
      threadId: 1,
      content: 'I found that staying calm and acknowledging their feelings helps. Try saying "I see you\'re upset" instead of "stop crying".',
      author: 'ExperiencedMom',
      authorId: 'user4',
      createdAt: '2024-01-20T11:45:00Z',
      isHelpful: true,
      likes: 5
    },
    {
      id: 2,
      threadId: 1,
      content: 'Distraction works for us! I keep a special toy that only comes out during meltdowns.',
      author: 'MomOfTwo',
      authorId: 'user5',
      createdAt: '2024-01-20T12:30:00Z',
      isHelpful: false,
      likes: 3
    },
    {
      id: 3,
      threadId: 2,
      content: 'YES! I cried so hard my kids asked if I was okay 😭 This show is pure emotional torture',
      author: 'CryingMom',
      authorId: 'user6',
      createdAt: '2024-01-19T21:00:00Z',
      isHelpful: false,
      likes: 7
    }
  ]
};

export const ForumProvider = ({ children }) => {
  const { user } = useAuth();
  const [forumData, setForumData] = useState(() => {
    const saved = localStorage.getItem('forumData');
    return saved ? JSON.parse(saved) : initialForumData;
  });

  useEffect(() => {
    localStorage.setItem('forumData', JSON.stringify(forumData));
  }, [forumData]);

  const createThread = (categoryId, threadData) => {
    const newThread = {
      id: Date.now(),
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

    setForumData(prev => ({
      ...prev,
      threads: [newThread, ...prev.threads]
    }));

    return newThread.id;
  };

  const createReply = (threadId, content) => {
    const newReply = {
      id: Date.now(),
      threadId: parseInt(threadId),
      content,
      author: user?.name || 'Anonymous',
      authorId: user?.id || 'anonymous',
      createdAt: new Date().toISOString(),
      isHelpful: false,
      likes: 0
    };

    setForumData(prev => ({
      ...prev,
      replies: [...prev.replies, newReply],
      threads: prev.threads.map(thread => 
        thread.id === parseInt(threadId) 
          ? { ...thread, replies: thread.replies + 1, updatedAt: new Date().toISOString() }
          : thread
      )
    }));
  };

  const getThreadsByCategory = (categoryId) => {
    return forumData.threads.filter(thread => thread.categoryId === parseInt(categoryId));
  };

  const getThread = (threadId) => {
    return forumData.threads.find(thread => thread.id === parseInt(threadId));
  };

  const getRepliesByThread = (threadId) => {
    return forumData.replies.filter(reply => reply.threadId === parseInt(threadId));
  };

  const incrementViews = (threadId) => {
    setForumData(prev => ({
      ...prev,
      threads: prev.threads.map(thread => 
        thread.id === parseInt(threadId) 
          ? { ...thread, views: thread.views + 1 }
          : thread
      )
    }));
  };

  const likeReply = (replyId) => {
    setForumData(prev => ({
      ...prev,
      replies: prev.replies.map(reply => 
        reply.id === parseInt(replyId) 
          ? { ...reply, likes: reply.likes + 1 }
          : reply
      )
    }));
  };

  const value = {
    categories: forumData.categories,
    threads: forumData.threads,
    replies: forumData.replies,
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