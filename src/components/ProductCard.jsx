import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { stripHtml } from '../utils/textUtils';
import { formatDate } from '../utils/dateUtils';
import { getImageSrc } from '../utils/media.js';
import { PLACEHOLDER_IMAGE } from '../config/assets';

const { FiStar, FiDollarSign, FiExternalLink, FiHeart } = FiIcons;

const ProductCard = ({ product, index }) => {
  const [imgSrc, setImgSrc] = useState(PLACEHOLDER_IMAGE);

  useEffect(() => {
    const src = getImageSrc(product.image || product.image_url);
    setImgSrc(src || PLACEHOLDER_IMAGE);
  }, [product.image, product.image_url]);

  const handleImageError = (e) => {
    console.warn(`[ProductCard] Image load failed for product ID ${product.id}`);
    e.currentTarget.src = PLACEHOLDER_IMAGE;
  };

  const getRatingStars = (rating = 5) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <SafeIcon
          key={i}
          icon={FiStar}
          className={`${i < rating ? 'text-purple-400' : 'text-gray-300'} text-sm`}
        />
      );
    }
    return stars;
  };

  const extractPrice = (content) => {
    const cleanContent = stripHtml(content);
    const priceMatch = cleanContent.match(/\$\d+(\.\d{2})?/);
    return priceMatch ? priceMatch[0] : null;
  };

  const subcategory = product.subcategory || 'General';
  const price = extractPrice(product.content);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group border border-purple-100 hover:border-purple-300"
    >
      <Link to={`/post/${product.id}`}>
        <div className="relative overflow-hidden">
          <img
            src={imgSrc}
            alt={product.title}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            onError={handleImageError}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-purple-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute top-4 left-4">
            <span className="bg-white/90 backdrop-blur-sm text-purple-800 px-3 py-1 rounded-full text-sm font-medium shadow-sm">
              {subcategory}
            </span>
          </div>
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-full">
              <SafeIcon icon={FiHeart} className="text-white text-lg" />
            </div>
          </div>
        </div>
      </Link>
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          {price && (
            <div className="flex items-center bg-purple-50 px-3 py-1 rounded-full">
              <SafeIcon icon={FiDollarSign} className="mr-1 text-purple-600" />
              <span className="text-purple-800 font-medium">{price}</span>
            </div>
          )}
          <div className="flex items-center">
            {getRatingStars(4)}
          </div>
        </div>
        <Link to={`/post/${product.id}`}>
          <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors line-clamp-2">
            {product.title}
          </h3>
        </Link>
        <p className="text-gray-600 mb-4 leading-relaxed line-clamp-3">
          {stripHtml(product.content).substring(0, 150)}...
        </p>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
            {formatDate(product.date)}
          </span>
          <div className="flex space-x-2">
            <Link
              to={`/post/${product.id}`}
              className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium transition-colors group px-3 py-1 bg-purple-50 rounded-full"
            >
              <span>Review</span>
              <SafeIcon icon={FiExternalLink} className="ml-1 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;