import React, { useState, useMemo, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useBlog } from '../contexts/BlogContext';
import BlogCard from '../components/BlogCard';
import KdramaGrid from '../components/KdramaGrid';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import SafeImage from '../common/SafeImage';
import { 
  ANIMATED_LOGO_VIDEO_URL, 
  FEATURED_STORY_VIDEO_URL, 
  BLOG_PLACEHOLDER, 
  KDRAMA_PLACEHOLDER 
} from '../config/assets';

const { FiTv, FiArrowRight, FiStar } = FiIcons;

const Home = () => {
  const { publishedPosts: posts } = useBlog();
  
  // Hooks for video visibility and error handling
  const footerVideoRef = useRef(null);
  const isFooterInView = useInView(footerVideoRef, { once: true, margin: "200px" });
  const [heroVideoError, setHeroVideoError] = useState(false);

  const featuredPosts = useMemo(() => {
    if (!posts || posts.length === 0) return [];
    return posts
      .filter(p => p.isHandPicked || p.ishandpicked === 1)
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
          {mostRecentPost && (
            <div className="lg:col-span-2 group relative rounded-3xl overflow-hidden shadow-xl bg-purple-900 h-[400px] lg:h-full">
              {/* Conditional Video Background with Fallback */}
              {!heroVideoError ? (
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="auto"
                  onError={() => setHeroVideoError(true)}
                  className="absolute inset-0 w-full h-full object-cover opacity-60 transform scale-105 group-hover:scale-110 transition-transform duration-1000"
                >
                  <source src={FEATURED_STORY_VIDEO_URL} type="video/mp4" />
                </video>
              ) : (
                <SafeImage 
                  src={mostRecentPost.image || mostRecentPost.image_url} 
                  alt={mostRecentPost.title} 
                  fallback={BLOG_PLACEHOLDER}
                  className="absolute inset-0 w-full h-full object-cover opacity-60 transform scale-105 group-hover:scale-110 transition-transform duration-1000"
                />
              )}
              
              <div className="absolute inset-0 bg-gradient-to-t from-purple-900/90 via-purple-900/40 to-transparent" />
              <div className="absolute bottom-0 left-0 p-8 text-white">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-widest">Latest Story</span>
                </div>
                <Link to={`/post/${mostRecentPost.id}`}>
                  <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4 group-hover:text-purple-200 transition-colors">
                    {mostRecentPost.title}
                  </h2>
                </Link>
                <Link to={`/post/${mostRecentPost.id}`} className="inline-flex items-center text-white font-bold border-b-2 border-white pb-1 hover:border-purple-300 hover:text-purple-200 transition-all">
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
              <iframe src="https://open.spotify.com/embed/playlist/484z3UpLGXc4qzy0IvVRQ7" width="100%" height="100%" frameBorder="0" allow="autoplay; encrypted-media; fullscreen" title="Spotify" className="absolute inset-0" />
            </div>
          </div>
        </div>
      </div>

      {/* Featured Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-serif font-bold text-gray-900">K-Drama Corner</h2>
          <Link to="/kdrama-recommendations" className="text-purple-600 font-bold flex items-center hover:text-purple-800">
            View All <SafeIcon icon={FiArrowRight} className="ml-2" />
          </Link>
        </div>
        <KdramaGrid />
      </div>

      {/* Handpicked Stories */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col mb-8">
          <div className="flex items-center space-x-2 mb-2">
            <SafeIcon icon={FiStar} className="text-purple-600 text-xl" />
            <span className="text-purple-600 font-bold uppercase tracking-widest text-sm">Editor's Picks</span>
          </div>
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-serif font-bold text-gray-900">Handpicked for You</h2>
            <Link to="/" className="text-purple-600 font-bold flex items-center hover:text-purple-800">
              Browse All <SafeIcon icon={FiArrowRight} className="ml-2" />
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredPosts.map((post, index) => (
            <BlogCard key={post.id} post={post} index={index} />
          ))}
        </div>

        {/* Community CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-24 bg-purple-900 rounded-[2.5rem] overflow-hidden relative text-center py-20 px-6"
        >
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="relative z-10 max-w-2xl mx-auto">
            <div ref={footerVideoRef} className="w-24 h-24 bg-purple-600 rounded-2xl overflow-hidden flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-900/50 rotate-3 border-4 border-purple-500">
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