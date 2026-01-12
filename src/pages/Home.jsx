import React, { useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useBlog } from '../contexts/BlogContext';
import KdramaGrid from '../components/KdramaGrid';
import ProductCard from '../components/ProductCard';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import SafeImage from '../common/SafeImage';
import { stripHtml } from '../utils/textUtils';

const { FiArrowRight, FiHeart, FiCoffee, FiBookOpen, FiMoon, FiShoppingBag, FiStar } = FiIcons;

const Home = () => {
  const { publishedPosts: posts, isLoading: postsLoading, fetchPosts } = useBlog();

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const latestStories = useMemo(() => {
    return posts.slice(0, 8);
  }, [posts]);

  // NEW: Filter specifically for the Product Recommendations category
  const productPosts = useMemo(() => {
    return posts
      .filter(p => (p.category || '').trim() === 'Product Recommendations')
      .slice(0, 3);
  }, [posts]);

  const featuredStory = latestStories[0] || {
    id: 'placeholder',
    title: "Finding Your Own Magic Shop",
    category: "Latest Story",
    excerpt: "Exploring the cozy corners of life and fandom."
  };

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
      {/* HERO SECTION */}
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

      {/* BENTO SECTION */}
      <section className="bg-purple-100/30 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative z-20">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:h-[600px]">
              <motion.div initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }} className="lg:col-span-2 bg-black rounded-[3rem] shadow-xl relative overflow-hidden group border border-purple-200/40">
                <video src="https://www.dropbox.com/scl/fi/kk5lebnsgklculhx1pdo8/cherry-blossom-laptop-moment.mp4?rlkey=1df4lj7n7f5mn5p4ppwbfg1aj&st=ym2k2ouz&raw=1" autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover transform scale-105 group-hover:scale-110 transition-transform duration-1000" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 text-white">
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-[10px] font-black uppercase tracking-widest mb-4 font-sans">{featuredStory.category}</span>
                  <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4 leading-tight text-white">{featuredStory.title}</h2>
                  <Link to={featuredStory.id === 'placeholder' ? '/blog' : `/post/${featuredStory.id}`} className="inline-flex items-center font-bold text-white border-b-2 border-white/50 hover:border-white transition-all pb-1 text-sm uppercase tracking-widest font-sans">
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

      {/* LATEST STORIES SECTION */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-16 px-4">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 tracking-tight">Latest Stories</h2>
            <Link to="/blog" className="text-purple-700 font-bold hover:gap-4 transition-all flex items-center gap-2 group font-sans">
              View Journal <SafeIcon icon={FiArrowRight} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="flex flex-col gap-8">
            {postsLoading ? (
              <div className="text-center py-20 bg-gray-50 rounded-[3rem] border border-dashed border-gray-200">
                <div className="animate-pulse flex flex-col items-center">
                  <div className="h-12 w-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-gray-400 font-sans italic">Syncing with your journal...</p>
                </div>
              </div>
            ) : latestStories.length > 0 ? (
              latestStories.map((post, index) => {
                const isFirst = index === 0;
                return (
                  <Link key={post.id} to={`/post/${post.id}`} className="block group">
                    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.1 }} className={`relative flex flex-col md:flex-row items-stretch gap-8 p-6 md:p-10 rounded-[3rem] transition-all duration-500 transform hover:scale-[1.015] active:scale-[0.99] ${isFirst ? 'bg-[#110C1D] hover:bg-[#1a1429] text-white shadow-2xl hover:shadow-purple-900/30' : 'bg-white hover:bg-purple-50/80 text-gray-900 shadow-sm hover:shadow-xl border border-gray-100 hover:border-purple-200'}`} >
                      <div className="w-full md:w-[320px] lg:w-[420px] aspect-video md:aspect-[4/3] shrink-0 rounded-[2rem] overflow-hidden shadow-lg border border-white/10">
                        <SafeImage src={post.image || post.image_url} alt={post.title} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000 ease-out" />
                      </div>
                      <div className="flex-1 flex flex-col justify-center py-4">
                        <div className="flex items-center gap-3 mb-6">
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] font-sans ${isFirst ? 'bg-white/10 text-white' : 'bg-purple-100/50 text-purple-700'}`}>
                            {post.category}
                          </span>
                        </div>
                        <h3 className={`text-2xl md:text-3xl lg:text-4xl font-serif font-bold mb-6 leading-tight transition-colors duration-300 ${isFirst ? 'text-white' : 'text-gray-900 group-hover:text-purple-800'}`}>
                          {post.title}
                        </h3>
                        <p className={`text-sm md:text-base lg:text-lg leading-relaxed mb-0 line-clamp-3 font-sans transition-colors duration-300 ${isFirst ? 'text-gray-400 group-hover:text-gray-300' : 'text-gray-500 group-hover:text-gray-600'}`}>
                          {post.excerpt || stripHtml(post.content).substring(0, 180)}...
                        </p>
                      </div>
                      <div className="hidden lg:flex items-center justify-center shrink-0">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-12 ${isFirst ? 'bg-white text-[#110C1D] shadow-lg group-hover:bg-purple-400 group-hover:text-white' : 'bg-gray-950 text-white shadow-lg group-hover:bg-purple-600 group-hover:shadow-purple-200'}`}>
                          <SafeIcon icon={FiArrowRight} className="text-2xl transform group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                );
              })
            ) : (
              <div className="text-center py-20 bg-gray-50 rounded-[3rem] border border-dashed border-gray-200">
                <p className="text-gray-500 font-sans">No stories published yet. Head to the dashboard to write one!</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* MUST WATCH SHOWS */}
      <section className="py-28 bg-gray-950 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-10">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400 mb-4 block font-sans">The Watchlist</span>
            <h2 className="text-5xl md:text-6xl font-serif font-bold">Must-Watch Dramas</h2>
          </div>
          <KdramaGrid />
        </div>
      </section>

      {/* PRODUCT RECOMMENDATIONS */}
      <section className="py-24 bg-white border-t border-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-600 mb-2 block font-sans">Curated for You</span>
              <h2 className="text-4xl font-serif font-bold text-gray-900">Product Recommendations</h2>
              <p className="text-gray-500 mt-2 font-sans italic">My current favorites</p>
            </div>
            <Link to="/products" className="hidden sm:flex items-center gap-2 text-purple-700 font-bold hover:gap-3 transition-all font-sans">
              View All <SafeIcon icon={FiArrowRight} />
            </Link>
          </div>

          {productPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {productPosts.map((post, i) => (
                <ProductCard key={post.id || post.slug || i} product={post} index={i} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-50 rounded-[3rem] border border-dashed border-gray-200">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <SafeIcon icon={FiShoppingBag} className="text-2xl text-purple-600" />
              </div>
              <p className="text-gray-500 font-sans">No recommendations found yet. Check back soon!</p>
            </div>
          )}

          <div className="mt-10 text-center sm:hidden">
            <Link to="/products" className="inline-flex items-center gap-2 px-8 py-4 bg-purple-600 text-white rounded-full font-bold shadow-lg shadow-purple-200 font-sans">
              View All Picks <SafeIcon icon={FiShoppingBag} className="ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* SMALL JOYS */}
      <section className="py-24 bg-purple-50/50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center mb-20">
            <div className="p-3 bg-pink-50 rounded-2xl mb-4"><SafeIcon icon={FiHeart} className="text-3xl text-pink-500" /></div>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6">Small Joys & Me Time</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {meTimeRituals.map((ritual, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="relative group">
                <div className={`absolute -inset-4 ${index % 2 === 0 ? 'bg-purple-100/60' : 'bg-pink-100/60'} rounded-[3rem] -rotate-2 group-hover:rotate-0 transition-transform duration-500`} />
                <div className="relative bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                  <div className="aspect-square rounded-3xl overflow-hidden mb-8 shadow-inner"><SafeImage src={ritual.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" /></div>
                  <h3 className="text-2xl font-serif font-bold text-gray-900 mb-4">{ritual.title}</h3>
                  <p className="text-gray-600 leading-relaxed text-sm font-sans">{ritual.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* JOIN A COMMUNITY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <motion.div initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }} className="bg-purple-900 rounded-[4rem] p-12 md:p-24 text-center relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">Join the Community</h2>
            <p className="text-purple-100 text-lg mb-10 font-sans">Get cozy reflections sent to your inbox.</p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto font-sans" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="Email address" className="flex-1 px-8 py-4 rounded-full bg-white/10 border border-white/20 text-white outline-none focus:ring-2 focus:ring-purple-400" />
              <button className="px-10 py-4 bg-purple-500 hover:bg-purple-400 text-white font-bold rounded-full transition-all shadow-lg font-sans">Subscribe</button>
            </form>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default Home;