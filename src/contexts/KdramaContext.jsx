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
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
};

export const KdramaProvider = ({ children }) => {
  const [kdramas, setKdramas] = useState(() => getLocalData() || []);
  const [isLoading, setIsLoading] = useState(true);

  // Table name as requested
  const TABLE_NAME = 'kdrama_recommendations';

  // Normalize data to ensure all fields exist
  const normalizeData = (data) => {
    return data.map((item, index) => ({
      ...item,
      id: item.id, // Keep original ID
      title: item.title || 'Untitled Drama',
      slug: item.slug || item.id || `drama-${index}`,
      tags: Array.isArray(item.tags) ? item.tags : (item.tags ? item.tags.split(',').map(t => t.trim()) : []),
      synopsis_short: item.synopsis_short || item.synopsis || '',
      synopsis_long: item.synopsis_long || item.synopsis || '',
      my_two_cents: item.my_two_cents || '', // Added new field
      image_url: item.image_url || item.image || '', // Ensure we catch both keys if backend drifts
      image_alt: item.image_alt || item.title || 'Drama poster',
      is_featured_on_home: item.is_featured_on_home === true || item.is_featured_on_home === 'true',
      display_order: parseInt(item.display_order) || (index + 1),
      created_at: item.created_at || new Date().toISOString(),
      updated_at: item.updated_at || new Date().toISOString()
    }));
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
      
      if (serverData && Array.isArray(serverData) && serverData.length > 0) {
        let normalized = normalizeData(serverData);
        // Sort by display_order ascending
        normalized.sort((a, b) => a.display_order - b.display_order);
        setKdramas(normalized);
      } else {
        // Fallback to local or seed if server is empty
        const localData = getLocalData();
        if (localData && localData.length > 0) {
          setKdramas(localData);
        } else {
          // Initial seed
          console.log("Seeding initial K-drama data...");
          const seeded = normalizeData(initialSeedData);
          setKdramas(seeded);
          // Optional: Attempt to seed server (fire and forget)
          seeded.forEach(async (drama) => {
             const { id, ...payload } = drama;
             await ncbCreate(TABLE_NAME, payload).catch(e => console.warn("Seed failed for", drama.title));
          });
        }
      }
    } catch (error) {
      console.error("Failed to fetch kdramas", error);
      if (kdramas.length === 0) {
        setKdramas(normalizeData(initialSeedData));
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKdramas();
  }, []);

  const addKdrama = async (dramaData) => {
    const tempId = Date.now().toString();
    const newDrama = {
      ...dramaData,
      id: tempId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Optimistic update
    setKdramas(prev => {
      const updated = [...prev, newDrama];
      return updated.sort((a, b) => a.display_order - b.display_order);
    });

    try {
      // Remove temp ID before sending to backend
      const { id, ...payload } = newDrama; 
      const savedDrama = await ncbCreate(TABLE_NAME, payload);
      
      if (savedDrama) {
        // Update the temp ID with real ID from server
        const realId = savedDrama.id || savedDrama._id;
        setKdramas(prev => prev.map(d => d.id === tempId ? { ...d, ...savedDrama, id: realId } : d));
        return realId;
      }
      return tempId;
    } catch (e) {
      console.error("Failed to save kdrama", e);
      return tempId;
    }
  };

  const updateKdrama = async (id, updates) => {
    const updatedData = { ...updates, updated_at: new Date().toISOString() };
    
    setKdramas(prev => {
        const updatedList = prev.map(d => d.id === id ? { ...d, ...updatedData } : d);
        return updatedList.sort((a, b) => a.display_order - b.display_order);
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
    return kdramas.find(d => d.slug === slug || d.id === slug);
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