import React, { useMemo, useRef } from 'react';
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
import { KDRAMA_PLACEHOLDER } from '../config/assets';

const { FiTv, FiArrowRight, FiCalendar, FiStar, FiHeart } = FiIcons;

const Home = () => {
  // Keep current functionality: only published posts
  const { publishedPosts: posts } = useBlog();

  // Lazy load ref for footer video (performance)
  const footerVideoRef = useRef(null);
  const isFooterInView = useInView(footerVideoRef, { once: true, margin: "200px" });

  // Featured Posts: Prioritize handpicked, fallback to most recent
  const featuredPosts = useMemo(() => {
    if (!posts || posts.length === 0) return [];

    const getPostTime = (p) => new Date(p?.date || p?.published_at || p?.created_at || 0).getTime();
    const isHandpicked = (p) =>
      p?.isHandPicked === true ||
      p?.ishandpicked === 1 || p?.ishandpicked === true ||
      p?.is_hand_picked === 1 || p?.is_hand_picked === true;

    let selection = posts.filter(isHandpicked);
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

  // Keep the original Zip (4) “Currently Watching” card content + image vibe
  const currentKDrama = {
    title: "Would You Marry Me?",
    episode: "Choi Woo Sik",
    status: "Rewatching",
    image: "https://images.unsplash.com/photo-1634152962476-4b8a00e1915c?w=600&h=800&fit=crop",
    description: "The chemistry is unmatched! Choi Woo Sik's performance is pure gold. ❤️",
    year: "2024"
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/50 via-white to-purple-50 pb-24">
      {/* Hero Section */}
      <div className="relative pt-20 pb-28 overflow-hidden">
        {/* Background Blobs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-200/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-pink-200/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Hero Intro */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-14"
          >
            <span className="inline-block py-2 px-6 rounded-full bg-purple-100 text-purple-700 font-semibold text-sm mb-6">
              💜 Welcome to the chaos &amp; charm
            </span>

            <h1 className="text-5xl md:text-6xl font-serif font-bold text-gray-900 mb-6 leading-[1.05]">
              <span className="block">
                <span className="text-gray-900">Life</span>
                <span className="text-purple-600">,</span>{" "}
                <span className="bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                  Love
                </span>
                <span className="text-purple-600">,</span>
              </span>

              <span className="block mt-2">
                <span className="text-gray-900">and a</span>{" "}
                <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-purple-700 bg-clip-text text-transparent font-extrabold tracking-tight">
                  Little Bit of BTS
                </span>
              </span>
            </h1>

            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              A cozy corner for moms navigating parenting, wellness, and the joy of K-culture. Grab a coffee (or tea) and stay a while.
            </p>
          </motion.div>

          {/* Bento Grid */}
          <div className="relative z-20 -mb-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:h-[520px]">
              {/* Featured Story Video Card (LEFT) */}
              {mostRecentPost ? (
                <motion.div
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="lg:col-span-2 bg-black rounded-3xl shadow-xl relative overflow-hidden group border border-purple-200/40"
                >
                  <video
                    src="https://www.dropbox.com/scl/fi/kk5lebnsgklculhx1pdo8/cherry-blossom-laptop-moment.mp4?rlkey=1df4lj7n7f5mn5p4ppwbfg1aj&st=ym2k2ouz&raw=1"
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="auto"
                    className="absolute inset-0 w-full h-full object-cover transform scale-105 group-hover:scale-110 transition-transform duration-1000"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

                  <div className="absolute bottom-0 left-0 right-0 p-8 md:p-10 text-white">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold">
                        Latest Story
                      </span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold">
                        <SafeIcon icon={FiCalendar} className="mr-2" />
                        {formatDate(mostRecentPost.date || mostRecentPost.published_at || mostRecentPost.created_at)}
                      </span>
                    </div>

                    <Link to={`/post/${mostRecentPost.id}`} className="block">
                      <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4 leading-tight hover:text-purple-200 transition-colors">
                        {mostRecentPost.title}
                      </h2>
                    </Link>

                    <p className="text-gray-200 line-clamp-2 max-w-xl mb-6 text-lg opacity-90">
                      {stripHtml(mostRecentPost.content)}
                    </p>

                    <Link
                      to={`/post/${mostRecentPost.id}`}
                      className="inline-flex items-center font-bold text-white border-b-2 border-white/50 hover:border-white transition-all pb-1"
                    >
                      Read full story <SafeIcon icon={FiArrowRight} className="ml-2" />
                    </Link>
                  </div>
                </motion.div>
              ) : (
                <div className="lg:col-span-2 bg-purple-100 rounded-3xl h-[400px] lg:h-full animate-pulse" />
              )}

              {/* RIGHT COLUMN STACK */}
              <div className="flex flex-col gap-6 lg:h-full">
                {/* Currently Watching Card */}
                <motion.div
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="flex-1 bg-white rounded-3xl overflow-hidden shadow-lg border border-purple-100 flex flex-col"
                >
                  <div className="relative h-40 lg:h-48">
                    <SafeImage
                      src={currentKDrama.image}
                      alt={currentKDrama.title}
                      fallback={KDRAMA_PLACEHOLDER}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute top-4 left-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-purple-600 text-white text-[10px] font-bold uppercase tracking-widest">
                        <SafeIcon icon={FiTv} className="mr-2" /> {currentKDrama.status}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-xl font-serif font-bold text-gray-900 mb-2">{currentKDrama.title}</h3>
                    <p className="text-gray-600 italic leading-relaxed text-sm flex-1">
                      "{currentKDrama.description}"
                    </p>
                    <Link
                      to="/kdrama-recommendations"
                      className="mt-4 inline-flex items-center text-xs text-purple-700 font-bold hover:text-purple-900 transition-colors"
                    >
                      All Recs <SafeIcon icon={FiArrowRight} className="ml-2" />
                    </Link>
                  </div>
                </motion.div>

                {/* Spotify embed card */}
                <motion.div 
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="flex-1 bg-black rounded-3xl shadow-lg relative overflow-hidden border border-purple-500/30 min-h-[240px]"
                >
                  <iframe
                    src="https://open.spotify.com/embed/playlist/484z3UpLGXc4qzy0IvVRQ7?utm_source=generator&theme=0"
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                    title="My Bangtan Faves Playlist"
                    className="absolute inset-0 w-full h-full"
                  ></iframe>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Latest Stories Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">Latest Stories</h2>
            <p className="text-gray-600">Fresh reflections on motherhood and Army life.</p>
          </div>
          <Link
            to="/blog"
            className="mt-6 md:mt-0 font-bold text-purple-600 hover:text-purple-800 flex items-center"
          >
            View All Stories <SafeIcon icon={FiArrowRight} className="ml-2" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts && posts.slice(0, 6).map((post, index) => (
            <BlogCard key={post.id} post={post} index={index} />
          ))}
        </div>
      </div>

      {/* Must-Watch KDrama Section */}
      <div className="bg-white py-24 border-y border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-4xl font-serif font-bold text-gray-900 mb-4">Must-Watch Shows</h2>
            <p className="text-gray-600 text-lg">My personal emotional rollercoasters.</p>
          </div>
          <KdramaGrid />
        </div>
      </div>

      {/* Featured Stories (Editor's Picks) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="flex items-center gap-3 mb-10">
          <SafeIcon icon={FiStar} className="text-purple-600 text-2xl" />
          <h2 className="text-3xl font-serif font-bold text-gray-900">Editor's Picks</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredPosts.map((post, index) => (
            <BlogCard key={post.id} post={post} index={index} />
          ))}
        </div>

        {/* Join CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-28 bg-purple-900 rounded-[3rem] p-10 md:p-20 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
          <div className="relative z-10 max-w-2xl mx-auto">
            <div
              ref={footerVideoRef}
              className="w-24 h-24 bg-purple-600 rounded-2xl overflow-hidden flex items-center justify-center mx-auto mb-8 shadow-2xl rotate-3 border-4 border-purple-500"
            >
              {isFooterInView && (
                <video
                  src="https://www.dropbox.com/scl/fi/bwhvn1l1m8iqnzigvy1hk/flashing-heart-logo-animation.mp4?rlkey=cmkbvlrh57ptba6odd4qo6dwr&st=rwkkrpwt&raw=1"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover transform scale-110"
                />
              )}
            </div>

            <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-6">
              Join the Community
            </h2>

            <p className="text-purple-100 text-lg mb-10">
              Get cozy reflections and recs sent to your inbox.
            </p>

            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Email address"
                className="flex-1 px-6 py-4 rounded-full bg-white/10 border border-white/20 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              <button className="px-8 py-4 bg-purple-500 hover:bg-purple-400 text-white font-bold rounded-full transition-all">
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