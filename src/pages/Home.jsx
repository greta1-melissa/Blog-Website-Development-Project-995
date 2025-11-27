import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useBlog } from '../contexts/BlogContext';
import BlogCard from '../components/BlogCard';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { ANIMATED_LOGO_VIDEO_URL, FEATURED_STORY_VIDEO_URL } from '../config/assets';

const { FiPlay, FiTv, FiMusic, FiArrowRight, FiCalendar, FiStar } = FiIcons;

const Home = () => {
  const { posts } = useBlog();
  
  // Logic for Featured Section: 1 Most Recent + 2 Hand Picked
  const featuredPosts = useMemo(() => {
    if (posts.length === 0) return [];

    const mostRecent = posts[0];
    // Find up to 2 other posts that are flagged as hand-picked and not the most recent one
    const handPicked = posts
      .filter(p => p.id !== mostRecent.id && p.isHandPicked)
      .slice(0, 2);
    
    // Combine them
    return [mostRecent, ...handPicked];
  }, [posts]);

  const mostRecentPost = posts[0];

  const currentKDrama = {
    title: "Would You Marry Me?",
    episode: "Choi Woo Sik",
    status: "Rewatching",
    image: "https://images.unsplash.com/photo-1634152962476-4b8a00e1915c?w=600&h=800&fit=crop",
    description: "The chemistry is unmatched! Choi Woo Sik's performance is pure gold. ❤️",
    year: "2024"
  };

  const spotifyPlaylist = {
    name: "Mom Vibes",
    trackCount: 47,
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
    url: "https://open.spotify.com/playlist/37i9dQZF1DX9tPFwDMOaN1"
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
        {/* Adjusted grid height and gap */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:h-[500px]">
          
          {/* Main Feature: Latest Post */}
          {mostRecentPost && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="lg:col-span-2 group relative rounded-3xl overflow-hidden shadow-xl bg-white h-[400px] lg:h-full border border-purple-100"
            >
              {/* Video Background */}
              <video 
                src={FEATURED_STORY_VIDEO_URL} 
                autoPlay 
                loop 
                muted 
                playsInline 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-purple-900/90 via-purple-900/40 to-transparent" />
              
              <div className="absolute bottom-0 left-0 p-8 md:p-10 text-white relative z-10">
                <div className="flex items-center space-x-3 mb-3">
                  <span className="bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide shadow-lg shadow-purple-900/20">
                    Latest Story
                  </span>
                  <span className="text-purple-100 text-sm flex items-center font-medium bg-purple-900/30 px-2 py-0.5 rounded-md backdrop-blur-sm">
                    <SafeIcon icon={FiCalendar} className="mr-2" /> {mostRecentPost.date}
                  </span>
                </div>
                <Link to={`/post/${mostRecentPost.id}`} className="block">
                  <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4 leading-tight group-hover:text-purple-200 transition-colors drop-shadow-sm">
                    {mostRecentPost.title}
                  </h2>
                </Link>
                <p className="text-purple-50 line-clamp-2 max-w-xl mb-6 text-lg font-medium drop-shadow-sm opacity-90">
                  {mostRecentPost.content}
                </p>
                <Link 
                  to={`/post/${mostRecentPost.id}`}
                  className="inline-flex items-center text-white font-bold border-b-2 border-white pb-1 hover:border-purple-300 hover:text-purple-200 transition-all"
                >
                  Read Full Story <SafeIcon icon={FiArrowRight} className="ml-2" />
                </Link>
              </div>
            </motion.div>
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
              <img 
                src={currentKDrama.image} 
                alt="K-Drama" 
                className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" 
              />
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

            {/* Bottom Right: Spotify */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex-1 bg-gradient-to-br from-purple-600 to-purple-800 rounded-3xl shadow-lg p-6 text-white flex flex-col justify-between relative overflow-hidden group border border-purple-500 min-h-[240px]"
            >
              <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all" />
              
              <div className="flex justify-between items-start relative z-10 w-full">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest opacity-80">Jamming To</span>
                  <h3 className="text-2xl font-bold mt-1 line-clamp-1">{spotifyPlaylist.name}</h3>
                </div>
                <SafeIcon icon={FiMusic} className="text-3xl opacity-80 flex-shrink-0" />
              </div>

              <div className="flex items-center gap-4 relative z-10 mt-4">
                <img src={spotifyPlaylist.image} alt="Album" className="w-12 h-12 rounded-lg shadow-md flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="h-1 bg-white/30 rounded-full overflow-hidden w-full">
                    <div className="h-full bg-white w-2/3"></div>
                  </div>
                  <p className="text-xs mt-2 opacity-90 truncate">{spotifyPlaylist.trackCount} tracks • Mom Life</p>
                </div>
                <a 
                  href={spotifyPlaylist.url} 
                  target="_blank" 
                  className="w-10 h-10 bg-white text-purple-700 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform flex-shrink-0"
                >
                  <SafeIcon icon={FiPlay} className="ml-1" />
                </a>
              </div>
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
          <div className="mt-4 md:mt-0">
            <Link 
              to="/blogs"
              className="inline-flex items-center px-6 py-3 bg-white text-purple-600 border border-purple-200 rounded-full font-medium hover:bg-purple-50 transition-colors shadow-sm"
            >
              View All Stories <SafeIcon icon={FiArrowRight} className="ml-2" />
            </Link>
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
            <div className="w-24 h-24 bg-purple-600 rounded-2xl overflow-hidden flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-900/50 rotate-3 border-4 border-purple-500">
              <video 
                src={ANIMATED_LOGO_VIDEO_URL} 
                autoPlay 
                loop 
                muted 
                playsInline 
                className="w-full h-full object-cover transform scale-110"
              />
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