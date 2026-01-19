import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { ncbReadAll, ncbCreate, ncbUpdate, ncbDelete, sanitizeNcbPayload } from '../services/nocodebackendClient';
import { getImageSrc } from '../utils/media.js';
import { KDRAMA_PLACEHOLDER } from '../config/assets';

const KdramaContext = createContext();
export const useKdrama = () => useContext(KdramaContext);

export const KdramaProvider = ({ children }) => {
  const [kdramas, setKdramas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const normalizeItem = useCallback((item) => {
    if (!item) return null;
    const cleanImage = getImageSrc(item.image_url || item.image || '', KDRAMA_PLACEHOLDER);
    const status = (item.status || 'published').toString().toLowerCase().trim();
    
    return {
      ...item,
      id: item.id || item._id,
      title: item.title || 'Untitled',
      status: status !== 'draft' ? 'published' : 'draft',
      image_url: cleanImage,
      is_featured_on_home: item.is_featured_on_home === true || item.is_featured_on_home === 1 || item.is_featured_on_home === '1'
    };
  }, []);

  const fetchKdramas = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await ncbReadAll('kdrama_recommendations');
      setKdramas(res.map(normalizeItem).filter(Boolean));
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  }, [normalizeItem]);

  useEffect(() => { fetchKdramas(); }, [fetchKdramas]);

  const featuredKdramas = useMemo(() => {
    const published = kdramas.filter(d => d.status === 'published');
    const featured = published.filter(d => d.is_featured_on_home);
    return (featured.length > 0 ? featured : published).slice(0, 8);
  }, [kdramas]);

  return (
    <KdramaContext.Provider value={{
      kdramas, featuredKdramas, isLoading, fetchKdramas,
      publishedKdramas: kdramas.filter(d => d.status === 'published'),
      addKdrama: async (d) => { await ncbCreate('kdrama_recommendations', sanitizeNcbPayload('kdrama_recommendations', d)); await fetchKdramas(); },
      updateKdrama: async (id, updates) => { await ncbUpdate('kdrama_recommendations', id, sanitizeNcbPayload('kdrama_recommendations', updates)); await fetchKdramas(); },
      deleteKdrama: async (id) => { await ncbDelete('kdrama_recommendations', id); await fetchKdramas(); },
      getKdramaBySlug: (slug) => kdramas.find(d => d.slug === slug || String(d.id) === String(slug))
    }}>
      {children}
    </KdramaContext.Provider>
  );
};