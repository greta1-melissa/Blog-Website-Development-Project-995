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
import { BLOG_PLACEHOLDER } from '../config/assets';

const { FiTv, FiArrowRight, FiHeart, FiShoppingTag, FiCoffee, FiBookOpen, FiMoon, FiZap, FiShoppingBag, FiClock } = FiIcons;

const RECOMMENDED_PRODUCTS = [
  {
    id: 'rec-1',
    title: "Laneige Lip Sleeping Mask",
    category: "Self-care",
    why: "The ultimate K-Beauty staple. I put this on every night and wake up with the softest lips. It's that tiny ritual of luxury that makes the evening feel complete.",
    bestFor: "Dry lips and overnight recovery",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?w=800&fit=crop",
    color: "bg-pink-50 text-pink-700"
  },
  {
    id: 'rec-2',
    title: "BT21 Koya Plushie",
    category: "BTS Mood",
    why: "Because sometimes you just need a sleepy blue koala on your desk to remind you to take a nap. It brings a smile to my face during long work calls.",
    bestFor: "Desk company and ARMY cozy vibes",
    image: "https://images.unsplash.com/photo-1559449182-2435534c034a?w=800&fit=crop",
    color: "bg-blue-50 text-blue-700"
  },
  {
    id: 'rec-3',
    title: "Ceramic Milk Frother",
    category: "Home Cafe",
    why: "My morning savior. It makes the perfect micro-foam for my lattes, making my 5 AM ritual feel like a high-end cafe experience.",
    bestFor: "Perfecting your morning latte art",
    image: "https://images.unsplash.com/photo-1510972527921-ce03766a1cf1?w=800&fit=crop",
    color: "bg-orange-50 text-orange-700"
  },
  {
    id: 'rec-4',
    title: "Kindle Paperwhite",
    category: "Mom Life",
    why: "Transitioning from blue light to e-ink has saved my sleep and my sanity. It's the best investment for a busy mom's brain during quiet hours.",
    bestFor: "Late night reading without the eye strain",
    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&fit=crop",
    color: "bg-purple-50 text-purple-700"
  },
  {
    id: 'rec-5',
    title: "Himalayan Salt Lamp",
    category: "Wellness",
    why: "The soft orange glow creates the perfect ambiance for my evening K-drama binges. It's instantly calming after a chaotic day.",
    bestFor: "Creating a cozy evening sanctuary",
    image: "https://images.unsplash.com/photo-1541123638424-3927515099b1?w=800&fit=crop",
    color: "bg-red-50 text-red-700"
  },
  {
    id: 'rec-6',
    title: "Lululemon Align Leggings",
    category: "Mom Uniform",
    why: "I rejected the hype for years until I finally put them on. They feel like a second skin during morning yoga or afternoon errands.",
    bestFor: "All-day comfort and stretch",
    image: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800&fit=crop",
    color: "bg-emerald-50 text-emerald-700"
  }
];

const Home = () => {
  const { publishedPosts: posts } = useBlog();

  const latestStories = useMemo(() => {
    return posts.filter(p => p.category !== 'Product Recommendations').slice(0, 4);
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
      {/* 1. HERO SECTION */}
      <div className="relative pt-20 pb-28 overflow-hidden bg-purple-100/50">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-200/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto mb-14">
            <span className="inline-block py-2 px-6 rounded-full bg-purple-200/60 text-purple-800 font-bold text-sm mb-6 shadow-sm">
              💜 Welcome to the magic shop
            </span>
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-gray-900 mb-6 leading-[1.05]">
              <span className="block">Life, Love,</span>
              <span className="block mt-2 bg-gradient-to-r from-purple-600 via-pink-500 to-purple-700 bg-clip-text text-transparent font-extrabold tracking-tight">
                and a Little Bit of BTS
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              A cozy corner for moms navigating motherhood with a little bit of chaos and a lot of love.
            </p>
          </motion.div>

          {/* BENTO SECTION */}
          <div className="relative z-20 mb-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:h-[600px]">
              <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2 bg-black rounded-3xl shadow-xl relative overflow-hidden group border border-purple-200/40">
                <video src="https://www.dropbox.com/scl/fi/kk5lebnsgklculhx1pdo8/cherry-blossom-laptop-moment.mp4?rlkey=1df4lj7n7f5mn5p4ppwbfg1aj&st=ym2k2ouz&raw=1" autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover transform scale-105 group-hover:scale-110 transition-transform duration-1000" />
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
                <div className="flex-1 bg-white rounded-3xl overflow-hidden shadow-lg border border-purple-100 flex flex-col">
                  <div className="relative h-40 lg:h-48">
                    <SafeImage src="https://images.unsplash.com/photo-1634152962476-4b8a00e1915c?w=600&h=800&fit=crop" className="w-full h-full object-cover" />
                    <div className="absolute top-4 left-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-purple-600 text-white text-[10px] font-bold uppercase tracking-widest">Rewatching</span>
                    </div>
                  </div>
                  <div className="p-6"><h3 className="text-xl font-serif font-bold text-gray-900 mb-2">Our Beloved Summer</h3></div>
                </div>
                <div className="bg-black rounded-3xl shadow-lg overflow-hidden border border-purple-500/30 h-[260px]">
                  <iframe src="https://open.spotify.com/embed/playlist/484z3UpLGXc4qzy0IvVRQ7?utm_source=generator&theme=1" width="100%" height="100%" frameBorder="0" loading="lazy" title="Playlist" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. RITUALS SECTION */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center mb-20">
            <div className="p-3 bg-pink-50 rounded-2xl mb-4"><SafeIcon icon={FiHeart} className="text-3xl text-pink-500" /></div>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6">Small Joys: Self-Care & Me Time</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {meTimeRituals.map((ritual, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="relative group">
                <div className={`absolute -inset-4 ${index % 2 === 0 ? 'bg-purple-100/60' : 'bg-pink-100/60'} rounded-[3rem] -rotate-2 group-hover:rotate-0 transition-transform duration-500`} />
                <div className="relative bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                  <div className="aspect-square rounded-3xl overflow-hidden mb-8 shadow-inner"><SafeImage src={ritual.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" /></div>
                  <h3 className="text-2xl font-serif font-bold text-gray-900 mb-4">{ritual.title}</h3>
                  <p className="text-gray-600 leading-relaxed text-sm">{ritual.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. LATEST STORIES (JOURNAL) - Brought back & polished */}
      <section className="py-24 bg-purple-50/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-16 px-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-600 mb-2 block">Latest from the heart</span>
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900">Recent Stories</h2>
            </div>
            <Link to="/blog" className="text-purple-700 font-bold hover:gap-4 transition-all flex items-center gap-2 pb-2">View Journal <SafeIcon icon={FiArrowRight} /></Link>
          </div>
          <div className="space-y-6">
            {latestStories.map((post) => (
              <motion.div key={post.id} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="group bg-white hover:bg-purple-900 rounded-[2.5rem] p-6 transition-all duration-500 flex flex-col md:flex-row items-center gap-8 shadow-sm hover:shadow-2xl border border-purple-100/50">
                <div className="w-full md:w-64 h-44 rounded-2xl overflow-hidden flex-shrink-0 bg-gray-100">
                  <SafeImage src={post.image} fallback={BLOG_PLACEHOLDER} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-4 mb-3 text-[10px] font-bold uppercase tracking-widest text-purple-500 group-hover:text-purple-200">
                    <span className="flex items-center gap-1"><SafeIcon icon={FiClock} /> {post.readTime || '3 min'}</span>
                    <span>•</span>
                    <span>{post.category}</span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 group-hover:text-white mb-3 transition-colors">{post.title}</h3>
                  <p className="text-gray-500 group-hover:text-purple-100/80 line-clamp-2 text-sm leading-relaxed">{stripHtml(post.content)}</p>
                </div>
                <Link to={`/post/${post.id}`} className="w-14 h-14 rounded-full border border-purple-200 flex items-center justify-center text-purple-600 group-hover:bg-white group-hover:border-white transition-all"><SafeIcon icon={FiArrowRight} /></Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. KDRAMA SECTION */}
      <section className="py-28 bg-gray-950 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400 mb-4 block">The Watchlist</span>
            <h2 className="text-5xl md:text-6xl font-serif font-bold mb-6">Must-Watch Dramas</h2>
          </div>
          <KdramaGrid />
        </div>
      </section>

      {/* 5. PRODUCT RECOMMENDATIONS - MASONRY LAYOUT (Placed before CTA) */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <span className="flex items-center justify-center gap-2 text-purple-700 font-bold uppercase tracking-[0.2em] text-[10px] mb-4">
              <SafeIcon icon={FiShoppingTag} /> Curated Picks
            </span>
            <h2 className="text-4xl md:text-6xl font-serif font-bold text-gray-900 mb-6 leading-tight">Handpicked Essentials</h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto font-sans">
              Things that make my days a little brighter and my nights a little cozier.
            </p>
          </div>

          <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
            {RECOMMENDED_PRODUCTS.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="break-inside-avoid group relative bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
              >
                <div className="relative overflow-hidden">
                  <SafeImage 
                    src={product.image} 
                    className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-1000" 
                  />
                  <div className="absolute top-6 left-6">
                    <span className={`inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${product.color} shadow-sm backdrop-blur-md`}>
                      {product.category}
                    </span>
                  </div>
                </div>
                
                <div className="p-8">
                  <h3 className="text-2xl font-serif font-bold text-gray-900 mb-4">{product.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-6 font-sans">
                    {product.why}
                  </p>
                  
                  <div className="pt-6 border-t border-gray-50 mb-8">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Best for:</p>
                    <p className="text-sm font-bold text-purple-700">{product.bestFor}</p>
                  </div>

                  <Link 
                    to="/products"
                    className="w-full inline-flex items-center justify-center px-6 py-4 bg-gray-950 text-white rounded-2xl font-bold text-sm group-hover:bg-purple-600 transition-colors duration-300"
                  >
                    See why I recommend it <SafeIcon icon={FiArrowRight} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. COMMUNITY CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <motion.div initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }} className="bg-purple-900 rounded-[4rem] p-12 md:p-24 text-center relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">Join the Community</h2>
            <p className="text-purple-100 text-lg mb-10">Get cozy reflections and recs sent to your inbox.</p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input type="email" placeholder="Email address" className="flex-1 px-8 py-4 rounded-full bg-white/10 border border-white/20 text-white placeholder:text-purple-300 outline-none focus:ring-2 focus:ring-purple-400" />
              <button className="px-10 py-4 bg-purple-500 hover:bg-purple-400 text-white font-bold rounded-full transition-all shadow-lg">Subscribe</button>
            </form>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default Home;