import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { ncbGet, ncbCreate, ncbUpdate, ncbDelete } from '../services/nocodebackendClient';
import { kdramas as initialSeedData } from '../data/kdramaData';

const KdramaContext = createContext();

export const useKdrama = () => {
  const context = useContext(KdramaContext);
  if (!context) {
    throw new Error('useKdrama must be used within a KdramaProvider');
  }
  return context;
};

// Helper: Local Storage wrapper for fallback/caching
const getLocalData = () => {
  try {
    const data = localStorage.getItem('kdrama_recommendations');
    const parsed = data ? JSON.parse(data) : null;
    return Array.isArray(parsed) ? parsed : null;
  } catch (e) {
    console.warn("Corrupt local storage for kdramas, resetting.", e);
    return null;
  }
};

export const KdramaProvider = ({ children }) => {
  const [kdramas, setKdramas] = useState(() => getLocalData() || []);
  const [isLoading, setIsLoading] = useState(true);

  const TABLE_NAME = 'kdrama_recommendations';

  // Normalize data to ensure all fields exist
  const normalizeData = (data) => {
    if (!Array.isArray(data)) return [];

    const processDropboxUrl = (url) => {
      if (url && typeof url === 'string' && url.includes('dropbox.com') && url.includes('dl=0')) {
        return url.replace('dl=0', 'raw=1');
      }
      return url;
    };
    
    return data.filter(item => item && typeof item === 'object').map((item, index) => {
      const initialImageUrl = item.image_url || item.image || '';
      const finalImageUrl = processDropboxUrl(initialImageUrl);
      
      return {
        ...item,
        id: item.id || `temp-${Date.now()}-${index}`,
        title: item.title || 'Untitled Drama',
        slug: item.slug || item.id || `drama-${index}`,
        tags: Array.isArray(item.tags) ? item.tags : (item.tags ? String(item.tags).split(',').map(t => t.trim()) : []),
        synopsis_short: item.synopsis_short || item.synopsis || '',
        synopsis_long: item.synopsis_long || item.synopsis || '',
        my_two_cents: item.my_two_cents || '',
        image_url: finalImageUrl,
        image: finalImageUrl,
        image_alt: item.image_alt || item.title || 'Drama poster',
        is_featured_on_home: item.is_featured_on_home === true || item.is_featured_on_home === 'true',
        display_order: parseInt(item.display_order) || (index + 1),
        created_at: item.created_at || new Date().toISOString(),
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
      } else {
        // Fallback to local if server empty
        const local = getLocalData();
        if (local && local.length > 0) {
          currentData = local;
        } else {
          currentData = normalizeData(initialSeedData);
        }
      }

      // --- CRITICAL: FORCE SYNC WITH SEED DATA ---
      // We need to ensure the new dramas requested are present and "Lovely Runner" is gone.
      // This acts as a client-side migration since we don't have DB migrations here.
      
      // 1. Remove "Lovely Runner" if it exists (assuming ID or Title match)
      currentData = currentData.filter(d => 
        !d.title.toLowerCase().includes('lovely runner') && 
        d.id !== 'lovely-runner'
      );

      // 2. Upsert new dramas from seed data
      const dramasToEnsure = [
        'moon-embracing-the-sun',
        'love-in-the-moonlight',
        'bon-appetit-your-highness',
        'when-life-gives-you-tangerines'
      ];

      let hasChanges = false;

      // Check if we need to add/update specific seed items
      initialSeedData.forEach(seedItem => {
        if (dramasToEnsure.includes(seedItem.id)) {
          const existingIndex = currentData.findIndex(d => d.id === seedItem.id);
          
          if (existingIndex === -1) {
            // Add if missing
            currentData.push(normalizeData([seedItem])[0]);
            hasChanges = true;
          } else {
            // Optional: Update if exists to ensure latest content? 
            // For now, we assume if it exists, user might have edited it, so we leave it unless it's strictly a seed refresh.
          }
        }
      });

      currentData.sort((a, b) => a.display_order - b.display_order);
      setKdramas(currentData);

      // If we modified the list locally (removed lovely runner or added new ones), 
      // we should try to sync these changes back to the backend silently if possible,
      // but for now, updating the state ensures the UI is correct.

    } catch (error) {
      console.error("Failed to fetch kdramas", error);
      // Fallback with forced seed
      const safeSeed = normalizeData(initialSeedData);
      setKdramas(safeSeed);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKdramas();
  }, []);

  const addKdrama = async (dramaData) => {
    const tempId = Date.now().toString();
    const payload = {
      ...dramaData,
      image_url: dramaData.image_url || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const newDrama = { ...payload, id: tempId };

    setKdramas(prev => {
      const updated = [...prev, newDrama];
      return normalizeData(updated).sort((a, b) => a.display_order - b.display_order);
    });

    try {
      const savedDrama = await ncbCreate(TABLE_NAME, payload);
      if (savedDrama) {
        const realId = savedDrama.id || savedDrama._id;
        setKdramas(prev => prev.map(d => d.id === tempId ? { ...d, ...savedDrama, id: realId } : d));
        return realId;
      }
      return tempId;
    } catch (e) {
      console.error("Failed to save kdrama", e);
      alert(`Error saving to backend: ${e.message}.`);
      return tempId;
    }
  };

  const updateKdrama = async (id, updates) => {
    const updatedData = { ...updates, updated_at: new Date().toISOString() };
    setKdramas(prev => {
      const updatedList = prev.map(d => d.id === id ? { ...d, ...updatedData } : d);
      return normalizeData(updatedList).sort((a, b) => a.display_order - b.display_order);
    });

    try {
      await ncbUpdate(TABLE_NAME, id, updatedData);
    } catch (e) {
      console.error("Failed to update kdrama", e);
    }
  };

  const deleteKdrama = async (id) => {
    setKdramas(prev => prev.filter(d => d.id !== id));
    try {
      await ncbDelete(TABLE_NAME, id);
    } catch (e) {
      console.error("Failed to delete kdrama", e);
    }
  };

  const getKdramaBySlug = (slug) => {
    // Robust check for string vs number ID match
    return kdramas.find(d => String(d.slug) === String(slug) || String(d.id) === String(slug));
  };

  const featuredKdramas = useMemo(() => {
    return kdramas.filter(d => d.is_featured_on_home);
  }, [kdramas]);

  const value = {
    kdramas,
    featuredKdramas,
    isLoading,
    addKdrama,
    updateKdrama,
    deleteKdrama,
    getKdramaBySlug,
    fetchKdramas
  };

  return (
    <KdramaContext.Provider value={value}>
      {children}
    </KdramaContext.Provider>
  );
};