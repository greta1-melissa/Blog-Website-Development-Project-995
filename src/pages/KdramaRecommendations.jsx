import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useKdrama } from '../contexts/KdramaContext';
import { normalizeDropboxImageUrl } from '../utils/media.js';
import { KDRAMA_PLACEHOLDER } from '../config/assets';

const { FiArrowLeft, FiTv, FiStar, FiImage, FiMessageCircle, FiEdit3 } = FiIcons;

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
    >
      <div className="text-center mb-16">
        <Link
          to="/"
          className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium mb-6 transition-colors"
        >
          <SafeIcon icon={FiArrowLeft} className="mr-2" /> Back to Home
        </Link>
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <SafeIcon icon={FiTv} className="text-3xl text-purple-600" />
        </div>
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6">
          K-Drama Recommendations <span className="text-purple-600">to Date</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          This is my growing list of K-dramas that made me laugh, cry, think, and completely lose sleep.
        </p>
      </div>

      <div className="flex items-center mb-8">
        <SafeIcon icon={FiStar} className="text-purple-600 text-2xl mr-3" />
        <h2 className="text-2xl font-bold text-gray-900">All Recommendations</h2>
      </div>

      <div className="grid grid-cols-1 gap-12">
        {kdramas.map((drama) => {
          const displayImage = normalizeDropboxImageUrl(drama.image_url || drama.image);

          return (
            <div key={drama.id} id={drama.slug} className="group block bg-white rounded-2xl shadow-sm border border-purple-50 overflow-hidden hover:shadow-lg transition-all duration-300 scroll-mt-24">
              <div className="flex flex-col h-full">
                <div className="w-full h-80 md:h-96 relative bg-purple-100">
                  <img
                    src={displayImage || KDRAMA_PLACEHOLDER}
                    alt={`${drama.title} Poster`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error(`[KdramaRecommendations] Broken Image for ${drama.title} (ID: ${drama.id}):`, displayImage);
                      e.currentTarget.src = KDRAMA_PLACEHOLDER;
                    }}
                  />
                  {!displayImage && (
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-200 to-indigo-200 flex items-center justify-center text-purple-400">
                      <SafeIcon icon={FiImage} className="text-6xl opacity-50" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/5" />
                </div>
                <div className="p-8 md:p-10 flex flex-col">
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <Link to={`/kdrama-recommendations/${drama.slug || drama.id}`} className="hover:text-purple-600 transition-colors">
                      <h3 className="text-3xl md:text-4xl font-serif font-bold text-gray-900">{drama.title}</h3>
                    </Link>
                    <div className="flex flex-wrap gap-2">
                      {drama.tags && drama.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-semibold rounded-full uppercase tracking-wide border border-purple-100"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="prose prose-purple max-w-none text-gray-700 leading-relaxed mb-8">
                    <p>{drama.synopsis_long || drama.synopsis_short}</p>
                  </div>
                  <div className="mt-auto bg-purple-50/50 rounded-xl p-6 border border-purple-100">
                    <h4 className="flex items-center text-sm font-bold text-purple-900 uppercase tracking-wide mb-3">
                      <SafeIcon icon={FiEdit3} className="mr-2 text-purple-600" /> My 2 Cents
                    </h4>
                    <p className="text-gray-700 italic text-base leading-relaxed">
                      {drama.my_two_cents ? (
                        `"${drama.my_two_cents}"`
                      ) : (
                        <span className="text-gray-400 not-italic">(I'll share my full thoughts on this drama soon!)</span>
                      )}
                    </p>
                  </div>
                  <div className="mt-6 flex justify-end">
                    <Link
                      to={`/kdrama-recommendations/${drama.slug || drama.id}`}
                      className="inline-flex items-center text-purple-600 font-bold hover:text-purple-800 transition-colors"
                    >
                      <SafeIcon icon={FiMessageCircle} className="mr-2 text-lg" /> Join Discussion <SafeIcon icon={FiIcons.FiArrowRight} className="ml-2" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default KdramaRecommendations;