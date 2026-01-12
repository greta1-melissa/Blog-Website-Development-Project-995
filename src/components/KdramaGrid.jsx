import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import SafeImage from '../common/SafeImage';
import { useKdrama } from '../contexts/KdramaContext';
import { KDRAMA_PLACEHOLDER } from '../config/assets';

const { FiArrowRight, FiChevronLeft, FiChevronRight } = FiIcons;

const KdramaCard = ({ drama, isDragging, isCenter }) => {
  const scale = isCenter ? 1.12 : 0.88;
  const opacity = isCenter ? 1 : 0.4;
  const zIndex = isCenter ? 40 : 20;
  const blur = isCenter ? "blur(0px)" : "blur(4px)";

  return (
    <motion.div
      data-id={drama.id}
      animate={{ scale, opacity, zIndex }}
      transition={{ type: "spring", stiffness: 200, damping: 25 }}
      style={{ filter: blur }}
      className="kdrama-card-container shrink-0 w-[75vw] sm:w-[50vw] md:w-[40vw] lg:w-[30vw] xl:w-[28vw] snap-center px-4 py-20 relative select-none"
    >
      <Link 
        to={`/kdrama-recommendations/${drama.slug || drama.id}`} 
        className={`block outline-none ${isDragging ? 'pointer-events-none' : ''}`}
      >
        <div className={`relative aspect-video rounded-[2.5rem] overflow-hidden bg-purple-950/40 border-2 transition-all duration-500 ${isCenter ? 'border-purple-400/50 shadow-2xl shadow-purple-500/20' : 'border-white/5'}`}>
          <SafeImage src={drama.image_url || drama.image} alt={drama.title} fallback={KDRAMA_PLACEHOLDER} className="w-full h-full object-cover pointer-events-none" />
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
  const containerRef = useRef(null);
  const rafRef = useRef();
  const snapTimerRef = useRef();
  const longPressTimerRef = useRef();
  
  const [centerId, setCenterId] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateCenterCard = useCallback(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const containerCenter = container.scrollLeft + container.offsetWidth / 2;
    const cards = container.querySelectorAll('.kdrama-card-container');
    
    let closestId = null;
    let minDistance = Infinity;

    cards.forEach(card => {
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const distance = Math.abs(containerCenter - cardCenter);
      if (distance < minDistance) {
        minDistance = distance;
        closestId = card.getAttribute('data-id');
      }
    });

    setCenterId(closestId);
    setCanScrollLeft(container.scrollLeft > 10);
    setCanScrollRight(container.scrollLeft < (container.scrollWidth - container.offsetWidth - 10));
  }, []);

  const onScroll = () => {
    updateCenterCard();
    clearTimeout(snapTimerRef.current);
    if (!isDragging) {
      snapTimerRef.current = setTimeout(() => {
        const closest = containerRef.current?.querySelector(`[data-id="${centerId}"]`);
        if (closest) {
          closest.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
      }, 200);
    }
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - containerRef.current.offsetLeft);
    setScrollLeft(containerRef.current.scrollLeft);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    containerRef.current.scrollLeft = scrollLeft - walk;
  };

  const stopDragging = () => setIsDragging(false);

  useEffect(() => {
    if (!isLoading && featuredKdramas.length > 0) {
      setTimeout(() => {
        const cards = containerRef.current?.querySelectorAll('.kdrama-card-container');
        if (cards?.[1]) {
          cards[1].scrollIntoView({ behavior: 'auto', block: 'nearest', inline: 'center' });
        }
        updateCenterCard();
      }, 300);
    }
  }, [isLoading, featuredKdramas, updateCenterCard]);

  const startContinuousScroll = (e, direction) => {
    e.stopPropagation();
    e.preventDefault();
    const step = () => {
      if (containerRef.current) {
        containerRef.current.scrollLeft += direction * 8;
        rafRef.current = requestAnimationFrame(step);
      }
    };
    longPressTimerRef.current = setTimeout(() => {
      rafRef.current = requestAnimationFrame(step);
    }, 200);
  };

  const stopContinuousScroll = (e) => {
    if (e) e.stopPropagation();
    clearTimeout(longPressTimerRef.current);
    cancelAnimationFrame(rafRef.current);
  };

  const scrollStep = (e, direction) => {
    e.stopPropagation();
    e.preventDefault();
    const cardWidth = containerRef.current?.querySelector('.kdrama-card-container')?.offsetWidth || 400;
    containerRef.current?.scrollBy({ left: direction * cardWidth, behavior: 'smooth' });
  };

  if (isLoading) return <div className="h-[500px] flex items-center justify-center animate-pulse text-purple-400 font-bold uppercase tracking-widest">Loading...</div>;

  return (
    <div className="relative w-full max-w-[100vw] overflow-hidden">
      {/* Debug Info */}
      <div className="text-center py-2 z-50 pointer-events-none">
        <span className="text-[10px] font-mono text-purple-400/50 uppercase tracking-widest">
          Featured: {featuredKdramas.length} | Rendering: {Math.min(featuredKdramas.length, 8)}
        </span>
      </div>

      {/* 3-Column Layout: [Left Gutter] [Carousel] [Right Gutter] */}
      <div className="grid grid-cols-[48px_1fr_48px] md:grid-cols-[80px_1fr_80px] lg:grid-cols-[100px_1fr_100px] items-center">
        
        {/* Left Gutter */}
        <div className="flex justify-center z-50">
          <button 
            onPointerDown={(e) => startContinuousScroll(e, -1)}
            onPointerUp={stopContinuousScroll}
            onPointerLeave={stopContinuousScroll}
            onClick={(e) => scrollStep(e, -1)}
            disabled={!canScrollLeft}
            className={`w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all shadow-2xl ${
              canScrollLeft 
              ? 'bg-white/10 backdrop-blur-xl border border-white/20 text-white hover:bg-purple-600 active:scale-90' 
              : 'bg-white/5 border-white/5 text-white/20 cursor-not-allowed opacity-30'
            }`}
          >
            <SafeIcon icon={FiChevronLeft} className="text-xl md:text-2xl" />
          </button>
        </div>

        {/* Center: Scroll Container */}
        <div className="relative h-[600px] flex flex-col justify-center overflow-hidden">
          {/* Decorative Overlays (Interaction-Safe) */}
          <div className="absolute left-0 top-0 bottom-0 w-16 md:w-32 z-30 bg-gradient-to-r from-gray-950 to-transparent pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 md:w-32 z-30 bg-gradient-to-l from-gray-950 to-transparent pointer-events-none" />

          <div 
            ref={containerRef}
            onScroll={onScroll}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={stopDragging}
            onMouseLeave={stopDragging}
            className={`flex items-center no-scrollbar overflow-x-auto py-10 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
            style={{ 
              scrollSnapType: 'x mandatory', 
              scrollPadding: '0 30%',
              scrollbarWidth: 'none'
            }}
          >
            {/* Spacers for Centering first/last items */}
            <div className="shrink-0 w-[20vw] md:w-[35vw]" />
            
            {featuredKdramas.slice(0, 8).map((drama) => (
              <KdramaCard 
                key={drama.id} 
                drama={drama} 
                isDragging={isDragging}
                isCenter={centerId === String(drama.id)} 
              />
            ))}

            <div className="shrink-0 w-[20vw] md:w-[35vw]" />
          </div>
        </div>

        {/* Right Gutter */}
        <div className="flex justify-center z-50">
          <button 
            onPointerDown={(e) => startContinuousScroll(e, 1)}
            onPointerUp={stopContinuousScroll}
            onPointerLeave={stopContinuousScroll}
            onClick={(e) => scrollStep(e, 1)}
            disabled={!canScrollRight}
            className={`w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all shadow-2xl ${
              canScrollRight 
              ? 'bg-white/10 backdrop-blur-xl border border-white/20 text-white hover:bg-purple-600 active:scale-90' 
              : 'bg-white/5 border-white/5 text-white/20 cursor-not-allowed opacity-30'
            }`}
          >
            <SafeIcon icon={FiChevronRight} className="text-xl md:text-2xl" />
          </button>
        </div>
      </div>

      {/* Indicators */}
      <div className="flex justify-center items-center gap-3 mt-4 z-40">
        {featuredKdramas.slice(0, 8).map((drama) => (
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