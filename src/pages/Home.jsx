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
    content: "The ultimate K-Beauty staple. I put this on every night and wake up with the softest lips. It's that tiny ritual of luxury.",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?w=800&fit=crop",
    subcategory: "Skincare"
  },
  {
    id: 'sample-2',
    title: "BTS 'Proof' Anthology",
    content: "More than just music, it's a history of growth. This anthology sits on my shelf as a constant reminder to keep pursuing my own 'Proof' of happiness.",
    image: "https://images.unsplash.com/photo-1619983081563-430f63602796?w=800&fit=crop",
    subcategory: "Music"
  },
  {
    id: 'sample-3',
    title: "Breville Bambino Plus",
    content: "My morning savior. It makes the perfect micro-foam for my lattes, making my 5 AM 'ritual' feel like a high-end cafe.",
    image: "https://images.unsplash.com/photo-1510972527921-ce03766a1cf1?w=800&fit=crop",
    subcategory: "Home Cafe"
  },
  {
    id: 'sample-4',
    title: "Kindle Paperwhite",
    content: "My nightly sanctuary. Transitioning from blue light to e-ink has saved my sleep and my sanity. It's the best investment for a busy mom's brain.",
    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&fit=crop",
    subcategory: "Wellness"
  },
  {
    id: 'sample-5',
    title: "Lululemon Align Leggings",
    content: "The uniform of the modern mom. I rejected the hype for years until I finally put them on. They feel like a second skin during morning yoga or afternoon errands.",
    image: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800&fit=crop",
    subcategory: "Lifestyle"
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
    const dbRecs = posts.filter(p => p.category === 'Product Recommendations').slice(0, 5);
    return dbRecs.length >= 5 ? dbRecs : DEFAULT_PRODUCTS;
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
      {/* 1. HERO SECTION - Deepened purple-100 */}
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

      {/* RITUALS SECTION */}
      <section className="py-24 bg-white overflow-hidden">
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
                  <h3 className="text-2xl font-serif font-bold text-gray-900 mb-4">{ritual.title}</h3>
                  <p className="text-gray-600 leading-relaxed text-sm">{ritual.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. PRODUCT RECOMMENDATIONS - BOUTIQUE MASONRY */}
      <section className="py-32 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center mb-24">
            <span className="flex items-center gap-2 text-purple-700 font-black uppercase tracking-[0.2em] text-[10px] mb-6">
              <SafeIcon icon={FiShoppingTag} /> Curated Picks
            </span>
            <h2 className="text-5xl md:text-7xl font-serif font-bold text-gray-900 leading-none mb-8">
              Melissa's <span className="text-purple-200">Essentials.</span>
            </h2>
            <p className="text-gray-400 text-sm max-w-[400px] leading-relaxed uppercase tracking-widest font-bold">
              Items I use daily to keep the magic alive at home.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-20">
            {/* Item 1: Large Statement */}
            <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="lg:col-span-8 group">
              <div className="relative aspect-[16/10] rounded-[4rem] overflow-hidden bg-purple-100/40 border-[1.5rem] border-purple-100/40 shadow-2xl">
                <SafeImage src={productRecs[0].image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
              </div>
              <div className="mt-12 max-w-xl">
                <span className="text-[10px] font-black uppercase tracking-widest text-purple-600 mb-4 block">{productRecs[0].subcategory}</span>
                <h3 className="text-4xl font-serif font-bold text-gray-900 mb-6">{productRecs[0].title}</h3>
                <p className="text-gray-500 leading-relaxed text-lg mb-8">{stripHtml(productRecs[0].content)}</p>
                <Link to={`/post/${productRecs[0].id}`} className="inline-flex items-center text-sm font-bold text-purple-700 border-b-2 border-purple-100 hover:border-purple-600 transition-all pb-1">
                  Full Review <SafeIcon icon={FiArrowRight} className="ml-2" />
                </Link>
              </div>
            </motion.div>

            {/* Item 2: Staggered Right */}
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="lg:col-span-4 flex flex-col justify-center">
              <div className="aspect-[4/5] rounded-[3rem] overflow-hidden bg-pink-100/40 border-[1rem] border-pink-100/40 shadow-xl group">
                <SafeImage src={productRecs[1].image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              </div>
              <div className="mt-8">
                <span className="text-[10px] font-black uppercase tracking-widest text-pink-600 mb-2 block">{productRecs[1].subcategory}</span>
                <h3 className="text-2xl font-serif font-bold text-gray-900 mb-4">{productRecs[1].title}</h3>
                <Link to={`/post/${productRecs[1].id}`} className="text-sm font-bold text-gray-400 hover:text-purple-600 transition-colors">Explore</Link>
              </div>
            </motion.div>

            {/* Item 3 & 4: Masonry Row 2 */}
            <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="lg:col-span-5 pt-12">
              <div className="aspect-square rounded-[3rem] overflow-hidden bg-orange-100/40 border-[1rem] border-orange-100/40 shadow-xl group">
                <SafeImage src={productRecs[2].image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              </div>
              <div className="mt-8">
                <span className="text-[10px] font-black uppercase tracking-widest text-orange-600 mb-2 block">{productRecs[2].subcategory}</span>
                <h3 className="text-2xl font-serif font-bold text-gray-900 mb-4">{productRecs[2].title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">{stripHtml(productRecs[2].content)}</p>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="lg:col-span-7 lg:mt-32">
              <div className="relative aspect-[16/9] rounded-[4rem] overflow-hidden bg-emerald-100/40 border-[1.5rem] border-emerald-100/40 shadow-2xl group">
                <SafeImage src={productRecs[3].image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
              </div>
              <div className="mt-10 flex justify-between items-start">
                <div className="max-w-md">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-2 block">{productRecs[3].subcategory}</span>
                  <h3 className="text-3xl font-serif font-bold text-gray-900 mb-4">{productRecs[3].title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">{stripHtml(productRecs[3].content)}</p>
                </div>
                <Link to={`/post/${productRecs[3].id}`} className="mt-6 w-14 h-14 rounded-full bg-gray-900 text-white flex items-center justify-center hover:bg-purple-600 transition-all">
                  <SafeIcon icon={FiArrowRight} />
                </Link>
              </div>
            </motion.div>

            {/* Item 5: The "Lululemon" Pick - Tall Center */}
            <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="lg:col-span-12 flex justify-center pt-24">
              <div className="max-w-4xl w-full flex flex-col md:flex-row items-center gap-16">
                <div className="w-full md:w-1/2 aspect-[3/4] rounded-[5rem] overflow-hidden bg-purple-100/40 border-[2rem] border-purple-100 shadow-2xl group">
                  <SafeImage src={productRecs[4].image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                </div>
                <div className="w-full md:w-1/2">
                  <span className="inline-flex items-center px-4 py-1 rounded-full bg-purple-100 text-purple-700 text-[10px] font-black uppercase tracking-[0.2em] mb-8">The Daily Uniform</span>
                  <h3 className="text-5xl font-serif font-bold text-gray-900 mb-8 leading-tight">{productRecs[4].title}</h3>
                  <p className="text-gray-500 text-lg leading-relaxed mb-10 italic">"{stripHtml(productRecs[4].content)}"</p>
                  <Link to={`/post/${productRecs[4].id}`} className="px-12 py-5 bg-gray-900 text-white rounded-full font-bold hover:bg-purple-600 transition-all shadow-xl">
                    View My Review
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* JOURNAL SECTION */}
      <section className="py-24 bg-purple-100/40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-16 px-4">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900">Latest Stories</h2>
            <Link to="/blog" className="text-purple-700 font-bold hover:gap-4 transition-all flex items-center gap-2">View Journal <SafeIcon icon={FiArrowRight} /></Link>
          </div>
          <div className="space-y-4">
            {latestStories.map((post) => (
              <motion.div key={post.id} className="group bg-white hover:bg-purple-900 rounded-[2rem] p-6 transition-all duration-500 flex flex-col md:flex-row items-center gap-8 shadow-sm hover:shadow-2xl">
                <div className="w-full md:w-56 h-40 rounded-2xl overflow-hidden flex-shrink-0 bg-gray-100">
                  <SafeImage src={post.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-2xl font-serif font-bold text-gray-900 group-hover:text-white mb-3">{post.title}</h3>
                  <p className="text-gray-500 group-hover:text-purple-100 line-clamp-2 text-sm">{stripHtml(post.content)}</p>
                </div>
                <Link to={`/post/${post.id}`} className="w-14 h-14 rounded-full border border-purple-200 flex items-center justify-center text-purple-600 group-hover:bg-white transition-all"><SafeIcon icon={FiArrowRight} /></Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* KDRAMA SECTION */}
      <section className="py-28 bg-gray-950 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-serif font-bold mb-6">Must-Watch Shows</h2>
          </div>
          <KdramaGrid />
        </div>
      </section>

      {/* COMMUNITY CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <motion.div initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }} className="bg-purple-900 rounded-[4rem] p-12 md:p-24 text-center relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">Join the Community</h2>
            <p className="text-purple-100 text-lg mb-10">Get cozy reflections and recs sent to your inbox.</p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input type="email" placeholder="Email address" className="flex-1 px-8 py-4 rounded-full bg-white/10 border border-white/20 text-white" />
              <button className="px-10 py-4 bg-purple-500 hover:bg-purple-400 text-white font-bold rounded-full transition-all">Subscribe</button>
            </form>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default Home;