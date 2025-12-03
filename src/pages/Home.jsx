import React, { useState, useMemo, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useBlog } from '../contexts/BlogContext';
import BlogCard from '../components/BlogCard';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { stripHtml } from '../utils/textUtils';
import { formatDate } from '../utils/dateUtils';
import { ANIMATED_LOGO_VIDEO_URL, FEATURED_STORY_VIDEO_URL } from '../config/assets';

const { FiTv, FiArrowRight, FiCalendar, FiStar } = FiIcons;

const Home = () => {
  // Use publishedPosts instead of raw posts to hide drafts/scheduled
  const { publishedPosts: posts } = useBlog();
  
  // Lazy load ref for footer video
  const footerVideoRef = useRef(null);
  const isFooterInView = useInView(footerVideoRef, { once: true, margin: "200px" });

  // Logic for Featured Section: Prioritize Hand Picked, fallback to Recent
  const featuredPosts = useMemo(() => {
    if (!posts || posts.length === 0) return [];

    // 1. Get all manually featured posts
    let selection = posts.filter(p => p.isHandPicked);

    // 2. Sort them by date (newest first)
    selection.sort((a, b) => new Date(b.date) - new Date(a.date));

    // 3. If fewer than 3, fill with most recent posts that aren't already selected
    if (selection.length < 3) {
      const selectedIds = new Set(selection.map(p => p.id));
      const fillers = posts
        .filter(p => !selectedIds.has(p.id))
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 3 - selection.length);
      
      selection = [...selection, ...fillers];
    }

    // 4. Return exactly 3 (or fewer if total posts < 3)
    return selection.slice(0, 3);
  }, [posts]);

  // Safely access the most recent post for the Hero/Bento section
  const mostRecentPost = posts && posts.length > 0 ? posts[0] : null;

  const currentKDrama = {
    title: "Would You Marry Me?",
    episode: "Choi Woo Sik",
    status: "Rewatching",
    image: "https://images.unsplash.com/photo-1634152962476-4b8a00e1915c?w=600&h=800&fit=crop",
    description: "The chemistry is unmatched! Choi Woo Sik's performance is pure gold. ❤️",
    year: "2024"
  };

  return (
    <div className="min-h-screen pb-20 bg-primary-50">
      {/* Hero Section */}
      <div className="relative pt-20 pb-32 overflow-hidden">
        {/* Background Decor */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-float"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-float" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block py-1 px-3 rounded-full bg-white/60 backdrop-blur-sm border border-purple-200 text-purple-700 text-sm font-semibold mb-6">
              💜 Welcome to the chaos & charm
            </span>
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-gray-900 mb-6 leading-tight">
              Life, Love, and a <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-purple-400">Little Bit of BTS</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
              A cozy corner for moms navigating parenting, wellness, and the joy of K-culture. Grab a coffee (or tea) and stay a while.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Bento Grid Featured Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-20 mb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:h-[500px]">
          {/* Main Feature: Latest Post */}
          {mostRecentPost ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="lg:col-span-2 group relative rounded-3xl overflow-hidden shadow-xl bg-white h-[400px] lg:h-full border border-purple-100"
            >
              {/* Video Background - Priority Load */}
              <video 
                src={FEATURED_STORY_VIDEO_URL}
                autoPlay 
                loop 
                muted 
                playsInline 
                preload="auto"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-purple-900/90 via-purple-900/40 to-transparent" />
              
              <div className="absolute bottom-0 left-0 p-8 md:p-10 text-white relative z-10">
                <div className="flex items-center space-x-3 mb-3">
                  <span className="bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide shadow-lg shadow-purple-900/20">
                    Latest Story
                  </span>
                  <span className="text-purple-100 text-sm flex items-center font-medium bg-purple-900/30 px-2 py-0.5 rounded-md backdrop-blur-sm">
                    <SafeIcon icon={FiCalendar} className="mr-2" />
                    {formatDate(mostRecentPost.date)}
                  </span>
                </div>
                <Link to={`/post/${mostRecentPost.id}`} className="block">
                  <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4 leading-tight group-hover:text-purple-200 transition-colors drop-shadow-sm">
                    {mostRecentPost.title}
                  </h2>
                </Link>
                <p className="text-purple-50 line-clamp-2 max-w-xl mb-6 text-lg font-medium drop-shadow-sm opacity-90">
                  {stripHtml(mostRecentPost.content)}
                </p>
                <Link 
                  to={`/post/${mostRecentPost.id}`}
                  className="inline-flex items-center text-white font-bold border-b-2 border-white pb-1 hover:border-purple-300 hover:text-purple-200 transition-all"
                >
                  Read Full Story <SafeIcon icon={FiArrowRight} className="ml-2" />
                </Link>
              </div>
            </motion.div>
          ) : (
            <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm flex items-center justify-center border border-purple-100 p-10 h-[400px] lg:h-full">
              <div className="text-center">
                <div className="text-4xl mb-4">✍️</div>
                <h3 className="text-xl font-bold text-gray-900">Stories loading...</h3>
                <p className="text-gray-500">Getting the latest updates for you.</p>
              </div>
            </div>
          )}

          {/* Right Column */}
          <div className="flex flex-col gap-6 w-full lg:h-full">
            {/* Top Right: Currently Watching */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex-1 bg-purple-900 rounded-3xl overflow-hidden shadow-lg relative group border border-purple-800 min-h-[240px]"
            >
              <img src={currentKDrama.image} alt="K-Drama" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
              <div className="absolute inset-0 bg-gradient-to-br from-purple-900/90 to-black/50" />
              <div className="absolute inset-0 p-6 flex flex-col justify-between text-white">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                      <SafeIcon icon={FiTv} />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-purple-200">Watching</span>
                  </div>
                  <span className="bg-purple-500 text-xs font-bold px-2 py-1 rounded text-white shadow-lg shadow-purple-900/40">
                    {currentKDrama.status}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">{currentKDrama.title}</h3>
                  <p className="text-sm text-purple-200 mb-3">{currentKDrama.episode}</p>
                  <p className="text-xs text-purple-300 line-clamp-2">{currentKDrama.description}</p>
                </div>
              </div>
            </motion.div>

            {/* Bottom Right: Spotify Embed */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex-1 bg-black rounded-3xl shadow-lg relative overflow-hidden border border-purple-500/30 min-h-[240px]"
            >
              <iframe 
                style={{borderRadius: '0px'}} 
                src="https://open.spotify.com/embed/playlist/484z3UpLGXc4qzy0IvVRQ7?utm_source=generator&theme=0" 
                width="100%" 
                height="100%" 
                frameBorder="0" 
                allowFullScreen="" 
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                loading="lazy" 
                title="Spotify Playlist"
                className="absolute inset-0 w-full h-full"
              ></iframe>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Featured Collection Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <SafeIcon icon={FiStar} className="text-purple-600 text-xl" />
              <span className="text-purple-600 font-bold uppercase tracking-widest text-sm">Editor's Picks</span>
            </div>
            <h2 className="text-3xl font-serif font-bold text-gray-900">Featured Stories</h2>
            <p className="text-gray-500 mt-1">Curated selections just for you</p>
          </div>
        </div>

        {/* Featured Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
          {featuredPosts.map((post, index) => (
            <BlogCard key={post.id} post={post} index={index} />
          ))}
        </div>

        {/* Newsletter / CTA Section */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-24 bg-purple-900 rounded-[2.5rem] overflow-hidden relative text-center py-20 px-6"
        >
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="relative z-10 max-w-2xl mx-auto">
            <div ref={footerVideoRef} className="w-24 h-24 bg-purple-600 rounded-2xl overflow-hidden flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-900/50 rotate-3 border-4 border-purple-500">
              {/* Lazy load the footer video only when in view */}
              {isFooterInView && (
                <video 
                  src={ANIMATED_LOGO_VIDEO_URL}
                  autoPlay 
                  loop 
                  muted 
                  playsInline 
                  className="w-full h-full object-cover transform scale-110"
                />
              )}
            </div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">
              Join the Bangtan Mom Community
            </h2>
            <p className="text-purple-200 mb-8 text-lg">
              Get weekly updates on parenting hacks, K-Drama recommendations, and a dose of positivity delivered to your inbox.
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Your email address" 
                className="flex-1 px-6 py-4 rounded-full bg-white/10 border border-white/20 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white/20 transition-all"
              />
              <button className="px-8 py-4 bg-purple-500 hover:bg-purple-400 text-white font-bold rounded-full shadow-lg shadow-purple-900/50 transition-all hover:scale-105">
                Subscribe
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Home;