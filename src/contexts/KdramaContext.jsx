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
    const data = localStorage.getItem('kdramas');
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
};

export const KdramaProvider = ({ children }) => {
  const [kdramas, setKdramas] = useState(() => getLocalData() || []);
  const [isLoading, setIsLoading] = useState(true);

  // Map existing static data format to new schema if needed
  // New Schema: id, title, slug, tags (array), synopsis_short, synopsis_long, image_url, image_alt, is_featured_on_home, display_order
  const normalizeData = (data) => {
    return data.map((item, index) => ({
      ...item,
      // Ensure fields exist
      slug: item.slug || item.id, // Fallback to ID if slug missing
      synopsis_short: item.synopsis_short || item.synopsis || '',
      synopsis_long: item.synopsis_long || item.synopsis || '', // Default long to short if missing
      image_url: item.image_url || item.image || '',
      tags: Array.isArray(item.tags) ? item.tags : (item.tags ? item.tags.split(',').map(t => t.trim()) : []),
      is_featured_on_home: item.is_featured_on_home !== undefined ? item.is_featured_on_home : (item.category === 'current'),
      display_order: item.display_order || (index + 1)
    }));
  };

  useEffect(() => {
    if (kdramas.length > 0) {
      localStorage.setItem('kdramas', JSON.stringify(kdramas));
    }
  }, [kdramas]);

  const fetchKdramas = async () => {
    setIsLoading(true);
    try {
      const serverData = await ncbGet('kdramas');
      
      if (serverData && Array.isArray(serverData) && serverData.length > 0) {
        // Use server data
        const normalized = normalizeData(serverData);
        // Sort by display_order
        normalized.sort((a, b) => a.display_order - b.display_order);
        setKdramas(normalized);
      } else {
        // Fallback to seed data if server is empty
        // We only use local if we haven't successfully fetched before or if server is empty (first run)
        const localData = getLocalData();
        if (localData && localData.length > 0) {
          setKdramas(localData);
        } else {
          // Initial seed
          const seeded = normalizeData(initialSeedData);
          setKdramas(seeded);
          // Optional: Auto-seed server? 
          // For now, we prefer manual sync or just let user create new ones. 
          // But to make "It just works" we can leave it in local state.
        }
      }
    } catch (error) {
      console.error("Failed to fetch kdramas", error);
      // Fallback
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
    const tempId = Date.now().toString(); // Temporary ID
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
      // Exclude temp ID for creation if backend generates it, 
      // but if we want to enforce slugs as IDs or keep simple, we rely on backend response
      const { id, ...payload } = newDrama; 
      const savedDrama = await ncbCreate('kdramas', payload);
      
      if (savedDrama) {
        setKdramas(prev => prev.map(d => d.id === tempId ? { ...savedDrama, ...d, id: savedDrama.id || savedDrama._id || tempId } : d));
        return savedDrama.id;
      }
      return tempId;
    } catch (e) {
      console.error("Failed to save kdrama", e);
      return tempId;
    }
  };

  const updateKdrama = async (id, updates) => {
    setKdramas(prev => prev.map(d => d.id === id ? { ...d, ...updates, updated_at: new Date().toISOString() } : d));
    try {
      await ncbUpdate('kdramas', id, updates);
    } catch (e) {
      console.error("Failed to update kdrama", e);
    }
  };

  const deleteKdrama = async (id) => {
    setKdramas(prev => prev.filter(d => d.id !== id));
    try {
      await ncbDelete('kdramas', id);
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
    fetchKdramas // Exposed if needed to force refresh
  };

  return (
    <KdramaContext.Provider value={value}>
      {children}
    </KdramaContext.Provider>
  );
};