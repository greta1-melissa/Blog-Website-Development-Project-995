import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import SafeImage from '../common/SafeImage';
import { useKdrama } from '../contexts/KdramaContext';
import { KDRAMA_PLACEHOLDER } from '../config/assets';

const { FiArrowRight, FiMessageCircle } = FiIcons;

const KdramaCard = ({ drama, index }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-purple-50 flex flex-col h-full overflow-hidden"
    >
      <Link to={`/kdrama-recommendations/${drama.slug || drama.id}`} className="block relative h-56 overflow-hidden bg-purple-100">
        <SafeImage 
          src={drama.image_url || drama.image} 
          alt={drama.title} 
          fallback={KDRAMA_PLACEHOLDER}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-in-out"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300" />
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          {drama.tags && drama.tags.slice(0, 2).map((tag, idx) => (
            <span key={idx} className="px-2 py-1 bg-white/90 backdrop-blur-sm text-purple-800 text-[10px] font-bold rounded-md shadow-sm uppercase">
              {tag}
            </span>
          ))}
        </div>
      </Link>
      
      <div className="p-5 flex flex-col flex-grow">
        <Link to={`/kdrama-recommendations/${drama.slug || drama.id}`}>
          <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight hover:text-purple-600 transition-colors line-clamp-2 min-h-[3rem]">
            {drama.title}
          </h3>
        </Link>
        <p className="text-gray-600 text-xs leading-relaxed mb-4 flex-grow line-clamp-3">
          {drama.synopsis_short}
        </p>
        <div className="mt-auto flex items-center justify-between border-t border-gray-50 pt-4">
          <Link 
            to={`/kdrama-recommendations/${drama.slug || drama.id}`}
            className="inline-flex items-center text-xs font-bold text-purple-600 hover:text-purple-800 transition-colors group/link"
          >
            Read Review <SafeIcon icon={FiArrowRight} className="ml-1 group-hover/link:translate-x-1 transition-transform" />
          </Link>
          <div className="flex items-center text-gray-400 text-xs font-medium">
            <SafeIcon icon={FiMessageCircle} className="mr-1" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const KdramaGrid = () => {
  const { featuredKdramas, isLoading, kdramas } = useKdrama();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white rounded-xl h-96 shadow-sm animate-pulse border border-purple-50">
            <div className="h-48 bg-purple-100/50"></div>
            <div className="p-6 space-y-4">
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-100 rounded"></div>
              <div className="h-4 bg-gray-100 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const displayList = featuredKdramas.length > 0 ? featuredKdramas : kdramas.slice(0, 4);

  if (displayList.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-purple-200">
        <p className="text-gray-500">No drama recommendations found yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {displayList.map((drama, index) => (
        <KdramaCard key={drama.id} drama={drama} index={index} />
      ))}
    </div>
  );
};

export default KdramaGrid;