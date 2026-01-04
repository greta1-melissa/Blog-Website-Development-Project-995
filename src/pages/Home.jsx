import React, { useState, useMemo, useRef } from 'react';
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
import { ANIMATED_LOGO_VIDEO_URL, FEATURED_STORY_VIDEO_URL, KDRAMA_PLACEHOLDER } from '../config/assets';

const { FiTv, FiArrowRight, FiCalendar, FiStar, FiHeart } = FiIcons;

const Home = () => {
  const { publishedPosts: posts } = useBlog();
  const footerVideoRef = useRef(null);
  const isFooterInView = useInView(footerVideoRef, { once: true, margin: "200px" });

  const featuredPosts = useMemo(() => {
    if (!posts || posts.length === 0) return [];
    return posts
      .filter(p => p.ishandpicked === 1)
      .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  }, [posts]);

  const mostRecentPost = posts && posts.length > 0 ? posts[0] : null;

  const currentKDrama = {
    title: "Would You Marry Me?",
    episode: "Choi Woo Sik",
    status: "Rewatching",
    image: "https://images.unsplash.com/photo-1634152962476-4b8a00e1915c?w=600&h=800&fit=crop",
  };

  return (
    <div className="min-h-screen pb-20 bg-primary-50">
      {/* Hero */}
      <div className="relative pt-20 pb-32 overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-gray-900 mb-6 leading-tight">
              Life, Love, and a <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-purple-400">Little Bit of BTS</span>
            </h1>
          </motion.div>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-20 mb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:h-[500px]">
          {mostRecentPost && (
            <div className="lg:col-span-2 group relative rounded-3xl overflow-hidden shadow-xl bg-white h-[400px] lg:h-full">
              <video src={FEATURED_STORY_VIDEO_URL} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-purple-900/90 via-purple-900/40 to-transparent" />
              <div className="absolute bottom-0 left-0 p-8 text-white">
                <Link to={`/post/${mostRecentPost.id}`}>
                  <h2 className="text-3xl font-serif font-bold mb-4">{mostRecentPost.title}</h2>
                </Link>
                <Link to={`/post/${mostRecentPost.id}`} className="inline-flex items-center text-white font-bold border-b-2 border-white pb-1">
                  Read Full Story <SafeIcon icon={FiArrowRight} className="ml-2" />
                </Link>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-6 w-full lg:h-full">
            <div className="flex-1 bg-purple-900 rounded-3xl overflow-hidden shadow-lg relative group">
              <SafeImage 
                src={currentKDrama.image} 
                alt="K-Drama" 
                fallback={KDRAMA_PLACEHOLDER}
                className="absolute inset-0 w-full h-full object-cover opacity-60"
              />
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
              <iframe src="https://open.spotify.com/embed/playlist/484z3UpLGXc4qzy0IvVRQ7" width="100%" height="100%" frameBorder="0" allow="autoplay; encrypted-media; fullscreen" title="Spotify" className="absolute inset-0" />
            </div>
          </div>
        </div>
      </div>

      {/* Featured Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <KdramaGrid />
      </div>

      {/* Handpicked Stories */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredPosts.map((post, index) => (
            <BlogCard key={post.id} post={post} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;