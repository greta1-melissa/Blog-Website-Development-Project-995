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
  // Center: 1.15 scale, Sides: 0.85 scale for dramatic spotlight effect
  const scale = isCenter ? 1.15 : 0.85;
  const opacity = isCenter ? 1 : 0.4;
  const zIndex = isCenter ? 40 : 20;
  const blur = isCenter ? "blur(0px)" : "blur(6px)";

  return (
    <motion.div
      data-id={drama.id}
      animate={{ scale, opacity, zIndex }}
      transition={{ type: "spring", stiffness: 180, damping: 22 }}
      style={{ filter: blur }}
      className="kdrama-card-container shrink-0 w-[75vw] sm:w-[50vw] md:w-[45vw] lg:w-[34vw] xl:w-[30vw] snap-center px-6 py-28 relative select-none"
    >
      <Link 
        to={`/kdrama-recommendations/${drama.slug || drama.id}`} 
        className={`block outline-none rounded-[2rem] overflow-hidden ${isDragging ? 'pointer-events-none' : ''}`}
      >
        {/* Card Body: Portrait Aspect Ratio 2/3 */}
        <div className={`relative aspect-[2/3] rounded-[2rem] overflow-hidden bg-purple-950/40 border-2 transition-all duration-700 ${
          isCenter 
            ? 'border-purple-400/60 shadow-[0_25px_60px_-15px_rgba(168,85,247,0.4)]' 
            : 'border-white/5 shadow-none'
        }`}>
          <SafeImage 
            src={drama.image_url || drama.image} 
            alt={drama.title} 
            fallback={KDRAMA_PLACEHOLDER} 
            className="w-full h-full object-cover pointer-events-none transform scale-105" 
          />
          
          {/* Gradient Overlay (Pointer-events: none to allow Link clicks) */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none" />
          
          {/* Category Tag */}
          <div className="absolute top-6 left-6 pointer-events-none">
            <span className="px-3 py-1 bg-purple-600/80 backdrop-blur-md text-white text-[10px] font-black rounded-full border border-white/20 uppercase tracking-[0.2em]">
              {drama.tags?.[0] || 'Drama'}
            </span>
          </div>

          {/* Content Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-10 pointer-events-none">
            <h3 className="text-2xl md:text-3xl xl:text-4xl font-serif font-bold text-white mb-4 leading-tight drop-shadow-lg">
              {drama.title}
            </h3>
            
            <AnimatePresence>
              {isCenter && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ delay: 0.1 }}
                  className="space-y-4"
                >
                  <p className="text-gray-200 text-sm md:text-base font-sans line-clamp-2 leading-relaxed italic opacity-90">
                    {drama.synopsis_short}
                  </p>
                  
                  <div className="flex items-center text-[10px] font-black text-purple-400 uppercase tracking-[0.2em] pt-2">
                    Full Review <SafeIcon icon={FiArrowRight} className="ml-2" />
                  </div>
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
      }, 250);
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
      }, 400);
    }
  }, [isLoading, featuredKdramas, updateCenterCard]);

  const startContinuousScroll = (e, direction) => {
    e.stopPropagation();
    e.preventDefault();
    const step = () => {
      if (containerRef.current) {
        containerRef.current.scrollLeft += direction * 10;
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

  if (isLoading) return <div className="h-[700px] flex items-center justify-center animate-pulse text-purple-400 font-bold uppercase tracking-widest">Loading...</div>;

  return (
    <div className="relative w-full max-w-[100vw] overflow-hidden">
      {/* Debug Info */}
      <div className="text-center py-4 z-50 pointer-events-none">
        <span className="text-[10px] font-mono text-purple-400/50 uppercase tracking-[0.3em]">
          Featured Collection: {Math.min(featuredKdramas.length, 8)} Items
        </span>
      </div>

      {/* Side Gutter Layout */}
      <div className="grid grid-cols-[56px_1fr_56px] md:grid-cols-[100px_1fr_100px] lg:grid-cols-[130px_1fr_130px] items-center">
        
        {/* Left Gutter */}
        <div className="flex justify-center z-50">
          <button 
            onPointerDown={(e) => startContinuousScroll(e, -1)}
            onPointerUp={stopContinuousScroll}
            onPointerLeave={stopContinuousScroll}
            onClick={(e) => scrollStep(e, -1)}
            disabled={!canScrollLeft}
            className={`w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center transition-all shadow-2xl ${
              canScrollLeft 
              ? 'bg-white/10 backdrop-blur-2xl border border-white/20 text-white hover:bg-purple-600 active:scale-95' 
              : 'bg-white/5 border-white/5 text-white/20 cursor-not-allowed opacity-20'
            }`}
          >
            <SafeIcon icon={FiChevronLeft} className="text-2xl md:text-3xl" />
          </button>
        </div>

        {/* Center: Scroll Container (Taller for Portrait) */}
        <div className="relative h-[850px] flex flex-col justify-center overflow-hidden">
          {/* Decorative Overlays */}
          <div className="absolute left-0 top-0 bottom-0 w-20 md:w-40 z-30 bg-gradient-to-r from-gray-950 to-transparent pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 md:w-40 z-30 bg-gradient-to-l from-gray-950 to-transparent pointer-events-none" />

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
              scrollPadding: '0 33%',
              scrollbarWidth: 'none'
            }}
          >
            {/* Spacers for Centering first/last items */}
            <div className="shrink-0 w-[15vw] md:w-[25vw] lg:w-[33vw]" />
            
            {featuredKdramas.slice(0, 8).map((drama) => (
              <KdramaCard 
                key={drama.id} 
                drama={drama} 
                isDragging={isDragging}
                isCenter={centerId === String(drama.id)} 
              />
            ))}

            <div className="shrink-0 w-[15vw] md:w-[25vw] lg:w-[33vw]" />
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
            className={`w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center transition-all shadow-2xl ${
              canScrollRight 
              ? 'bg-white/10 backdrop-blur-2xl border border-white/20 text-white hover:bg-purple-600 active:scale-95' 
              : 'bg-white/5 border-white/5 text-white/20 cursor-not-allowed opacity-20'
            }`}
          >
            <SafeIcon icon={FiChevronRight} className="text-2xl md:text-3xl" />
          </button>
        </div>
      </div>

      {/* Modern Pill Indicators */}
      <div className="flex justify-center items-center gap-4 mt-2 z-40 pb-12">
        {featuredKdramas.slice(0, 8).map((drama) => (
          <div 
            key={drama.id} 
            className={`h-1.5 rounded-full transition-all duration-700 ${
              centerId === String(drama.id) 
                ? 'w-16 bg-purple-500 shadow-[0_0_20px_rgba(168,85,247,1)]' 
                : 'w-3 bg-white/10'
            }`} 
          />
        ))}
      </div>
    </div>
  );
};

export default KdramaGrid;