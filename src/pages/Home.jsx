import React, { useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useBlog } from '../contexts/BlogContext';
import { useAuth } from '../contexts/AuthContext';
import KdramaGrid from '../components/KdramaGrid';
import ProductCard from '../components/ProductCard';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import SafeImage from '../common/SafeImage';
import { stripHtml } from '../utils/textUtils';

const { FiArrowRight, FiHeart, FiCoffee, FiBookOpen, FiMoon, FiUsers, FiStar, FiChevronRight, FiMusic, FiTv, FiSmile } = FiIcons;

const Home = () => {
  const { publishedPosts, products, isLoading, fetchData } = useBlog();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const latestStories = useMemo(() => publishedPosts.slice(0, 8), [publishedPosts]);
  const productPicks = useMemo(() => products.slice(0, 6), [products]);

  const meTimeRituals = [
    {
      title: "The Coffee Ritual",
      desc: "5 minutes of silence with a hot latte before the house wakes up.",
      icon: FiCoffee,
      image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&fit=crop"
    },
    {
      title: "Evening Skincare",
      desc: "Washing off the day and layering on the calm. My non-negotiable ten minutes.",
      icon: FiMoon,
      image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&fit=crop"
    },
    {
      title: "Mindful Reading",
      desc: "Getting lost in a story that isn't mine for just a few chapters.",
      icon: FiBookOpen,
      image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&fit=crop"
    }
  ];

  return (
    <div className="min-h-screen bg-white pb-24 font-sans">
      {/* HERO SECTION */}
      <section className="relative pt-24 pb-16 overflow-hidden bg-purple-100/30">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-200/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-block py-2 px-6 rounded-full bg-purple-200/60 text-purple-800 font-black text-[10px] mb-8 uppercase tracking-[0.2em]">💜 Welcome to the magic shop</span>
            <h1 className="text-5xl md:text-8xl font-serif font-bold text-gray-900 mb-8 leading-tight">
              Life, Love, <br/>
              <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-purple-800 bg-clip-text text-transparent italic">and a Little Bit of BTS</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
              A cozy corner for moms navigating the chaos of parenting with a soundtrack of K-Pop and a heart full of stories.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/blog" className="px-10 py-4 bg-gray-900 text-white rounded-full font-black text-sm uppercase tracking-widest hover:bg-purple-900 transition-all shadow-xl">Explore Journal</Link>
              {!isAuthenticated && (
                <Link to="/login" className="px-10 py-4 bg-white text-gray-900 border border-gray-200 rounded-full font-black text-sm uppercase tracking-widest hover:border-purple-300 transition-all">Join Community</Link>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* RESTORED BENTO / VIDEO SECTION */}
      <section className="bg-purple-100/30 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <motion.div className="lg:col-span-2 bg-black rounded-[3rem] shadow-xl relative overflow-hidden group h-[400px] md:h-[600px]">
              <video
                src="https://www.dropbox.com/scl/fi/kk5lebnsgklculhx1pdo8/cherry-blossom-laptop-moment.mp4?rlkey=1df4lj7n7f5mn5p4ppwbfg1aj&st=ym2k2ouz&raw=1"
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute bottom-12 left-12 text-white">
                <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 backdrop-blur-md px-3 py-1 rounded-full mb-4 inline-block">
                  Featured Journal
                </span>
                <h2 className="text-3xl md:text-5xl font-serif font-bold mb-4">Finding Your Magic Shop</h2>
                <Link
                  to="/blog"
                  className="inline-flex items-center font-bold border-b-2 border-white/50 hover:border-white transition-all pb-1 text-sm uppercase tracking-widest"
                >
                  Read Story <SafeIcon icon={FiArrowRight} className="ml-2" />
                </Link>
              </div>
            </motion.div>

            <div className="flex flex-col gap-6">
              <div className="flex-1 bg-white rounded-[2.5rem] overflow-hidden shadow-lg border border-purple-100 p-6 flex flex-col justify-end relative h-[280px]">
                <SafeImage
                  src="https://images.unsplash.com/photo-1634152962476-4b8a00e1915c?w=600&fit=crop"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="relative text-white">
                  <h3 className="text-xl font-serif font-bold">Our Beloved Summer</h3>
                  <p className="text-xs opacity-70">Rewatching currently...</p>
                </div>
              </div>

              <div className="bg-black rounded-[2.5rem] shadow-lg overflow-hidden border border-purple-500/30 h-[300px]">
                <iframe
                  src="https://open.spotify.com/embed/playlist/484z3UpLGXc4qzy0IvVRQ7?utm_source=generator&theme=1"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LATEST STORIES SECTION */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between mb-16 px-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-purple-600 mb-2 block">The Journal</span>
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 tracking-tight">Latest Stories</h2>
            </div>
            <Link to="/blog" className="text-purple-700 font-bold flex items-center gap-2 font-sans group">
              View All <SafeIcon icon={FiArrowRight} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="flex flex-col gap-8">
            {isLoading ? (
              <div className="text-center py-20 italic text-gray-400 animate-pulse">Syncing with your journal...</div>
            ) : latestStories.length > 0 ? (
              latestStories.map((post, index) => (
                <Link key={post.id} to={`/post/${post.id}`} className="block group">
                  <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className={`relative flex flex-col md:flex-row items-stretch gap-8 p-6 md:p-10 rounded-[3rem] transition-all duration-500 transform hover:scale-[1.01] ${index === 0 ? 'bg-[#110C1D] text-white shadow-2xl shadow-purple-900/20' : 'bg-white text-gray-900 border border-gray-100 hover:shadow-xl hover:border-purple-100'}`}>
                    <div className="w-full md:w-[320px] lg:w-[420px] aspect-video rounded-[2rem] overflow-hidden bg-gray-800">
                      <SafeImage src={post.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    </div>
                    <div className="flex-1 flex flex-col justify-center py-4">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 w-fit ${index === 0 ? 'bg-white/10' : 'bg-purple-100/50 text-purple-700'}`}>{post.category}</span>
                      <h3 className="text-2xl md:text-4xl font-serif font-bold mb-6 group-hover:text-purple-400 transition-colors">{post.title}</h3>
                      <p className={`line-clamp-3 font-sans leading-relaxed ${index === 0 ? 'text-gray-400' : 'text-gray-500'}`}>{post.excerpt || stripHtml(post.content).substring(0, 150)}</p>
                    </div>
                  </motion.div>
                </Link>
              ))
            ) : (
              <div className="text-center py-20 bg-gray-50 rounded-[3rem] border border-dashed border-gray-200">
                <p className="text-gray-400 italic">No stories have been published yet.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* K-DRAMA WATCHLIST */}
      <section className="py-28 bg-gray-950 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center mb-10">
          <span className="text-[10px] font-black uppercase tracking-widest text-purple-400 mb-4 block font-sans">The Watchlist</span>
          <h2 className="text-5xl md:text-6xl font-serif font-bold">Must-Watch Dramas</h2>
          <KdramaGrid />
        </div>
      </section>

      {/* PRODUCT RECOMMENDATIONS */}
      <section className="py-24 bg-white border-t border-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-purple-600 mb-2 block font-sans">Curated Picks</span>
              <h2 className="text-4xl font-serif font-bold text-gray-900">Product Recommendations</h2>
            </div>
            <Link to="/products" className="hidden sm:flex items-center gap-2 text-purple-700 font-bold hover:gap-3 transition-all font-sans">
              View All <SafeIcon icon={FiArrowRight} />
            </Link>
          </div>

          <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
            {productPicks.map((product, i) => (
              <div key={product.id || i} className="break-inside-avoid">
                <ProductCard product={product} index={i} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SMALL JOYS SECTION */}
      <section className="py-24 bg-purple-50/50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="p-4 bg-pink-100 rounded-3xl mb-6 inline-block"><SafeIcon icon={FiHeart} className="text-3xl text-pink-500" /></div>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-20">Small Joys & Me Time</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-left">
            {meTimeRituals.map((ritual, index) => (
              <motion.div 
                key={index} 
                whileHover={{ y: -10 }}
                className="bg-white p-8 rounded-[3rem] shadow-sm border border-purple-100/50 hover:shadow-xl transition-all"
              >
                <div className="aspect-square rounded-[2rem] overflow-hidden mb-8 shadow-inner">
                  <SafeImage src={ritual.image} className="w-full h-full object-cover" />
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-purple-100 rounded-xl text-purple-600"><SafeIcon icon={ritual.icon} /></div>
                  <h3 className="text-2xl font-serif font-bold">{ritual.title}</h3>
                </div>
                <p className="text-gray-600 font-sans leading-relaxed">{ritual.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* JOIN COMMUNITY SECTION (LAST) */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-purple-700 via-purple-800 to-indigo-900 rounded-[4rem] p-12 md:p-20 text-center text-white relative overflow-hidden shadow-2xl"
          >
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
            <div className="relative z-10">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-[2rem] flex items-center justify-center mx-auto mb-10">
                <SafeIcon icon={FiUsers} className="text-4xl text-white" />
              </div>
              <h2 className="text-4xl md:text-6xl font-serif font-bold mb-8">Join Our Community</h2>
              <p className="text-xl text-purple-100 max-w-2xl mx-auto mb-12 leading-relaxed">
                Connect with fellow moms and ARMY. Share your favorite drama moments, parenting wins, and find your daily dose of purple love.
              </p>
              {isAuthenticated ? (
                <Link to="/forums" className="inline-flex items-center px-12 py-5 bg-white text-purple-900 rounded-full font-black text-sm uppercase tracking-[0.2em] hover:bg-purple-100 transition-all shadow-xl group">
                  Go to Forums <SafeIcon icon={FiChevronRight} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <Link to="/login" className="inline-flex items-center px-12 py-5 bg-white text-purple-900 rounded-full font-black text-sm uppercase tracking-[0.2em] hover:bg-purple-100 transition-all shadow-xl group">
                  Join Free Today <SafeIcon icon={FiChevronRight} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;