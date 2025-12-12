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
        const serverSlugs = new Set(currentData.map(d => String(d.slug)));

        const dramasToEnsure = [
          'the-haunted-palace', 'moon-lovers-scarlet-heart-ryeo', 'mr-queen',
          'crash-landing-on-you', 'moon-embracing-the-sun', 'love-in-the-moonlight',
          'bon-appetit-your-highness', 'when-life-gives-you-tangerines'
        ];

        initialSeedData.forEach(seedItem => {
          // Check if seed item is missing by ID AND Slug
          if (dramasToEnsure.includes(seedItem.id)) {
            const isMissingById = !serverIds.has(String(seedItem.id));
            const isMissingBySlug = !serverSlugs.has(String(seedItem.slug));
            
            if (isMissingById && isMissingBySlug) {
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
        !d.title.toLowerCase().includes('lovely runner') && String(d.id) !== 'lovely-runner'
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
      image_url: dramaData.image_url || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Prevent duplicates: Check if slug exists locally
    if (kdramas.some(d => d.slug === payload.slug)) {
      throw new Error(`A drama with the slug "${payload.slug}" already exists.`);
    }

    const newDrama = { ...payload, id: tempId };
    
    // Optimistic Update
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
      
      // Update local state with real ID
      setKdramas(prev => prev.map(d => d.id === tempId ? { ...d, ...savedDrama, id: realId } : d));
      return realId;
    } catch (e) {
      console.error("Failed to save kdrama", e);
      // Revert optimistic update
      setKdramas(prev => prev.filter(d => d.id !== tempId));
      throw e;
    }
  };

  /**
   * Safe Update Logic:
   * 1. Try update by ID.
   * 2. If 404 (ID not found), fetch all from server to find valid ID by slug.
   * 3. If found by slug -> Update with real ID.
   * 4. If not found -> Create new record.
   */
  const updateKdrama = async (id, updates) => {
    const updatedData = { ...updates, updated_at: new Date().toISOString() };
    const previousState = [...kdramas];
    
    // 1. Optimistic Update
    setKdramas(prev => {
      const updatedList = prev.map(d => d.id === id ? { ...d, ...updatedData } : d);
      return normalizeData(updatedList).sort((a, b) => a.display_order - b.display_order);
    });

    try {
      // 2. Try direct update
      const response = await ncbUpdate(TABLE_NAME, id, updatedData);
      
      // Check for error in response object (ncbUpdate returns JSON)
      if (response && response.error) {
        throw new Error(response.error); // Throw to catch block
      }
    } catch (e) {
      const errorMessage = e.message || '';
      
      // 3. Handle 404 / Record Not Found
      if (errorMessage.includes('404') || errorMessage.toLowerCase().includes('not found')) {
        console.warn(`[KdramaContext] Update failed for ID ${id}. Attempting recovery by slug...`);
        
        try {
          // A. Fetch fresh list from server
          const serverList = await ncbGet(TABLE_NAME);
          const currentLocalItem = previousState.find(d => d.id === id);
          if (!currentLocalItem) throw new Error("Item missing from local state.");

          // B. Find match by SLUG
          const targetSlug = updatedData.slug || currentLocalItem.slug;
          const match = Array.isArray(serverList) 
            ? serverList.find(d => d.slug === targetSlug)
            : null;

          if (match) {
            // C. Found! Update using REAL ID
            console.log(`[KdramaContext] Recovered record. Real ID: ${match.id}`);
            await ncbUpdate(TABLE_NAME, match.id, updatedData);
            
            // Sync local ID
            setKdramas(prev => prev.map(d => d.id === id ? { ...d, id: match.id } : d));
            return;
          } else {
            // D. Not Found -> Create as NEW
            console.log(`[KdramaContext] Record not on server. Creating new entry...`);
            const fullPayload = { ...currentLocalItem, ...updatedData };
            // Remove the invalid ID before creating
            const { id: _, ...createPayload } = fullPayload;
            
            const saved = await ncbCreate(TABLE_NAME, createPayload);
            if (!saved || saved.error) throw new Error(saved?.error || "Create failed during recovery");
            
            const newRealId = saved.id || saved._id;
            setKdramas(prev => prev.map(d => d.id === id ? { ...d, ...saved, id: newRealId } : d));
            return;
          }
        } catch (recoveryError) {
          console.error("Recovery failed:", recoveryError);
          // Fall through to main error handler
        }
      }

      // Main Error Handler
      console.error("Failed to update kdrama", e);
      setKdramas(previousState); // Revert
      throw e; // Propagate to modal
    }
  };

  const deleteKdrama = async (id) => {
    const previousState = [...kdramas];
    setKdramas(prev => prev.filter(d => d.id !== id));

    try {
      const success = await ncbDelete(TABLE_NAME, id);
      if (!success) {
        // If delete fails, it might be a local-only item or slug-id mismatch
        // We could try to find by slug and delete, but for safety we just warn
        console.warn("Delete operation returned false/failed on server.");
      }
    } catch (e) {
      console.error("Failed to delete kdrama", e);
      // If it was a 404, it's already gone, so we don't restore
      if (!e.message.includes('404')) {
        setKdramas(previousState);
        alert("Failed to delete from database. Restored.");
      }
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