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
  const post = (posts || []).find(p => p.id === id || String(p.slug) === String(id));

  useEffect(() => {
    if (post) {
      document.title = post.meta_title || post.title;
      
      const updateMeta = (name, content) => {
        let el = document.querySelector(`meta[name="${name}"]`) || document.querySelector(`meta[property="${name}"]`);
        if (!el) {
          el = document.createElement('meta');
          if (name.startsWith('og:')) el.setAttribute('property', name);
          else el.setAttribute('name', name);
          document.head.appendChild(el);
        }
        el.setAttribute('content', content || '');
      };

      updateMeta('description', post.meta_description || post.title);
      updateMeta('keywords', post.meta_keywords || '');
      
      // OpenGraph
      updateMeta('og:title', post.meta_title || post.title);
      updateMeta('og:description', post.meta_description || post.title);
      updateMeta('og:image', post.og_image || post.displayImage || BLOG_PLACEHOLDER);
      updateMeta('og:type', 'article');
      
      // Twitter
      updateMeta('twitter:card', 'summary_large_image');
      updateMeta('twitter:title', post.meta_title || post.title);
      updateMeta('twitter:description', post.meta_description || post.title);
      updateMeta('twitter:image', post.og_image || post.displayImage || BLOG_PLACEHOLDER);

      // Canonical
      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
      }
      canonical.setAttribute('href', window.location.href);
      
      window.scrollTo(0, 0);
    }
  }, [post]);

  if (!post) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 font-serif">Story Not Found</h2>
        <Link to="/blogs" className="text-purple-600 font-bold flex items-center hover:underline">
          <SafeIcon icon={FiArrowLeft} className="mr-2" /> Back to Stories
        </Link>
      </div>
    );
  }

  return (
    <motion.article initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto px-4 py-12">
      <Link to="/blogs" className="inline-flex items-center text-gray-500 hover:text-purple-600 font-bold mb-8 transition-colors group">
        <SafeIcon icon={FiArrowLeft} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Back to All Stories
      </Link>

      <header className="mb-12">
        <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-[10px] font-black uppercase tracking-widest rounded-full mb-6">
          {post.categoryName || 'General'}
        </span>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 leading-tight mb-8 font-serif">
          {post.title}
        </h1>
        
        <div className="flex flex-wrap items-center gap-6 text-gray-500 border-y border-gray-100 py-6">
          <div className="flex items-center">
            <SafeIcon icon={FiUser} className="mr-2 text-purple-400" />
            <span className="font-bold text-gray-900">{post.author_name || post.author || 'Admin'}</span>
          </div>
          <div className="flex items-center">
            <SafeIcon icon={FiCalendar} className="mr-2 text-purple-400" />
            <span>{post.published_at ? new Date(post.published_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Recently'}</span>
          </div>
          <div className="flex items-center">
            <SafeIcon icon={FiClock} className="mr-2 text-purple-400" />
            <span>{post.readtime || '5 min read'}</span>
          </div>
        </div>
      </header>

      <div className="relative aspect-[21/9] rounded-3xl overflow-hidden mb-12 shadow-2xl border border-gray-100">
        <SafeImage 
          src={post.displayImage || post.featured_image_url || post.image} 
          alt={post.title} 
          fallback={BLOG_PLACEHOLDER}
          className="w-full h-full object-cover"
        />
      </div>

      <div 
        className="prose prose-purple prose-lg max-w-none prose-headings:font-serif prose-headings:font-bold prose-p:text-gray-700 prose-img:rounded-3xl"
        dangerouslySetInnerHTML={{ __html: post.content_html || post.content }}
      />

      <footer className="mt-16 pt-12 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button className="p-3 bg-gray-50 rounded-full hover:bg-purple-50 hover:text-purple-600 transition-colors shadow-sm">
              <SafeIcon icon={FiShare2} />
            </button>
            <button className="p-3 bg-gray-50 rounded-full hover:bg-purple-50 hover:text-purple-600 transition-colors shadow-sm">
              <SafeIcon icon={FiBookmark} />
            </button>
          </div>
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            {post.status}
          </div>
        </div>
      </footer>
    </motion.article>
  );
};

export default BlogPost;