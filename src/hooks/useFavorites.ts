/**
 * useFavorites Hook
 * Manages favorite POIs with persistent storage
 * Supports offline-first optimistic updates with sync queue
 */

import { useState, useEffect, useCallback } from "react";
import * as Haptics from "expo-haptics";
import {
  getFavorites,
  addToFavorite,
  removeFromFavorites,
  toggleFavorite as toggleFavoriteStorage,
  isFavorite as isFavoriteStorage,
  type CachedPOI,
} from "../utils/storage";
import { addToQueue } from "../utils/sync-queue";

interface UseFavoritesReturn {
  favorites: string[];
  favoritesData: CachedPOI[];
  isLoading: boolean;
  isFavorite: (poiId: string) => boolean;
  addFavorite: (poi: CachedPOI) => Promise<void>;
  removeFavorite: (poiId: string) => Promise<void>;
  toggleFavorite: (poi: CachedPOI) => Promise<boolean>;
  refreshFavorites: () => Promise<void>;
}

export function useFavorites(): UseFavoritesReturn {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [favoritesData, setFavoritesData] = useState<CachedPOI[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load favorites on mount
  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setIsLoading(true);
      const favs = await getFavorites();
      setFavorites(favs.map((f) => f.id));
      setFavoritesData(favs);
    } catch (error) {
      console.error("[useFavorites] Load failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const isFavorite = useCallback(
    (poiId: string): boolean => {
      return favorites.includes(poiId);
    },
    [favorites],
  );

  const addFavorite = useCallback(
    async (poi: CachedPOI) => {
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        
        // Optimistic update - update UI immediately
        setFavorites((prev) => [...prev, poi.id]);
        setFavoritesData((prev) => [...prev, { ...poi, isFavorite: true }]);
        
        // Save to local storage
        await addToFavorite(poi);
        
        // Add to sync queue for background sync
        await addToQueue('ADD_FAVORITE', { poi });
        
        console.log("[useFavorites] Added favorite with sync queue:", poi.id);
      } catch (error) {
        console.error("[useFavorites] Add failed:", error);
        // Revert optimistic update on error
        setFavorites((prev) => prev.filter((id) => id !== poi.id));
        setFavoritesData((prev) => prev.filter((f) => f.id !== poi.id));
      }
    },
    [],
  );

  const removeFavorite = useCallback(
    async (poiId: string) => {
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        
        // Optimistic update - update UI immediately
        setFavorites((prev) => prev.filter((id) => id !== poiId));
        setFavoritesData((prev) => prev.filter((f) => f.id !== poiId));
        
        // Save to local storage
        await removeFromFavorites(poiId);
        
        // Add to sync queue for background sync
        await addToQueue('REMOVE_FAVORITE', { poiId });
        
        console.log("[useFavorites] Removed favorite with sync queue:", poiId);
      } catch (error) {
        console.error("[useFavorites] Remove failed:", error);
        // Note: We don't revert on remove failure as the item is already gone
      }
    },
    [],
  );

  const toggleFavorite = useCallback(
    async (poi: CachedPOI): Promise<boolean> => {
      const wasFavorite = favorites.includes(poi.id);
      if (wasFavorite) {
        await removeFavorite(poi.id);
        return false;
      } else {
        await addFavorite(poi);
        return true;
      }
    },
    [favorites, addFavorite, removeFavorite],
  );

  const refreshFavorites = useCallback(async () => {
    await loadFavorites();
  }, []);

  return {
    favorites,
    favoritesData,
    isLoading,
    isFavorite,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    refreshFavorites,
  };
}