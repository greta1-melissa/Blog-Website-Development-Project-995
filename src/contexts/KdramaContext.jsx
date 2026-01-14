import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { ncbReadAll, ncbCreate, ncbUpdate, ncbDelete } from '../services/nocodebackendClient';
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
   * Defensive against non-string slugs and boolean variations.
   */
  const normalizeData = useCallback((data) => {
    if (!Array.isArray(data)) return [];
    
    return data.map((item, index) => {
      const rawImage = item.image_url || item.image || '';
      const cleanImage = getImageSrc(rawImage, KDRAMA_PLACEHOLDER);
      
      // Robust boolean check for NCB
      const isFeatured = item.is_featured_on_home === true || 
                        item.is_featured_on_home === 1 || 
                        item.is_featured_on_home === '1' || 
                        item.is_featured_on_home === 'true';

      return {
        ...item,
        id: item.id || `temp-${Date.now()}-${index}`,
        title: item.title || 'Untitled',
        slug: String(item.slug || item.id || `drama-${index}`).trim(),
        tags: Array.isArray(item.tags) ? item.tags : (item.tags ? String(item.tags).split(',').map(t => t.trim()) : []),
        synopsis_short: item.synopsis_short || item.synopsis || '',
        synopsis_long: item.synopsis_long || item.synopsis || '',
        my_two_cents: item.my_two_cents || '',
        image_url: cleanImage,
        is_featured_on_home: isFeatured,
        display_order: parseInt(item.display_order) || (index + 1)
      };
    });
  }, []);

  const fetchKdramas = useCallback(async () => {
    setIsLoading(true);
    try {
      // Use ncbReadAll for consistency and proxy handling
      const res = await ncbReadAll(TABLE_NAME);
      
      let currentData = [];
      if (Array.isArray(res) && res.length > 0) {
        currentData = normalizeData(res);
      } else {
        currentData = normalizeData(initialSeedData);
      }
      
      // Global sort by display order
      currentData.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
      setKdramas(currentData);
    } catch (error) {
      console.warn("KdramaContext: Fetching failed, using seeds.", error);
      setKdramas(normalizeData(initialSeedData));
    } finally {
      setIsLoading(false);
    }
  }, [normalizeData]);

  useEffect(() => {
    fetchKdramas();
  }, [fetchKdramas]);

  const addKdrama = async (dramaData) => {
    try {
      const saved = await ncbCreate(TABLE_NAME, {
        ...dramaData,
        created_at: new Date().toISOString()
      });
      await fetchKdramas();
      return saved;
    } catch (err) {
      console.error("Failed to add drama", err);
      throw err;
    }
  };

  const updateKdrama = async (id, updates) => {
    try {
      if (updates.slug !== undefined) {
        updates.slug = String(updates.slug ?? '').trim();
      }
      await ncbUpdate(TABLE_NAME, id, updates);
      await fetchKdramas();
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

  const getKdramaBySlug = (slug) => {
    const searchSlug = String(slug || '').trim();
    return kdramas.find(d => 
      String(d.slug || '').trim() === searchSlug || 
      String(d.id) === searchSlug
    );
  };

  /**
   * Filter logic for featured section
   */
  const featuredKdramas = useMemo(() => {
    const featured = kdramas.filter(d => d.is_featured_on_home === true);
    const source = featured.length > 0 ? featured : kdramas;
    return [...source]
      .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
      .slice(0, 8);
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