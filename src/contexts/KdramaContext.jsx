import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { ncbReadAll, ncbCreate, ncbUpdate, ncbDelete, sanitizeNcbPayload } from '../services/nocodebackendClient';
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

  const normalizeData = useCallback((data) => {
    if (!Array.isArray(data)) return [];
    return data.map((item, index) => {
      const rawImage = item.image_url || item.image || '';
      const cleanImage = getImageSrc(rawImage, KDRAMA_PLACEHOLDER);
      
      const isFeatured = item.is_featured_on_home === true || 
                        item.is_featured_on_home === 1 || 
                        item.is_featured_on_home === '1' || 
                        item.is_featured_on_home === 'true';

      // Robust status handling
      const rawStatus = (item.status || 'published').toString().toLowerCase().trim();
      const isPublished = rawStatus === 'published' || rawStatus === '1' || rawStatus === 'true';
      const cleanStatus = isPublished ? 'published' : 'draft';

      return {
        ...item,
        id: item.id || item._id,
        title: item.title || 'Untitled',
        status: cleanStatus,
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
      const currentData = normalizeData(res);
      // Sort and set data from NCB
      const sorted = [...currentData].sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
      setKdramas(sorted);
    } catch (error) {
      console.error('Fetch K-Dramas Failed:', error);
      setKdramas([]);
    } finally {
      setIsLoading(false);
    }
  }, [normalizeData]);

  useEffect(() => {
    fetchKdramas();
  }, [fetchKdramas]);

  const addKdrama = async (dramaData) => {
    try {
      const payload = sanitizeNcbPayload('kdrama_recommendations', dramaData);
      const saved = await ncbCreate(TABLE_NAME, payload);
      await fetchKdramas();
      return saved;
    } catch (err) {
      console.error('Add K-Drama Failed:', err);
      throw err;
    }
  };

  const updateKdrama = async (id, updates) => {
    try {
      const payload = sanitizeNcbPayload('kdrama_recommendations', updates);
      await ncbUpdate(TABLE_NAME, id, payload);
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
    // Show published dramas that are marked as featured
    const featured = kdramas.filter(d => d.is_featured_on_home === true && d.status === 'published');
    // If none are specifically featured, show the latest published ones
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