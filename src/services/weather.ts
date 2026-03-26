import { useState, useEffect, useCallback } from 'react';
import { networkService, useNetworkStatus } from './network';

// Types for weather data
export interface WeatherData {
  location: string;
  temperature: number;
  humidity: number;
  description: string;
  icon: string;
  windSpeed: number;
  windDirection: string;
  pressure: number;
  visibility: number;
  uvIndex: number;
  feelsLike: number;
  dewPoint: number;
  lastUpdated: string;
}

export interface WeatherForecast {
  date: string;
  tempMin: number;
  tempMax: number;
  description: string;
  icon: string;
  precipitation: number;
  humidity: number;
  windSpeed: number;
}

export interface VolcanoAlert {
  id: string;
  name: string;
  level: 'normal' | 'watch' | 'warning' | 'eruption';
  levelColor: string;
  description: string;
  lastUpdate: string;
  recommendations: string[];
  location: {
    latitude: number;
    longitude: number;
  };
}

export interface EarthquakeData {
  id: string;
  magnitude: number;
  depth: number;
  location: string;
  time: string;
  latitude: number;
  longitude: number;
  intensity?: string;
}

// Cache keys
const WEATHER_CACHE_KEY = 'balibuddy_weather_cache';
const VOLCANO_CACHE_KEY = 'balibuddy_volcano_cache';
const EARTHQUAKE_CACHE_KEY = 'balibuddy_earthquake_cache';

// Cache durations
const WEATHER_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
const VOLCANO_CACHE_DURATION = 15 * 60 * 1000; // 15 minutes
const EARTHQUAKE_CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

class WeatherService {
  // BMKG API endpoints (Indonesian Meteorological Agency)
  private bmkgBaseUrl = 'https://api.bmkg.go.id';
  
  // MAGMA API endpoints (Indonesian Volcanology)
  private magmaBaseUrl = 'https://magma.esdm.go.id';

  // Get current weather for a location
  async getWeather(latitude: number, longitude: number): Promise<WeatherData> {
    const isOnline = networkService.isOnline();
    
    // Try cache first
    const cached = this.getCachedWeather();
    if (cached && !isOnline) {
      return cached;
    }

    if (isOnline) {
      try {
        // Call actual BMKG API
        const apiUrl = process.env.EXPO_PUBLIC_API_KEY_BMKG || 'https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=31.71.01.1001';
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
          throw new Error('BMKG API request failed');
        }
        
        const data = await response.json();
        
        // Parse BMKG response
        const weather = this.parseBMKGWeather(data, latitude, longitude);
        
        // Cache the result
        this.cacheWeather(weather);
        
        return weather;
      } catch (error) {
        console.error('Failed to fetch weather from BMKG:', error);
        
        // Fall back to simulation
        const weather = this.simulateBaliWeather(latitude, longitude);
        this.cacheWeather(weather);
        
        return weather;
      }
    }

    // Offline and no cache
    if (cached) {
      return cached;
    }
    
    throw new Error('No weather data available offline');
  }

  // Parse BMKG API response
  private parseBMKGWeather(data: any, lat: number, lon: number): WeatherData {
    const now = new Date();
    
    try {
      // Extract location info
      const location = data.lokasi || {};
      const locationName = location.desa ? 
        `${location.desa}, ${location.kecamatan || ''}, ${location.kotkab || ''}` : 
        'Bali, Indonesia';
      
      // Extract weather data from first forecast
      const forecastData = data.data?.[0]?.cuaca?.[0]?.[0] || {};
      
      return {
        location: locationName,
        temperature: forecastData.t || 28,
        humidity: forecastData.hu || 75,
        description: forecastData.weather_desc || 'Cerah',
        icon: this.getWeatherIcon(forecastData.weather_desc || 'Cerah'),
        windSpeed: forecastData.ws || 10,
        windDirection: forecastData.wd || 'E',
        pressure: 1013,
        visibility: forecastData.vs_text ? parseInt(forecastData.vs_text) : 10,
        uvIndex: 8,
        feelsLike: forecastData.t ? forecastData.t + 2 : 30,
        dewPoint: forecastData.t ? forecastData.t - 5 : 23,
        lastUpdated: now.toISOString(),
      };
    } catch (error) {
      console.error('Error parsing BMKG data:', error);
      return this.simulateBaliWeather(lat, lon);
    }
  }

  // Get weather icon based on description
  private getWeatherIcon(description: string): string {
    const desc = description.toLowerCase();
    if (desc.includes('cerah') || desc.includes('clear')) return '☀️';
    if (desc.includes('berawan') || desc.includes('cloud')) return '⛅';
    if (desc.includes('hujan ringan') || desc.includes('light rain')) return '🌧️';
    if (desc.includes('hujan lebat') || desc.includes('heavy rain')) return '⛈️';
    if (desc.includes('hujan') || desc.includes('rain')) return '🌧️';
    return '⛅';
  }

  // Get weather forecast
  async getForecast(latitude: number, longitude: number, days: number = 7): Promise<WeatherForecast[]> {
    const isOnline = networkService.isOnline();
    
    if (isOnline) {
      try {
        // Simulate forecast data
        const forecast = this.simulateForecast(latitude, longitude, days);
        return forecast;
      } catch (error) {
        console.error('Failed to fetch forecast:', error);
        return [];
      }
    }

    return [];
  }

  // Get volcano alerts
  async getVolcanoAlerts(): Promise<VolcanoAlert[]> {
    const isOnline = networkService.isOnline();
    
    // Try cache first
    const cached = this.getCachedVolcanoAlerts();
    if (cached && !isOnline) {
      return cached;
    }

    if (isOnline) {
      try {
        // Simulate MAGMA API response
        const alerts = this.simulateVolcanoAlerts();
        
        // Cache the result
        this.cacheVolcanoAlerts(alerts);
        
        return alerts;
      } catch (error) {
        console.error('Failed to fetch volcano alerts:', error);
        
        if (cached) {
          return cached;
        }
        
        throw error;
      }
    }

    if (cached) {
      return cached;
    }
    
    return [];
  }

  // Get earthquake data
  async getEarthquakes(): Promise<EarthquakeData[]> {
    const isOnline = networkService.isOnline();
    
    // Try cache first
    const cached = this.getCachedEarthquakes();
    if (cached && !isOnline) {
      return cached;
    }

    if (isOnline) {
      try {
        // Simulate BMKG earthquake data
        const earthquakes = this.simulateEarthquakes();
        
        // Cache the result
        this.cacheEarthquakes(earthquakes);
        
        return earthquakes;
      } catch (error) {
        console.error('Failed to fetch earthquakes:', error);
        
        if (cached) {
          return cached;
        }
        
        throw error;
      }
    }

    if (cached) {
      return cached;
    }
    
    return [];
  }

  // Simulate realistic Bali weather
  private simulateBaliWeather(lat: number, lon: number): WeatherData {
    const now = new Date();
    const hour = now.getHours();
    
    // Bali tropical climate simulation
    let temp = 28 + Math.random() * 6; // 28-34°C
    let humidity = 70 + Math.random() * 20; // 70-90%
    
    // Adjust for time of day
    if (hour < 6 || hour > 18) {
      temp -= 3; // Cooler at night
    }
    
    // Weather conditions
    const conditions = [
      { description: 'Cerah', icon: '☀️' },
      { description: 'Berawan', icon: '⛅' },
      { description: 'Hujan Ringan', icon: '🌧️' },
      { description: 'Hujan Lebat', icon: '⛈️' },
    ];
    
    const condition = conditions[Math.floor(Math.random() * conditions.length)];
    
    return {
      location: 'Bali, Indonesia',
      temperature: Math.round(temp),
      humidity: Math.round(humidity),
      description: condition.description,
      icon: condition.icon,
      windSpeed: Math.round(5 + Math.random() * 15),
      windDirection: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.floor(Math.random() * 8)],
      pressure: Math.round(1010 + Math.random() * 10),
      visibility: Math.round(8 + Math.random() * 2),
      uvIndex: Math.round(8 + Math.random() * 4),
      feelsLike: Math.round(temp + (humidity > 80 ? 3 : 0)),
      dewPoint: Math.round(temp - (100 - humidity) / 5),
      lastUpdated: now.toISOString(),
    };
  }

  // Simulate weather forecast
  private simulateForecast(lat: number, lon: number, days: number): WeatherForecast[] {
    const forecast: WeatherForecast[] = [];
    const now = new Date();
    
    for (let i = 0; i < days; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() + i);
      
      const conditions = [
        { description: 'Cerah', icon: '☀️' },
        { description: 'Berawan', icon: '⛅' },
        { description: 'Hujan Ringan', icon: '🌧️' },
      ];
      
      const condition = conditions[Math.floor(Math.random() * conditions.length)];
      
      forecast.push({
        date: date.toISOString().split('T')[0],
        tempMin: Math.round(24 + Math.random() * 3),
        tempMax: Math.round(30 + Math.random() * 4),
        description: condition.description,
        icon: condition.icon,
        precipitation: Math.round(Math.random() * 30),
        humidity: Math.round(70 + Math.random() * 20),
        windSpeed: Math.round(5 + Math.random() * 15),
      });
    }
    
    return forecast;
  }

  // Simulate volcano alerts
  private simulateVolcanoAlerts(): VolcanoAlert[] {
    return [
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
        location: { latitude: -8.3405, longitude: 115.5080 },
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
        location: { latitude: -8.2421, longitude: 115.3760 },
      },
    ];
  }

  // Simulate earthquake data
  private simulateEarthquakes(): EarthquakeData[] {
    return [
      {
        id: '1',
        magnitude: 4.2,
        depth: 10,
        location: 'Bali Sea',
        time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        latitude: -8.3405,
        longitude: 115.0920,
        intensity: 'III',
      },
      {
        id: '2',
        magnitude: 3.8,
        depth: 15,
        location: 'Lombok Strait',
        time: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        latitude: -8.5611,
        longitude: 115.5545,
        intensity: 'II',
      },
    ];
  }

  // Cache methods
  private cacheWeather(data: WeatherData): void {
    try {
      localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify({
        data,
        timestamp: Date.now(),
      }));
    } catch (error) {
      console.warn('Failed to cache weather:', error);
    }
  }

  private getCachedWeather(): WeatherData | null {
    try {
      const cached = localStorage.getItem(WEATHER_CACHE_KEY);
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);
      
      if (Date.now() - timestamp > WEATHER_CACHE_DURATION) {
        localStorage.removeItem(WEATHER_CACHE_KEY);
        return null;
      }

      return data;
    } catch (error) {
      console.warn('Failed to load cached weather:', error);
      return null;
    }
  }

  private cacheVolcanoAlerts(alerts: VolcanoAlert[]): void {
    try {
      localStorage.setItem(VOLCANO_CACHE_KEY, JSON.stringify({
        alerts,
        timestamp: Date.now(),
      }));
    } catch (error) {
      console.warn('Failed to cache volcano alerts:', error);
    }
  }

  private getCachedVolcanoAlerts(): VolcanoAlert[] | null {
    try {
      const cached = localStorage.getItem(VOLCANO_CACHE_KEY);
      if (!cached) return null;

      const { alerts, timestamp } = JSON.parse(cached);
      
      if (Date.now() - timestamp > VOLCANO_CACHE_DURATION) {
        localStorage.removeItem(VOLCANO_CACHE_KEY);
        return null;
      }

      return alerts;
    } catch (error) {
      console.warn('Failed to load cached volcano alerts:', error);
      return null;
    }
  }

  private cacheEarthquakes(earthquakes: EarthquakeData[]): void {
    try {
      localStorage.setItem(EARTHQUAKE_CACHE_KEY, JSON.stringify({
        earthquakes,
        timestamp: Date.now(),
      }));
    } catch (error) {
      console.warn('Failed to cache earthquakes:', error);
    }
  }

  private getCachedEarthquakes(): EarthquakeData[] | null {
    try {
      const cached = localStorage.getItem(EARTHQUAKE_CACHE_KEY);
      if (!cached) return null;

      const { earthquakes, timestamp } = JSON.parse(cached);
      
      if (Date.now() - timestamp > EARTHQUAKE_CACHE_DURATION) {
        localStorage.removeItem(EARTHQUAKE_CACHE_KEY);
        return null;
      }

      return earthquakes;
    } catch (error) {
      console.warn('Failed to load cached earthquakes:', error);
      return null;
    }
  }

  // Clear all caches
  clearCache(): void {
    localStorage.removeItem(WEATHER_CACHE_KEY);
    localStorage.removeItem(VOLCANO_CACHE_KEY);
    localStorage.removeItem(EARTHQUAKE_CACHE_KEY);
  }
}

// Singleton instance
export const weatherService = new WeatherService();

// React hook for weather data
export function useWeather() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<WeatherForecast[]>([]);
  const [volcanoAlerts, setVolcanoAlerts] = useState<VolcanoAlert[]>([]);
  const [earthquakes, setEarthquakes] = useState<EarthquakeData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isOnline } = useNetworkStatus();

  const fetchWeather = useCallback(async (lat: number, lon: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const [weatherData, forecastData, volcanoData, earthquakeData] = await Promise.all([
        weatherService.getWeather(lat, lon),
        weatherService.getForecast(lat, lon),
        weatherService.getVolcanoAlerts(),
        weatherService.getEarthquakes(),
      ]);

      setWeather(weatherData);
      setForecast(forecastData);
      setVolcanoAlerts(volcanoData);
      setEarthquakes(earthquakeData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch weather data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearCache = useCallback(() => {
    weatherService.clearCache();
    setWeather(null);
    setForecast([]);
    setVolcanoAlerts([]);
    setEarthquakes([]);
  }, []);

  return {
    weather,
    forecast,
    volcanoAlerts,
    earthquakes,
    isLoading,
    error,
    isOnline,
    fetchWeather,
    clearCache,
  };
}

export default weatherService;
