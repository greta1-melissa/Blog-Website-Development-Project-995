import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { ncbGet, ncbCreate, ncbUpdate, ncbDelete } from '../services/nocodebackendClient';
import { kdramas as initialSeedData } from '../data/kdramaData';
import { normalizeDropboxImageUrl } from '../utils/media.js';

const KdramaContext = createContext();

export const useKdrama = () => {
  const context = useContext(KdramaContext);
  if (!context) {
    throw new Error('useKdrama must be used within a KdramaProvider');
  }
  return context;
};

const getLocalData = () => {
  try {
    const data = localStorage.getItem('kdrama_recommendations');
    const parsed = data ? JSON.parse(data) : null;
    return Array.isArray(parsed) ? parsed : null;
  } catch (e) {
    return null;
  }
};

export const KdramaProvider = ({ children }) => {
  const [kdramas, setKdramas] = useState(() => getLocalData() || []);
  const [isLoading, setIsLoading] = useState(true);
  const TABLE_NAME = 'kdrama_recommendations';

  const normalizeData = (data) => {
    if (!Array.isArray(data)) return [];
    return data.filter(item => item && typeof item === 'object').map((item, index) => {
      const rawImage = item.image_url || item.image || '';
      const finalImageUrl = normalizeDropboxImageUrl(rawImage);
      return {
        ...item,
        id: item.id || `temp-${Date.now()}-${index}`,
        title: item.title || 'Untitled',
        slug: item.slug || item.id || `drama-${index}`,
        tags: Array.isArray(item.tags) ? item.tags : (item.tags ? String(item.tags).split(',').map(t => t.trim()) : []),
        synopsis_short: item.synopsis_short || item.synopsis || '',
        synopsis_long: item.synopsis_long || item.synopsis || '',
        my_two_cents: item.my_two_cents || '',
        image: "",
        image_url: finalImageUrl,
        is_featured_on_home: item.is_featured_on_home === true || item.is_featured_on_home === 'true',
        display_order: parseInt(item.display_order) || (index + 1),
        updated_at: item.updated_at || new Date().toISOString()
      };
    });
  };

  useEffect(() => {
    if (kdramas.length > 0) {
      localStorage.setItem('kdrama_recommendations', JSON.stringify(kdramas));
    }
  }, [kdramas]);

  const fetchKdramas = async () => {
    setIsLoading(true);
    try {
      const serverData = await ncbGet(TABLE_NAME);
      let currentData = [];

      if (serverData && Array.isArray(serverData) && serverData.length > 0) {
        currentData = normalizeData(serverData);
        const serverSlugs = new Set(currentData.map(d => String(d.slug)));

        initialSeedData.forEach(seedItem => {
          if (!serverSlugs.has(String(seedItem.slug))) {
            currentData.push(normalizeData([seedItem])[0]);
          }
        });
      } else {
        const local = getLocalData();
        currentData = local && local.length > 0 ? local : normalizeData(initialSeedData);
      }

      currentData.sort((a, b) => a.display_order - b.display_order);
      setKdramas(currentData);
    } catch (error) {
      console.error("Failed to fetch kdramas", error);
      setKdramas(normalizeData(initialSeedData));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKdramas();
  }, []);

  // IMAGE PERSISTENCE VALIDATOR
  const validateImageProxy = (url) => {
    if (!url) return true;
    if (url.includes('dropbox.com/scl')) {
      throw new Error("Direct Dropbox links are forbidden. Use the 'Upload' button to generate a permanent proxy link.");
    }
    if (!url.startsWith('/api/media/dropbox') && !url.includes('images.unsplash.com')) {
      throw new Error("Image URL must start with /api/media/dropbox for persistence.");
    }
    return true;
  };

  const addKdrama = async (dramaData) => {
    const tempId = Date.now().toString();
    const rawUrl = (dramaData.image_url || dramaData.image || '').trim();
    
    validateImageProxy(rawUrl);
    const normalizedImage = normalizeDropboxImageUrl(rawUrl);

    const payload = {
      ...dramaData,
      image_url: normalizedImage,
      image: "",
      tags: Array.isArray(dramaData.tags) ? dramaData.tags.join(',') : (dramaData.tags || ''),
      created_at: new Date().toISOString()
    };

    if (kdramas.some(d => d.slug === payload.slug)) {
      throw new Error(`Slug "${payload.slug}" already exists.`);
    }

    setKdramas(prev => normalizeData([...prev, { ...payload, id: tempId }]).sort((a, b) => a.display_order - b.display_order));

    try {
      const saved = await ncbCreate(TABLE_NAME, payload);
      if (!saved || saved.error) throw new Error(saved?.error || "Create failed");
      const realId = saved.id || saved._id;
      setKdramas(prev => prev.map(d => d.id === tempId ? { ...d, ...saved, id: realId } : d));
      return realId;
    } catch (e) {
      setKdramas(prev => prev.filter(d => d.id !== tempId));
      throw e;
    }
  };

  const updateKdrama = async (id, updates) => {
    const previousState = [...kdramas];
    const itemToUpdate = kdramas.find(k => k.id === id);
    const targetSlug = updates.slug || itemToUpdate?.slug;

    if (!targetSlug) throw new Error("Cannot update: Record has no slug.");

    let finalImageUrl = (updates.image_url !== undefined ? updates.image_url : (itemToUpdate.image_url || itemToUpdate.image || '')).trim();
    
    validateImageProxy(finalImageUrl);
    finalImageUrl = normalizeDropboxImageUrl(finalImageUrl);

    const preparedUpdates = {
      ...updates,
      image_url: finalImageUrl,
      image: "",
      updated_at: new Date().toISOString()
    };

    if (updates.tags !== undefined) {
      preparedUpdates.tags = Array.isArray(updates.tags) ? updates.tags.join(',') : (updates.tags || '');
    }

    setKdramas(prev => {
      const updatedList = prev.map(d => d.id === id ? { ...d, ...preparedUpdates } : d);
      return normalizeData(updatedList).sort((a, b) => a.display_order - b.display_order);
    });

    try {
      const allRecords = await ncbGet(TABLE_NAME);
      const existingRecord = allRecords.find(r => r.slug === targetSlug || String(r.id) === String(id));

      if (existingRecord) {
        await ncbUpdate(TABLE_NAME, existingRecord.id, preparedUpdates);
      } else {
        const { id: _, ...createPayload } = { ...itemToUpdate, ...preparedUpdates };
        await ncbCreate(TABLE_NAME, createPayload);
      }
    } catch (e) {
      setKdramas(previousState);
      throw e;
    }
  };

  const deleteKdrama = async (id) => {
    const previousState = [...kdramas];
    setKdramas(prev => prev.filter(d => d.id !== id));
    try {
      await ncbDelete(TABLE_NAME, id);
    } catch (e) {
      if (!e.message.includes('404')) {
        setKdramas(previousState);
      }
    }
  };

  const getKdramaBySlug = (slug) => kdramas.find(d => String(d.slug) === String(slug) || String(d.id) === String(slug));
  const featuredKdramas = useMemo(() => kdramas.filter(d => d.is_featured_on_home).slice(0, 4), [kdramas]);

  return (
    <KdramaContext.Provider value={{ kdramas, featuredKdramas, isLoading, addKdrama, updateKdrama, deleteKdrama, getKdramaBySlug, fetchKdramas }}>
      {children}
    </KdramaContext.Provider>
  );
};