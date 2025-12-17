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
      // Use the shared utility to normalize images consistently
      // Prioritize image_url
      const finalImageUrl = normalizeDropboxImageUrl(item.image_url || item.image || '');
      
      return {
        ...item,
        id: item.id || `temp-${Date.now()}-${index}`,
        title: item.title || 'Untitled',
        slug: item.slug || item.id || `drama-${index}`,
        tags: Array.isArray(item.tags) ? item.tags : (item.tags ? String(item.tags).split(',').map(t => t.trim()) : []),
        synopsis_short: item.synopsis_short || item.synopsis || '',
        synopsis_long: item.synopsis_long || item.synopsis || '',
        my_two_cents: item.my_two_cents || '',
        image_url: finalImageUrl,
        image: finalImageUrl, // Keeps legacy sync
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
        
        // Merge missing seed data mainly for display if server is partial
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

  const addKdrama = async (dramaData) => {
    const tempId = Date.now().toString();
    // Normalize image URL before saving
    const normalizedImage = normalizeDropboxImageUrl(dramaData.image_url || dramaData.image);
    
    const payload = {
      ...dramaData,
      image: normalizedImage,
      image_url: normalizedImage,
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

  // -------------------------------------------------------------------------
  // SAFE UPSERT LOGIC
  // -------------------------------------------------------------------------
  const updateKdrama = async (id, updates) => {
    const previousState = [...kdramas];
    const itemToUpdate = kdramas.find(k => k.id === id);
    const targetSlug = updates.slug || itemToUpdate?.slug;

    if (!targetSlug) {
      throw new Error("Cannot update: Record has no slug.");
    }

    // Normalize incoming image URL
    const newImageUrl = normalizeDropboxImageUrl(updates.image_url || updates.image);
    // Use new URL if present, otherwise fall back to existing. 
    // This prevents overwriting with blank if the user didn't change the image field.
    const finalImageUrl = newImageUrl || itemToUpdate.image_url || itemToUpdate.image;

    const preparedUpdates = {
      ...updates,
      image: finalImageUrl,
      image_url: finalImageUrl,
      updated_at: new Date().toISOString()
    };

    // 1. Optimistic Update
    setKdramas(prev => {
      const updatedList = prev.map(d => d.id === id ? { ...d, ...preparedUpdates } : d);
      return normalizeData(updatedList).sort((a, b) => a.display_order - b.display_order);
    });

    try {
      // 2. FETCH FIRST: Check if record exists on server by SLUG
      const allRecords = await ncbGet(TABLE_NAME);
      const existingRecord = allRecords.find(r => r.slug === targetSlug);

      if (existingRecord) {
        // A. FOUND: Update using REAL Server ID
        console.log(`[KdramaContext] Upsert: Found ${targetSlug} (ID: ${existingRecord.id}). Updating...`);
        const realId = existingRecord.id;
        await ncbUpdate(TABLE_NAME, realId, preparedUpdates);
        
        // Sync local ID if it was different
        if (String(id) !== String(realId)) {
          setKdramas(prev => prev.map(d => d.id === id ? { ...d, id: realId } : d));
        }
      } else {
        // B. NOT FOUND: Create new record
        console.log(`[KdramaContext] Upsert: ${targetSlug} not found. Creating...`);
        // Remove 'id' if it's junk/temp/slug
        const { id: _, ...createPayload } = { ...itemToUpdate, ...preparedUpdates };
        
        const saved = await ncbCreate(TABLE_NAME, createPayload);
        if (!saved || saved.error) throw new Error(saved?.error || "Create failed during upsert");
        
        const newRealId = saved.id || saved._id;
        setKdramas(prev => prev.map(d => d.id === id ? { ...d, ...saved, id: newRealId } : d));
      }
    } catch (e) {
      console.error("[KdramaContext] Safe Update Failed:", e);
      setKdramas(previousState); // Revert
      throw e;
    }
  };

  const deleteKdrama = async (id) => {
    const previousState = [...kdramas];
    setKdramas(prev => prev.filter(d => d.id !== id));
    try {
      await ncbDelete(TABLE_NAME, id);
    } catch (e) {
      console.error("Delete failed", e);
      if (!e.message.includes('404')) {
        setKdramas(previousState);
        alert("Delete failed on server. Restored.");
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