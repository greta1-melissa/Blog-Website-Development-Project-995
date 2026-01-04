import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import SafeImage from '../common/SafeImage';
import { useKdrama } from '../contexts/KdramaContext';
import { KDRAMA_PLACEHOLDER } from '../config/assets';

const { FiArrowLeft, FiTv, FiStar, FiMessageCircle, FiEdit3, FiArrowRight } = FiIcons;

const KdramaRecommendations = () => {
  const { kdramas, isLoading } = useKdrama();

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-500">Loading dramas...</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-16">
        <Link to="/" className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium mb-6">
          <SafeIcon icon={FiArrowLeft} className="mr-2" /> Back to Home
        </Link>
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <SafeIcon icon={FiTv} className="text-3xl text-purple-600" />
        </div>
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6">K-Drama Recommendations</h1>
      </div>

      <div className="grid grid-cols-1 gap-12">
        {kdramas.map((drama) => (
          <div key={drama.id} className="bg-white rounded-2xl shadow-sm border border-purple-50 overflow-hidden hover:shadow-lg transition-all">
            <div className="flex flex-col md:flex-row h-full">
              <div className="md:w-1/3 h-64 md:h-auto bg-purple-100">
                <SafeImage 
                  src={drama.image_url || drama.image} 
                  alt={drama.title} 
                  fallback={KDRAMA_PLACEHOLDER}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="md:w-2/3 p-8 flex flex-col">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <Link to={`/kdrama-recommendations/${drama.slug || drama.id}`} className="hover:text-purple-600">
                    <h3 className="text-3xl font-serif font-bold text-gray-900">{drama.title}</h3>
                  </Link>
                </div>
                <p className="text-gray-700 leading-relaxed mb-6">{drama.synopsis_long || drama.synopsis_short}</p>
                <div className="bg-purple-50 rounded-xl p-4 border border-purple-100 mb-6 font-serif italic text-gray-700">
                  <h4 className="flex items-center text-xs font-bold text-purple-900 uppercase tracking-wide mb-2 not-italic">
                    <SafeIcon icon={FiEdit3} className="mr-2 text-purple-600" /> My 2 Cents
                  </h4>
                  "{drama.my_two_cents}"
                </div>
                <div className="mt-auto flex justify-end">
                  <Link to={`/kdrama-recommendations/${drama.slug || drama.id}`} className="inline-flex items-center text-purple-600 font-bold">
                    <SafeIcon icon={FiMessageCircle} className="mr-2" /> Join Discussion <SafeIcon icon={FiArrowRight} className="ml-2" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default KdramaRecommendations;