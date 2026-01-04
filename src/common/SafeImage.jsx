import React, { useState, useEffect } from 'react';
import { getImageSrc, isDropboxUrl } from '../utils/media';
import { PLACEHOLDER_IMAGE } from '../config/assets';

/**
 * SafeImage Component
 * 
 * Final line of defense for image rendering. 
 * Prevents network requests to blocked sources and handles loading failures.
 */
const SafeImage = ({ 
  src, 
  alt = "", 
  fallback = PLACEHOLDER_IMAGE, 
  className = "", 
  loading = "lazy", 
  ...props 
}) => {
  
  // Resolve source using global normalization logic
  const resolveInitialSrc = (input) => {
    if (!input) return fallback;
    return getImageSrc(input, fallback);
  };

  const [imgSrc, setImgSrc] = useState(() => resolveInitialSrc(src));
  const [hasFailed, setHasFailed] = useState(false);

  // Re-normalize if props change
  useEffect(() => {
    setImgSrc(resolveInitialSrc(src));
    setHasFailed(false);
  }, [src, fallback]);

  const handleError = () => {
    if (hasFailed || imgSrc === fallback) {
      // Final emergency fallback to transparent pixel to prevent broken icon
      setImgSrc("data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7");
      return;
    }

    setHasFailed(true);
    setImgSrc(fallback);
  };

  return (
    <img 
      src={imgSrc} 
      alt={alt} 
      className={className} 
      onError={handleError} 
      loading={loading}
      {...props} 
    />
  );
};

export default SafeImage;