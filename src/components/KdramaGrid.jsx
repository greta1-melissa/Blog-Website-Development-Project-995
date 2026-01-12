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
      className="kdrama-card-container shrink-0 w-[60vw] sm:w-[40vw] md:w-[36vw] lg:w-[27vw] xl:w-[24vw] snap-center px-5 py-20 relative select-none"
    >
      <Link 
        to={`/kdrama-recommendations/${drama.slug || drama.id}`} 
        className={`block outline-none rounded-[1.5rem] overflow-hidden ${isDragging ? 'pointer-events-none' : ''}`}
      >
        <div className={`relative aspect-[2/3] rounded-[1.5rem] overflow-hidden bg-purple-950/40 border-2 transition-all duration-700 ${
          isCenter 
            ? 'border-purple-400/60 shadow-[0_20px_50px_-12px_rgba(168,85,247,0.4)]' 
            : 'border-white/5 shadow-none'
        }`}>
          <SafeImage 
            src={drama.image_url || drama.image} 
            alt={drama.title} 
            fallback={KDRAMA_PLACEHOLDER} 
            className="w-full h-full object-cover pointer-events-none transform scale-105" 
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none" />
          
          <div className="absolute top-5 left-5 pointer-events-none">
            <span className="px-2.5 py-1 bg-purple-600/80 backdrop-blur-md text-white text-[9px] font-black rounded-full border border-white/20 uppercase tracking-[0.2em]">
              {drama.tags?.[0] || 'Drama'}
            </span>
          </div>

          {/* Adjusted padding and spacing for longer synopsis */}
          <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6 lg:p-7 pointer-events-none">
            <h3 className="text-xl md:text-2xl lg:text-3xl font-serif font-bold text-white mb-2 leading-tight drop-shadow-lg">
              {drama.title}
            </h3>
            
            <AnimatePresence>
              {isCenter && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 15 }}
                  transition={{ delay: 0.1 }}
                  className="space-y-2"
                >
                  {/* line-clamp-3 ensures up to 2-3 lines of text (approx 2 sentences) */}
                  <p className="text-gray-200 text-xs md:text-[13px] font-sans line-clamp-3 leading-snug italic opacity-95">
                    {drama.synopsis_short}
                  </p>
                  
                  <div className="flex items-center text-[9px] font-black text-purple-400 uppercase tracking-[0.2em] pt-1">
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

  if (isLoading) return <div className="h-[600px] flex items-center justify-center animate-pulse text-purple-400 font-bold uppercase tracking-widest">Loading...</div>;

  return (
    <div className="relative w-full max-w-[100vw] overflow-hidden">
      <div className="text-center pb-4 z-50 pointer-events-none">
        <span className="text-sm md:text-base font-sans font-bold text-purple-400/90 uppercase tracking-[0.3em]">
          Featured K-Dramas: {Math.min(featuredKdramas.length, 8)} Items
        </span>
      </div>

      <div className="grid grid-cols-[50px_1fr_50px] md:grid-cols-[90px_1fr_90px] lg:grid-cols-[120px_1fr_120px] items-center">
        
        <div className="flex justify-center z-50">
          <button 
            onPointerDown={(e) => startContinuousScroll(e, -1)}
            onPointerUp={stopContinuousScroll}
            onPointerLeave={stopContinuousScroll}
            onClick={(e) => scrollStep(e, -1)}
            disabled={!canScrollLeft}
            className={`w-11 h-11 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all shadow-2xl ${
              canScrollLeft 
              ? 'bg-white/10 backdrop-blur-2xl border border-white/20 text-white hover:bg-purple-600 active:scale-95' 
              : 'bg-white/5 border-white/5 text-white/20 cursor-not-allowed opacity-20'
            }`}
          >
            <SafeIcon icon={FiChevronLeft} className="text-xl md:text-2xl" />
          </button>
        </div>

        <div className="relative h-[700px] flex flex-col justify-center overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-20 md:w-40 z-30 bg-gradient-to-r from-gray-950 to-transparent pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 md:w-40 z-30 bg-gradient-to-l from-gray-950 to-transparent pointer-events-none" />

          <div 
            ref={containerRef}
            onScroll={onScroll}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={stopDragging}
            onMouseLeave={stopDragging}
            className={`flex items-center no-scrollbar overflow-x-auto py-8 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
            style={{ 
              scrollSnapType: 'x mandatory', 
              scrollPadding: '0 38%',
              scrollbarWidth: 'none'
            }}
          >
            <div className="shrink-0 w-[20vw] md:w-[32vw] lg:w-[38vw]" />
            
            {featuredKdramas.slice(0, 8).map((drama) => (
              <KdramaCard 
                key={drama.id} 
                drama={drama} 
                isDragging={isDragging}
                isCenter={centerId === String(drama.id)} 
              />
            ))}

            <div className="shrink-0 w-[20vw] md:w-[32vw] lg:w-[38vw]" />
          </div>
        </div>

        <div className="flex justify-center z-50">
          <button 
            onPointerDown={(e) => startContinuousScroll(e, 1)}
            onPointerUp={stopContinuousScroll}
            onPointerLeave={stopContinuousScroll}
            onClick={(e) => scrollStep(e, 1)}
            disabled={!canScrollRight}
            className={`w-11 h-11 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all shadow-2xl ${
              canScrollRight 
              ? 'bg-white/10 backdrop-blur-2xl border border-white/20 text-white hover:bg-purple-600 active:scale-95' 
              : 'bg-white/5 border-white/5 text-white/20 cursor-not-allowed opacity-20'
            }`}
          >
            <SafeIcon icon={FiChevronRight} className="text-xl md:text-2xl" />
          </button>
        </div>
      </div>

      <div className="flex justify-center items-center gap-3 mt-2 z-40 pb-8">
        {featuredKdramas.slice(0, 8).map((drama) => (
          <div 
            key={drama.id} 
            className={`h-1 rounded-full transition-all duration-700 ${
              centerId === String(drama.id) 
                ? 'w-12 bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.8)]' 
                : 'w-2.5 bg-white/10'
            }`} 
          />
        ))}
      </div>
    </div>
  );
};

export default KdramaGrid;