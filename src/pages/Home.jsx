import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useBlog } from '../contexts/BlogContext';
import KdramaGrid from '../components/KdramaGrid';
import BlogCard from '../components/BlogCard';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import SafeImage from '../common/SafeImage';
import { stripHtml } from '../utils/textUtils';

const { FiArrowRight, FiHeart, FiShoppingTag, FiCoffee, FiBookOpen, FiMoon, FiClock } = FiIcons;

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
  const { publishedPosts: posts, isLoading: postsLoading } = useBlog();

  // Filter 3 latest stories (excluding products)
  const latestStories = useMemo(() => {
    return posts
      .filter(p => p.category !== 'Product Recommendations')
      .slice(0, 3);
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
      <section className="relative pt-20 pb-12 overflow-hidden bg-purple-100/30">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-200/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto">
            <span className="inline-block py-2 px-6 rounded-full bg-purple-200/60 text-purple-800 font-bold text-sm mb-6 shadow-sm font-sans uppercase tracking-widest">
              💜 Welcome to the magic shop
            </span>
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-gray-900 mb-6 leading-[1.05]">
              <span className="block">Life, Love,</span>
              <span className="block mt-2 bg-gradient-to-r from-purple-600 via-pink-500 to-purple-700 bg-clip-text text-transparent font-extrabold tracking-tight">
                and a Little Bit of BTS
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed font-sans">
              A cozy corner for moms navigating motherhood with a little bit of chaos and a lot of love.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 2. BENTO SECTION */}
      <section className="bg-purple-100/30 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative z-20">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:h-[600px]">
              <motion.div initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }} className="lg:col-span-2 bg-black rounded-[3rem] shadow-xl relative overflow-hidden group border border-purple-200/40">
                <video src="https://www.dropbox.com/scl/fi/kk5lebnsgklculhx1pdo8/cherry-blossom-laptop-moment.mp4?rlkey=1df4lj7n7f5mn5p4ppwbfg1aj&st=ym2k2ouz&raw=1" autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover transform scale-105 group-hover:scale-110 transition-transform duration-1000" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 text-white">
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-[10px] font-black uppercase tracking-widest mb-4 font-sans">Latest Story</span>
                  <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4 leading-tight text-white">Finding Your Own Magic Shop</h2>
                  <Link to="/blog" className="inline-flex items-center font-bold text-white border-b-2 border-white/50 hover:border-white transition-all pb-1 text-sm uppercase tracking-widest font-sans">
                    Read Story <SafeIcon icon={FiArrowRight} className="ml-2" />
                  </Link>
                </div>
              </motion.div>
              <div className="flex flex-col gap-6 lg:h-full">
                <div className="flex-1 bg-white rounded-[2.5rem] overflow-hidden shadow-lg border border-purple-100 flex flex-col">
                  <div className="relative h-40 lg:h-48">
                    <SafeImage src="https://images.unsplash.com/photo-1634152962476-4b8a00e1915c?w=600&h=800&fit=crop" className="w-full h-full object-cover" />
                    <div className="absolute top-4 left-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-purple-600 text-white text-[10px] font-bold uppercase tracking-widest font-sans">Rewatching</span>
                    </div>
                  </div>
                  <div className="p-6 font-serif"><h3 className="text-xl font-bold text-gray-900">Our Beloved Summer</h3></div>
                </div>
                <div className="bg-black rounded-[2.5rem] shadow-lg overflow-hidden border border-purple-500/30 h-[260px]">
                  <iframe src="https://open.spotify.com/embed/playlist/484z3UpLGXc4qzy0IvVRQ7?utm_source=generator&theme=1" width="100%" height="100%" frameBorder="0" loading="lazy" title="Playlist" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. LATEST STORIES (Horizontal Layout) */}
      <section className="py-20 bg-purple-50/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900">Latest Stories</h2>
            <Link to="/blog" className="text-purple-700 font-bold hover:gap-4 transition-all flex items-center gap-2 pb-2 font-sans">
              View Journal <SafeIcon icon={FiArrowRight} />
            </Link>
          </div>
          
          <div className="flex flex-col gap-6">
            {postsLoading && (
              <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-gray-200">
                <p className="text-gray-500 font-sans">Loading stories...</p>
              </div>
            )}

            {!postsLoading && latestStories.length === 0 && (
              <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-gray-200">
                <p className="text-gray-500 font-sans">No stories found. Start by adding some in the Admin panel!</p>
              </div>
            )}

            {latestStories.map((post, index) => {
               const isFirst = index === 0;
               return (
                 <Link key={post.id} to={`/post/${post.id}`} className="block group">
                   <motion.div 
                     initial={{ opacity: 0, y: 20 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     viewport={{ once: true }}
                     transition={{ delay: index * 0.1 }}
                     className={`relative flex flex-col md:flex-row items-center gap-6 md:gap-10 p-6 md:p-8 rounded-[2.5rem] transition-all duration-300 ${
                       isFirst 
                         ? 'bg-[#110C1D] text-white shadow-xl hover:shadow-2xl hover:-translate-y-1' 
                         : 'bg-white text-gray-900 shadow-sm hover:shadow-xl border border-gray-100 hover:-translate-y-1'
                     }`}
                   >
                     {/* Image */}
                     <div className="w-full md:w-[300px] lg:w-[380px] aspect-video md:aspect-[4/3] shrink-0 rounded-2xl overflow-hidden shadow-md">
                       <SafeImage 
                         src={post.image || post.image_url} 
                         alt={post.title} 
                         className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" 
                       />
                     </div>
                     
                     {/* Content */}
                     <div className="flex-1 flex flex-col justify-center text-left py-2">
                       <h3 className={`text-2xl md:text-3xl font-serif font-bold mb-4 leading-tight ${isFirst ? 'text-white' : 'text-gray-900'}`}>
                         {post.title}
                       </h3>
                       <p className={`text-sm md:text-base leading-relaxed mb-0 line-clamp-3 ${isFirst ? 'text-gray-300' : 'text-gray-600'}`}>
                         {post.excerpt || stripHtml(post.content).substring(0, 160)}...
                       </p>
                     </div>

                     {/* Arrow Button */}
                     <div className={`shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:translate-x-2 ${
                        isFirst 
                          ? 'bg-white text-gray-900' 
                          : 'bg-white border border-gray-100 text-purple-600 shadow-sm group-hover:border-purple-200'
                     }`}>
                        <SafeIcon icon={FiArrowRight} className="text-xl" />
                     </div>
                   </motion.div>
                 </Link>
               )
            })}
          </div>
        </div>
      </section>

      {/* 4. MUST WATCH SHOWS */}
      <section className="py-28 bg-gray-950 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400 mb-4 block font-sans">The Watchlist</span>
            <h2 className="text-5xl md:text-6xl font-serif font-bold mb-6 font-serif">Must-Watch Dramas</h2>
          </div>
          <KdramaGrid />
        </div>
      </section>

      {/* 5. SMALL JOYS (Rituals) */}
      <section className="py-24 bg-purple-50/50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center mb-20">
            <div className="p-3 bg-pink-50 rounded-2xl mb-4"><SafeIcon icon={FiHeart} className="text-3xl text-pink-500" /></div>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6 font-serif">Small Joys: Self-Care & Me Time</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {meTimeRituals.map((ritual, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="relative group">
                <div className={`absolute -inset-4 ${index % 2 === 0 ? 'bg-purple-100/60' : 'bg-pink-100/60'} rounded-[3rem] -rotate-2 group-hover:rotate-0 transition-transform duration-500`} />
                <div className="relative bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                  <div className="aspect-square rounded-3xl overflow-hidden mb-8 shadow-inner"><SafeImage src={ritual.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" /></div>
                  <h3 className="text-2xl font-serif font-bold text-gray-900 mb-4 font-serif">{ritual.title}</h3>
                  <p className="text-gray-600 leading-relaxed text-sm font-sans">{ritual.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. PRODUCT RECOMMENDATIONS */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <span className="flex items-center justify-center gap-2 text-purple-700 font-bold uppercase tracking-[0.2em] text-[10px] mb-4 font-sans">
              <SafeIcon icon={FiShoppingTag} /> Curated Picks
            </span>
            <h2 className="text-4xl md:text-6xl font-serif font-bold text-gray-900 mb-6 leading-tight font-serif">Handpicked Essentials</h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto font-sans">
              Things that make my days a little brighter and my nights a little cozier.
            </p>
          </div>
          <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
            {RECOMMENDED_PRODUCTS.map((product, index) => (
              <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="break-inside-avoid group relative bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
                <div className="relative overflow-hidden">
                  <SafeImage src={product.image} className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-1000" />
                  <div className="absolute top-6 left-6">
                    <span className={`inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${product.color} shadow-sm backdrop-blur-md font-sans`}>{product.category}</span>
                  </div>
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-serif font-bold text-gray-900 mb-4 font-serif">{product.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-6 font-sans">{product.why}</p>
                  <div className="pt-6 border-t border-gray-50 mb-8 font-sans">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 font-sans">Best for:</p>
                    <p className="text-sm font-bold text-purple-700">{product.bestFor}</p>
                  </div>
                  <Link to="/products" className="w-full inline-flex items-center justify-center px-6 py-4 bg-gray-950 text-white rounded-2xl font-bold text-sm group-hover:bg-purple-600 transition-colors duration-300 font-sans">
                    See why I recommend it <SafeIcon icon={FiArrowRight} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. JOIN A COMMUNITY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <motion.div initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }} className="bg-purple-900 rounded-[4rem] p-12 md:p-24 text-center relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6 font-serif">Join the Community</h2>
            <p className="text-purple-100 text-lg mb-10 font-sans">Get cozy reflections and recs sent to your inbox.</p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto font-sans">
              <input type="email" placeholder="Email address" className="flex-1 px-8 py-4 rounded-full bg-white/10 border border-white/20 text-white placeholder:text-purple-300 outline-none focus:ring-2 focus:ring-purple-400" />
              <button className="px-10 py-4 bg-purple-500 hover:bg-purple-400 text-white font-bold rounded-full transition-all shadow-lg font-sans">Subscribe</button>
            </form>
          </div>
        </motion.div>
      </section>

      {/* 8. SMALL JOYS (Repeat as requested) */}
      <section className="py-24 bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center mb-16">
            <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4 font-serif italic">Everyday Rituals</h2>
            <p className="text-gray-500 font-sans">Small reminders to find peace in the everyday.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {meTimeRituals.map((ritual, index) => (
              <div key={index} className="flex items-center gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <div className={`w-12 h-12 rounded-2xl ${ritual.color} flex items-center justify-center flex-shrink-0`}>
                  <SafeIcon icon={ritual.icon} className="text-xl" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">{ritual.title}</h4>
                  <p className="text-xs text-gray-500 mt-1">{ritual.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
    </div>
  );
};

export default Home;