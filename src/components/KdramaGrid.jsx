import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import SafeImage from '../common/SafeImage';
import { useKdrama } from '../contexts/KdramaContext';
import { KDRAMA_PLACEHOLDER } from '../config/assets';

const { FiArrowRight, FiChevronRight } = FiIcons;

const KdramaCard = ({ drama, isFocused, isCenterFallback, onHover, onLeave }) => {
  let scale = 0.9;
  let opacity = 0.4;
  let zIndex = 10;
  let blur = "blur(4px)";
  let shadow = "none";

  // Priority 1: Mouse Hover | Priority 2: Intersection Center
  if (isFocused) {
    scale = 1.15;
    opacity = 1;
    zIndex = 40;
    blur = "blur(0px)";
    shadow = "0 25px 60px rgba(168,85,247,0.4)";
  } else if (isCenterFallback) {
    scale = 1.05;
    opacity = 0.9;
    zIndex = 30;
    blur = "blur(0px)";
    shadow = "0 15px 40px rgba(168,85,247,0.15)";
  }

  return (
    <motion.div
      data-id={drama.id}
      onPointerEnter={() => onHover(drama.id)}
      onPointerLeave={onLeave}
      animate={{ scale, opacity, zIndex }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      style={{ filter: blur, boxShadow: shadow }}
      className="kdrama-card-container shrink-0 w-[300px] md:w-[450px] snap-center px-4 py-20 relative"
    >
      <Link to={`/kdrama-recommendations/${drama.slug || drama.id}`} className="block">
        <div className={`relative aspect-video rounded-[2.5rem] overflow-hidden bg-purple-950/40 border-2 transition-all duration-500 ${isFocused ? 'border-purple-400' : 'border-white/5'}`}>
          <SafeImage src={drama.image_url || drama.image} alt={drama.title} fallback={KDRAMA_PLACEHOLDER} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent" />
          
          <div className="absolute top-6 left-6">
            <span className="px-3 py-1 bg-black/40 backdrop-blur-md text-white text-[9px] font-black rounded-full border border-white/10 uppercase tracking-widest">
              {drama.tags?.[0] || 'Drama'}
            </span>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-8">
            <h3 className="text-2xl md:text-3xl font-serif font-bold text-white mb-2 leading-tight">
              {drama.title}
            </h3>
            <AnimatePresence>
              {(isFocused || isCenterFallback) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="flex items-center justify-between"
                >
                  <p className="text-gray-300 text-xs font-sans line-clamp-1 max-w-[70%] italic">
                    {drama.synopsis_short}
                  </p>
                  <span className="flex items-center text-[10px] font-black text-purple-400 uppercase tracking-widest">
                    Review <SafeIcon icon={FiArrowRight} className="ml-2" />
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

const KdramaGrid = () => {
  const { featuredKdramas, isLoading } = useKdrama();
  const scrollContainerRef = useRef(null);
  const [hoveredId, setHoveredId] = useState(null);
  const [centerId, setCenterId] = useState(null);

  // Intersection Observer to detect which card is in the center of the viewport
  useEffect(() => {
    if (isLoading || featuredKdramas.length === 0) return;

    const options = {
      root: scrollContainerRef.current,
      rootMargin: '0px -40% 0px -40%', // Tight window to detect the center-most card
      threshold: 0.5
    };

    const callback = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('data-id');
          if (id) setCenterId(id);
        }
      });
    };

    const observer = new IntersectionObserver(callback, options);
    const cards = scrollContainerRef.current.querySelectorAll('.kdrama-card-container');
    cards.forEach(card => observer.observe(card));

    return () => observer.disconnect();
  }, [featuredKdramas, isLoading]);

  if (isLoading) {
    return (
      <div className="h-[500px] flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="relative group/main -mx-4 px-4 h-[600px] flex flex-col justify-center overflow-hidden">
      {/* Gradient Overlays with pointer-events enabled to allow interactions through them */}
      <div className="absolute left-0 top-0 bottom-0 w-32 z-40 bg-gradient-to-r from-gray-950 to-transparent opacity-80" />
      <div className="absolute right-0 top-0 bottom-0 w-32 z-40 bg-gradient-to-l from-gray-950 to-transparent opacity-80" />

      {/* Main Scroll Container using native snap-x */}
      <div 
        ref={scrollContainerRef}
        className="flex items-center gap-0 overflow-x-auto no-scrollbar snap-x snap-mandatory py-10"
        style={{ scrollPadding: '0 25%' }}
      >
        {/* Padding for snap alignment */}
        <div className="shrink-0 w-[20vw]" />

        {featuredKdramas.map((drama) => (
          <KdramaCard 
            key={drama.id} 
            drama={drama} 
            isFocused={hoveredId === drama.id}
            isCenterFallback={!hoveredId && centerId === String(drama.id)}
            onHover={setHoveredId}
            onLeave={() => setHoveredId(null)}
          />
        ))}

        {/* View All Card */}
        <div className="kdrama-card-container shrink-0 w-[300px] md:w-[450px] snap-center px-4 py-20 relative">
          <Link to="/kdrama-recommendations" className="flex flex-col items-center justify-center aspect-video rounded-[2.5rem] border-2 border-dashed border-white/20 hover:border-purple-400 bg-white/5 group/link transition-all duration-500">
            <div className="w-16 h-16 rounded-full bg-purple-600 flex items-center justify-center mb-4 group-hover/link:scale-110 transition-transform shadow-lg shadow-purple-500/20">
              <SafeIcon icon={FiChevronRight} className="text-2xl text-white" />
            </div>
            <span className="text-white font-serif text-xl font-bold">View Full Watchlist</span>
          </Link>
        </div>

        <div className="shrink-0 w-[20vw]" />
      </div>

      {/* Pagination Indicators */}
      <div className="flex justify-center items-center gap-2 mt-8 z-40">
        {featuredKdramas.map((drama) => (
          <div 
            key={drama.id} 
            className={`h-1 rounded-full transition-all duration-500 ${
              (hoveredId === drama.id || (!hoveredId && centerId === String(drama.id))) 
                ? 'w-10 bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.6)]' 
                : 'w-2 bg-white/20'
            }`} 
          />
        ))}
      </div>
    </div>
  );
};

export default KdramaGrid;