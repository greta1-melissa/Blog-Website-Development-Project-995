import React, { useState, useEffect } from 'react';
import { getImageSrc, isDropboxUrl } from '../utils/media';
import { PLACEHOLDER_IMAGE } from '../config/assets';

/**
 * SafeImage Component
 * 
 * Final line of defense for image rendering.
 * Only allows images from trusted sources or our internal proxy.
 */
const SafeImage = ({ src, alt = "", fallback = PLACEHOLDER_IMAGE, className = "", loading = "lazy", ...props }) => {
  
  // Define trusted patterns for rendering
  const isTrustedSource = (url) => {
    if (!url) return false;
    
    // 1. Internal Proxy (Critical for Dropbox functionality)
    if (url.startsWith('/api/media/')) return true;
    
    // 2. Local Assets
    if (url.startsWith('/assets/') || url.startsWith('/') || url.startsWith('data:')) return true;
    
    // 3. Approved CDNs
    const trustedHosts = [
      'images.unsplash.com',
      'player.vimeo.com',
      'i.scdn.co', // Spotify
      'images.pexels.com'
    ];
    
    try {
      const u = new URL(url);
      return trustedHosts.some(host => u.hostname.includes(host));
    } catch (e) {
      return false;
    }
  };

  const resolveInitialSrc = (input) => {
    if (!input) return fallback;
    
    const resolved = getImageSrc(input, fallback);
    
    // If the resolved URL is still a raw Dropbox URL (normalization failed)
    // or is not a trusted source, we force the fallback immediately.
    if (isDropboxUrl(resolved) || !isTrustedSource(resolved)) {
      return fallback;
    }
    
    return resolved;
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
      // Final emergency fallback to transparent pixel
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