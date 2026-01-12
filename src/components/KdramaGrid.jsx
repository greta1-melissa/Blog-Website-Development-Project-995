import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import SafeImage from '../common/SafeImage';
import { useKdrama } from '../contexts/KdramaContext';
import { KDRAMA_PLACEHOLDER } from '../config/assets';

const { FiArrowRight, FiChevronRight, FiStar } = FiIcons;

const KdramaCard = ({ drama, isFocused, isCenterFallback, onHover, onLeave }) => {
  // Determine scale and appearance based on focus state
  // Landscape focus logic: Focused = 1.15, Center = 1.08, Others = 0.9
  let scale = 0.9;
  let opacity = 0.4;
  let zIndex = 1;
  let blur = "blur(4px)";
  let shadow = "none";

  if (isFocused) {
    scale = 1.15;
    opacity = 1;
    zIndex = 30;
    blur = "blur(0px)";
    shadow = "0 20px 50px rgba(168, 85, 247, 0.4)";
  } else if (isCenterFallback) {
    scale = 1.08;
    opacity = 0.85;
    zIndex = 10;
    blur = "blur(0px)";
    shadow = "0 10px 30px rgba(168, 85, 247, 0.15)";
  }

  return (
    <motion.div
      onPointerEnter={() => onHover(drama.id)}
      onPointerLeave={onLeave}
      animate={{ scale, opacity, zIndex }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      style={{ filter: blur, boxShadow: shadow }}
      className="shrink-0 w-[400px] md:w-[520px] scroll-snap-align-center px-6 py-20 relative"
    >
      <Link to={`/kdrama-recommendations/${drama.slug || drama.id}`} className="block">
        <div className={`relative aspect-video rounded-[2.5rem] overflow-hidden bg-purple-950/40 border-2 transition-all duration-500 ${isFocused ? 'border-purple-400' : 'border-white/5'}`}>
          <SafeImage 
            src={drama.image_url || drama.image} 
            alt={drama.title} 
            fallback={KDRAMA_PLACEHOLDER} 
            className="w-full h-full object-cover" 
          />
          
          {/* Subtle Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
          
          {/* Genre Pill */}
          <div className="absolute top-6 left-6">
            <span className="px-3 py-1 bg-black/40 backdrop-blur-md text-white text-[9px] font-black rounded-full border border-white/10 uppercase tracking-widest">
              {drama.tags?.[0] || 'Drama'}
            </span>
          </div>

          {/* Bottom Content */}
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <h3 className="text-2xl md:text-3xl font-serif font-bold text-white mb-2 leading-tight">
              {drama.title}
            </h3>
            
            <AnimatePresence>
              {isFocused && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  exit={{ opacity: 0, x: -10 }}
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
  const { kdramas, isLoading } = useKdrama();
  const scrollContainerRef = useRef(null);
  const scrollRaf = useRef(null);
  
  const [hoveredId, setHoveredId] = useState(null);
  const [centerId, setCenterId] = useState(null);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);

  // Take up to 8 cards for the spotlight
  const displayList = useMemo(() => {
    return kdramas.slice(0, 8);
  }, [kdramas]);

  // Logic to find the card closest to the horizontal center of the viewport
  const updateCenterCard = useCallback(() => {
    if (!scrollContainerRef.current || displayList.length === 0) return;
    
    const container = scrollContainerRef.current;
    const scrollCenter = container.scrollLeft + container.clientWidth / 2;
    const cards = container.querySelectorAll('.scroll-snap-align-center');
    
    let closestId = null;
    let minDistance = Infinity;

    // Skip the first and last elements which are spacers
    cards.forEach((card, idx) => {
      if (idx === 0 || idx === cards.length - 1) return;
      
      const rect = card.getBoundingClientRect();
      const cardCenter = container.scrollLeft + rect.left + rect.width / 2;
      const distance = Math.abs(scrollCenter - cardCenter);
      
      if (distance < minDistance) {
        minDistance = distance;
        closestId = displayList[idx - 1]?.id;
      }
    });

    setCenterId(closestId);
  }, [displayList]);

  // Handle Edge Hover Auto-Scrolling
  const startAutoScroll = (direction) => {
    if (hoveredId) return; // Prioritize manual card focus
    
    setIsAutoScrolling(true);
    const scroll = () => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollLeft += direction * 18; // Smooth moderate speed
        updateCenterCard();
        scrollRaf.current = requestAnimationFrame(scroll);
      }
    };
    scrollRaf.current = requestAnimationFrame(scroll);
  };

  const stopAutoScroll = () => {
    if (scrollRaf.current) cancelAnimationFrame(scrollRaf.current);
    setIsAutoScrolling(false);
  };

  useEffect(() => {
    updateCenterCard();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', updateCenterCard);
    }
    return () => container?.removeEventListener('scroll', updateCenterCard);
  }, [updateCenterCard, displayList]);

  const handleMouseMove = (e) => {
    const container = e.currentTarget;
    const { left, width } = container.getBoundingClientRect();
    const mouseX = e.clientX - left;
    const zoneWidth = width * 0.20; // 20% width zones on each side

    if (mouseX < zoneWidth) {
      if (!isAutoScrolling) startAutoScroll(-1);
    } else if (mouseX > width - zoneWidth) {
      if (!isAutoScrolling) startAutoScroll(1);
    } else {
      stopAutoScroll();
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
    <div 
      className="relative group/main -mx-4 px-4 h-[600px] flex flex-col justify-center overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { stopAutoScroll(); setHoveredId(null); }}
    >
      {/* Invisible Hover Zones Indicators (Visual Cue) */}
      <div className="absolute left-0 top-0 bottom-0 w-[15%] z-40 cursor-w-resize pointer-events-none group-hover/main:bg-gradient-to-r from-purple-500/5 to-transparent transition-opacity" />
      <div className="absolute right-0 top-0 bottom-0 w-[15%] z-40 cursor-e-resize pointer-events-none group-hover/main:bg-gradient-to-l from-purple-500/5 to-transparent transition-opacity" />

      {/* The Carousel */}
      <div 
        ref={scrollContainerRef}
        className="flex items-center gap-0 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory"
        style={{ scrollPadding: '0 25%' }}
      >
        {/* Leading Spacer */}
        <div className="shrink-0 w-[20vw] md:w-[30vw] scroll-snap-align-center" />
        
        {displayList.map((drama) => (
          <KdramaCard 
            key={drama.id} 
            drama={drama} 
            isFocused={hoveredId === drama.id}
            isCenterFallback={!hoveredId && centerId === drama.id}
            onHover={setHoveredId}
            onLeave={() => setHoveredId(null)}
          />
        ))}

        {/* Closing "Explore All" Card */}
        <div className="shrink-0 w-[400px] md:w-[520px] scroll-snap-align-center px-6 opacity-30 hover:opacity-100 transition-opacity">
          <Link to="/kdrama-recommendations" className="flex flex-col items-center justify-center aspect-video rounded-[2.5rem] border-2 border-dashed border-white/20 hover:border-purple-500 bg-white/5 group/link">
            <div className="w-16 h-16 rounded-full bg-purple-600 flex items-center justify-center mb-4 group-hover/link:scale-110 transition-transform">
              <SafeIcon icon={FiChevronRight} className="text-2xl text-white" />
            </div>
            <span className="text-white font-serif text-xl font-bold">View Full Watchlist</span>
          </Link>
        </div>

        {/* Trailing Spacer */}
        <div className="shrink-0 w-[20vw] md:w-[30vw] scroll-snap-align-center" />
      </div>

      {/* Minimal Progress Line */}
      <div className="flex justify-center items-center gap-6 mt-8">
        <div className="flex gap-2">
          {displayList.map((drama) => (
            <div 
              key={drama.id} 
              className={`h-1 rounded-full transition-all duration-500 ${ (hoveredId === drama.id || (!hoveredId && centerId === drama.id)) ? 'w-12 bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.6)]' : 'w-3 bg-white/10'}`} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default KdramaGrid;