import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import SafeImage from '../common/SafeImage';
import { useKdrama } from '../contexts/KdramaContext';
import { KDRAMA_PLACEHOLDER } from '../config/assets';

const { FiArrowRight, FiMessageCircle, FiChevronRight, FiChevronLeft } = FiIcons;

const KdramaCard = ({ drama, index, focusState }) => {
  // Define styles based on focus state
  const getStyles = () => {
    switch (focusState) {
      case 'isFocus':
        return "scale-[1.18] z-20 opacity-100 shadow-[0_20px_50px_rgba(168,85,247,0.4)] border-purple-400/50 blur-0";
      case 'isNear':
        return "scale-[0.96] z-10 opacity-70 border-white/10 blur-[1px]";
      case 'isFar':
        return "scale-[0.88] z-0 opacity-40 border-white/5 blur-[3px]";
      default:
        return "scale-100 opacity-100 blur-0";
    }
  };

  return (
    <motion.div
      layout
      transition={{ duration: 0.22, ease: "easeOut" }}
      className={`shrink-0 w-[280px] md:w-[350px] scroll-snap-align-center px-4 py-12 transition-all duration-300 ease-out transform ${getStyles()}`}
    >
      <Link to={`/kdrama-recommendations/${drama.slug || drama.id}`} className="block">
        <div className="relative aspect-[2/3] rounded-[2.5rem] overflow-hidden bg-purple-950/20 border-2 transition-colors duration-500">
          <SafeImage 
            src={drama.image_url || drama.image} 
            alt={drama.title} 
            fallback={KDRAMA_PLACEHOLDER} 
            className="w-full h-full object-cover" 
            loading="lazy" 
          />
          
          <div className={`absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent transition-opacity duration-500 ${focusState === 'isFocus' ? 'opacity-90' : 'opacity-70'}`} />
          
          {focusState === 'isFocus' && (
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(168,85,247,0.4),transparent_70%)] pointer-events-none" />
          )}

          <div className="absolute top-6 left-6 z-10">
            {drama.tags && drama.tags.slice(0, 1).map((tag, idx) => (
              <span key={idx} className="px-4 py-1.5 bg-white/10 backdrop-blur-md text-white text-[10px] font-black rounded-full border border-white/20 uppercase tracking-[0.2em]">
                {tag}
              </span>
            ))}
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-8 z-10">
            <h3 className={`text-xl md:text-2xl font-serif font-bold text-white mb-3 leading-tight transition-colors duration-300 ${focusState === 'isFocus' ? 'text-purple-300' : ''}`}>
              {drama.title}
            </h3>
            
            {focusState === 'isFocus' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <p className="text-gray-400 text-xs leading-relaxed mb-6 line-clamp-2 font-sans">
                  {drama.synopsis_short}
                </p>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center text-[10px] font-black text-purple-400 uppercase tracking-widest">
                    Full Review <SafeIcon icon={FiArrowRight} className="ml-2" />
                  </span>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

const KdramaGrid = () => {
  const { kdramas, isLoading } = useKdrama();
  const scrollContainerRef = useRef(null);
  const scrollRaf = useRef(null);
  const [focusIndex, setFocusIndex] = useState(1);
  const [isMouseIn, setIsMouseIn] = useState(false);
  const [hoverStartTime, setHoverStartTime] = useState(null);

  // Track Focus (Mouse vs Center)
  const updateFocus = useCallback((event) => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const children = container.querySelectorAll('.scroll-snap-align-center');
    
    let targetX;
    if (event && event.type === 'mousemove') {
      targetX = event.clientX;
    } else {
      // Center fallback
      targetX = container.getBoundingClientRect().left + container.clientWidth / 2;
    }

    let closestIdx = 0;
    let minDistance = Infinity;

    children.forEach((child, idx) => {
      const rect = child.getBoundingClientRect();
      const childCenter = rect.left + rect.width / 2;
      const distance = Math.abs(targetX - childCenter);
      if (distance < minDistance) {
        minDistance = distance;
        closestIdx = idx;
      }
    });

    setFocusIndex(closestIdx);
  }, []);

  // Accelerated Scroll Logic
  const startAutoScroll = (direction) => {
    setHoverStartTime(Date.now());
    const scroll = () => {
      if (scrollContainerRef.current) {
        const elapsed = Date.now() - (hoverStartTime || Date.now());
        const speed = elapsed > 300 ? 38 : 22; // Ramp up speed
        scrollContainerRef.current.scrollLeft += direction * speed;
        updateFocus(); // Keep spotlight updated while scrolling
        scrollRaf.current = requestAnimationFrame(scroll);
      }
    };
    scrollRaf.current = requestAnimationFrame(scroll);
  };

  const stopAutoScroll = () => {
    if (scrollRaf.current) cancelAnimationFrame(scrollRaf.current);
    setHoverStartTime(null);
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', () => !isMouseIn && updateFocus());
      updateFocus();
    }
    return () => container?.removeEventListener('scroll', updateFocus);
  }, [updateFocus, isMouseIn, isLoading]);

  const displayList = kdramas.slice(0, 4);

  if (isLoading) return <div className="h-[500px] flex items-center justify-center text-purple-400">Loading...</div>;

  return (
    <div 
      className="relative group/carousel -mx-4 px-4 h-[700px] flex flex-col justify-center overflow-hidden"
      onMouseMove={(e) => { setIsMouseIn(true); updateFocus(e); }}
      onMouseLeave={() => { setIsMouseIn(false); updateFocus(); stopAutoScroll(); }}
    >
      {/* Turbo Scroll Zones */}
      <div className="absolute left-0 top-0 bottom-0 w-[20%] z-40 cursor-w-resize" onMouseEnter={() => startAutoScroll(-1)} onMouseLeave={stopAutoScroll} />
      <div className="absolute right-0 top-0 bottom-0 w-[20%] z-40 cursor-e-resize" onMouseEnter={() => startAutoScroll(1)} onMouseLeave={stopAutoScroll} />

      {/* Main Carousel */}
      <div 
        ref={scrollContainerRef}
        className="flex items-center gap-0 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory py-10"
        style={{ scrollPadding: '0 25%' }}
      >
        <div className="shrink-0 w-[25vw] md:w-[35vw]" />
        
        {displayList.map((drama, index) => (
          <KdramaCard 
            key={drama.id} 
            drama={drama} 
            index={index} 
            focusState={focusIndex === index + 1 ? 'isFocus' : Math.abs(focusIndex - (index + 1)) === 1 ? 'isNear' : 'isFar'}
          />
        ))}

        {/* View All Card */}
        <div className={`shrink-0 w-[280px] md:w-[350px] scroll-snap-align-center px-4 transition-all duration-300 ${focusIndex === displayList.length + 1 ? 'scale-110 opacity-100' : 'scale-90 opacity-40'}`}>
          <Link to="/kdrama-recommendations" className="flex flex-col items-center justify-center aspect-[2/3] rounded-[2.5rem] border-2 border-dashed border-white/20 hover:border-purple-500/50 bg-white/5">
            <div className="w-16 h-16 rounded-full bg-purple-600 flex items-center justify-center mb-4">
              <SafeIcon icon={FiArrowRight} className="text-2xl text-white" />
            </div>
            <span className="text-white font-serif text-xl font-bold">Explore All</span>
          </Link>
        </div>

        <div className="shrink-0 w-[25vw] md:w-[35vw]" />
      </div>

      {/* Navigation Indicators */}
      <div className="flex justify-center gap-3 mt-8">
        {displayList.map((_, i) => (
          <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${focusIndex === i + 1 ? 'w-12 bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.8)]' : 'w-3 bg-white/10'}`} />
        ))}
      </div>
    </div>
  );
};

export default KdramaGrid;