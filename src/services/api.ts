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
      // In production, this would call actual BMKG API
      // For now, return simulated data
      const simulatedData: WeatherData = {
        location,
        temperature: 28 + Math.floor(Math.random() * 5),
        humidity: 75 + Math.floor(Math.random() * 15),
        description: ['Cerah', 'Berawan', 'Hujan Ringan'][Math.floor(Math.random() * 3)],
        icon: ['☀️', '⛅', '🌧️'][Math.floor(Math.random() * 3)],
        windSpeed: 10 + Math.floor(Math.random() * 15),
        forecast: Array.from({ length: 7 }, (_, i) => ({
          date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toLocaleDateString('de-DE'),
          tempMin: 24 + Math.floor(Math.random() * 3),
          tempMax: 30 + Math.floor(Math.random() * 4),
          description: ['Cerah', 'Berawan', 'Hujan'][Math.floor(Math.random() * 3)],
          icon: ['☀️', '⛅', '🌧️'][Math.floor(Math.random() * 3)],
          precipitation: Math.floor(Math.random() * 30),
        })),
      };

      cache.set(cacheKey, simulatedData, 30); // Cache for 30 minutes
      return simulatedData;
    } catch (error) {
      console.error('Weather API error:', error);
      throw new Error('Wetterdaten konnten nicht geladen werden');
    }
  },

  async getWeatherAlerts(location: string): Promise<string[]> {
    // Simulated weather alerts
    const alerts: string[] = [];
    
    if (Math.random() > 0.7) {
      alerts.push('⚠️ Starkregen-Warnung für die nächsten 6 Stunden');
    }
    
    if (Math.random() > 0.8) {
      alerts.push('🌊 Flutwelle-Warnung für Küstengebiete');
    }
    
    return alerts;
  },
};

// Volcano API Service
export const VolcanoService = {
  async getVolcanoAlerts(): Promise<VolcanoAlert[]> {
    const cacheKey = 'volcano_alerts';
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      // Simulated volcano data based on real Indonesian volcanoes
      const volcanoes: VolcanoAlert[] = [
        {
          id: '1',
          name: 'Gunung Agung',
          level: 'watch',
          levelColor: '#F59E0B',
          description: 'Erhöhte seismische Aktivität. Status: Waspada (Watch).',
          lastUpdate: new Date().toISOString(),
          recommendations: [
            'Nicht innerhalb von 4 km vom Gipfel entfernen',
            'Evakuierungs Routen kennen',
            'Auf offizielle Anweisungen achten',
          ],
        },
        {
          id: '2',
          name: 'Gunung Batur',
          level: 'normal',
          levelColor: '#90BE6D',
          description: 'Normale Aktivität. Status: Normal.',
          lastUpdate: new Date().toISOString(),
          recommendations: [
            'Sicher zum Wandern',
            'Empfohlene Routen einhalten',
          ],
        },
        {
          id: '3',
          name: 'Gunung Rinjani',
          level: 'normal',
          levelColor: '#90BE6D',
          description: 'Normale Aktivität. Status: Normal.',
          lastUpdate: new Date().toISOString(),
          recommendations: [
            'Wanderungen möglich',
            'Wetter prüfen vor Aufstieg',
          ],
        },
      ];

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
      // Simulated exchange rates (in production, use ExchangeRate-API)
      const rates: CurrencyRates = {
        base: baseCurrency,
        date: new Date().toISOString(),
        rates: {
          IDR: 1,
          EUR: 0.000057, // 1 IDR = 0.000057 EUR
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
      // Simulated ferry data
      const ferries = [
        {
          id: '1',
          name: 'Bali Express',
          type: 'Fast Boat',
          lat: -8.7183,
          lng: 115.1687,
          destination: 'Gili Trawangan',
          eta: '45 min',
          status: 'active',
        },
        {
          id: '2',
          name: 'Gili Getaway',
          type: 'Fast Boat',
          lat: -8.6477,
          lng: 115.1378,
          destination: 'Lombok',
          eta: '1h 30min',
          status: 'active',
        },
        {
          id: '3',
          name: 'Blue Water Express',
          type: 'Ferry',
          lat: -8.5069,
          lng: 115.2624,
          destination: 'Nusa Lembongan',
          eta: '30 min',
          status: 'active',
        },
      ];

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