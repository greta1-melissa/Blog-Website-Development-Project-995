import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import SafeImage from '../common/SafeImage';
import { useBlog } from '../contexts/BlogContext';
import { BLOG_PLACEHOLDER } from '../config/assets';

const { FiCalendar, FiClock, FiUser, FiArrowLeft, FiShare2, FiBookmark } = FiIcons;

const BlogPost = () => {
  const { id } = useParams();
  const { posts } = useBlog();
  const post = posts.find(p => p.id === id || p.slug === id);

  useEffect(() => {
    if (post) {
      // Dynamic SEO Injection
      document.title = post.meta_title || post.title;
      
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) metaDescription.setAttribute('content', post.meta_description || post.title);

      const metaKeywords = document.querySelector('meta[name="keywords"]');
      if (metaKeywords) metaKeywords.setAttribute('content', post.meta_keywords || '');

      // OpenGraph
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute('content', post.meta_title || post.title);

      const ogImage = document.querySelector('meta[property="og:image"]');
      if (ogImage) ogImage.setAttribute('content', post.og_image || post.image);
      
      window.scrollTo(0, 0);
    }
  }, [post]);

  if (!post) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Story Not Found</h2>
        <Link to="/blogs" className="text-purple-600 font-bold flex items-center">
          <SafeIcon icon={FiArrowLeft} className="mr-2" /> Back to Stories
        </Link>
      </div>
    );
  }

  return (
    <motion.article 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="max-w-4xl mx-auto px-4 py-12"
    >
      <Link to="/blogs" className="inline-flex items-center text-gray-500 hover:text-purple-600 font-bold mb-8 transition-colors group">
        <SafeIcon icon={FiArrowLeft} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Back to All Stories
      </Link>

      <header className="mb-12">
        <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-xs font-black uppercase tracking-widest rounded-full mb-6">
          {post.category}
        </span>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 leading-tight mb-8 font-serif">
          {post.title}
        </h1>
        
        <div className="flex flex-wrap items-center gap-6 text-gray-500 border-y border-gray-100 py-6">
          <div className="flex items-center">
            <SafeIcon icon={FiUser} className="mr-2" />
            <span className="font-bold text-gray-900">{post.author}</span>
          </div>
          <div className="flex items-center">
            <SafeIcon icon={FiCalendar} className="mr-2" />
            <span>{new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          </div>
          <div className="flex items-center">
            <SafeIcon icon={FiClock} className="mr-2" />
            <span>{post.readtime || '5 min read'}</span>
          </div>
        </div>
      </header>

      <div className="relative aspect-[21/9] rounded-3xl overflow-hidden mb-12 shadow-2xl">
        <SafeImage 
          src={post.image || post.og_image} 
          alt={post.title} 
          fallback={BLOG_PLACEHOLDER}
          className="w-full h-full object-cover"
        />
      </div>

      <div 
        className="prose prose-purple prose-lg max-w-none prose-headings:font-serif prose-headings:font-bold prose-p:text-gray-700 prose-img:rounded-3xl"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      <footer className="mt-16 pt-12 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button className="p-3 bg-gray-50 rounded-full hover:bg-purple-50 hover:text-purple-600 transition-colors">
              <SafeIcon icon={FiShare2} />
            </button>
            <button className="p-3 bg-gray-50 rounded-full hover:bg-purple-50 hover:text-purple-600 transition-colors">
              <SafeIcon icon={FiBookmark} />
            </button>
          </div>
        </div>
      </footer>
    </motion.article>
  );
};

export default BlogPost;