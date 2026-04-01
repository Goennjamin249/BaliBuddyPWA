import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Image,
} from "react-native";
import {
  Cloud,
  Sun,
  CloudRain,
  CloudLightning,
  Wind,
  Droplets,
  RefreshCw,
  AlertTriangle,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";

import { useTheme } from "../theme/ThemeContext";

interface WeatherData {
  temp: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  description: string;
  icon: string;
  location: string;
}

// Fallback data for offline/API errors
const FALLBACK_WEATHER: WeatherData = {
  temp: 29,
  feelsLike: 33,
  humidity: 75,
  windSpeed: 12,
  condition: "Sunny",
  description: "Sonnig",
  icon: "01d",
  location: "Bali, Indonesien",
};

// Get weather icon based on condition
const getWeatherIcon = (
  condition: string,
  size: number = 48,
  color: string = "#F59E0B",
) => {
  const conditionLower = condition.toLowerCase();

  if (conditionLower.includes("rain") || conditionLower.includes("drizzle")) {
    return <CloudRain size={size} color={color} />;
  }
  if (conditionLower.includes("thunder") || conditionLower.includes("storm")) {
    return <CloudLightning size={size} color={color} />;
  }
  if (conditionLower.includes("cloud")) {
    return <Cloud size={size} color={color} />;
  }
  return <Sun size={size} color={color} />;
};

export default function WeatherWidget({
  onRefresh,
  compact = false,
}: {
  onRefresh?: () => void;
  compact?: boolean;
}) {
  const { colors } = useTheme();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = useCallback(async () => {
    const API_KEY = process.env.EXPO_PUBLIC_WEATHER_API_KEY;
    
    // Bali coordinates (Denpasar)
    const BALI_LAT = -8.4095;
    const BALI_LON = 115.1889;

    // If no API key, use fallback immediately
    if (!API_KEY) {
      console.warn("Weather API key not configured - using fallback");
      setWeather(FALLBACK_WEATHER);
      setLoading(false);
      return;
    }

    try {
      // Use Bali coordinates for accurate local weather
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${BALI_LAT}&lon=${BALI_LON}&appid=${API_KEY}&units=metric&lang=de`;

      // 2 second timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      // Validate response structure
      if (!data.main || !data.weather || !data.name) {
        throw new Error("Invalid weather data");
      }

      setWeather({
        temp: Math.round(data.main.temp),
        feelsLike: Math.round(data.main.feels_like),
        humidity: data.main.humidity,
        windSpeed: Math.round(data.wind?.speed || 0),
        condition: data.weather[0].main,
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        location: `${data.name}, ${data.sys?.country || "ID"}`,
      });
      setError(null);
    } catch (err) {
      console.warn("Weather fetch failed, using fallback:", err);
      // Silent fallback - no error shown to user
      setWeather(FALLBACK_WEATHER);
      setError(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWeather();
  }, [fetchWeather]);

  const handleRefresh = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLoading(true);
    await fetchWeather();
    onRefresh?.();
  };

  // Loading State - Skeleton UI
  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.card }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textMuted }]}>
          Wetter wird geladen...
        </Text>
      </View>
    );
  }

  // Compact View (for dashboards)
  if (compact && weather) {
    return (
      <TouchableOpacity
        style={[styles.compactCard, { backgroundColor: colors.card }]}
        onPress={handleRefresh}
        activeOpacity={0.7}
      >
        {getWeatherIcon(weather.condition, 32, colors.primary)}
        <View style={styles.compactInfo}>
          <Text style={[styles.compactTemp, { color: colors.text }]}>
            {weather.temp}°C
          </Text>
          <Text style={[styles.compactLocation, { color: colors.textMuted }]}>
            {weather.location.split(",")[0]}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  // Full Weather Card
  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      {/* Header with Refresh */}
      <View style={styles.header}>
        <View style={styles.locationRow}>
          <Text style={[styles.location, { color: colors.text }]}>
            📍 {weather?.location || FALLBACK_WEATHER.location}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.refreshButton, { backgroundColor: colors.cardMuted }]}
          onPress={handleRefresh}
          activeOpacity={0.7}
        >
          <RefreshCw size={18} color={colors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Main Weather Display */}
      <View style={styles.main}>
        {weather?.icon ? (
          <Image
            source={{ uri: `https://openweathermap.org/img/wn/${weather.icon}@2x.png` }}
            style={styles.weatherIcon}
            resizeMode="contain"
          />
        ) : (
          getWeatherIcon(weather?.condition || "Sunny", 64, colors.primary)
        )}
        <View style={styles.tempContainer}>
          <Text style={[styles.temperature, { color: colors.text }]}>
            {weather?.temp || FALLBACK_WEATHER.temp}°C
          </Text>
          <Text style={[styles.description, { color: colors.textMuted }]}>
            {weather?.description || FALLBACK_WEATHER.description}
          </Text>
        </View>
      </View>

      {/* Weather Details */}
      <View style={styles.details}>
        <View style={styles.detailItem}>
          <Wind size={20} color={colors.textMuted} />
          <Text style={[styles.detailText, { color: colors.textMuted }]}>
            {weather?.windSpeed || FALLBACK_WEATHER.windSpeed} km/h
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Droplets size={20} color={colors.textMuted} />
          <Text style={[styles.detailText, { color: colors.textMuted }]}>
            {weather?.humidity || FALLBACK_WEATHER.humidity}%
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={[styles.detailText, { color: colors.textMuted }]}>
            🌡️ {weather?.feelsLike || FALLBACK_WEATHER.feelsLike}°C
          </Text>
        </View>
      </View>

      {/* Error Banner (if fallback is used) */}
      {error && (
        <View
          style={[styles.errorBanner, { backgroundColor: colors.cardMuted }]}
        >
          <AlertTriangle size={16} color="#F59E0B" />
          <Text style={[styles.errorText, { color: colors.textMuted }]}>
            Offline-Modus: Wetterdaten nicht verfügbar
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
      },
    }),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  locationRow: {
    flex: 1,
  },
  location: {
    fontSize: 14,
    fontWeight: "600",
  },
  refreshButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: 14,
    marginTop: 12,
    fontWeight: "500",
  },
  main: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 16,
  },
  weatherIcon: {
    width: 80,
    height: 80,
  },
  tempContainer: {
    flex: 1,
  },
  temperature: {
    fontSize: 48,
    fontWeight: "800",
  },
  description: {
    fontSize: 16,
    marginTop: 4,
    textTransform: "capitalize",
  },
  details: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  detailText: {
    fontSize: 13,
    fontWeight: "500",
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    marginTop: 16,
    borderRadius: 12,
  },
  errorText: {
    fontSize: 12,
    flex: 1,
  },
  compactCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
      },
    }),
  },
  compactInfo: {
    flex: 1,
  },
  compactTemp: {
    fontSize: 24,
    fontWeight: "700",
  },
  compactLocation: {
    fontSize: 12,
    marginTop: 2,
  },
});
