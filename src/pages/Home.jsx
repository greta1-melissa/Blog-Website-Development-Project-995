import React, { useMemo, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useBlog } from '../contexts/BlogContext';
import KdramaGrid from '../components/KdramaGrid';
import ProductCard from '../components/ProductCard';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import SafeImage from '../common/SafeImage';
import { stripHtml } from '../utils/textUtils';
import { formatDate } from '../utils/dateUtils';
import { KDRAMA_PLACEHOLDER } from '../config/assets';

const { FiTv, FiArrowRight, FiCalendar, FiStar, FiCoffee, FiBookOpen, FiSun, FiMoon, FiShoppingBag, FiHeart, FiZap, FiCheck } = FiIcons;

const Home = () => {
  const { publishedPosts: posts } = useBlog();
  const footerVideoRef = useRef(null);
  const isFooterInView = useInView(footerVideoRef, { once: true, margin: "200px" });

  const latestStories = useMemo(() => {
    return posts.filter(p => p.category !== 'Product Recommendations').slice(0, 4);
  }, [posts]);

  const productRecs = useMemo(() => {
    return posts.filter(p => p.category === 'Product Recommendations').slice(0, 3);
  }, [posts]);

  const meTimeRituals = [
    {
      title: "The Coffee Ritual",
      desc: "5 minutes of silence with a hot latte before the house wakes up. It's not just caffeine; it's a reset for my soul.",
      icon: FiCoffee,
      color: "bg-orange-100 text-orange-600",
      image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&fit=crop"
    },
    {
      title: "Evening Skincare",
      desc: "Washing off the day and layering on the calm. My non-negotiable ten minutes of peace after the kids are asleep.",
      icon: FiMoon,
      color: "bg-blue-100 text-blue-600",
      image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&fit=crop"
    },
    {
      title: "Mindful Reading",
      desc: "Getting lost in a story that isn't mine for just a few chapters. A daily escape into other worlds.",
      icon: FiBookOpen,
      color: "bg-emerald-100 text-emerald-600",
      image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&fit=crop"
    }
  ];

  const currentKDrama = {
    title: "Would You Marry Me?",
    episode: "Choi Woo Sik",
    status: "Rewatching",
    image: "https://images.unsplash.com/photo-1634152962476-4b8a00e1915c?w=600&h=800&fit=crop",
    description: "The chemistry is unmatched! Choi Woo Sik's performance is pure gold. ❤️",
  };

  return (
    <div className="min-h-screen bg-white pb-24 font-sans">
      {/* 1. HERO SECTION (Unchanged) */}
      <div className="relative pt-20 pb-28 overflow-hidden bg-purple-50/50">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-200/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-pink-200/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-14"
          >
            <span className="inline-block py-2 px-6 rounded-full bg-purple-100 text-purple-700 font-bold text-sm mb-6">
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

            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed font-sans">
              A cozy corner for moms navigating motherhood with a little bit of chaos, a lot of love, and the perfect K-Pop playlist. Grab a coffee and stay a while.
            </p>
          </motion.div>

          {/* 2. BENTO SECTION (Unchanged) */}
          <div className="relative z-20 mb-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:h-[600px]">
              <motion.div
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="lg:col-span-2 bg-black rounded-3xl shadow-xl relative overflow-hidden group border border-purple-200/40"
              >
                <video
                  src="https://www.dropbox.com/scl/fi/kk5lebnsgklculhx1pdo8/cherry-blossom-laptop-moment.mp4?rlkey=1df4lj7n7f5mn5p4ppwbfg1aj&st=ym2k2ouz&raw=1"
                  autoPlay loop muted playsInline preload="auto"
                  className="absolute inset-0 w-full h-full object-cover transform scale-105 group-hover:scale-110 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-10 text-white">
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold mb-4">Latest Story</span>
                  <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4 leading-tight text-white">Finding Your Own Magic Shop</h2>
                  <Link to="/blog" className="inline-flex items-center font-bold text-white border-b-2 border-white/50 hover:border-white transition-all pb-1">
                    Read full story <SafeIcon icon={FiArrowRight} className="ml-2" />
                  </Link>
                </div>
              </motion.div>

              <div className="flex flex-col gap-6 lg:h-full">
                <motion.div
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="flex-1 bg-white rounded-3xl overflow-hidden shadow-lg border border-purple-100 flex flex-col"
                >
                  <div className="relative h-40 lg:h-48">
                    <SafeImage src={currentKDrama.image} alt={currentKDrama.title} fallback={KDRAMA_PLACEHOLDER} className="w-full h-full object-cover" />
                    <div className="absolute top-4 left-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-purple-600 text-white text-[10px] font-bold uppercase tracking-widest">
                        <SafeIcon icon={FiTv} className="mr-2" /> {currentKDrama.status}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-serif font-bold text-gray-900 mb-2">{currentKDrama.title}</h3>
                    <p className="text-gray-600 italic text-sm leading-relaxed font-sans">"{currentKDrama.description}"</p>
                  </div>
                </motion.div>
                <div className="bg-black rounded-3xl shadow-lg overflow-hidden border border-purple-500/30 h-[260px]">
                  <iframe src="https://open.spotify.com/embed/playlist/484z3UpLGXc4qzy0IvVRQ7?utm_source=generator&theme=1" width="100%" height="100%" frameBorder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" title="Playlist" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. PERSONAL RITUALS (Floating Gallery Style) */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center mb-20">
            <div className="p-3 bg-pink-50 rounded-2xl mb-4">
              <SafeIcon icon={FiHeart} className="text-3xl text-pink-500" />
            </div>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6 font-serif">Small Joys: Self-Care & Me Time</h2>
            <p className="text-xl text-gray-500 max-w-2xl leading-relaxed font-sans">Carving out quiet moments in the beautiful chaos.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {meTimeRituals.map((ritual, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative group"
              >
                <div className={`absolute -inset-4 ${index % 2 === 0 ? 'bg-purple-50' : 'bg-pink-50'} rounded-[3rem] -rotate-2 group-hover:rotate-0 transition-transform duration-500`} />
                <div className="relative bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                  <div className="aspect-square rounded-3xl overflow-hidden mb-8 shadow-inner">
                    <SafeImage src={ritual.image} className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700" />
                  </div>
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg ${ritual.color}`}>
                    <SafeIcon icon={ritual.icon} className="text-2xl" />
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-gray-900 mb-4 font-serif">{ritual.title}</h3>
                  <p className="text-gray-600 leading-relaxed text-sm font-sans">{ritual.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. LATEST STORIES (Editorial List Style) */}
      <section className="py-24 bg-purple-50/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-16 px-4">
            <div className="max-w-lg">
              <span className="text-purple-600 font-bold uppercase tracking-widest text-xs mb-2 block font-sans">The Journal</span>
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 font-serif">Latest Stories</h2>
            </div>
            <Link to="/blog" className="hidden md:flex items-center gap-2 text-purple-600 font-bold hover:gap-4 transition-all font-sans">
              View Journal <SafeIcon icon={FiArrowRight} />
            </Link>
          </div>

          <div className="space-y-4">
            {latestStories.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="group bg-white hover:bg-purple-900 rounded-[2rem] p-6 transition-all duration-500 flex flex-col md:flex-row items-center gap-8 shadow-sm hover:shadow-2xl hover:-translate-y-1"
              >
                <div className="w-full md:w-56 h-40 rounded-2xl overflow-hidden flex-shrink-0 bg-gray-100">
                  <SafeImage src={post.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-4 mb-3 text-[10px] font-bold uppercase tracking-widest text-purple-600 group-hover:text-purple-200 font-sans">
                    <span>{post.category}</span>
                    <span className="w-1 h-1 bg-current rounded-full" />
                    <span>{formatDate(post.date)}</span>
                  </div>
                  <Link to={`/post/${post.id}`}>
                    <h3 className="text-2xl font-serif font-bold text-gray-900 group-hover:text-white mb-3 transition-colors font-serif">
                      {post.title}
                    </h3>
                  </Link>
                  <p className="text-gray-500 group-hover:text-purple-100 line-clamp-2 text-sm leading-relaxed transition-colors font-sans">
                    {stripHtml(post.content)}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <Link to={`/post/${post.id}`} className="w-14 h-14 rounded-full border border-purple-100 flex items-center justify-center text-purple-600 group-hover:bg-white group-hover:text-purple-900 transition-all">
                    <SafeIcon icon={FiArrowRight} className="text-xl" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. MUST-WATCH SHOWS (Cinema Night Style) */}
      <section className="py-28 bg-gray-950 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white to-transparent opacity-5" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-md rounded-full border border-white/10 mb-6 font-sans">
              <SafeIcon icon={FiZap} className="text-yellow-400" />
              <span className="text-xs font-bold uppercase tracking-widest text-white">The Watchlist</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-serif font-bold mb-6 font-serif text-white">Must-Watch Shows</h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto font-sans">Handpicked emotional rollercoasters and swoon-worthy stories.</p>
          </div>

          <div className="relative">
            <div className="cinema-grid-wrapper">
              <KdramaGrid />
            </div>
            <div className="mt-20 flex justify-center">
              <Link to="/kdrama-recommendations" className="group flex items-center gap-4 px-10 py-4 bg-white text-black rounded-full font-bold hover:bg-purple-500 hover:text-white transition-all duration-300 font-sans">
                Explore Full Library
                <SafeIcon icon={FiArrowRight} className="group-hover:translate-x-2 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. NEW: PRODUCT RECOMMENDATIONS (Boutique Shelf Style) */}
      <section className="py-24 bg-orange-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
            <div className="max-w-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600">
                  <SafeIcon icon={FiShoppingBag} />
                </div>
                <span className="text-orange-600 font-bold uppercase tracking-widest text-xs font-sans">The Shop Edit</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 font-serif">Melissa's Faves</h2>
              <p className="text-gray-500 mt-4 text-lg font-sans">I only recommend what I actually use in my real life. No filler, just the good stuff.</p>
            </div>
            <Link to="/products" className="mt-6 md:mt-0 inline-flex items-center text-gray-900 font-bold border-b-2 border-orange-200 hover:border-orange-500 transition-all pb-1 font-sans">
              Browse All Picks <SafeIcon icon={FiArrowRight} className="ml-2" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {productRecs.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-orange-100 flex flex-col group"
              >
                <div className="relative aspect-[4/5] overflow-hidden">
                  <SafeImage src={product.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                  <div className="absolute top-6 left-6">
                    <span className="bg-white/90 backdrop-blur-md text-gray-900 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-sm flex items-center gap-1">
                      <SafeIcon icon={FiCheck} className="text-green-500" /> Verified Fave
                    </span>
                  </div>
                </div>
                <div className="p-8 flex flex-col flex-1">
                  <div className="flex items-center gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map(s => (
                      <SafeIcon key={s} icon={FiStar} className="text-orange-400 text-xs fill-current" />
                    ))}
                  </div>
                  <h3 className="text-xl font-serif font-bold text-gray-900 mb-4 group-hover:text-orange-600 transition-colors font-serif leading-tight">
                    {product.title}
                  </h3>
                  <p className="text-gray-500 text-sm line-clamp-2 mb-8 font-sans leading-relaxed">
                    {stripHtml(product.content)}
                  </p>
                  <Link to={`/post/${product.id}`} className="mt-auto inline-flex items-center justify-center w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-orange-600 transition-all font-sans shadow-lg shadow-gray-200">
                    Read Review
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. JOIN THE COMMUNITY (Unchanged) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-purple-900 rounded-[4rem] p-12 md:p-24 text-center relative overflow-hidden shadow-2xl"
        >
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
          <div className="relative z-10 max-w-2xl mx-auto">
            <div ref={footerVideoRef} className="w-24 h-24 bg-purple-600 rounded-3xl overflow-hidden flex items-center justify-center mx-auto mb-8 shadow-2xl rotate-3 border-4 border-purple-500">
              {isFooterInView && (
                <video
                  src="https://www.dropbox.com/scl/fi/bwhvn1l1m8iqnzigvy1hk/flashing-heart-logo-animation.mp4?rlkey=cmkbvlrh57ptba6odd4qo6dwr&st=rwkkrpwt&raw=1"
                  autoPlay loop muted playsInline className="w-full h-full object-cover transform scale-110"
                />
              )}
            </div>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6 font-serif">Join the Community</h2>
            <p className="text-purple-100 text-lg mb-10 font-sans">Get cozy reflections and recs sent to your inbox.</p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="Email address" className="flex-1 px-8 py-4 rounded-full bg-white/10 border border-white/20 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 font-sans" />
              <button className="px-10 py-4 bg-purple-500 hover:bg-purple-400 text-white font-bold rounded-full transition-all shadow-lg shadow-black/20 font-sans">Subscribe</button>
            </form>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default Home;