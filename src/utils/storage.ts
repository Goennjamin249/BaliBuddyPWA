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
  SCANNER_RESULTS: "@balibuddy:scanner:results",
  SCANNER_ALLERGENS: "@balibuddy:scanner:allergens",
  DICTIONARY_FAVORITES: "@balibuddy:dictionary:favorites",
  LAWHUB_FAVORITES: "@balibuddy:lawhub:favorites",
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

export interface CachedRate {
  eur: number;
  idr: number;
  timestamp: number;
}

export interface ScannerMenuItem {
  id: string;
  name: string;
  description: string;
  price: string;
  allergens: string[];
  isSafe: boolean;
  riskLevel: "low" | "medium" | "high";
}

export interface ScannerResult {
  timestamp: number;
  items: ScannerMenuItem[];
  selectedAllergens: string[];
}

const RATE_KEY = "@balibuddy:rate";

export async function saveRate(rate: CachedRate): Promise<void> {
  try {
    await kvStore.setJSON(RATE_KEY, rate);
  } catch (error) {
    console.error("[Storage] Failed to save rate:", error);
  }
}

export async function getCachedRate(): Promise<CachedRate | null> {
  try {
    return await kvStore.getJSON<CachedRate>(RATE_KEY);
  } catch {
    return null;
  }
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

// === Scanner Storage ===
export async function saveScannerResult(result: ScannerResult): Promise<void> {
  try {
    await kvStore.setJSON(STORAGE_KEYS.SCANNER_RESULTS, result);
  } catch (error) {
    console.error("[Storage] Failed to save scanner result:", error);
  }
}

export async function getScannerResult(): Promise<ScannerResult | null> {
  try {
    return await kvStore.getJSON<ScannerResult>(STORAGE_KEYS.SCANNER_RESULTS);
  } catch {
    return null;
  }
}

export async function saveScannerAllergens(allergens: string[]): Promise<void> {
  try {
    await kvStore.set(STORAGE_KEYS.SCANNER_ALLERGENS, JSON.stringify(allergens));
  } catch (error) {
    console.error("[Storage] Failed to save scanner allergens:", error);
  }
}

export async function getScannerAllergens(): Promise<string[]> {
  try {
    const data = await kvStore.get(STORAGE_KEYS.SCANNER_ALLERGENS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function clearScannerResult(): Promise<void> {
  try {
    await kvStore.set(STORAGE_KEYS.SCANNER_RESULTS, null);
  } catch (error) {
    console.error("[Storage] Failed to clear scanner result:", error);
  }
}

// === Dictionary Favorites Storage ===
export async function saveDictionaryFavorites(ids: string[]): Promise<void> {
  try {
    await kvStore.setJSON(STORAGE_KEYS.DICTIONARY_FAVORITES, ids);
  } catch (error) {
    console.error("[Storage] Failed to save dictionary favorites:", error);
  }
}

export async function getDictionaryFavorites(): Promise<string[]> {
  try {
    const data = await kvStore.getJSON<string[]>(STORAGE_KEYS.DICTIONARY_FAVORITES);
    return data ?? [];
  } catch {
    return [];
  }
}

export async function toggleDictionaryFavorite(id: string): Promise<boolean> {
  try {
    const favorites = await getDictionaryFavorites();
    const index = favorites.indexOf(id);
    if (index >= 0) {
      favorites.splice(index, 1);
    } else {
      favorites.push(id);
    }
    await saveDictionaryFavorites(favorites);
    return index < 0;
  } catch (error) {
    console.error("[Storage] Failed to toggle dictionary favorite:", error);
    return false;
  }
}

export async function isDictionaryFavorite(id: string): Promise<boolean> {
  try {
    const favorites = await getDictionaryFavorites();
    return favorites.includes(id);
  } catch {
    return false;
  }
}

// === Law Hub Favorites Storage ===
export async function saveLawHubFavorites(ids: string[]): Promise<void> {
  try {
    await kvStore.setJSON(STORAGE_KEYS.LAWHUB_FAVORITES, ids);
  } catch (error) {
    console.error("[Storage] Failed to save law hub favorites:", error);
  }
}

export async function getLawHubFavorites(): Promise<string[]> {
  try {
    const data = await kvStore.getJSON<string[]>(STORAGE_KEYS.LAWHUB_FAVORITES);
    return data ?? [];
  } catch {
    return [];
  }
}

export async function toggleLawHubFavorite(id: string): Promise<boolean> {
  try {
    const favorites = await getLawHubFavorites();
    const index = favorites.indexOf(id);
    if (index >= 0) {
      favorites.splice(index, 1);
    } else {
      favorites.push(id);
    }
    await saveLawHubFavorites(favorites);
    return index < 0;
  } catch (error) {
    console.error("[Storage] Failed to toggle law hub favorite:", error);
    return false;
  }
}

export async function isLawHubFavorite(id: string): Promise<boolean> {
  try {
    const favorites = await getLawHubFavorites();
    return favorites.includes(id);
  } catch {
    return false;
  }
}

export async function clearAllData(): Promise<void> {
  try {
    await kvStore.clearAll();
  } catch (error) {
    console.error("[Storage] Failed to clear all data:", error);
  }
}
