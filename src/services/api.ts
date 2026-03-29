import { Platform } from 'react-native';

// API Configuration - All external API calls now go through our serverless functions
const API_CONFIG = {
  // Local API endpoints (secured via Vercel Serverless Functions)
  WEATHER_ENDPOINT: '/api/weather',
  VOLCANO_ENDPOINT: '/api/volcano',
  EXCHANGE_RATE_ENDPOINT: '/api/exchange-rate',
  FERRY_ENDPOINT: '/api/ferry',
  OVERPASS_ENDPOINT: '/api/overpass',
  TRIPADVISOR_ENDPOINT: '/api/tripadvisor',
};

// Types
export interface WeatherData {
  location: string;
  temperature: number;
  humidity: number;
  description: string;
  icon: string;
  windSpeed: number;
  forecast: WeatherForecast[];
}

export interface WeatherForecast {
  date: string;
  tempMin: number;
  tempMax: number;
  description: string;
  icon: string;
  precipitation: number;
}

export interface VolcanoAlert {
  id: string;
  name: string;
  level: 'normal' | 'watch' | 'warning' | 'eruption';
  levelColor: string;
  description: string;
  lastUpdate: string;
  recommendations: string[];
}

export interface CurrencyRates {
  base: string;
  date: string;
  rates: Record<string, number>;
}

// Cache management
class APICache {
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();

  set(key: string, data: any, ttlMinutes: number = 30): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMinutes * 60 * 1000,
    });
  }

  get(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  clear(): void {
    this.cache.clear();
  }
}

const cache = new APICache();

// Helper function for API calls with retry and timeout
async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retries: number = 3,
  timeout: number = 10000
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      if (i === retries - 1) {
        clearTimeout(timeoutId);
        throw error;
      }
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  
  throw new Error('Max retries reached');
}

// Weather API Service
export const WeatherService = {
  async getWeather(location: string = 'Denpasar'): Promise<WeatherData> {
    const cacheKey = `weather_${location}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetchWithRetry(`${API_CONFIG.WEATHER_ENDPOINT}?location=${encodeURIComponent(location)}`);
      
      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Transform API response to match our interface
      const weatherData: WeatherData = {
        location: data.location || location,
        temperature: data.temperature || data.current?.temperature_2m || 28,
        humidity: data.humidity || data.current?.relative_humidity_2m || 75,
        description: data.description || data.current?.weather_code?.toString() || 'Klar',
        icon: data.icon || '☀️',
        windSpeed: data.windSpeed || data.current?.wind_speed_10m || 10,
        forecast: data.forecast || data.daily?.map((day: any, i: number) => ({
          date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toLocaleDateString('de-DE'),
          tempMin: day.temperature_2m_min || 24,
          tempMax: day.temperature_2m_max || 30,
          description: day.weather_code?.toString() || 'Klar',
          icon: '☀️',
          precipitation: day.precipitation || 0,
        })) || [],
      };

      cache.set(cacheKey, weatherData, 30); // Cache for 30 minutes
      return weatherData;
    } catch (error) {
      console.error('Weather API error:', error);
      throw new Error('Wetterdaten konnten nicht geladen werden');
    }
  },

  async getWeatherAlerts(location: string): Promise<string[]> {
    try {
      const response = await fetchWithRetry(`${API_CONFIG.WEATHER_ENDPOINT}?location=${encodeURIComponent(location)}&alerts=true`);
      
      if (!response.ok) {
        return [];
      }
      
      const data = await response.json();
      return data.alerts || [];
    } catch (error) {
      console.error('Weather alerts error:', error);
      return [];
    }
  },
};

// Volcano API Service
export const VolcanoService = {
  async getVolcanoAlerts(): Promise<VolcanoAlert[]> {
    const cacheKey = 'volcano_alerts';
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetchWithRetry(API_CONFIG.VOLCANO_ENDPOINT);
      
      if (!response.ok) {
        throw new Error(`Volcano API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Transform API response to match our interface
      const volcanoes: VolcanoAlert[] = data.volcanoes?.map((volcano: any) => ({
        id: volcano.id,
        name: volcano.name,
        level: volcano.status === 'Normal' ? 'normal' : volcano.status === 'Waspada' ? 'watch' : volcano.status === 'Siaga' ? 'warning' : 'eruption',
        levelColor: volcano.alertLevel === 1 ? '#90BE6D' : volcano.alertLevel === 2 ? '#F59E0B' : '#FF6B6B',
        description: volcano.description || `${volcano.name} - Status: ${volcano.status}`,
        lastUpdate: volcano.lastEruption || new Date().toISOString(),
        recommendations: volcano.recommendations || [],
      })) || [];

      cache.set(cacheKey, volcanoes, 15); // Cache for 15 minutes
      return volcanoes;
    } catch (error) {
      console.error('Volcano API error:', error);
      throw new Error('Vulkandaten konnten nicht geladen werden');
    }
  },

  async getVolcanoById(id: string): Promise<VolcanoAlert | null> {
    const volcanoes = await this.getVolcanoAlerts();
    return volcanoes.find(v => v.id === id) || null;
  },

  getLevelDescription(level: string): string {
    const descriptions: Record<string, string> = {
      normal: 'Normal - Keine besonderen Vorsichtsmaßnahmen',
      watch: 'Waspada (Watch) - Erhöhte Aufmerksamkeit',
      warning: 'Siaga (Warning) - Bereitschaft zur Evakuierung',
      eruption: 'Awas (Eruption) - Sofortige Evakuierung',
    };
    return descriptions[level] || 'Unbekannt';
  },
};

// Currency API Service
export const CurrencyService = {
  async getRates(baseCurrency: string = 'IDR'): Promise<CurrencyRates> {
    const cacheKey = `currency_${baseCurrency}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetchWithRetry(`${API_CONFIG.EXCHANGE_RATE_ENDPOINT}?from=${baseCurrency}`);
      
      if (!response.ok) {
        throw new Error(`Currency API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Transform API response to match our interface
      const rates: CurrencyRates = {
        base: data.base || baseCurrency,
        date: data.date || new Date().toISOString(),
        rates: data.rates || {
          IDR: 1,
          EUR: 0.000057,
          USD: 0.000062,
          GBP: 0.000050,
          AUD: 0.000095,
          SGD: 0.000083,
          JPY: 0.0091,
          CHF: 0.000056,
        },
      };

      cache.set(cacheKey, rates, 60); // Cache for 60 minutes
      return rates;
    } catch (error) {
      console.error('Currency API error:', error);
      throw new Error('Wechselkurse konnten nicht geladen werden');
    }
  },

  convert(amount: number, from: string, to: string, rates: CurrencyRates): number {
    const fromRate = rates.rates[from] || 1;
    const toRate = rates.rates[to] || 1;
    return (amount / fromRate) * toRate;
  },
};

// AIS (Vessel Tracking) API Service
export const AISservice = {
  async getFerryLocations(): Promise<any[]> {
    const cacheKey = 'ferry_locations';
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetchWithRetry(API_CONFIG.FERRY_ENDPOINT);
      
      if (!response.ok) {
        throw new Error(`AIS API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Transform API response to match our interface
      const ferries = data.vessels?.map((vessel: any) => ({
        id: vessel.mmsi || vessel.id,
        name: vessel.name,
        type: vessel.type || 'Ferry',
        lat: vessel.latitude || vessel.lat,
        lng: vessel.longitude || vessel.lng,
        destination: vessel.destination || 'Unknown',
        eta: vessel.eta || 'Unknown',
        status: vessel.status || 'active',
      })) || [];

      cache.set(cacheKey, ferries, 5); // Cache for 5 minutes (real-time data)
      return ferries;
    } catch (error) {
      console.error('AIS API error:', error);
      throw new Error('Fährdaten konnten nicht geladen werden');
    }
  },
};

// BMKG API Service (Indonesian Meteorological Agency)
export const BMKGService = {
  async getEarthquakeData(): Promise<any[]> {
    const cacheKey = 'earthquake_data';
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      // Simulated earthquake data
      const earthquakes = [
        {
          id: '1',
          magnitude: 4.2,
          depth: 10,
          location: 'Bali Sea',
          time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          lat: -8.3405,
          lng: 115.0920,
        },
        {
          id: '2',
          magnitude: 3.8,
          depth: 15,
          location: 'Lombok Strait',
          time: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          lat: -8.5611,
          lng: 115.5545,
        },
      ];

      cache.set(cacheKey, earthquakes, 10); // Cache for 10 minutes
      return earthquakes;
    } catch (error) {
      console.error('BMKG API error:', error);
      throw new Error('Erdbeben-Daten konnten nicht geladen werden');
    }
  },

  async getTsunamiWarnings(): Promise<any[]> {
    // Check for active tsunami warnings
    return []; // No active warnings in simulation
  },
};

// Export all services
export default {
  Weather: WeatherService,
  Volcano: VolcanoService,
  Currency: CurrencyService,
  AIS: AISservice,
  BMKG: BMKGService,
};