import { useState, useEffect, useCallback } from 'react';
import { networkService, useNetworkStatus } from './network';

// Types for POI data
export interface POI {
  id: string;
  name: string;
  type: 'restaurant' | 'warung' | 'hotel' | 'atm' | 'pharmacy' | 'hospital';
  latitude: number;
  longitude: number;
  distance?: number; // in meters
  rating?: number;
  address?: string;
  openingHours?: string;
  phone?: string;
}

export interface POISearchParams {
  latitude: number;
  longitude: number;
  radius?: number; // in meters, default 300
  types?: string[];
}

// Cache for POI data
const POI_CACHE_KEY = 'balibuddy_poi_cache';
const POI_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

class POIService {
  private overpassUrl = 'https://overpass-api.de/api/interpreter';

  // Build Overpass QL query for POIs around a location
  private buildOverpassQuery(lat: number, lon: number, radius: number): string {
    return `
      [out:json][timeout:25];
      (
        // Restaurants and eating places
        node["amenity"="restaurant"](around:${radius},${lat},${lon});
        way["amenity"="restaurant"](around:${radius},${lat},${lon});
        node["amenity"="fast_food"](around:${radius},${lat},${lon});
        way["amenity"="fast_food"](around:${radius},${lat},${lon});
        
        // Warungs (local food stalls)
        node["amenity"="cafe"](around:${radius},${lat},${lon});
        way["amenity"="cafe"](around:${radius},${lat},${lon});
        node["shop"="food"](around:${radius},${lat},${lon});
        way["shop"="food"](around:${radius},${lat},${lon});
        
        // Hotels and accommodation
        node["tourism"="hotel"](around:${radius},${lat},${lon});
        way["tourism"="hotel"](around:${radius},${lat},${lon});
        node["tourism"="guest_house"](around:${radius},${lat},${lon});
        way["tourism"="guest_house"](around:${radius},${lat},${lon});
        
        // ATMs
        node["amenity"="atm"](around:${radius},${lat},${lon});
        
        // Pharmacies
        node["amenity"="pharmacy"](around:${radius},${lat},${lon});
        way["amenity"="pharmacy"](around:${radius},${lat},${lon});
        
        // Hospitals
        node["amenity"="hospital"](around:${radius},${lat},${lon});
        way["amenity"="hospital"](around:${radius},${lat},${lon});
        node["amenity"="clinic"](around:${radius},${lat},${lon});
        way["amenity"="clinic"](around:${radius},${lat},${lon});
      );
      out body;
      >;
      out skel qt;
    `;
  }

  // Parse Overpass response to POI format
  private parseOverpassResponse(data: any): POI[] {
    const pois: POI[] = [];
    const elements = data.elements || [];

    for (const element of elements) {
      if (element.type !== 'node' && element.type !== 'way') continue;
      
      const tags = element.tags || {};
      let type: POI['type'] = 'restaurant';
      let name = tags.name || 'Unnamed';

      // Determine POI type
      if (tags.amenity === 'restaurant' || tags.amenity === 'fast_food') {
        type = 'restaurant';
        name = tags.name || tags.cuisine || 'Restaurant';
      } else if (tags.amenity === 'cafe' || tags.shop === 'food') {
        type = 'warung';
        name = tags.name || 'Warung';
      } else if (tags.tourism === 'hotel' || tags.tourism === 'guest_house') {
        type = 'hotel';
        name = tags.name || 'Accommodation';
      } else if (tags.amenity === 'atm') {
        type = 'atm';
        name = tags.brand || tags.operator || 'ATM';
      } else if (tags.amenity === 'pharmacy') {
        type = 'pharmacy';
        name = tags.name || 'Pharmacy';
      } else if (tags.amenity === 'hospital' || tags.amenity === 'clinic') {
        type = 'hospital';
        name = tags.name || 'Medical Facility';
      }

      // Get coordinates
      let lat = element.lat;
      let lon = element.lon;
      
      // For ways, use center point
      if (element.type === 'way' && element.center) {
        lat = element.center.lat;
        lon = element.center.lon;
      }

      if (lat && lon) {
        pois.push({
          id: `osm_${element.id}`,
          name,
          type,
          latitude: lat,
          longitude: lon,
          address: tags['addr:street'] ? 
            `${tags['addr:street']} ${tags['addr:housenumber'] || ''}`.trim() : 
            undefined,
          openingHours: tags.opening_hours,
          phone: tags.phone,
        });
      }
    }

    return pois;
  }

  // Calculate distance between two coordinates (Haversine formula)
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  // Search for POIs near a location
  async searchNearby(params: POISearchParams): Promise<POI[]> {
    const { latitude, longitude, radius = 300, types } = params;
    const isOnline = networkService.isOnline();

    // Try to get cached data first
    const cached = this.getCachedPOIs();
    if (cached && cached.length > 0) {
      // Filter cached POIs by distance and type
      let filtered = cached.filter(poi => {
        const distance = this.calculateDistance(latitude, longitude, poi.latitude, poi.longitude);
        return distance <= radius;
      });

      if (types && types.length > 0) {
        filtered = filtered.filter(poi => types.includes(poi.type));
      }

      // Add distance to each POI
      filtered = filtered.map(poi => ({
        ...poi,
        distance: this.calculateDistance(latitude, longitude, poi.latitude, poi.longitude),
      }));

      // Sort by distance
      filtered.sort((a, b) => (a.distance || 0) - (b.distance || 0));

      if (!isOnline) {
        return filtered; // Return cached data if offline
      }
    }

    // If online, fetch fresh data
    if (isOnline) {
      try {
        const query = this.buildOverpassQuery(latitude, longitude, radius);
        const response = await fetch(this.overpassUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: `data=${encodeURIComponent(query)}`,
        });

        if (!response.ok) {
          throw new Error('Failed to fetch POIs');
        }

        const data = await response.json();
        let pois = this.parseOverpassResponse(data);

        // Add distance to each POI
        pois = pois.map(poi => ({
          ...poi,
          distance: this.calculateDistance(latitude, longitude, poi.latitude, poi.longitude),
        }));

        // Filter by type if specified
        if (types && types.length > 0) {
          pois = pois.filter(poi => types.includes(poi.type));
        }

        // Sort by distance
        pois.sort((a, b) => (a.distance || 0) - (b.distance || 0));

        // Cache the results
        this.cachePOIs(pois);

        return pois;
      } catch (error) {
        console.error('Error fetching POIs:', error);
        // Fall back to cached data
        return cached || [];
      }
    }

    // Offline and no cache
    return cached || [];
  }

  // Cache POIs to localStorage
  private cachePOIs(pois: POI[]): void {
    try {
      const cacheData = {
        pois,
        timestamp: Date.now(),
      };
      localStorage.setItem(POI_CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Failed to cache POIs:', error);
    }
  }

  // Get cached POIs from localStorage
  private getCachedPOIs(): POI[] | null {
    try {
      const cached = localStorage.getItem(POI_CACHE_KEY);
      if (!cached) return null;

      const { pois, timestamp } = JSON.parse(cached);
      
      // Check if cache is still valid
      if (Date.now() - timestamp > POI_CACHE_DURATION) {
        localStorage.removeItem(POI_CACHE_KEY);
        return null;
      }

      return pois;
    } catch (error) {
      console.warn('Failed to load cached POIs:', error);
      return null;
    }
  }

  // Clear POI cache
  clearCache(): void {
    localStorage.removeItem(POI_CACHE_KEY);
  }
}

// Singleton instance
export const poiService = new POIService();

// React hook for POI search
export function usePOISearch() {
  const [pois, setPois] = useState<POI[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isOnline } = useNetworkStatus();

  const searchNearby = useCallback(async (params: POISearchParams) => {
    setIsLoading(true);
    setError(null);

    try {
      const results = await poiService.searchNearby(params);
      setPois(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search POIs');
      setPois([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearCache = useCallback(() => {
    poiService.clearCache();
    setPois([]);
  }, []);

  return {
    pois,
    isLoading,
    error,
    isOnline,
    searchNearby,
    clearCache,
  };
}

export default poiService;
