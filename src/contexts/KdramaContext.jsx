import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { ncbCreate, ncbUpdate, ncbDelete } from '../services/nocodebackendClient';
import { kdramas as initialSeedData } from '../data/kdramaData';
import { getImageSrc } from '../utils/media.js';
import { KDRAMA_PLACEHOLDER } from '../config/assets';

const KdramaContext = createContext();

export const useKdrama = () => {
  const context = useContext(KdramaContext);
  if (!context) {
    throw new Error('useKdrama must be used within a KdramaProvider');
  }
  return context;
};

export const KdramaProvider = ({ children }) => {
  const [kdramas, setKdramas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const TABLE_NAME = 'kdrama_recommendations';

  /**
   * Normalizes incoming database data.
   * Handles boolean conversion from NCB (1/0 or true/false strings).
   */
  const normalizeData = (data) => {
    if (!Array.isArray(data)) return [];
    return data.map((item, index) => {
      const rawImage = item.image_url || item.image || '';
      const cleanImage = getImageSrc(rawImage, KDRAMA_PLACEHOLDER);
      
      // Robust boolean check for NCB (handles 1, "1", true, "true")
      const isFeatured = 
        item.is_featured_on_home === true || 
        item.is_featured_on_home === 1 || 
        item.is_featured_on_home === '1' || 
        item.is_featured_on_home === 'true';

      return {
        ...item,
        id: item.id || `temp-${Date.now()}-${index}`,
        title: item.title || 'Untitled',
        slug: item.slug || item.id || `drama-${index}`,
        tags: Array.isArray(item.tags) 
          ? item.tags 
          : (item.tags ? String(item.tags).split(',').map(t => t.trim()) : []),
        synopsis_short: item.synopsis_short || item.synopsis || '',
        synopsis_long: item.synopsis_long || item.synopsis || '',
        image_url: cleanImage,
        is_featured_on_home: isFeatured,
        display_order: parseInt(item.display_order) || (index + 1)
      };
    });
  };

  const fetchKdramas = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/ncb/read/${TABLE_NAME}`);
      const json = await res.json();
      
      let currentData = [];
      if (json.status === 'success' && Array.isArray(json.data) && json.data.length > 0) {
        currentData = normalizeData(json.data);
      } else {
        // Fallback to seed data if DB is empty
        currentData = normalizeData(initialSeedData);
      }
      
      currentData.sort((a, b) => a.display_order - b.display_order);
      setKdramas(currentData);
    } catch (error) {
      console.warn("KdramaContext: Fetching from DB failed, using seed data.", error);
      setKdramas(normalizeData(initialSeedData));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKdramas();
  }, []);

  const addKdrama = async (dramaData) => {
    try {
      const saved = await ncbCreate(TABLE_NAME, dramaData);
      await fetchKdramas(); // Refresh to ensure sync
      return saved.id;
    } catch (err) {
      console.error("Failed to add drama", err);
      throw err;
    }
  };

  const updateKdrama = async (id, updates) => {
    try {
      await ncbUpdate(TABLE_NAME, id, updates);
      setKdramas(prev => prev.map(d => 
        String(d.id) === String(id) ? { ...d, ...updates } : d
      ));
    } catch (err) {
      console.error("Failed to update drama", err);
      throw err;
    }
  };

  const deleteKdrama = async (id) => {
    try {
      await ncbDelete(TABLE_NAME, id);
      setKdramas(prev => prev.filter(d => String(d.id) !== String(id)));
    } catch (err) {
      console.error("Failed to delete drama", err);
      throw err;
    }
  };

  const getKdramaBySlug = (slug) => kdramas.find(d => 
    String(d.slug) === String(slug) || String(d.id) === String(slug)
  );

  // If no dramas are marked as featured, show the first 4 as a fallback
  const featuredKdramas = useMemo(() => {
    const featured = kdramas.filter(d => d.is_featured_on_home);
    return (featured.length > 0 ? featured : kdramas).slice(0, 4);
  }, [kdramas]);

  return (
    <KdramaContext.Provider value={{ 
      kdramas, 
      featuredKdramas, 
      isLoading, 
      addKdrama, 
      updateKdrama, 
      deleteKdrama, 
      getKdramaBySlug, 
      fetchKdramas 
    }}>
      {children}
    </KdramaContext.Provider>
  );
};