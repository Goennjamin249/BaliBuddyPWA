/**
 * Centralized weather service
 * Routes all weather API calls through serverless functions to avoid API key exposure
 * Implements aggressive caching to minimize API requests
 */

import { getWeather, saveWeather, type CachedWeather } from "../utils/storage";
import {
  fromCachedWeather,
  toCachedWeather,
  DEFAULT_WEATHER as _DEFAULT_WEATHER,
  type WeatherData as _WeatherData,
} from "../utils/weatherMapper";

// Re-export for use in other modules
export { _DEFAULT_WEATHER as DEFAULT_WEATHER };
export type { _WeatherData as WeatherData };

// Serverless endpoint (no API key needed - key is server-side)
const WEATHER_API_URL = "/api/weather";

// Cache duration: 30 minutes (same as server-side Cache-Control)
const WEATHER_CACHE_DURATION_MS = 30 * 60 * 1000;

// In-memory cache to prevent duplicate requests
let inFlightRequest: Promise<_WeatherData> | null = null;

/**
 * Check if cached weather data is still valid (30 minutes)
 */
function isCacheValid(cached: CachedWeather | null): boolean {
  if (!cached) return false;
  const age = Date.now() - cached.timestamp;
  return age < WEATHER_CACHE_DURATION_MS;
}

/**
 * Fetch weather data through serverless function
 * Falls back to cached data or default if API is unavailable
 * Deduplicates concurrent requests
 */
export async function fetchWeather(
  _showLoading: boolean = true,
): Promise<_WeatherData> {
  // If there's already a request in flight, return that promise
  if (inFlightRequest) {
    return inFlightRequest;
  }

  // Check cache first
  const cached = await getWeather();
  if (cached.data && isCacheValid(cached.data)) {
    return fromCachedWeather(cached.data);
  }

  // Create new request with deduplication
  inFlightRequest = (async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(WEATHER_API_URL, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const data = await response.json();

      const weatherData: _WeatherData = {
        temperature: data.temperature ?? _DEFAULT_WEATHER.temperature,
        feelsLike: data.feelsLike ?? _DEFAULT_WEATHER.feelsLike,
        humidity: data.humidity ?? _DEFAULT_WEATHER.humidity,
        windSpeed: data.windSpeed ?? _DEFAULT_WEATHER.windSpeed,
        condition: data.condition ?? _DEFAULT_WEATHER.condition,
        icon: data.icon ?? _DEFAULT_WEATHER.icon,
        location: data.location ?? _DEFAULT_WEATHER.location,
      };

      // Cache the result
      await saveWeather(toCachedWeather(weatherData));

      return weatherData;
    } catch (error) {
      console.error("Fetch weather error:", error);

      // Try cached data as fallback
      const fallbackCached = await getWeather();
      if (fallbackCached.data) {
        return fromCachedWeather(fallbackCached.data);
      }

      return _DEFAULT_WEATHER;
    } finally {
      inFlightRequest = null;
    }
  })();

  return inFlightRequest;
}

/**
 * Get weather data with cache-first strategy
 */
export async function getWeatherData(): Promise<_WeatherData> {
  // Try cache first
  const cached = await getWeather();
  if (cached.data) {
    return fromCachedWeather(cached.data);
  }

  // Fetch fresh data
  return fetchWeather(true);
}
