/**
 * Shared weather data conversion utilities
 * Centralizes weather mapping to avoid duplication across components
 */

export interface CachedWeather {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  icon: string;
  location: string;
}

export interface WeatherData {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  icon: string;
  location: string;
}

/**
 * Convert cached weather data to display format
 */
export const fromCachedWeather = (cached: CachedWeather): WeatherData => ({
  temperature: cached.temperature,
  feelsLike: cached.feelsLike,
  humidity: cached.humidity,
  windSpeed: cached.windSpeed,
  condition: cached.condition,
  icon: cached.icon || "\u26C5",
  location: cached.location,
});

/**
 * Convert display weather data to cache format
 */
export const toCachedWeather = (data: WeatherData): CachedWeather => ({
  temperature: data.temperature,
  feelsLike: data.feelsLike,
  humidity: data.humidity,
  windSpeed: data.windSpeed,
  condition: data.condition,
  icon: data.icon,
  location: data.location,
});

/**
 * Default fallback weather data for Bali
 */
export const DEFAULT_WEATHER: WeatherData = {
  temperature: 28,
  feelsLike: 32,
  humidity: 78,
  windSpeed: 15,
  condition: "Teilweise bew\u00F6lkt",
  icon: "\u26C5",
  location: "Bali, Indonesien",
};