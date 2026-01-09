import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import SafeImage from '../common/SafeImage';
import { useKdrama } from '../contexts/KdramaContext';
import { KDRAMA_PLACEHOLDER } from '../config/assets';

const { FiArrowRight, FiMessageCircle, FiChevronRight, FiChevronLeft } = FiIcons;

const KdramaCard = ({ drama, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0.6, scale: 0.9 }}
      whileInView={{ 
        opacity: 1, 
        scale: 1,
        transition: { duration: 0.5, ease: "easeOut" }
      }}
      whileHover={{ 
        scale: 1.05,
        zIndex: 10,
        transition: { duration: 0.3 }
      }}
      viewport={{ amount: 0.8 }}
      className="shrink-0 w-[300px] md:w-[380px] snap-center group relative py-10"
    >
      <Link to={`/kdrama-recommendations/${drama.slug || drama.id}`} className="block">
        <div className="relative aspect-[2/3] rounded-[3rem] overflow-hidden bg-purple-900/20 shadow-2xl transition-all duration-500 group-hover:shadow-purple-500/20 border border-white/5 group-hover:border-purple-500/40">
          
          {/* Spotlight Glow (Behind Image) */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-600/20 via-transparent to-transparent pointer-events-none" />

          {/* Image */}
          <SafeImage 
            src={drama.image_url || drama.image} 
            alt={drama.title} 
            fallback={KDRAMA_PLACEHOLDER} 
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000 ease-out" 
            loading="lazy" 
          />
          
          {/* Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />

          {/* Tags */}
          <div className="absolute top-8 left-8 flex flex-wrap gap-2 z-10">
            {drama.tags && drama.tags.slice(0, 1).map((tag, idx) => (
              <span key={idx} className="px-4 py-1.5 bg-white/10 backdrop-blur-xl text-white text-[10px] font-black rounded-full border border-white/20 uppercase tracking-[0.2em] shadow-lg">
                {tag}
              </span>
            ))}
          </div>

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-10 z-10">
            <h3 className="text-2xl md:text-3xl font-serif font-bold text-white mb-4 leading-tight group-hover:text-purple-300 transition-colors duration-300">
              {drama.title}
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-8 line-clamp-2 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 font-sans">
              {drama.synopsis_short}
            </p>
            
            <div className="flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100">
              <span className="inline-flex items-center text-[11px] font-black text-purple-400 uppercase tracking-[0.2em]">
                Read Review <SafeIcon icon={FiArrowRight} className="ml-2" />
              </span>
              <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 group-hover:bg-purple-600 group-hover:border-purple-500 transition-all duration-300">
                <SafeIcon icon={FiMessageCircle} className="text-white text-sm" />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

const KdramaGrid = () => {
  const { kdramas, isLoading } = useKdrama();
  const scrollContainerRef = useRef(null);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      const cardWidth = 380; // Approximate card width
      const scrollTo = direction === 'left' ? scrollLeft - cardWidth : scrollLeft + cardWidth;
      scrollContainerRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  // Display exactly 8 dramas
  const displayList = kdramas.slice(0, 8);

  if (isLoading) {
    return (
      <div className="flex gap-8 overflow-hidden py-10">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="shrink-0 w-[320px] aspect-[2/3] bg-white/5 rounded-[3rem] animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="relative group/carousel -mt-10">
      {/* Navigation Buttons */}
      <div className="absolute -top-28 right-0 flex gap-4 z-20">
        <button 
          onClick={() => scroll('left')}
          className="w-14 h-14 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl flex items-center justify-center text-white hover:bg-purple-600 hover:border-purple-600 transition-all duration-300 shadow-2xl active:scale-90"
        >
          <SafeIcon icon={FiChevronLeft} className="text-2xl" />
        </button>
        <button 
          onClick={() => scroll('right')}
          className="w-14 h-14 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl flex items-center justify-center text-white hover:bg-purple-600 hover:border-purple-600 transition-all duration-300 shadow-2xl active:scale-90"
        >
          <SafeIcon icon={FiChevronRight} className="text-2xl" />
        </button>
      </div>

      {/* Carousel Container */}
      <div 
        ref={scrollContainerRef}
        className="flex gap-4 md:gap-10 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-16 pt-4 px-[10%] scroll-smooth"
      >
        {displayList.map((drama, index) => (
          <KdramaCard key={drama.id} drama={drama} index={index} />
        ))}
        
        {/* "View All" Card */}
        <motion.div 
          className="shrink-0 w-[300px] flex items-center justify-center snap-center"
        >
          <Link 
            to="/kdrama-recommendations" 
            className="flex flex-col items-center gap-8 group/all"
          >
            <div className="w-24 h-24 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center group-hover/all:border-purple-500 group-hover/all:bg-purple-500/20 transition-all duration-500 group-hover/all:scale-110">
              <SafeIcon icon={FiArrowRight} className="text-4xl text-white group-hover/all:translate-x-2 transition-transform" />
            </div>
            <span className="text-white font-serif text-2xl font-bold opacity-60 group-hover/all:opacity-100 transition-opacity">Explore More</span>
          </Link>
        </motion.div>
      </div>

      {/* Custom Scrollbar Shadow */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-48 h-1 bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          className="h-full bg-purple-600"
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />
      </div>
    </div>
  );
};

export default KdramaGrid;