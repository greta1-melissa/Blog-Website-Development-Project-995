import React, { useState, useMemo, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useBlog } from '../contexts/BlogContext';
import BlogCard from '../components/BlogCard';
import KdramaGrid from '../components/KdramaGrid';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { stripHtml } from '../utils/textUtils';
import { formatDate } from '../utils/dateUtils';
import { getImageSrc } from '../utils/media.js';
import { ANIMATED_LOGO_VIDEO_URL } from '../config/assets';

const { FiTv, FiArrowRight, FiCalendar, FiStar, FiHeart, FiChevronDown, FiMusic, FiPlay } = FiIcons;

// Direct link for the background video (Optimized with raw=1 for direct streaming)
const HERO_BG_VIDEO = "https://www.dropbox.com/scl/fi/kk5lebnsgklculhx1pdo8/cherry-blossom-laptop-moment.mp4?rlkey=1df4lj7n7f5mn5p4ppwbfg1aj&st=jeg4z0pq&raw=1";
const SPOTIFY_PLAYLIST_URL = "https://open.spotify.com/playlist/37i9dQZF1DX0S69vT_-66T"; // Curated BTS/Cozy Playlist

const Home = () => {
  const { publishedPosts: posts } = useBlog();
  const footerVideoRef = useRef(null);
  const isFooterInView = useInView(footerVideoRef, { once: true, margin: "200px" });

  const featuredPosts = useMemo(() => {
    if (!posts || posts.length === 0) return [];
    const getPostTime = (p) => new Date(p?.date || p?.published_at || p?.created_at || 0).getTime();

    let selection = posts.filter(p =>
      p?.isHandPicked === true ||
      p?.ishandpicked === 1 ||
      p?.is_hand_picked === true
    );

    selection.sort((a, b) => getPostTime(b) - getPostTime(a));

    if (selection.length < 3) {
      const selectedIds = new Set(selection.map(p => p.id));
      const fillers = posts
        .filter(p => !selectedIds.has(p.id))
        .sort((a, b) => getPostTime(b) - getPostTime(a))
        .slice(0, 3 - selection.length);
      selection = [...selection, ...fillers];
    }
    return selection.slice(0, 3);
  }, [posts]);

  const currentKDrama = {
    title: "Would You Marry Me?",
    status: "Rewatching",
    image: "https://images.unsplash.com/photo-1634152962476-4b8a00e1915c?w=600&h=800&fit=crop",
    description: "The chemistry is unmatched! Choi Woo Sik's performance is pure gold. ❤️",
    year: "2024"
  };

  const currentDramaImg = getImageSrc(currentKDrama.image);

  return (
    <div className="min-h-screen pb-20 bg-primary-50">
      {/* 1. Full-Width Single Column Hero Video Section */}
      <section className="relative h-[90vh] min-h-[600px] w-full overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <video
            src={HERO_BG_VIDEO}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          {/* Subtle Overlays for readability */}
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-purple-900/40 via-transparent to-primary-50"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            <span className="inline-block py-2 px-6 rounded-full bg-white/10 backdrop-blur-md text-white border border-white/20 font-bold text-xs mb-8 uppercase tracking-[0.25em] shadow-xl">
              ARMY Mom • K-Drama Lover • WFH Life
            </span>
            
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-serif font-bold text-white mb-8 leading-tight drop-shadow-2xl">
              Bangtan <span className="text-purple-300">Mom</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-purple-50 max-w-3xl mx-auto leading-relaxed mb-12 font-light drop-shadow-lg">
              Heartfelt stories, curated K-drama recs, and the beautiful chaos of motherhood.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-6">
              <Link 
                to="/blog" 
                className="px-10 py-5 bg-purple-600 text-white rounded-full font-bold shadow-2xl hover:bg-purple-500 hover:scale-105 transition-all text-sm uppercase tracking-widest"
              >
                Read Stories
              </Link>
              <Link 
                to="/forums" 
                className="px-10 py-5 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-full font-bold hover:bg-white/20 transition-all text-sm uppercase tracking-widest"
              >
                Join Community
              </Link>
            </div>
          </motion.div>

          <motion.div 
            animate={{ y: [0, 15, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2 text-white/50"
          >
            <SafeIcon icon={FiChevronDown} className="text-4xl" />
          </motion.div>
        </div>
      </section>

      {/* 2. Side-by-Side: Watching & Listening Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-20 mb-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Watching Section */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-[2.5rem] overflow-hidden shadow-2xl border border-purple-100 flex flex-col md:flex-row h-full group"
          >
            <div className="md:w-2/5 relative h-64 md:h-auto overflow-hidden">
              <img
                src={currentDramaImg}
                alt={currentKDrama.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:bg-gradient-to-r"></div>
              <div className="absolute top-4 left-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-purple-600 text-white text-[10px] font-black uppercase tracking-widest">
                  <SafeIcon icon={FiTv} className="mr-2" /> {currentKDrama.status}
                </span>
              </div>
            </div>

            <div className="md:w-3/5 p-8 flex flex-col justify-center">
              <h3 className="text-xs font-black text-purple-600 uppercase tracking-[0.2em] mb-2">Currently Watching</h3>
              <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4 leading-tight">{currentKDrama.title}</h2>
              <p className="text-gray-600 italic mb-6 leading-relaxed">"{currentKDrama.description}"</p>
              <Link
                to="/kdrama-recommendations"
                className="inline-flex items-center text-purple-700 font-black text-xs uppercase tracking-wider hover:text-purple-900 transition-colors"
              >
                More Recs <SafeIcon icon={FiArrowRight} className="ml-2" />
              </Link>
            </div>
          </motion.div>

          {/* Spotify Playlist Section */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-indigo-900 via-purple-900 to-fuchsia-900 rounded-[2.5rem] overflow-hidden shadow-2xl p-10 flex flex-col justify-center relative group"
          >
            <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:opacity-20 transition-opacity">
              <SafeIcon icon={FiMusic} className="text-[12rem] text-white" />
            </div>
            
            <div className="relative z-10">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 border border-white/20">
                <SafeIcon icon={FiMusic} className="text-3xl text-purple-200" />
              </div>
              
              <h3 className="text-xs font-black text-purple-300 uppercase tracking-[0.2em] mb-2">Daily Soundtrack</h3>
              <h2 className="text-4xl font-serif font-bold text-white mb-4">Magic Shop Vibes</h2>
              <p className="text-purple-100/80 mb-10 max-w-sm leading-relaxed text-lg">
                The perfect playlist for a work-from-home afternoon or cozy evening reflection.
              </p>
              
              <a
                href={SPOTIFY_PLAYLIST_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-10 py-5 bg-white text-purple-900 font-black rounded-full hover:bg-purple-50 transition-all shadow-xl uppercase tracking-widest text-xs"
              >
                <SafeIcon icon={FiPlay} className="mr-3" /> Open on Spotify
              </a>
            </div>
          </motion.div>

        </div>
      </div>

      {/* Latest Stories */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-32">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <span className="inline-block text-purple-600 font-black uppercase tracking-[0.3em] text-xs mb-4">Journal</span>
            <h2 className="text-4xl md:text-6xl font-serif font-bold text-gray-900 mb-4 leading-tight">Latest Stories</h2>
            <p className="text-gray-600 text-xl leading-relaxed font-light">
              Reflections on motherhood, ARMY life, and the little moments that make it all worthwhile.
            </p>
          </div>
          <Link
            to="/blog"
            className="inline-flex items-center px-10 py-4 bg-white border border-purple-200 text-purple-700 font-bold rounded-full hover:bg-purple-50 transition-all shadow-sm uppercase tracking-widest text-xs"
          >
            View All <SafeIcon icon={FiArrowRight} className="ml-2" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {posts && posts.slice(0, 6).map((post, index) => (
            <BlogCard key={post.id} post={post} index={index} />
          ))}
        </div>
      </div>

      {/* KDrama Recommendations Section */}
      <div className="bg-white py-32 mb-32 border-y border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-20"
          >
            <span className="inline-block py-2 px-6 rounded-full bg-purple-50 text-purple-700 font-black text-[10px] uppercase tracking-widest mb-6 border border-purple-100">
              Curated Reviews
            </span>
            <h2 className="text-4xl md:text-6xl font-serif font-bold text-gray-900 mb-8">
              Must-Watch Shows
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed font-light">
              As a K-drama-loving ARMY mom, these are the emotional rollercoasters I recommend to my closest friends.
            </p>
          </motion.div>

          <KdramaGrid />

          <div className="text-center mt-16">
            <Link
              to="/kdrama-recommendations"
              className="inline-flex items-center px-12 py-5 bg-purple-600 text-white font-black rounded-full hover:bg-purple-700 transition-all shadow-2xl shadow-purple-900/20 uppercase tracking-widest text-xs"
            >
              All Recommendations <SafeIcon icon={FiArrowRight} className="ml-2" />
            </Link>
          </div>
        </div>
      </div>

      {/* Featured Stories (Editor's Picks) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-6 mb-16">
           <div className="h-px bg-purple-200 flex-1"></div>
           <div className="flex items-center space-x-3">
              <SafeIcon icon={FiStar} className="text-purple-600 text-2xl" />
              <span className="text-purple-600 font-black uppercase tracking-[0.4em] text-sm">Editor's Picks</span>
           </div>
           <div className="h-px bg-purple-200 flex-1"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {featuredPosts.map((post, index) => (
            <BlogCard key={post.id} post={post} index={index} />
          ))}
        </div>

        {/* Join CTA */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-32 bg-purple-900 rounded-[5rem] overflow-hidden relative text-center py-28 px-6 shadow-3xl"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-800 via-purple-900 to-indigo-900 opacity-95"></div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>

          <div className="relative z-10 max-w-3xl mx-auto">
            <div
              ref={footerVideoRef}
              className="w-28 h-28 bg-white/10 backdrop-blur-xl rounded-3xl overflow-hidden flex items-center justify-center mx-auto mb-10 shadow-2xl rotate-3 border border-white/20"
            >
              {isFooterInView && (
                <video
                  src={ANIMATED_LOGO_VIDEO_URL}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover transform scale-125"
                />
              )}
            </div>

            <h2 className="text-4xl md:text-7xl font-serif font-bold text-white mb-8">
              The Magic Shop
            </h2>

            <p className="text-purple-100 mb-12 text-2xl font-light leading-relaxed">
              Get new stories, cozy reflections, and K-drama recs sent straight to your inbox.
            </p>

            <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 px-8 py-5 rounded-full bg-white/10 border border-white/20 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white/20 transition-all text-lg"
              />
              <button className="px-10 py-5 bg-white text-purple-900 font-black rounded-full shadow-2xl transition-all hover:scale-105 active:scale-95 uppercase tracking-widest text-xs">
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