import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import SafeImage from '../common/SafeImage';
import { useKdrama } from '../contexts/KdramaContext';
import { KDRAMA_PLACEHOLDER } from '../config/assets';

const { FiArrowRight, FiChevronLeft, FiChevronRight } = FiIcons;

const KdramaCard = ({ drama, isHovered, isCenter }) => {
  // Requirements: center 1.12, sides 0.88. Hover gets a slight extra boost for feedback.
  const scale = isHovered ? 1.15 : (isCenter ? 1.12 : 0.88);
  const opacity = isHovered || isCenter ? 1 : 0.4;
  const zIndex = isHovered ? 50 : (isCenter ? 40 : 20);
  const blur = isHovered || isCenter ? "blur(0px)" : "blur(4px)";

  return (
    <motion.div
      data-id={drama.id}
      animate={{ scale, opacity, zIndex }}
      transition={{ type: "spring", stiffness: 200, damping: 25 }}
      style={{ filter: blur }}
      className="kdrama-card-container shrink-0 w-[80vw] sm:w-[55vw] md:w-[40vw] lg:w-[30vw] xl:w-[28vw] snap-center px-4 py-20 relative"
    >
      <Link to={`/kdrama-recommendations/${drama.slug || drama.id}`} className="block">
        <div className={`relative aspect-video rounded-[2.5rem] overflow-hidden bg-purple-950/40 border-2 transition-all duration-500 ${isCenter ? 'border-purple-400/50 shadow-2xl shadow-purple-500/20' : 'border-white/5'}`}>
          <SafeImage src={drama.image_url || drama.image} alt={drama.title} fallback={KDRAMA_PLACEHOLDER} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/10 to-transparent" />
          
          <div className="absolute top-6 left-6">
            <span className="px-3 py-1 bg-black/40 backdrop-blur-md text-white text-[9px] font-black rounded-full border border-white/10 uppercase tracking-widest">
              {drama.tags?.[0] || 'Drama'}
            </span>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-8">
            <h3 className="text-xl md:text-2xl font-serif font-bold text-white mb-2 leading-tight">
              {drama.title}
            </h3>
            <AnimatePresence>
              {isCenter && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="flex items-center justify-between"
                >
                  <p className="text-gray-300 text-[10px] font-sans line-clamp-1 max-w-[70%] italic">
                    {drama.synopsis_short}
                  </p>
                  <span className="flex items-center text-[9px] font-black text-purple-400 uppercase tracking-widest">
                    Review <SafeIcon icon={FiArrowRight} className="ml-1" />
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
  const requestRef = useRef();
  const [centerId, setCenterId] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);

  // Initial scroll to 2nd card (index 1)
  useEffect(() => {
    if (!isLoading && featuredKdramas.length > 1 && scrollContainerRef.current) {
      const timer = setTimeout(() => {
        const cards = scrollContainerRef.current.querySelectorAll('.kdrama-card-container');
        if (cards[1]) {
          cards[1].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [isLoading, featuredKdramas]);

  // Intersection Observer for center spotlight detection
  useEffect(() => {
    if (isLoading || featuredKdramas.length === 0) return;

    const options = {
      root: scrollContainerRef.current,
      rootMargin: '0px -30% 0px -30%', // Window to detect the centered card
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

  // Continuous Smooth Hover-to-Scroll Logic
  const startScrolling = useCallback((direction) => {
    const scrollHandler = () => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollLeft += direction * 6; // Scroll speed
        requestRef.current = requestAnimationFrame(scrollHandler);
      }
    };
    requestRef.current = requestAnimationFrame(scrollHandler);
  }, []);

  const stopScrolling = useCallback(() => {
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }
  }, []);

  // Click-to-Scroll step by step
  const scrollByStep = (direction) => {
    if (scrollContainerRef.current) {
      const firstCard = scrollContainerRef.current.querySelector('.kdrama-card-container');
      const stepWidth = firstCard ? firstCard.offsetWidth : 400;
      scrollContainerRef.current.scrollBy({ left: direction * stepWidth, behavior: 'smooth' });
    }
  };

  if (isLoading) {
    return (
      <div className="h-[500px] flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="relative -mx-4 px-4 h-[650px] flex flex-col justify-center overflow-hidden">
      {/* Debug Line */}
      <div className="absolute top-0 left-0 right-0 text-center py-2 z-50 pointer-events-none">
        <span className="text-[10px] font-mono text-purple-400/50 uppercase tracking-widest">
          Featured returned: {featuredKdramas.length} | Rendered: {Math.min(featuredKdramas.length, 8)}
        </span>
      </div>

      {/* Decorative Overlays - pointer-events-none ensures they don't block clicks/hover */}
      <div className="absolute left-0 top-0 bottom-0 w-48 z-30 bg-gradient-to-r from-gray-950 via-gray-950/40 to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-48 z-30 bg-gradient-to-l from-gray-950 via-gray-950/40 to-transparent pointer-events-none" />

      {/* Navigation Arrows - Always visible */}
      <div className="absolute left-6 md:left-12 top-1/2 -translate-y-1/2 z-50 flex items-center">
        <button 
          onPointerEnter={() => startScrolling(-1)}
          onPointerLeave={stopScrolling}
          onClick={() => scrollByStep(-1)}
          className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white flex items-center justify-center hover:bg-purple-600 hover:border-purple-500 transition-all shadow-2xl active:scale-95"
          aria-label="Scroll Left"
        >
          <SafeIcon icon={FiChevronLeft} className="text-2xl" />
        </button>
      </div>

      <div className="absolute right-6 md:right-12 top-1/2 -translate-y-1/2 z-50 flex items-center">
        <button 
          onPointerEnter={() => startScrolling(1)}
          onPointerLeave={stopScrolling}
          onClick={() => scrollByStep(1)}
          className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white flex items-center justify-center hover:bg-purple-600 hover:border-purple-500 transition-all shadow-2xl active:scale-95"
          aria-label="Scroll Right"
        >
          <SafeIcon icon={FiChevronRight} className="text-2xl" />
        </button>
      </div>

      {/* Main Responsive Grid Container */}
      <div 
        ref={scrollContainerRef}
        className="flex items-center gap-0 overflow-x-auto no-scrollbar snap-x snap-mandatory py-10 cursor-grab active:cursor-grabbing"
        style={{ scrollPadding: '0 35%' }}
      >
        {/* Padding for centering first/last cards (Responsive) */}
        <div className="shrink-0 w-[10vw] sm:w-[20vw] lg:w-[35vw]" />

        {featuredKdramas.map((drama) => (
          <div 
            key={drama.id} 
            onPointerEnter={() => setHoveredId(drama.id)}
            onPointerLeave={() => setHoveredId(null)}
          >
            <KdramaCard 
              drama={drama} 
              isHovered={hoveredId === drama.id}
              isCenter={centerId === String(drama.id)}
            />
          </div>
        ))}

        <div className="shrink-0 w-[10vw] sm:w-[20vw] lg:w-[35vw]" />
      </div>

      {/* Pagination Indicators */}
      <div className="flex justify-center items-center gap-3 mt-4 z-40">
        {featuredKdramas.map((drama) => (
          <div 
            key={drama.id} 
            className={`h-1 rounded-full transition-all duration-700 ${
              centerId === String(drama.id) 
                ? 'w-12 bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.8)]' 
                : 'w-2 bg-white/10'
            }`} 
          />
        ))}
      </div>
    </div>
  );
};

export default KdramaGrid;