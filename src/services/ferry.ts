import { useState, useEffect, useCallback } from 'react';
import { networkService, useNetworkStatus } from './network';

// Types for ferry data
export interface Ferry {
  id: string;
  name: string;
  type: 'fast_boat' | 'ferry' | 'speedboat';
  operator: string;
  departure: {
    port: string;
    time: string;
    date: string;
  };
  arrival: {
    port: string;
    time: string;
    date: string;
  };
  duration: number; // in minutes
  price: {
    economy: number;
    business?: number;
    vip?: number;
  };
  status: 'scheduled' | 'boarding' | 'departed' | 'arrived' | 'delayed' | 'cancelled';
  capacity: number;
  availableSeats: number;
  amenities: string[];
  contact: {
    phone?: string;
    website?: string;
  };
}

export interface FerryRoute {
  id: string;
  from: string;
  to: string;
  distance: number; // in nautical miles
  duration: number; // in minutes
  operators: string[];
  frequency: string; // e.g., "Daily", "3x per week"
}

export interface FerrySearchParams {
  from?: string;
  to?: string;
  date?: string;
  passengers?: number;
}

// Cache for ferry data
const FERRY_CACHE_KEY = 'balibuddy_ferry_cache';
const FERRY_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes (real-time data)

class FerryService {
  // AIS API endpoint (simulated)
  private aisApiUrl = 'https://api.aisstream.io/v0';
  
  // Popular Bali ferry routes
  private baliRoutes: FerryRoute[] = [
    {
      id: 'bali-gili',
      from: 'Bali (Padangbai)',
      to: 'Gili Trawangan',
      distance: 35,
      duration: 90,
      operators: ['Blue Water Express', 'Gili Getaway', 'Scoot Cruise'],
      frequency: 'Daily',
    },
    {
      id: 'bali-nusa',
      from: 'Bali (Sanur)',
      to: 'Nusa Lembongan',
      distance: 18,
      duration: 30,
      operators: ['Rocky Fast Cruise', 'D\'Camel Fast Ferry'],
      frequency: 'Multiple daily',
    },
    {
      id: 'bali-lombok',
      from: 'Bali (Padangbai)',
      to: 'Lombok (Bangsal)',
      distance: 50,
      duration: 120,
      operators: ['Bali Lombok Cruise', 'Eka Jaya'],
      frequency: 'Daily',
    },
  ];

  // Get ferry schedules
  async getFerrySchedules(params: FerrySearchParams = {}): Promise<Ferry[]> {
    const isOnline = networkService.isOnline();
    
    // Try cache first
    const cached = this.getCachedFerries();
    if (cached && !isOnline) {
      return this.filterFerries(cached, params);
    }

    if (isOnline) {
      try {
        // Simulate AIS API response
        const ferries = this.simulateFerryData(params);
        
        // Cache the result
        this.cacheFerries(ferries);
        
        return ferries;
      } catch (error) {
        console.error('Failed to fetch ferry schedules:', error);
        
        if (cached) {
          return this.filterFerries(cached, params);
        }
        
        throw error;
      }
    }

    if (cached) {
      return this.filterFerries(cached, params);
    }
    
    return [];
  }

  // Get ferry routes
  async getFerryRoutes(): Promise<FerryRoute[]> {
    return this.baliRoutes;
  }

  // Get specific ferry by ID
  async getFerryById(id: string): Promise<Ferry | null> {
    const ferries = await this.getFerrySchedules();
    return ferries.find(f => f.id === id) || null;
  }

  // Filter ferries based on search params
  private filterFerries(ferries: Ferry[], params: FerrySearchParams): Ferry[] {
    let filtered = [...ferries];

    if (params.from) {
      filtered = filtered.filter(f => 
        f.departure.port.toLowerCase().includes(params.from!.toLowerCase())
      );
    }

    if (params.to) {
      filtered = filtered.filter(f => 
        f.arrival.port.toLowerCase().includes(params.to!.toLowerCase())
      );
    }

    if (params.date) {
      filtered = filtered.filter(f => 
        f.departure.date === params.date
      );
    }

    return filtered;
  }

  // Simulate realistic ferry data
  private simulateFerryData(params: FerrySearchParams): Ferry[] {
    const now = new Date();
    const ferries: Ferry[] = [];

    // Generate schedules for each route
    this.baliRoutes.forEach((route, routeIndex) => {
      const numFerries = 3 + Math.floor(Math.random() * 3); // 3-5 ferries per route
      
      for (let i = 0; i < numFerries; i++) {
        const departureTime = new Date(now);
        departureTime.setHours(6 + i * 3 + Math.floor(Math.random() * 2)); // Spread throughout day
        
        const arrivalTime = new Date(departureTime);
        arrivalTime.setMinutes(arrivalTime.getMinutes() + route.duration);

        const statuses: Ferry['status'][] = ['scheduled', 'boarding', 'departed', 'arrived'];
        const status = i === 0 ? statuses[Math.floor(Math.random() * statuses.length)] : 'scheduled';

        ferries.push({
          id: `ferry_${routeIndex}_${i}`,
          name: `${route.operators[i % route.operators.length]} ${i + 1}`,
          type: i % 2 === 0 ? 'fast_boat' : 'ferry',
          operator: route.operators[i % route.operators.length],
          departure: {
            port: route.from,
            time: departureTime.toTimeString().slice(0, 5),
            date: departureTime.toISOString().split('T')[0],
          },
          arrival: {
            port: route.to,
            time: arrivalTime.toTimeString().slice(0, 5),
            date: arrivalTime.toISOString().split('T')[0],
          },
          duration: route.duration,
          price: {
            economy: 150000 + Math.floor(Math.random() * 200000),
            business: 250000 + Math.floor(Math.random() * 150000),
            vip: 400000 + Math.floor(Math.random() * 200000),
          },
          status,
          capacity: 50 + Math.floor(Math.random() * 100),
          availableSeats: Math.floor(Math.random() * 50),
          amenities: ['AC', 'Toilet', 'Life Jacket'].concat(
            Math.random() > 0.5 ? ['WiFi'] : [],
            Math.random() > 0.7 ? ['Snack Bar'] : []
          ),
          contact: {
            phone: '+62 361 ' + Math.floor(Math.random() * 9000000 + 1000000),
            website: Math.random() > 0.5 ? 'https://example-ferry.com' : undefined,
          },
        });
      }
    });

    return ferries;
  }

  // Cache methods
  private cacheFerries(ferries: Ferry[]): void {
    try {
      localStorage.setItem(FERRY_CACHE_KEY, JSON.stringify({
        ferries,
        timestamp: Date.now(),
      }));
    } catch (error) {
      console.warn('Failed to cache ferries:', error);
    }
  }

  private getCachedFerries(): Ferry[] | null {
    try {
      const cached = localStorage.getItem(FERRY_CACHE_KEY);
      if (!cached) return null;

      const { ferries, timestamp } = JSON.parse(cached);
      
      if (Date.now() - timestamp > FERRY_CACHE_DURATION) {
        localStorage.removeItem(FERRY_CACHE_KEY);
        return null;
      }

      return ferries;
    } catch (error) {
      console.warn('Failed to load cached ferries:', error);
      return null;
    }
  }

  // Clear cache
  clearCache(): void {
    localStorage.removeItem(FERRY_CACHE_KEY);
  }
}

// Singleton instance
export const ferryService = new FerryService();

// React hook for ferry data
export function useFerry() {
  const [ferries, setFerries] = useState<Ferry[]>([]);
  const [routes, setRoutes] = useState<FerryRoute[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isOnline } = useNetworkStatus();

  const searchFerries = useCallback(async (params: FerrySearchParams = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      const [ferryData, routeData] = await Promise.all([
        ferryService.getFerrySchedules(params),
        ferryService.getFerryRoutes(),
      ]);

      setFerries(ferryData);
      setRoutes(routeData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch ferry data');
      setFerries([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getFerryById = useCallback(async (id: string) => {
    try {
      return await ferryService.getFerryById(id);
    } catch (err) {
      console.error('Failed to get ferry:', err);
      return null;
    }
  }, []);

  const clearCache = useCallback(() => {
    ferryService.clearCache();
    setFerries([]);
    setRoutes([]);
  }, []);

  return {
    ferries,
    routes,
    isLoading,
    error,
    isOnline,
    searchFerries,
    getFerryById,
    clearCache,
  };
}

export default ferryService;
