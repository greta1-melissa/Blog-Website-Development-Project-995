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

// Helper: Local Storage wrapper
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

  // Normalize data to ensure all fields exist AND URLs are display-ready
  const normalizeData = (data) => {
    if (!Array.isArray(data)) return [];

    const processDropboxUrl = (url) => {
      if (!url || typeof url !== 'string') return '';
      if (!url.includes('dropbox.com')) return url;
      
      let newUrl = url;
      // Force raw=1 for direct image rendering
      if (newUrl.includes('dl=0')) {
        newUrl = newUrl.replace('dl=0', 'raw=1');
      } else if (newUrl.includes('raw=0')) {
        newUrl = newUrl.replace('raw=0', 'raw=1');
      }
      
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
        
        // Merge strategy: Prioritize Server, add missing Seed items
        const serverIds = new Set(currentData.map(d => String(d.id)));
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
            if (!serverIds.has(String(seedItem.id))) {
              currentData.push(normalizeData([seedItem])[0]);
            }
          }
        });

      } else {
        const local = getLocalData();
        if (local && local.length > 0) {
          currentData = local;
        } else {
          currentData = normalizeData(initialSeedData);
        }
      }

      // Filter out test/deleted items if needed
      currentData = currentData.filter(d => 
        !d.title.toLowerCase().includes('lovely runner') && 
        String(d.id) !== 'lovely-runner'
      );

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
    const payload = {
      ...dramaData,
      image_url: dramaData.image_url || '', // API URL is already normalized by form, but context normalizes again to be safe
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
      if (!savedDrama || savedDrama.error) {
        throw new Error(savedDrama?.error || "Unknown database error");
      }
      const realId = savedDrama.id || savedDrama._id;
      setKdramas(prev => prev.map(d => d.id === tempId ? { ...d, ...savedDrama, id: realId } : d));
      return realId;
    } catch (e) {
      console.error("Failed to save kdrama", e);
      setKdramas(prev => prev.filter(d => d.id !== tempId));
      alert(`Failed to save to database: ${e.message}`);
      throw e; 
    }
  };

  const updateKdrama = async (id, updates) => {
    const updatedData = { ...updates, updated_at: new Date().toISOString() };
    const previousState = [...kdramas];

    setKdramas(prev => {
      const updatedList = prev.map(d => d.id === id ? { ...d, ...updatedData } : d);
      return normalizeData(updatedList).sort((a, b) => a.display_order - b.display_order);
    });

    try {
      const response = await ncbUpdate(TABLE_NAME, id, updatedData);
      if (response && response.error) throw new Error(response.error);
    } catch (e) {
      console.error("Failed to update kdrama", e);
      setKdramas(previousState);
      alert(`Failed to save changes: ${e.message}`);
      throw e;
    }
  };

  const deleteKdrama = async (id) => {
    const previousState = [...kdramas];
    setKdramas(prev => prev.filter(d => d.id !== id));

    try {
      const success = await ncbDelete(TABLE_NAME, id);
      if (!success) throw new Error("Delete failed");
    } catch (e) {
      console.error("Failed to delete kdrama", e);
      setKdramas(previousState);
      alert("Failed to delete from database.");
    }
  };

  const getKdramaBySlug = (slug) => {
    return kdramas.find(d => String(d.slug) === String(slug) || String(d.id) === String(slug));
  };

  const featuredKdramas = useMemo(() => {
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