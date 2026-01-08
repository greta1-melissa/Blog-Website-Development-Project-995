import React, { useMemo, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useBlog } from '../contexts/BlogContext';
import KdramaGrid from '../components/KdramaGrid';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import SafeImage from '../common/SafeImage';
import { stripHtml } from '../utils/textUtils';
import { formatDate } from '../utils/dateUtils';
import { KDRAMA_PLACEHOLDER } from '../config/assets';

const { FiTv, FiArrowRight, FiStar, FiCoffee, FiBookOpen, FiMoon, FiShoppingBag, FiHeart, FiZap, FiCheck, FiShoppingTag } = FiIcons;

const DEFAULT_PRODUCTS = [
  {
    id: 'sample-1',
    title: "Laneige Lip Sleeping Mask",
    content: "The ultimate K-Beauty staple. I put this on every night and wake up with the softest lips. It's that tiny ritual of luxury that makes the evening feel complete.",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?w=800&fit=crop",
    subcategory: "Skincare",
    price: "$24.00"
  },
  {
    id: 'sample-2',
    title: "BTS 'Proof' Anthology Album",
    content: "More than just music, it's a history of growth. This anthology sits on my shelf as a constant reminder to keep pursuing my own 'Proof' of happiness.",
    image: "https://images.unsplash.com/photo-1619983081563-430f63602796?w=800&fit=crop",
    subcategory: "Music",
    price: "$65.00"
  },
  {
    id: 'sample-3',
    title: "Breville Bambino Plus",
    content: "My morning savior. It makes the perfect micro-foam for my lattes, making my 5 AM 'ritual' feel like a high-end cafe experience.",
    image: "https://images.unsplash.com/photo-1510972527921-ce03766a1cf1?w=800&fit=crop",
    subcategory: "Home Cafe",
    price: "$499.00"
  }
];

const Home = () => {
  const { publishedPosts: posts } = useBlog();
  const footerVideoRef = useRef(null);
  const isFooterInView = useInView(footerVideoRef, { once: true, margin: "200px" });

  const latestStories = useMemo(() => {
    return posts.filter(p => p.category !== 'Product Recommendations').slice(0, 4);
  }, [posts]);

  const productRecs = useMemo(() => {
    const dbRecs = posts.filter(p => p.category === 'Product Recommendations').slice(0, 3);
    return dbRecs.length > 0 ? dbRecs : DEFAULT_PRODUCTS;
  }, [posts]);

  const meTimeRituals = [
    {
      title: "The Coffee Ritual",
      desc: "5 minutes of silence with a hot latte before the house wakes up.",
      icon: FiCoffee,
      color: "bg-orange-100 text-orange-600",
      image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&fit=crop"
    },
    {
      title: "Evening Skincare",
      desc: "Washing off the day and layering on the calm. My non-negotiable ten minutes.",
      icon: FiMoon,
      color: "bg-blue-100 text-blue-600",
      image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&fit=crop"
    },
    {
      title: "Mindful Reading",
      desc: "Getting lost in a story that isn't mine for just a few chapters.",
      icon: FiBookOpen,
      color: "bg-emerald-100 text-emerald-600",
      image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&fit=crop"
    }
  ];

  return (
    <div className="min-h-screen bg-white pb-24 font-sans">
      {/* 1. HERO SECTION - Deepened light purple */}
      <div className="relative pt-20 pb-28 overflow-hidden bg-purple-100/50">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-200/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-pink-200/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto mb-14"
          >
            <span className="inline-block py-2 px-6 rounded-full bg-purple-200/60 text-purple-800 font-bold text-sm mb-6 shadow-sm">
              💜 Welcome to the chaos &amp; charm
            </span>
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-gray-900 mb-6 leading-[1.05]">
              <span className="block">Life, Love,</span>
              <span className="block mt-2 bg-gradient-to-r from-purple-600 via-pink-500 to-purple-700 bg-clip-text text-transparent font-extrabold tracking-tight">
                and a Little Bit of BTS
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              A cozy corner for moms navigating motherhood with a little bit of chaos, a lot of love, and the perfect K-Pop playlist.
            </p>
          </motion.div>

          {/* BENTO SECTION */}
          <div className="relative z-20 mb-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:h-[600px]">
              <motion.div
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
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
                  <Link to="/blog" className="inline-flex items-center font-bold text-white border-b-2 border-white/50 hover:border-white transition-all pb-1 text-sm uppercase tracking-widest">
                    Read Story <SafeIcon icon={FiArrowRight} className="ml-2" />
                  </Link>
                </div>
              </motion.div>

              <div className="flex flex-col gap-6 lg:h-full">
                <motion.div
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex-1 bg-white rounded-3xl overflow-hidden shadow-lg border border-purple-100 flex flex-col"
                >
                  <div className="relative h-40 lg:h-48">
                    <SafeImage src="https://images.unsplash.com/photo-1634152962476-4b8a00e1915c?w=600&h=800&fit=crop" className="w-full h-full object-cover" />
                    <div className="absolute top-4 left-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-purple-600 text-white text-[10px] font-bold uppercase tracking-widest">
                        <SafeIcon icon={FiTv} className="mr-2" /> Rewatching
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-serif font-bold text-gray-900 mb-2">Our Beloved Summer</h3>
                    <p className="text-gray-600 italic text-sm leading-relaxed">"The chemistry is unmatched! Choi Woo Sik's performance is pure gold."</p>
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

      {/* PERSONAL RITUALS - Deepened purple-100 */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center mb-20">
            <div className="p-3 bg-pink-50 rounded-2xl mb-4">
              <SafeIcon icon={FiHeart} className="text-3xl text-pink-500" />
            </div>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6">Small Joys: Self-Care & Me Time</h2>
            <p className="text-xl text-gray-500 max-w-2xl leading-relaxed">Carving out quiet moments in the beautiful chaos.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {meTimeRituals.map((ritual, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="relative group"
              >
                <div className={`absolute -inset-4 ${index % 2 === 0 ? 'bg-purple-100/60' : 'bg-pink-100/60'} rounded-[3rem] -rotate-2 group-hover:rotate-0 transition-transform duration-500`} />
                <div className="relative bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                  <div className="aspect-square rounded-3xl overflow-hidden mb-8">
                    <SafeImage src={ritual.image} className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700" />
                  </div>
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg ${ritual.color}`}>
                    <SafeIcon icon={ritual.icon} className="text-2xl" />
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-gray-900 mb-4">{ritual.title}</h3>
                  <p className="text-gray-600 leading-relaxed text-sm">{ritual.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* LATEST STORIES - Deepened purple-100 */}
      <section className="py-24 bg-purple-100/40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-16 px-4">
            <div className="max-w-lg">
              <span className="text-purple-700 font-bold uppercase tracking-widest text-xs mb-2 block font-sans">The Journal</span>
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900">Latest Stories</h2>
            </div>
            <Link to="/blog" className="hidden md:flex items-center gap-2 text-purple-700 font-bold hover:gap-4 transition-all">
              View Journal <SafeIcon icon={FiArrowRight} />
            </Link>
          </div>

          <div className="space-y-4">
            {latestStories.map((post) => (
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
                  <div className="flex items-center justify-center md:justify-start gap-4 mb-3 text-[10px] font-bold uppercase tracking-widest text-purple-600 group-hover:text-purple-200">
                    <span>{post.category}</span>
                    <span className="w-1 h-1 bg-current rounded-full" />
                    <span>{formatDate(post.date)}</span>
                  </div>
                  <Link to={`/post/${post.id}`}>
                    <h3 className="text-2xl font-serif font-bold text-gray-900 group-hover:text-white mb-3 transition-colors">
                      {post.title}
                    </h3>
                  </Link>
                  <p className="text-gray-500 group-hover:text-purple-100 line-clamp-2 text-sm leading-relaxed transition-colors">
                    {stripHtml(post.content)}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <Link to={`/post/${post.id}`} className="w-14 h-14 rounded-full border border-purple-200 flex items-center justify-center text-purple-600 group-hover:bg-white group-hover:text-purple-900 transition-all">
                    <SafeIcon icon={FiArrowRight} className="text-xl" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* MUST-WATCH SHOWS */}
      <section className="py-28 bg-gray-950 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white to-transparent opacity-5" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-md rounded-full border border-white/10 mb-6">
              <SafeIcon icon={FiZap} className="text-yellow-400" />
              <span className="text-xs font-bold uppercase tracking-widest">The Watchlist</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-serif font-bold mb-6">Must-Watch Shows</h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">Handpicked emotional rollercoasters and swoon-worthy stories.</p>
          </div>
          <KdramaGrid />
        </div>
      </section>

      {/* 6. PRODUCT RECOMMENDATIONS - EDITORIAL ASYMMETRIC GRID */}
      <section className="py-32 bg-white relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full opacity-[0.03] pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
                <path d="M 100 0 L 0 0 0 100" fill="none" stroke="currentColor" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row items-baseline justify-between mb-24">
            <div className="max-w-2xl">
              <span className="flex items-center gap-2 text-purple-700 font-black uppercase tracking-[0.2em] text-[10px] mb-6">
                <SafeIcon icon={FiShoppingTag} /> Curated Picks
              </span>
              <h2 className="text-5xl md:text-7xl font-serif font-bold text-gray-900 leading-none">
                Melissa's <br/> <span className="text-purple-200">Essentials.</span>
              </h2>
            </div>
            <p className="mt-8 md:mt-0 text-gray-400 text-sm max-w-[280px] leading-relaxed uppercase tracking-widest font-bold">
              Items I use daily to keep the magic alive at home.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-20 lg:gap-x-12 items-center">
            {/* Feature 1 - Large Left */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-7 group relative"
            >
              <div className="relative aspect-[16/10] rounded-[3rem] overflow-hidden bg-purple-100/40 border-[1.5rem] border-purple-100/40 shadow-2xl">
                <SafeImage src={productRecs[0].image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-500" />
              </div>
              <div className="mt-10 lg:absolute lg:bottom-12 lg:-right-12 lg:mt-0 max-w-sm bg-white p-10 rounded-[2.5rem] shadow-2xl border border-purple-50">
                <span className="text-[10px] font-black uppercase tracking-widest text-purple-600 mb-2 block">{productRecs[0].subcategory}</span>
                <h3 className="text-3xl font-serif font-bold text-gray-900 mb-4">{productRecs[0].title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 mb-6 font-sans">{stripHtml(productRecs[0].content)}</p>
                <Link to={`/post/${productRecs[0].id}`} className="inline-flex items-center text-sm font-bold text-purple-700 hover:gap-3 transition-all">
                  Full Review <SafeIcon icon={FiArrowRight} className="ml-2" />
                </Link>
              </div>
            </motion.div>

            {/* Feature 2 - Stacked Right */}
            <div className="lg:col-span-5 space-y-24">
              {productRecs.slice(1).map((product, idx) => (
                <motion.div 
                  key={product.id}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.2 }}
                  className="flex flex-col md:flex-row lg:flex-col gap-8 group"
                >
                  <div className="w-full md:w-1/2 lg:w-full aspect-square rounded-[2rem] overflow-hidden bg-pink-100/40 border-[1rem] border-pink-100/40 shadow-xl">
                    <SafeImage src={product.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  </div>
                  <div className="flex-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-pink-600 mb-2 block">{product.subcategory}</span>
                    <h3 className="text-2xl font-serif font-bold text-gray-900 mb-3">{product.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-4">{stripHtml(product.content)}</p>
                    <Link to={`/post/${product.id}`} className="text-sm font-bold border-b border-gray-200 hover:border-purple-600 transition-colors pb-1">
                      View Details
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* JOIN THE COMMUNITY */}
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
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">Join the Community</h2>
            <p className="text-purple-100 text-lg mb-10">Get cozy reflections and recs sent to your inbox.</p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="Email address" className="flex-1 px-8 py-4 rounded-full bg-white/10 border border-white/20 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400" />
              <button className="px-10 py-4 bg-purple-500 hover:bg-purple-400 text-white font-bold rounded-full transition-all shadow-lg">Subscribe</button>
            </form>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default Home;