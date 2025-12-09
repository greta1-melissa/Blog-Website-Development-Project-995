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

    // Robust Dropbox URL processor
    const processDropboxUrl = (url) => {
      if (!url || typeof url !== 'string' || !url.includes('dropbox.com')) return url;
      let newUrl = url;
      // Replace dl=0 with raw=1
      if (newUrl.includes('dl=0')) {
        newUrl = newUrl.replace('dl=0', 'raw=1');
      } 
      // Replace raw=0 with raw=1
      else if (newUrl.includes('raw=0')) {
        newUrl = newUrl.replace('raw=0', 'raw=1');
      }
      // If raw=1 is still missing, append it
      if (!newUrl.includes('raw=1')) {
        const separator = newUrl.includes('?') ? '&' : '?';
        newUrl = `${newUrl}${separator}raw=1`;
      }
      return newUrl;
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

      // --- CRITICAL: FORCE SYNC WITH SEED DATA & FEATURED FLAGS ---
      
      // 1. Remove unwanted dramas (Lovely Runner, Hometown Cha Cha Cha)
      currentData = currentData.filter(d => 
        !d.title.toLowerCase().includes('lovely runner') && 
        d.id !== 'lovely-runner' &&
        d.id !== 'hometown-cha-cha-cha'
      );

      // 2. Upsert new/specific dramas from seed data
      const dramasToEnsure = [
        'the-haunted-palace',
        'moon-lovers-scarlet-heart-ryeo',
        'mr-queen',
        'crash-landing-on-you',
        'moon-embracing-the-sun',
        'love-in-the-moonlight',
        'bon-appetit-your-highness',
        'when-life-gives-you-tangerines'
      ];

      initialSeedData.forEach(seedItem => {
        if (dramasToEnsure.includes(seedItem.id)) {
          const existingIndex = currentData.findIndex(d => d.id === seedItem.id);
          if (existingIndex === -1) {
            currentData.push(normalizeData([seedItem])[0]);
          } else {
            // Update existing item to match seed (ensures content consistency)
             currentData[existingIndex] = { ...currentData[existingIndex], ...normalizeData([seedItem])[0] };
          }
        }
      });

      // 3. STRICTLY ENFORCE HOME PAGE FEATURED LIST
      // Only these 4 IDs should be featured. All others set to false.
      const HOMEPAGE_FEATURED_IDS = [
        'the-haunted-palace',
        'moon-lovers-scarlet-heart-ryeo',
        'mr-queen',
        'crash-landing-on-you'
      ];

      currentData = currentData.map(drama => {
        if (HOMEPAGE_FEATURED_IDS.includes(drama.id)) {
          return { ...drama, is_featured_on_home: true };
        } else {
          return { ...drama, is_featured_on_home: false };
        }
      });

      currentData.sort((a, b) => a.display_order - b.display_order);
      setKdramas(currentData);

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
    return kdramas.find(d => String(d.slug) === String(slug) || String(d.id) === String(slug));
  };

  const featuredKdramas = useMemo(() => {
    // Filter by the flag first, then ensure we only take the top 4 if somehow more are flagged
    return kdramas.filter(d => d.is_featured_on_home).slice(0, 4);
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