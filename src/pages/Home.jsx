import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useBlog } from '../contexts/BlogContext';
import BlogCard from '../components/BlogCard';
import KdramaGrid from '../components/KdramaGrid';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import SafeImage from '../common/SafeImage';
import { stripHtml } from '../utils/textUtils';
import { formatDate } from '../utils/dateUtils';
import { getImageSrc } from '../utils/media';
import { 
  ANIMATED_LOGO_VIDEO_URL, 
  FEATURED_STORY_VIDEO_URL, 
  KDRAMA_PLACEHOLDER,
  BLOG_PLACEHOLDER
} from '../config/assets';

const { FiTv, FiArrowRight, FiCalendar, FiStar, FiHeart } = FiIcons;

const Home = () => {
  const { publishedPosts: posts } = useBlog();
  const footerVideoRef = useRef(null);
  const isFooterInView = useInView(footerVideoRef, { once: true, margin: "200px" });

  const featuredPosts = useMemo(() => {
    if (!posts || posts.length === 0) return [];
    return posts
      .filter(p => p.ishandpicked === 1 || p.isHandPicked === true)
      .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  }, [posts]);

  // The hero post is the most recent handpicked post, or the latest post overall
  const heroPost = featuredPosts.length > 0 ? featuredPosts[0] : (posts?.[0] || null);

  // --- DEFENSIVE LOGGING (Dev Only) ---
  useEffect(() => {
    if (import.meta.env.DEV && heroPost) {
      const rawUrl = heroPost.image || heroPost.image_url;
      if (rawUrl) {
        console.group(`[Hero Image Debug] "${heroPost.title}"`);
        console.log(`Original URL:`, rawUrl);
        console.log(`Normalized/Proxied URL:`, getImageSrc(rawUrl));
        console.groupEnd();
      }
    }
  }, [heroPost]);

  const currentKDrama = {
    title: "Would You Marry Me?",
    episode: "Choi Woo Sik",
    status: "Rewatching",
    image: "https://images.unsplash.com/photo-1634152962476-4b8a00e1915c?w=600&h=800&fit=crop",
  };

  return (
    <div className="min-h-screen pb-20 bg-primary-50">
      {/* Hero Header */}
      <div className="relative pt-20 pb-32 overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-gray-900 mb-6 leading-tight">
              Life, Love, and a <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-purple-400">Little Bit of BTS</span>
            </h1>
          </motion.div>
        </div>
      </div>

      {/* Bento Grid Hero Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-20 mb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:h-[500px]">
          {heroPost && (
            <div className="lg:col-span-2 group relative rounded-3xl overflow-hidden shadow-xl bg-white h-[400px] lg:h-full">
              {/* Use Post Hero Image (Proxied) if available, otherwise fallback to video */}
              {heroPost.image || heroPost.image_url ? (
                <SafeImage 
                  src={heroPost.image || heroPost.image_url} 
                  alt={heroPost.title} 
                  fallback={BLOG_PLACEHOLDER}
                  className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000"
                />
              ) : (
                <video 
                  src={FEATURED_STORY_VIDEO_URL} 
                  autoPlay 
                  loop 
                  muted 
                  playsInline 
                  className="absolute inset-0 w-full h-full object-cover" 
                />
              )}
              
              <div className="absolute inset-0 bg-gradient-to-t from-purple-900/90 via-purple-900/40 to-transparent" />
              <div className="absolute bottom-0 left-0 p-8 text-white">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider">
                    {heroPost.category || 'Featured'}
                  </span>
                  <span className="text-purple-200 text-xs">• {formatDate(heroPost.date)}</span>
                </div>
                <Link to={`/post/${heroPost.id}`}>
                  <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4 group-hover:text-purple-200 transition-colors">
                    {heroPost.title}
                  </h2>
                </Link>
                <Link to={`/post/${heroPost.id}`} className="inline-flex items-center text-white font-bold border-b-2 border-white pb-1 hover:border-purple-300 hover:text-purple-200 transition-all">
                  Read Full Story <SafeIcon icon={FiArrowRight} className="ml-2" />
                </Link>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-6 w-full lg:h-full">
            <div className="flex-1 bg-purple-900 rounded-3xl overflow-hidden shadow-lg relative group">
              <SafeImage src={currentKDrama.image} alt="K-Drama" fallback={KDRAMA_PLACEHOLDER} className="absolute inset-0 w-full h-full object-cover opacity-60" />
              <div className="absolute inset-0 bg-gradient-to-br from-purple-900/90 to-black/50" />
              <div className="absolute inset-0 p-6 flex flex-col justify-between text-white">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <SafeIcon icon={FiTv} />
                    <span className="text-xs font-bold uppercase tracking-widest text-purple-200">Watching</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">{currentKDrama.title}</h3>
                  <p className="text-sm text-purple-200">{currentKDrama.episode}</p>
                </div>
              </div>
            </div>
            <div className="flex-1 bg-black rounded-3xl shadow-lg relative overflow-hidden border border-purple-500/30">
              <iframe src="https://open.spotify.com/embed/playlist/484z3UpLGXc4qzy0IvVRQ7" width="100%" height="100%" frameBorder="0" allow="autoplay;encrypted-media;fullscreen" title="Spotify" className="absolute inset-0" />
            </div>
          </div>
        </div>
      </div>

      {/* Featured Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-serif font-bold text-gray-900">K-Drama Recommendations</h2>
          <Link to="/kdrama-recommendations" className="text-purple-600 font-bold flex items-center hover:text-purple-800 transition-colors">
            View All <SafeIcon icon={FiArrowRight} className="ml-1" />
          </Link>
        </div>
        <KdramaGrid />
      </div>

      {/* Handpicked Stories */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-serif font-bold text-gray-900">Handpicked for You</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredPosts.slice(1).map((post, index) => (
            <BlogCard key={post.id} post={post} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;