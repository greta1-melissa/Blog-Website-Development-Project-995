import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import SafeImage from '../common/SafeImage';
import { useKdrama } from '../contexts/KdramaContext';
import { KDRAMA_PLACEHOLDER } from '../config/assets';

const { FiArrowRight, FiChevronRight, FiChevronLeft, FiStar } = FiIcons;

// The "Elite 8" Selection
const MUST_WATCH_LIST = [
  { id: 'scarlet-heart', title: 'Scarlet Heart Ryeo', tags: ['Historical', 'Tragedy'], image: 'https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?w=800' },
  { id: 'mr-queen', title: 'Mr. Queen', tags: ['Comedy', 'Body Swap'], image: 'https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?w=800' },
  { id: 'cloy', title: 'Crash Landing on You', tags: ['Romance', 'Drama'], image: 'https://images.unsplash.com/photo-1518181282240-721245c38981?w=800' },
  { id: 'reply-1988', title: 'Reply 1988', tags: ['Family', 'Slice of Life'], image: 'https://images.unsplash.com/photo-1516589174184-c685245d4b63?w=800' },
  { id: 'itaewon-class', title: 'Itaewon Class', tags: ['Revenge', 'Business'], image: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=800' },
  { id: 'goblin', title: 'Goblin', tags: ['Fantasy', 'Romance'], image: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800' },
  { id: 'hotel-del-luna', title: 'Hotel Del Luna', tags: ['Supernatural', 'Fashion'], image: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=800' },
  { id: 'kingdom', title: 'Kingdom', tags: ['Zombies', 'Political'], image: 'https://images.unsplash.com/photo-1580226330962-4217f2252a12?w=800' }
];

const KdramaCard = ({ drama, isFocused, isCenterFallback, onHover, onLeave }) => {
  // Determine scale and appearance
  let scale = 0.92;
  let opacity = 0.5;
  let zIndex = 1;
  let blur = "blur(2px)";
  let shadow = "none";

  if (isFocused) {
    scale = 1.18;
    opacity = 1;
    zIndex = 30;
    blur = "blur(0px)";
    shadow = "0 25px 60px rgba(168, 85, 247, 0.5)";
  } else if (isCenterFallback) {
    scale = 1.08;
    opacity = 0.9;
    zIndex = 10;
    blur = "blur(0px)";
    shadow = "0 10px 30px rgba(168, 85, 247, 0.2)";
  }

  return (
    <motion.div
      onPointerEnter={() => onHover(drama.id)}
      onPointerLeave={onLeave}
      animate={{ scale, opacity, zIndex }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      style={{ filter: blur, boxShadow: shadow }}
      className="shrink-0 w-[300px] md:w-[380px] scroll-snap-align-center px-4 py-16 relative"
    >
      <Link to={`/kdrama-recommendations/${drama.id}`} className="block">
        <div className={`relative aspect-[2/3] rounded-[3rem] overflow-hidden bg-purple-950/40 border-2 transition-colors duration-500 ${isFocused ? 'border-purple-400' : 'border-white/5'}`}>
          <SafeImage 
            src={drama.image} 
            alt={drama.title} 
            fallback={KDRAMA_PLACEHOLDER} 
            className="w-full h-full object-cover" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
          
          {/* Tags */}
          <div className="absolute top-8 left-8 flex gap-2">
            {drama.tags.map((tag, i) => (
              <span key={i} className="px-3 py-1 bg-white/10 backdrop-blur-md text-white text-[9px] font-black rounded-full border border-white/20 uppercase tracking-widest">
                {tag}
              </span>
            ))}
          </div>

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-10">
            <h3 className="text-2xl font-serif font-bold text-white mb-4 leading-tight">
              {drama.title}
            </h3>
            <AnimatePresence>
              {isFocused && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <span className="inline-flex items-center text-[10px] font-black text-purple-400 uppercase tracking-[0.2em]">
                    Read Review <SafeIcon icon={FiArrowRight} className="ml-2" />
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
  const scrollContainerRef = useRef(null);
  const scrollRaf = useRef(null);
  const [hoveredId, setHoveredId] = useState(null);
  const [centerId, setCenterId] = useState(null);
  const [hoverStartTime, setHoverStartTime] = useState(null);

  // Update center-most card ID
  const updateCenterCard = useCallback(() => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const scrollCenter = container.scrollLeft + container.clientWidth / 2;
    const cards = container.querySelectorAll('.scroll-snap-align-center');
    
    let closestId = null;
    let minDistance = Infinity;

    cards.forEach((card, idx) => {
      if (idx === 0 || idx === cards.length - 1) return; // Skip spacers
      const rect = card.getBoundingClientRect();
      const cardCenter = container.scrollLeft + rect.left + rect.width / 2;
      const distance = Math.abs(scrollCenter - cardCenter);
      
      if (distance < minDistance) {
        minDistance = distance;
        closestId = MUST_WATCH_LIST[idx - 1]?.id;
      }
    });

    setCenterId(closestId);
  }, []);

  // Auto-Scroll Logic with Acceleration
  const startAutoScroll = (direction) => {
    if (hoveredId) return; // Don't scroll if focusing a card
    const startTime = Date.now();
    setHoverStartTime(startTime);

    const scroll = () => {
      if (scrollContainerRef.current) {
        const elapsed = Date.now() - startTime;
        const speed = elapsed > 300 ? 36 : 22; // Accelerated speed
        scrollContainerRef.current.scrollLeft += direction * speed;
        updateCenterCard();
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
    updateCenterCard();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', updateCenterCard);
    }
    return () => container?.removeEventListener('scroll', updateCenterCard);
  }, [updateCenterCard]);

  // Handle Mouse Over Container for Scroll Zones
  const handleMouseMove = (e) => {
    const container = e.currentTarget;
    const { left, width } = container.getBoundingClientRect();
    const mouseX = e.clientX - left;
    const zoneWidth = width * 0.20;

    if (mouseX < zoneWidth) {
      if (!hoverStartTime) startAutoScroll(-1);
    } else if (mouseX > width - zoneWidth) {
      if (!hoverStartTime) startAutoScroll(1);
    } else {
      stopAutoScroll();
    }
  };

  return (
    <div 
      className="relative group/main -mx-4 px-4 h-[750px] flex flex-col justify-center overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { stopAutoScroll(); setHoveredId(null); }}
    >
      {/* Scroll Zones Overlay (Visual Cues) */}
      <div className="absolute left-0 top-0 bottom-0 w-[20%] z-40 cursor-w-resize pointer-events-none group-hover/main:bg-gradient-to-r from-purple-900/10 to-transparent transition-opacity" />
      <div className="absolute right-0 top-0 bottom-0 w-[20%] z-40 cursor-e-resize pointer-events-none group-hover/main:bg-gradient-to-l from-purple-900/10 to-transparent transition-opacity" />

      {/* Viewport Container */}
      <div 
        ref={scrollContainerRef}
        className="flex items-center gap-0 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory py-10"
        style={{ scrollPadding: '0 25%' }}
      >
        {/* Spacer for Centering */}
        <div className="shrink-0 w-[25vw] md:w-[35vw] scroll-snap-align-center" />
        
        {MUST_WATCH_LIST.map((drama) => (
          <KdramaCard 
            key={drama.id} 
            drama={drama} 
            isFocused={hoveredId === drama.id}
            isCenterFallback={!hoveredId && centerId === drama.id}
            onHover={setHoveredId}
            onLeave={() => setHoveredId(null)}
          />
        ))}

        {/* View All Card */}
        <div className="shrink-0 w-[300px] md:w-[380px] scroll-snap-align-center px-4 opacity-40 hover:opacity-100 transition-opacity">
          <Link to="/kdrama-recommendations" className="flex flex-col items-center justify-center aspect-[2/3] rounded-[3rem] border-2 border-dashed border-white/20 hover:border-purple-500 bg-white/5">
            <div className="w-20 h-20 rounded-full bg-purple-600 flex items-center justify-center mb-6 shadow-lg shadow-purple-500/40">
              <SafeIcon icon={FiChevronRight} className="text-3xl text-white" />
            </div>
            <span className="text-white font-serif text-2xl font-bold">Full Archive</span>
          </Link>
        </div>

        {/* Spacer for Centering */}
        <div className="shrink-0 w-[25vw] md:w-[35vw] scroll-snap-align-center" />
      </div>

      {/* Progress Line */}
      <div className="flex justify-center items-center gap-4 mt-12">
        <div className="h-px w-24 bg-gradient-to-r from-transparent to-purple-500/50" />
        <div className="flex gap-2">
          {MUST_WATCH_LIST.map((drama) => (
            <div 
              key={drama.id} 
              className={`h-1.5 rounded-full transition-all duration-500 ${ (hoveredId === drama.id || (!hoveredId && centerId === drama.id)) ? 'w-10 bg-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.8)]' : 'w-2 bg-white/10'}`} 
            />
          ))}
        </div>
        <div className="h-px w-24 bg-gradient-to-l from-transparent to-purple-500/50" />
      </div>
    </div>
  );
};

export default KdramaGrid;