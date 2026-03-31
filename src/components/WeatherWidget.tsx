import React, { useState, useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";

interface WeatherData {
  name: string;
  main: {
    temp: number;
  };
  weather: Array<{
    description: string;
  }>;
}

// Nutze .env Datei für den Key: EXPO_PUBLIC_WEATHER_API_KEY=dein_schlüssel
const API_KEY = process.env.EXPO_PUBLIC_WEATHER_API_KEY;
const CITY = "Bali"; // Oder dynamisch übergeben
const URL = `https://api.openweathermap.org/data/2.5/weather?q=${CITY}&appid=${API_KEY}&units=metric&lang=de`;

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch(URL);
        if (!response.ok) throw new Error(`HTTP Fehler: ${response.status}`);

        const data = await response.json();
        setWeather(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unbekannter Fehler");
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);

  // 1. Fallback: Lade-UI (Verhindert White Screen)
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  // 2. Fallback: Fehler-UI (Fängt API-Probleme ab)
  if (error) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-red-500 font-bold text-center">
          Wetter konnte nicht geladen werden: {error}
        </Text>
      </View>
    );
  }

  // 3. UI: Sicheres Rendering mit NativeWind v5
  // "shadow-md" ersetzt die alten shadow* Props.
  return (
    <View className="flex-1 items-center justify-center p-4 bg-gray-50">
      <View className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
        <Text className="text-2xl font-bold text-gray-800 text-center">
          {weather?.name}
        </Text>
        <Text className="text-5xl font-black text-blue-500 text-center my-2">
          {weather?.main?.temp ? Math.round(weather.main.temp) : "--"}°C
        </Text>
        <Text className="text-lg text-gray-500 capitalize text-center">
          {weather?.weather?.[0]?.description}
        </Text>
      </View>
    </View>
  );
}
