import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useKdrama } from '../contexts/KdramaContext';

// Added FiHeart to the destructuring assignment
const { FiArrowLeft, FiTv, FiStar, FiFilm, FiImage, FiMessageCircle, FiHeart, FiEdit3 } = FiIcons;

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
      {/* Header */}
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
          Click on any drama to see my full thoughts and join the discussion in the comments!
        </p>
      </div>

      <div className="flex items-center mb-8">
        <SafeIcon icon={FiStar} className="text-purple-600 text-2xl mr-3" />
        <h2 className="text-2xl font-bold text-gray-900">All Recommendations</h2>
      </div>

      <div className="grid grid-cols-1 gap-12">
        {kdramas.map((drama) => (
          <div 
            key={drama.id} 
            id={drama.slug} // Anchor for hash links
            className="group block bg-white rounded-2xl shadow-sm border border-purple-50 overflow-hidden hover:shadow-lg transition-all duration-300 scroll-mt-24"
          >
            <div className="flex flex-col md:flex-row h-full">
              <div className="md:w-1/3 min-h-[300px] relative bg-purple-100">
                {drama.image_url ? (
                  <img 
                    src={drama.image_url} 
                    alt={drama.image_alt || drama.title} 
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-purple-300">
                    <SafeIcon icon={FiImage} className="text-5xl" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/5" />
              </div>
              
              <div className="flex-1 p-8 md:p-10 flex flex-col">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <Link to={`/kdrama-recommendations/${drama.slug || drama.id}`} className="hover:text-purple-600 transition-colors">
                    <h3 className="text-2xl md:text-3xl font-serif font-bold text-gray-900">{drama.title}</h3>
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

                {/* My 2 Cents Section */}
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
                    <SafeIcon icon={FiMessageCircle} className="mr-2 text-lg" /> 
                    Join Discussion 
                    <SafeIcon icon={FiIcons.FiArrowRight} className="ml-2" />
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