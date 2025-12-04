import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useKdrama } from '../contexts/KdramaContext';

// Added FiHeart to the destructuring assignment
const { FiArrowLeft, FiTv, FiStar, FiFilm, FiImage, FiMessageCircle, FiHeart } = FiIcons;

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
          This is my growing list of K-dramas that made me laugh, cry, think, and completely lose sleep. Click on any drama to see my full thoughts and join the discussion in the comments!
        </p>
      </div>

      <div className="flex items-center mb-8">
        <SafeIcon icon={FiStar} className="text-purple-600 text-2xl mr-3" />
        <h2 className="text-2xl font-bold text-gray-900">All Recommendations</h2>
      </div>

      <div className="grid grid-cols-1 gap-12">
        {kdramas.map((drama) => (
          <Link 
            to={`/kdrama-recommendations/${drama.slug || drama.id}`}
            key={drama.id}
            id={drama.slug} // Anchor for hash links
            className="group block bg-white rounded-2xl shadow-sm border border-purple-50 overflow-hidden hover:shadow-lg transition-all duration-300 scroll-mt-24"
          >
            <div className="flex flex-col md:flex-row h-full">
              <div className="md:w-1/3 min-h-[250px] relative bg-purple-100">
                {drama.image_url ? (
                  <img 
                    src={drama.image_url} 
                    alt={drama.image_alt || drama.title} 
                    className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-purple-300">
                    <SafeIcon icon={FiImage} className="text-5xl" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
              </div>
              
              <div className="flex-1 p-8 md:p-10 flex flex-col justify-center">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <h3 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 group-hover:text-purple-600 transition-colors">{drama.title}</h3>
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
                
                <p className="text-gray-700 text-lg leading-relaxed mb-6">
                  {drama.synopsis_long || drama.synopsis_short}
                </p>

                <div className="mt-auto">
                    <h4 className="flex items-center text-sm font-bold text-purple-900 uppercase tracking-wide mb-2">
                        <SafeIcon icon={FiHeart} className="mr-2 text-purple-500" />
                        My Thoughts:
                    </h4>
                    <p className="text-gray-600 italic text-sm mb-4">
                        (Click to read full discussion and comments)
                    </p>
                    <div className="flex items-center text-purple-600 font-bold text-sm">
                        <SafeIcon icon={FiMessageCircle} className="mr-2 text-lg" />
                        Join the Discussion
                        <SafeIcon icon={FiIcons.FiArrowRight} className="ml-2 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </motion.div>
  );
};

export default KdramaRecommendations;