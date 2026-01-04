import React, { useState, useEffect, useRef } from 'react';
import { getImageSrc } from '../utils/media';
import { PLACEHOLDER_IMAGE } from '../config/assets';

/**
 * SafeImage Component
 * 
 * Standardized wrapper for all images in the application.
 * - Handles Dropbox proxying automatically via getImageSrc.
 * - Robust error handling with category-specific fallbacks.
 * - Prevents infinite re-render loops by tracking failure state.
 * - Ensures state updates only once per failure.
 */
const SafeImage = ({ 
  src, 
  alt = "", 
  fallback = PLACEHOLDER_IMAGE, 
  className = "", 
  loading = "lazy",
  ...props 
}) => {
  // Initialize state with the processed source or fallback
  const [imgSrc, setImgSrc] = useState(() => getImageSrc(src) || fallback);
  
  // Flag to track if the primary source has already failed to prevent loops
  const [hasFailed, setHasFailed] = useState(false);
  
  // Track logged failures to prevent console spam
  const loggedUrls = useRef(new Set());

  // Reset state when source or fallback props change
  useEffect(() => {
    const newSrc = getImageSrc(src) || fallback;
    setImgSrc(newSrc);
    setHasFailed(false);
  }, [src, fallback]);

  const handleError = () => {
    // 1. If we already tried the fallback and it also failed, stop.
    // This prevents infinite loops if the placeholder itself is broken.
    if (hasFailed) {
      // Return a transparent 1x1 pixel as the absolute final fallback
      setImgSrc("data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7");
      return;
    }

    // 2. Log diagnostic info exactly once per unique URL
    if (src && !loggedUrls.current.has(src)) {
      console.warn(`[SafeImage] Load failed for: ${src}. Switching to fallback.`);
      loggedUrls.current.add(src);
    }

    // 3. Update state once: mark as failed and switch to the provided fallback
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