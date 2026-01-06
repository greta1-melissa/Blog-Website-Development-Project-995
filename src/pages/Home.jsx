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
import { ANIMATED_LOGO_VIDEO_URL, FEATURED_STORY_VIDEO_URL } from '../config/assets';

const { FiTv, FiArrowRight, FiCalendar, FiStar, FiHeart } = FiIcons;

const Home = () => {
  const { publishedPosts: posts } = useBlog();
  const footerVideoRef = useRef(null);
  const isFooterInView = useInView(footerVideoRef, { once: true, margin: "200px" });

  const featuredPosts = useMemo(() => {
    if (!posts || posts.length === 0) return [];

    const getPostTime = (p) => new Date(p?.date || p?.published_at || p?.created_at || 0).getTime();

    // Accept multiple possible "handpicked" flags (boolean, number, different keys)
    let selection = posts.filter(p =>
      p?.isHandPicked === true ||
      p?.ishandpicked === 1 ||
      p?.ishandpicked === true ||
      p?.is_hand_picked === 1 ||
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

  const mostRecentPost = useMemo(() => {
    if (!posts || posts.length === 0) return null;
    const getPostTime = (p) => new Date(p?.date || p?.published_at || p?.created_at || 0).getTime();
    return [...posts].sort((a, b) => getPostTime(b) - getPostTime(a))[0];
  }, [posts]);

  const currentKDrama = {
    title: "Would You Marry Me?",
    episode: "Choi Woo Sik",
    status: "Rewatching",
    image: "https://images.unsplash.com/photo-1634152962476-4b8a00e1915c?w=600&h=800&fit=crop",
    description: "The chemistry is unmatched! Choi Woo Sik's performance is pure gold. ❤️",
    year: "2024"
  };

  const currentDramaImg = getImageSrc(currentKDrama.image);

  return (
    <div className="min-h-screen pb-20 bg-primary-50">
      {/* Hero Section */}
      <div className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-100 rounded-full opacity-60 blur-3xl"></div>
          <div className="absolute top-1/2 -right-24 w-96 h-96 bg-pink-100 rounded-full opacity-60 blur-3xl"></div>
          <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-blue-100 rounded-full opacity-50 blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <span className="inline-block py-2 px-6 rounded-full bg-purple-100 text-purple-800 font-medium text-sm mb-6">
              ARMY Mom • K-Drama Lover • Work From Home Life
            </span>
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-gray-900 mb-6 leading-tight">
              Welcome to <span className="text-purple-700">Bangtan Mom</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              A cozy corner for heartfelt stories, K-drama recommendations, and the beautiful chaos of being a mom.
            </p>
          </motion.div>

          {/* Bento Grid Hero Area */}
          <div className="relative z-20 mb-24">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:h-[500px]">
              {mostRecentPost ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="lg:col-span-2 group relative rounded-3xl overflow-hidden shadow-xl bg-white h-[400px] lg:h-full border border-purple-100"
                >
                  <video
                    src={FEATURED_STORY_VIDEO_URL}
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="auto"
                    className="absolute inset-0 w-full h-full object-cover transform scale-105 group-hover:scale-110 transition-transform duration-1000"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-purple-900/90 via-purple-900/40 to-transparent opacity-90"></div>

                  <div className="absolute bottom-0 left-0 right-0 p-8 md:p-10">
                    <div className="flex items-center space-x-3 mb-4">
                      <span className="flex items-center text-purple-100 text-sm font-medium bg-purple-900/30 px-2 py-0.5 rounded-md backdrop-blur-sm">
                        <SafeIcon icon={FiCalendar} className="mr-2" /> {formatDate(mostRecentPost.date || mostRecentPost.published_at || mostRecentPost.created_at)}
                      </span>
                      <span className="flex items-center text-purple-100 text-sm font-medium bg-purple-900/30 px-2 py-0.5 rounded-md backdrop-blur-sm">
                        <SafeIcon icon={FiHeart} className="mr-2" /> Featured Story
                      </span>
                    </div>

                    <Link to={`/post/${mostRecentPost.id}`} className="block">
                      <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4 leading-tight group-hover:text-purple-200 transition-colors drop-shadow-sm">
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
                      Read the full story <SafeIcon icon={FiArrowRight} className="ml-2" />
                    </Link>
                  </div>
                </motion.div>
              ) : (
                <div className="lg:col-span-2 rounded-3xl overflow-hidden shadow-xl bg-white h-[400px] lg:h-full border border-purple-100" />
              )}

              {/* Current KDrama Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white rounded-3xl overflow-hidden shadow-lg border border-purple-100 h-[400px] lg:h-full flex flex-col"
              >
                <div className="relative h-48 lg:h-56 overflow-hidden">
                  <img
                    src={currentDramaImg}
                    alt={currentKDrama.title}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>

                  <div className="absolute bottom-4 left-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-purple-600 text-white text-sm font-medium">
                      <SafeIcon icon={FiTv} className="mr-2" /> {currentKDrama.status}
                    </span>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-serif font-bold text-gray-900 mb-1">{currentKDrama.title}</h3>
                  <p className="text-sm text-purple-600 font-medium mb-4">{currentKDrama.year}</p>
                  <p className="text-gray-600 flex-1 italic">"{currentKDrama.description}"</p>

                  <Link
                    to="/kdrama-recommendations"
                    className="mt-6 inline-flex items-center text-purple-700 font-bold hover:text-purple-900 transition-colors"
                  >
                    View Recommendations <SafeIcon icon={FiArrowRight} className="ml-2" />
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Latest Stories */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">Latest Stories</h2>
            <p className="text-gray-600 max-w-xl">
              Fresh reflections on motherhood, ARMY life, and the little moments that make it all worthwhile.
            </p>
          </div>

          <Link
            to="/blog"
            className="mt-6 md:mt-0 inline-flex items-center px-6 py-3 bg-white border border-purple-200 text-purple-700 font-bold rounded-full hover:bg-purple-50 transition-all"
          >
            View All Posts <SafeIcon icon={FiArrowRight} className="ml-2" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
          {posts && posts.slice(0, 6).map((post, index) => (
            <BlogCard key={post.id} post={post} index={index} />
          ))}
        </div>
      </div>

      {/* KDrama Recommendations */}
      <div className="bg-gradient-to-b from-white to-purple-50 py-20 mb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <span className="inline-block py-2 px-6 rounded-full bg-purple-100 text-purple-800 font-medium text-sm mb-6">
              K-Drama Recommendations
            </span>

            <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6">
              Must-Watch Shows
            </h2>

            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              As a K-drama-loving ARMY mom, these are the shows I recommend to anyone looking for their next emotional rollercoaster.
            </p>
          </motion.div>

          <KdramaGrid />

          <div className="text-center mt-12">
            <Link
              to="/kdrama-recommendations"
              className="inline-flex items-center px-8 py-3 bg-white border border-purple-200 text-purple-700 font-bold rounded-full hover:bg-purple-50 transition-all"
            >
              View All Recommendations <SafeIcon icon={FiArrowRight} className="ml-2" />
            </Link>
          </div>
        </div>
      </div>

      {/* Featured Stories */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <SafeIcon icon={FiStar} className="text-purple-600 text-xl" />
              <span className="text-purple-600 font-bold uppercase tracking-widest text-sm">Editor's Picks</span>
            </div>
            <h2 className="text-3xl font-serif font-bold text-gray-900">Featured Stories</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
          {featuredPosts.map((post, index) => (
            <BlogCard key={post.id} post={post} index={index} />
          ))}
        </div>

        {/* Join CTA */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-24 bg-purple-900 rounded-[2.5rem] overflow-hidden relative text-center py-20 px-6"
        >
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>

          <div className="relative z-10 max-w-2xl mx-auto">
            <div
              ref={footerVideoRef}
              className="w-24 h-24 bg-purple-600 rounded-2xl overflow-hidden flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-900/50 rotate-3 border-4 border-purple-500"
            >
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

            <p className="text-purple-100 mb-8 text-lg">
              Get new posts, cozy reflections, and K-drama recs sent straight to your inbox.
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