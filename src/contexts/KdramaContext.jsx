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
  const TABLE_NAME = 'kdramas'; // Replaces kdrama_recommendations as requested

  const normalizeData = useCallback((data) => {
    if (!Array.isArray(data)) return [];
    return data.map((item, index) => {
      const rawImage = item.image_url || item.image || '';
      const cleanImage = getImageSrc(rawImage, KDRAMA_PLACEHOLDER);
      const isFeatured = item.is_featured_on_home === true || 
                        item.is_featured_on_home === 1 || 
                        item.is_featured_on_home === '1' || 
                        item.is_featured_on_home === 'true';

      return {
        ...item,
        id: item.id || item._id,
        title: item.title || 'Untitled',
        status: (item.status || 'published').toString().toLowerCase().trim(),
        slug: String(item.slug || item.id || `drama-${index}`).trim(),
        tags: Array.isArray(item.tags) ? item.tags : (item.tags ? String(item.tags).split(',').map(t => t.trim()) : []),
        synopsis_short: item.synopsis_short || item.synopsis || '',
        synopsis_long: item.synopsis_long || item.synopsis || '',
        my_two_cents: item.my_two_cents || '',
        image_url: cleanImage,
        is_featured_on_home: isFeatured,
        display_order: parseInt(item.display_order) || (index + 1),
        // SEO Fields
        seo_title: item.seo_title || item.title || '',
        meta_description: item.meta_description || item.synopsis_short || '',
        focus_keyword: item.focus_keyword || '',
        og_image_url: item.og_image_url || cleanImage,
        canonical_url: item.canonical_url || '',
        noindex: item.noindex === true || item.noindex === 'true' || item.noindex === 1
      };
    });
  }, []);

  const fetchKdramas = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await ncbReadAll(TABLE_NAME);
      let currentData = normalizeData(res);
      if (currentData.length === 0) currentData = normalizeData(initialSeedData);
      currentData.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
      setKdramas(currentData);
    } catch (error) {
      console.error('Fetch K-Dramas Failed:', error);
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
      const saved = await ncbCreate(TABLE_NAME, dramaData);
      await fetchKdramas();
      return saved;
    } catch (err) {
      console.error('Add K-Drama Failed:', err);
      throw err;
    }
  };

  const updateKdrama = async (id, updates) => {
    try {
      await ncbUpdate(TABLE_NAME, id, updates);
      await fetchKdramas();
    } catch (err) {
      console.error('Update K-Drama Failed:', err);
      throw err;
    }
  };

  const deleteKdrama = async (id) => {
    try {
      await ncbDelete(TABLE_NAME, id);
      await fetchKdramas();
    } catch (err) {
      console.error('Delete K-Drama Failed:', err);
      throw err;
    }
  };

  const getKdramaBySlug = (slug) => {
    const searchSlug = String(slug || '').trim();
    return kdramas.find(d => String(d.slug || '').trim() === searchSlug || String(d.id) === searchSlug);
  };

  const featuredKdramas = useMemo(() => {
    const featured = kdramas.filter(d => d.is_featured_on_home === true && d.status === 'published');
    const source = featured.length > 0 ? featured : kdramas.filter(d => d.status === 'published');
    return [...source].sort((a, b) => (a.display_order || 0) - (b.display_order || 0)).slice(0, 8);
  }, [kdramas]);

  return (
    <KdramaContext.Provider value={{
      kdramas, 
      publishedKdramas: kdramas.filter(d => d.status === 'published'),
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