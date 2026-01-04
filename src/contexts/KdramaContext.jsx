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
   * Ensures image paths are sanitized before reaching state.
   */
  const normalizeData = (data) => {
    if (!Array.isArray(data)) return [];
    return data.map((item, index) => {
      const rawImage = item.image_url || item.image || '';
      
      // Normalize image path immediately
      const cleanImage = getImageSrc(rawImage, KDRAMA_PLACEHOLDER);
      
      return {
        ...item,
        id: item.id || `temp-${Date.now()}-${index}`,
        title: item.title || 'Untitled',
        slug: item.slug || item.id || `drama-${index}`,
        tags: Array.isArray(item.tags) ? item.tags : (item.tags ? String(item.tags).split(',').map(t => t.trim()) : []),
        synopsis_short: item.synopsis_short || item.synopsis || '',
        synopsis_long: item.synopsis_long || item.synopsis || '',
        image_url: cleanImage,
        is_featured_on_home: item.is_featured_on_home === true || item.is_featured_on_home === 'true',
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
      if (Array.isArray(json.data) && json.data.length > 0) {
        currentData = normalizeData(json.data);
      } else {
        currentData = normalizeData(initialSeedData);
      }
      
      currentData.sort((a, b) => a.display_order - b.display_order);
      setKdramas(currentData);
    } catch (error) {
      console.error("KdramaContext fetch failed", error);
      setKdramas(normalizeData(initialSeedData));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKdramas();
  }, []);

  const addKdrama = async (dramaData) => {
    const saved = await ncbCreate(TABLE_NAME, dramaData);
    setKdramas(prev => normalizeData([...prev, saved]).sort((a, b) => a.display_order - b.display_order));
    return saved.id;
  };

  const updateKdrama = async (id, updates) => {
    await ncbUpdate(TABLE_NAME, id, updates);
    setKdramas(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d).map(item => normalizeData([item])[0]));
  };

  const deleteKdrama = async (id) => {
    await ncbDelete(TABLE_NAME, id);
    setKdramas(prev => prev.filter(d => d.id !== id));
  };

  const getKdramaBySlug = (slug) => kdramas.find(d => String(d.slug) === String(slug) || String(d.id) === String(slug));

  const featuredKdramas = useMemo(() => kdramas.filter(d => d.is_featured_on_home).slice(0, 4), [kdramas]);

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