import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useBlog } from '../contexts/BlogContext';

const { FiAlertTriangle, FiX, FiRefreshCcw } = FiIcons;

const GlobalErrorBanner = () => {
  const { fetchError, isErrorDismissed, dismissError, retryFetch, isLoading } = useBlog();

  if (!fetchError || isErrorDismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="bg-red-600 text-white overflow-hidden sticky top-20 z-[45] shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex-1 flex items-center min-w-0">
              <span className="flex p-2 rounded-lg bg-red-800">
                <SafeIcon icon={FiAlertTriangle} className="h-5 w-5 text-white" />
              </span>
              <p className="ml-3 font-medium text-white truncate text-sm sm:text-base">
                <span className="md:hidden">API Connection Error</span>
                <span className="hidden md:inline">{fetchError}</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={retryFetch}
                disabled={isLoading}
                className="flex items-center justify-center px-4 py-1.5 border border-transparent rounded-md shadow-sm text-xs font-bold text-red-600 bg-white hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                <SafeIcon icon={FiRefreshCcw} className={`mr-2 h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
                Retry
              </button>
              <button
                onClick={dismissError}
                className="p-2 rounded-md hover:bg-red-800 focus:outline-none transition-colors"
                title="Dismiss"
              >
                <SafeIcon icon={FiX} className="h-5 w-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default GlobalErrorBanner;