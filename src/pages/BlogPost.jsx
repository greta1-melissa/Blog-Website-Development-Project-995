import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useBlog } from '../contexts/BlogContext';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiArrowLeft, FiUser, FiClock, FiTag, FiCalendar, FiHeart, FiShare2 } = FiIcons;

const BlogPost = () => {
  const { id } = useParams();
  const { getPost } = useBlog();
  const post = getPost(id);

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <div className="bg-purple-50 rounded-xl p-8">
          <SafeIcon icon={FiHeart} className="text-purple-400 text-6xl mb-4 mx-auto" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Post Not Found</h1>
          <p className="text-gray-600 mb-8">The blog post you're looking for doesn't exist.</p>
          <Link 
            to="/" 
            className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            <SafeIcon icon={FiArrowLeft} className="mr-2" /> Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const getCategoryStyle = (category) => {
    // All purple gradients
    return 'bg-gradient-to-r from-purple-500 to-purple-700 text-white';
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.content.substring(0, 100) + '...',
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50">
      <motion.article 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
      >
        <Link 
          to="/" 
          className="inline-flex items-center px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-purple-50 border border-purple-200 transition-colors mb-8 shadow-sm"
        >
          <SafeIcon icon={FiArrowLeft} className="mr-2" /> Back to Home
        </Link>

        <div className="relative mb-8 rounded-2xl overflow-hidden shadow-2xl border border-purple-100">
          <img src={post.image} alt={post.title} className="w-full h-64 md:h-96 object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-purple-900/60 via-purple-900/20 to-transparent" />
          
          <div className="absolute top-6 left-6">
            <span className={`px-4 py-2 rounded-full text-sm font-medium shadow-lg ${getCategoryStyle(post.category)}`}>
              <SafeIcon icon={FiTag} className="inline mr-1" /> {post.category}
            </span>
          </div>

          <button 
            onClick={handleShare}
            className="absolute top-6 right-6 p-3 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
          >
            <SafeIcon icon={FiShare2} className="text-lg" />
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-purple-100">
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
            <div className="flex items-center bg-purple-50 px-3 py-1 rounded-full">
              <SafeIcon icon={FiUser} className="mr-1 text-purple-600" />
              <span className="font-medium text-purple-800">{post.author}</span>
            </div>
            <div className="flex items-center bg-purple-50 px-3 py-1 rounded-full">
              <SafeIcon icon={FiCalendar} className="mr-1 text-purple-600" />
              <span className="text-purple-800">{post.date}</span>
            </div>
            <div className="flex items-center bg-purple-50 px-3 py-1 rounded-full">
              <SafeIcon icon={FiClock} className="mr-1 text-purple-600" />
              <span className="text-purple-800">{post.readTime}</span>
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            <span className="bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent">
              {post.title}
            </span>
          </h1>

          <div className="w-full bg-purple-100 rounded-full h-2 mb-6">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full w-0 transition-all duration-300" id="reading-progress"></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-purple-100">
          <div className="prose prose-lg max-w-none prose-headings:text-purple-900 prose-a:text-purple-600">
            {post.content.split('\n').map((paragraph, index) => (
              <motion.p 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="mb-6 text-gray-700 leading-relaxed text-lg"
                style={{ 
                  textIndent: index === 0 ? '2rem' : '0',
                  fontSize: index === 0 ? '1.25rem' : '1.125rem',
                  fontWeight: index === 0 ? '500' : '400'
                }}
              >
                {paragraph}
              </motion.p>
            ))}
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-gradient-to-r from-purple-600 to-purple-500 rounded-2xl p-8 text-white shadow-lg"
        >
          <div className="flex items-center mb-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mr-6">
              <SafeIcon icon={FiUser} className="text-white text-2xl" />
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-1">{post.author}</h3>
              <p className="text-purple-100">Content Creator & Mom</p>
            </div>
          </div>
          <p className="text-purple-100 leading-relaxed">
            Hi! I'm Melissa, a mom who loves sharing authentic stories about family life, wellness, and my passion for K-culture. Thank you for reading and being part of this amazing community! 💜
          </p>
          <div className="flex items-center mt-6 space-x-4">
            <button className="flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors">
              <SafeIcon icon={FiHeart} className="mr-2" /> Follow
            </button>
            <button 
              onClick={handleShare}
              className="flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors"
            >
              <SafeIcon icon={FiShare2} className="mr-2" /> Share
            </button>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 text-center"
        >
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-purple-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              <span className="bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent">
                Want to read more?
              </span>
            </h3>
            <p className="text-gray-600 mb-6">
              Discover more stories, tips, and insights from our blog
            </p>
            <Link 
              to="/" 
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-lg hover:from-purple-700 hover:to-purple-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <SafeIcon icon={FiArrowLeft} className="mr-2" /> Back to All Posts
            </Link>
          </div>
        </motion.div>
      </motion.article>

      <script dangerouslySetInnerHTML={{ __html: `
        window.addEventListener('scroll', function() {
          const article = document.querySelector('article');
          const progressBar = document.getElementById('reading-progress');
          if (article && progressBar) {
            const articleHeight = article.offsetHeight;
            const scrolled = window.scrollY;
            const progress = (scrolled / (articleHeight - window.innerHeight)) * 100;
            progressBar.style.width = Math.min(progress, 100) + '%';
          }
        });
      `}} />
    </div>
  );
};

export default BlogPost;