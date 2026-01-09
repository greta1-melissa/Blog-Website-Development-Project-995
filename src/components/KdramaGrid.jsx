import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import SafeImage from '../common/SafeImage';
import { useKdrama } from '../contexts/KdramaContext';
import { KDRAMA_PLACEHOLDER } from '../config/assets';

const { FiArrowRight, FiMessageCircle, FiChevronRight, FiChevronLeft } = FiIcons;

const KdramaCard = ({ drama, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="shrink-0 w-[280px] md:w-[320px] group relative"
    >
      <Link to={`/kdrama-recommendations/${drama.slug || drama.id}`} className="block">
        <div className="relative aspect-[2/3] rounded-[2rem] overflow-hidden bg-purple-900 shadow-2xl transition-all duration-500 group-hover:scale-[1.02] group-hover:-translate-y-2">
          {/* Image */}
          <SafeImage 
            src={drama.image_url || drama.image} 
            alt={drama.title} 
            fallback={KDRAMA_PLACEHOLDER} 
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000 ease-out" 
            loading="lazy" 
          />
          
          {/* Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />
          
          {/* Glow Effect on Hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-tr from-purple-600/20 via-transparent to-pink-500/10 pointer-events-none" />

          {/* Tags */}
          <div className="absolute top-6 left-6 flex flex-wrap gap-2 z-10">
            {drama.tags && drama.tags.slice(0, 1).map((tag, idx) => (
              <span key={idx} className="px-3 py-1 bg-white/10 backdrop-blur-md text-white text-[10px] font-black rounded-full border border-white/20 uppercase tracking-widest shadow-lg">
                {tag}
              </span>
            ))}
          </div>

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-8 z-10">
            <h3 className="text-xl md:text-2xl font-serif font-bold text-white mb-3 leading-tight group-hover:text-purple-300 transition-colors duration-300">
              {drama.title}
            </h3>
            <p className="text-gray-400 text-xs leading-relaxed mb-6 line-clamp-2 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 font-sans">
              {drama.synopsis_short}
            </p>
            
            <div className="flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100">
              <span className="inline-flex items-center text-[10px] font-black text-purple-400 uppercase tracking-widest">
                Review <SafeIcon icon={FiArrowRight} className="ml-2" />
              </span>
              <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                <SafeIcon icon={FiMessageCircle} className="text-white text-xs" />
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
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth / 2 : scrollLeft + clientWidth / 2;
      scrollContainerRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  // Ensure we display exactly 8 dramas (or max available)
  const displayList = kdramas.slice(0, 8);

  if (isLoading) {
    return (
      <div className="flex gap-8 overflow-hidden py-10">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="shrink-0 w-[320px] aspect-[2/3] bg-white/5 rounded-[2rem] animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="relative group/carousel">
      {/* Navigation Buttons */}
      <div className="absolute -top-24 right-0 flex gap-4 z-20">
        <button 
          onClick={() => scroll('left')}
          className="w-12 h-12 rounded-full border border-white/10 bg-white/5 backdrop-blur-md flex items-center justify-center text-white hover:bg-purple-600 hover:border-purple-600 transition-all duration-300 shadow-xl"
        >
          <SafeIcon icon={FiChevronLeft} className="text-xl" />
        </button>
        <button 
          onClick={() => scroll('right')}
          className="w-12 h-12 rounded-full border border-white/10 bg-white/5 backdrop-blur-md flex items-center justify-center text-white hover:bg-purple-600 hover:border-purple-600 transition-all duration-300 shadow-xl"
        >
          <SafeIcon icon={FiChevronRight} className="text-xl" />
        </button>
      </div>

      {/* Carousel Container */}
      <div 
        ref={scrollContainerRef}
        className="flex gap-8 overflow-x-auto no-scrollbar pb-12 pt-4 px-4 -mx-4 scroll-smooth"
      >
        {displayList.map((drama, index) => (
          <KdramaCard key={drama.id} drama={drama} index={index} />
        ))}
        
        {/* "View All" Card */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="shrink-0 w-[280px] md:w-[320px] flex items-center justify-center"
        >
          <Link 
            to="/kdrama-recommendations" 
            className="flex flex-col items-center gap-6 group/all"
          >
            <div className="w-20 h-20 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center group-hover/all:border-purple-500 group-hover/all:bg-purple-500/10 transition-all duration-500">
              <SafeIcon icon={FiArrowRight} className="text-3xl text-white group-hover/all:translate-x-2 transition-transform" />
            </div>
            <span className="text-white font-serif text-2xl font-bold">View All Dramas</span>
          </Link>
        </motion.div>
      </div>

      {/* Progress Indicator (Subtle bottom line) */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-white/5">
        <motion.div 
          className="h-full bg-purple-600"
          initial={{ width: "0%" }}
          whileInView={{ width: "100%" }}
          transition={{ duration: 2 }}
        />
      </div>
    </div>
  );
};

export default KdramaGrid;