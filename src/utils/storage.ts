/**
 * BaliBuddy Storage Utility
 * Offline-first data persistence layer
 * Migrated from AsyncStorage to expo-sqlite/kv-store
 */

import * as kvStore from "./kv-store";

// Storage Keys
export const STORAGE_KEYS = {
  POIS: "@balibuddy:pois",
  POIS_TIMESTAMP: "@balibuddy:pois:timestamp",
  POIS_LOCATION: "@balibuddy:pois:location",
  FAVORITES: "@balibuddy:favorites",
  WEATHER: "@balibuddy:weather",
  WEATHER_TIMESTAMP: "@balibuddy:weather:timestamp",
  SETTINGS: "@balibuddy:settings",
  LAST_LAUNCH: "@balibuddy:last_launch",
} as const;

export const CACHE_DURATION = {
  POIS: 15 * 60 * 1000,
  WEATHER: 30 * 60 * 1000,
};

export interface CachedPOI {
  id: string;
  name: string;
  type: string;
  latitude: number;
  longitude: number;
  description: string;
  distance?: number;
  phone?: string;
  isFavorite?: boolean;
}

export interface CachedWeather {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  icon: string;
  location: string;
}

export interface StorageResult<T> {
  data: T | null;
  isCached: boolean;
  timestamp?: number;
  isExpired?: boolean;
}

export async function savePOIs(
  pois: CachedPOI[],
  latitude: number,
  longitude: number,
): Promise<void> {
  try {
    await kvStore.setJSON(STORAGE_KEYS.POIS, pois);
    await kvStore.set(STORAGE_KEYS.POIS_TIMESTAMP, Date.now().toString());
    await kvStore.setJSON(STORAGE_KEYS.POIS_LOCATION, { latitude, longitude });
  } catch (error) {
    console.error("[Storage] Failed to save POIs:", error);
  }
}

export async function getPOIs(): Promise<StorageResult<CachedPOI[]>> {
  try {
    const [poisData, timestampData] = await Promise.all([
      kvStore.getJSON<CachedPOI[]>(STORAGE_KEYS.POIS),
      kvStore.get(STORAGE_KEYS.POIS_TIMESTAMP),
    ]);

    const timestamp = timestampData ? parseInt(timestampData, 10) : 0;
    const isExpired = timestamp
      ? Date.now() - timestamp > CACHE_DURATION.POIS
      : false;

    return { data: poisData, isCached: !!poisData, timestamp, isExpired: !!isExpired };
  } catch (error) {
    console.error("[Storage] Failed to get POIs:", error);
    return { data: null, isCached: false, isExpired: false };
  }
}

export async function getFavorites(): Promise<CachedPOI[]> {
  try {
    const data = await kvStore.getJSON<CachedPOI[]>(STORAGE_KEYS.FAVORITES);
    return data ?? [];
  } catch {
    return [];
  }
}

export async function addToFavorite(poi: CachedPOI): Promise<void> {
  try {
    const favorites = await getFavorites();
    if (favorites.some((f) => f.id === poi.id)) return;
    await kvStore.setJSON(STORAGE_KEYS.FAVORITES, [...favorites, { ...poi, isFavorite: true }]);
  } catch (error) {
    console.error("[Storage] Failed to add favorite:", error);
  }
}

export async function removeFromFavorites(poiId: string): Promise<void> {
  try {
    const favorites = await getFavorites();
    await kvStore.setJSON(STORAGE_KEYS.FAVORITES, favorites.filter((f) => f.id !== poiId));
  } catch (error) {
    console.error("[Storage] Failed to remove favorite:", error);
  }
}

export async function toggleFavorite(poi: CachedPOI): Promise<boolean> {
  const favorites = await getFavorites();
  const exists = favorites.some((f) => f.id === poi.id);
  if (exists) {
    await removeFromFavorites(poi.id);
    return false;
  } else {
    await addToFavorite(poi);
    return true;
  }
}

export async function isFavorite(poiId: string): Promise<boolean> {
  try {
    const favorites = await getFavorites();
    return favorites.some((f) => f.id === poiId);
  } catch {
    return false;
  }
}

export async function saveWeather(weather: CachedWeather): Promise<void> {
  try {
    await kvStore.setJSON(STORAGE_KEYS.WEATHER, weather);
    await kvStore.set(STORAGE_KEYS.WEATHER_TIMESTAMP, Date.now().toString());
  } catch (error) {
    console.error("[Storage] Failed to save weather:", error);
  }
}

export async function getWeather(): Promise<StorageResult<CachedWeather>> {
  try {
    const [weatherData, timestampData] = await Promise.all([
      kvStore.getJSON<CachedWeather>(STORAGE_KEYS.WEATHER),
      kvStore.get(STORAGE_KEYS.WEATHER_TIMESTAMP),
    ]);

    const timestamp = timestampData ? parseInt(timestampData, 10) : 0;
    const isExpired = timestamp
      ? Date.now() - timestamp > CACHE_DURATION.WEATHER
      : false;

    return {
      data: weatherData,
      isCached: !!weatherData,
      timestamp,
      isExpired: !!isExpired,
    };
  } catch {
    return { data: null, isCached: false, isExpired: false };
  }
}

export async function clearAllData(): Promise<void> {
  try {
    await kvStore.clearAll();
  } catch (error) {
    console.error("[Storage] Failed to clear all data:", error);
  }
}
