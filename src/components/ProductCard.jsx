import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import SafeImage from '../common/SafeImage';
import { stripHtml } from '../utils/textUtils';
import { formatDate } from '../utils/dateUtils';
import { PLACEHOLDER_IMAGE } from '../config/assets';

const { FiStar, FiExternalLink } = FiIcons;

const ProductCard = ({ product, index }) => {
  const getRatingStars = (rating = 5) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <SafeIcon 
          key={i} 
          icon={FiStar} 
          className={`${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-200'} text-xs`} 
        />
      );
    }
    return stars;
  };

  const subcategory = product.subcategory || 'General';
  
  // Prioritize the new Short Description (excerpt) if available, otherwise strip HTML from content
  const description = product.excerpt || stripHtml(product.content);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-white rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden group border border-purple-100 hover:border-purple-300"
    >
      <Link to={`/post/${product.id}`}>
        <div className="relative overflow-hidden w-full">
          <SafeImage 
            src={product.image || product.image_url} 
            alt={product.title} 
            fallback={PLACEHOLDER_IMAGE} 
            className="w-full h-auto object-cover group-hover:scale-110 transition-transform duration-700 ease-out" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-purple-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <div className="absolute top-4 left-4">
            <span className="bg-white/90 backdrop-blur-md text-purple-800 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm border border-purple-50">
              {subcategory}
            </span>
          </div>
        </div>
      </Link>

      <div className="p-6 md:p-8">
        <div className="flex items-center gap-1 mb-4">
          <div className="flex items-center">
            {getRatingStars(product.rating)}
          </div>
          <span className="ml-2 text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
            {product.rating}/5 Rating
          </span>
        </div>

        <Link to={`/post/${product.id}`}>
          <h3 className="text-xl md:text-2xl font-serif font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors leading-tight">
            {product.title}
          </h3>
        </Link>

        <p className="text-gray-600 text-sm leading-relaxed mb-6 font-sans">
          {description.length > 150 ? description.substring(0, 150) + '...' : description}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-purple-50">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            {formatDate(product.date)}
          </span>
          
          <Link 
            to={`/post/${product.id}`} 
            className="inline-flex items-center text-xs font-black text-purple-600 uppercase tracking-widest group/link"
          >
            Details 
            <SafeIcon icon={FiExternalLink} className="ml-2 group-hover/link:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;