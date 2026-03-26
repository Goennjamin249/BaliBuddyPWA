import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Sun, Cloud, CloudRain, Wind, Droplets, Thermometer, Eye, ArrowLeft, Home, RefreshCw, AlertTriangle, MapPin } from 'lucide-react-native';

interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  visibility: number;
  uvIndex: number;
  forecast: ForecastDay[];
}

interface ForecastDay {
  day: string;
  tempMax: number;
  tempMin: number;
  condition: string;
  icon: string;
}

// Bali 2026 Weather Data (simulated real-time)
const BALI_WEATHER_DATA: WeatherData = {
  location: 'Bali, Indonesien',
  temperature: 28,
  condition: 'Teilweise bewölkt',
  humidity: 75,
  windSpeed: 12,
  visibility: 10,
  uvIndex: 8,
  forecast: [
    { day: 'Heute', tempMax: 30, tempMin: 24, condition: 'Sonnig', icon: '☀️' },
    { day: 'Morgen', tempMax: 29, tempMin: 23, condition: 'Teilweise bewölkt', icon: '⛅' },
    { day: 'Mi', tempMax: 28, tempMin: 22, condition: 'Regen', icon: '🌧️' },
    { day: 'Do', tempMax: 27, tempMin: 21, condition: 'Bewölkt', icon: '☁️' },
    { day: 'Fr', tempMax: 29, tempMin: 23, condition: 'Sonnig', icon: '☀️' },
  ],
};

// Helper function to get weather condition from WMO code
const getWeatherCondition = (code: number): string => {
  if (code === 0) return 'Klar';
  if (code <= 3) return 'Teilweise bewölkt';
  if (code <= 48) return 'Nebel';
  if (code <= 57) return 'Nieselregen';
  if (code <= 67) return 'Regen';
  if (code <= 77) return 'Schnee';
  if (code <= 82) return 'Regenschauer';
  if (code <= 86) return 'Schneeschauer';
  if (code <= 99) return 'Gewitter';
  return 'Unbekannt';
};

// Helper function to get weather emoji from WMO code
const getWeatherEmoji = (code: number): string => {
  if (code === 0) return '☀️';
  if (code <= 3) return '⛅';
  if (code <= 48) return '🌫️';
  if (code <= 57) return '🌧️';
  if (code <= 67) return '🌧️';
  if (code <= 77) return '❄️';
  if (code <= 82) return '🌦️';
  if (code <= 86) return '🌨️';
  if (code <= 99) return '⛈️';
  return '🌤️';
};

// Weather alerts for Bali
const WEATHER_ALERTS = [
  {
    type: 'UV-Index',
    level: 'Hoch',
    message: 'UV-Index 8 - Sonnenschutz verwenden!',
    icon: '☀️',
    color: '#F59E0B',
  },
  {
    type: 'Regen',
    level: 'Mittel',
    message: 'Regenwahrscheinlichkeit am Mittwoch',
    icon: '🌧️',
    color: '#3B82F6',
  },
];

export default function WeatherScreen() {
  const router = useRouter();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isOffline, setIsOffline] = useState<boolean>(false);

  // Fetch weather data
  const fetchWeather = useCallback(async () => {
    setIsLoading(true);
    try {
      // Using local API endpoint for weather data
      const response = await fetch('/api/weather?lat=-8.4095&lng=115.1889');
      const data = await response.json();
      
      if (data.current) {
        const weatherData: WeatherData = {
          location: 'Bali, Indonesien',
          temperature: Math.round(data.current.temperature_2m),
          condition: getWeatherCondition(data.current.weather_code),
          humidity: Math.round(data.current.relative_humidity_2m),
          windSpeed: Math.round(data.current.wind_speed_10m),
          visibility: 10, // Default visibility
          uvIndex: Math.round(data.current.uv_index),
          forecast: data.daily ? data.daily.time.slice(0, 5).map((date: string, index: number) => ({
            day: index === 0 ? 'Heute' : new Date(date).toLocaleDateString('de-DE', { weekday: 'short' }),
            tempMax: Math.round(data.daily.temperature_2m_max[index]),
            tempMin: Math.round(data.daily.temperature_2m_min[index]),
            condition: getWeatherCondition(data.daily.weather_code[index]),
            icon: getWeatherEmoji(data.daily.weather_code[index]),
          })) : BALI_WEATHER_DATA.forecast,
        };
        
        setWeather(weatherData);
        setLastUpdate(new Date());
        setIsOffline(false);
        
        // Cache to localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('cachedWeather', JSON.stringify({
            timestamp: Date.now(),
            data: weatherData,
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching weather:', error);
      
      // Load from cache if available
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem('cachedWeather');
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          setWeather(data);
          setLastUpdate(new Date(timestamp));
          setIsOffline(true);
        } else {
          // Use fallback data
          setWeather(BALI_WEATHER_DATA);
          setIsOffline(true);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch weather on mount
  useEffect(() => {
    fetchWeather();
  }, [fetchWeather]);

  // Get weather icon
  const getWeatherIcon = (condition: string) => {
    if (condition.includes('Sonnig') || condition.includes('sun')) return <Sun size={32} color="#F59E0B" />;
    if (condition.includes('bewölkt') || condition.includes('cloud')) return <Cloud size={32} color="#6B7280" />;
    if (condition.includes('Regen') || condition.includes('rain')) return <CloudRain size={32} color="#3B82F6" />;
    return <Sun size={32} color="#F59E0B" />;
  };

  // Get UV level color
  const getUVLevelColor = (uvIndex: number) => {
    if (uvIndex <= 2) return '#10B981';
    if (uvIndex <= 5) return '#F59E0B';
    if (uvIndex <= 7) return '#F97316';
    if (uvIndex <= 10) return '#EF4444';
    return '#7C3AED';
  };

  // Get UV level text
  const getUVLevelText = (uvIndex: number) => {
    if (uvIndex <= 2) return 'Niedrig';
    if (uvIndex <= 5) return 'Mittel';
    if (uvIndex <= 7) return 'Hoch';
    if (uvIndex <= 10) return 'Sehr hoch';
    return 'Extrem';
  };

  if (isLoading && !weather) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00B4D8" />
        <Text style={styles.loadingText}>Wetter wird geladen...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#0F172A" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.title}>🌤️ Wetter</Text>
            <Text style={styles.subtitle}>Live-Updates für Bali</Text>
          </View>
          <TouchableOpacity 
            style={styles.homeButton}
            onPress={() => router.push('/')}
          >
            <Home size={20} color="#0F172A" />
          </TouchableOpacity>
        </View>

        {/* Status Banner */}
        {isOffline && (
          <View style={styles.offlineBanner}>
            <Text style={styles.offlineText}>📴 Offline-Modus (gecachezte Daten)</Text>
          </View>
        )}

        {/* Current Weather Card */}
        {weather && (
          <View style={styles.currentWeatherCard}>
            <View style={styles.currentWeatherHeader}>
              <MapPin size={20} color="#00B4D8" />
              <Text style={styles.locationText}>{weather.location}</Text>
              <TouchableOpacity 
                style={styles.refreshButton}
                onPress={fetchWeather}
                disabled={isLoading}
              >
                <RefreshCw size={20} color={isLoading ? "#9CA3AF" : "#00B4D8"} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.currentWeatherContent}>
              <View style={styles.temperatureContainer}>
                {getWeatherIcon(weather.condition)}
                <Text style={styles.temperature}>{weather.temperature}°C</Text>
              </View>
              <Text style={styles.condition}>{weather.condition}</Text>
            </View>

            {/* Weather Details */}
            <View style={styles.weatherDetails}>
              <View style={styles.detailItem}>
                <Droplets size={16} color="#3B82F6" />
                <Text style={styles.detailLabel}>Feuchtigkeit</Text>
                <Text style={styles.detailValue}>{weather.humidity}%</Text>
              </View>
              <View style={styles.detailItem}>
                <Wind size={16} color="#6B7280" />
                <Text style={styles.detailLabel}>Wind</Text>
                <Text style={styles.detailValue}>{weather.windSpeed} km/h</Text>
              </View>
              <View style={styles.detailItem}>
                <Eye size={16} color="#8B5CF6" />
                <Text style={styles.detailLabel}>Sicht</Text>
                <Text style={styles.detailValue}>{weather.visibility} km</Text>
              </View>
              <View style={styles.detailItem}>
                <Thermometer size={16} color="#EF4444" />
                <Text style={styles.detailLabel}>UV-Index</Text>
                <Text style={[styles.detailValue, { color: getUVLevelColor(weather.uvIndex) }]}>
                  {weather.uvIndex}
                </Text>
              </View>
            </View>

            {lastUpdate && (
              <Text style={styles.lastUpdate}>
                Letzte Aktualisierung: {lastUpdate.toLocaleTimeString('de-DE')}
              </Text>
            )}
          </View>
        )}

        {/* Weather Alerts */}
        <View style={styles.alertsSection}>
          <Text style={styles.sectionTitle}>⚠️ Wetterwarnungen</Text>
          {WEATHER_ALERTS.map((alert, index) => (
            <View key={index} style={[styles.alertCard, { borderLeftColor: alert.color }]}>
              <View style={styles.alertHeader}>
                <Text style={styles.alertIcon}>{alert.icon}</Text>
                <View style={styles.alertInfo}>
                  <Text style={styles.alertType}>{alert.type}</Text>
                  <Text style={[styles.alertLevel, { color: alert.color }]}>{alert.level}</Text>
                </View>
              </View>
              <Text style={styles.alertMessage}>{alert.message}</Text>
            </View>
          ))}
        </View>

        {/* 5-Day Forecast */}
        {weather && (
          <View style={styles.forecastSection}>
            <Text style={styles.sectionTitle}>📅 5-Tage-Vorhersage</Text>
            <View style={styles.forecastGrid}>
              {weather.forecast.map((day, index) => (
                <View key={index} style={styles.forecastCard}>
                  <Text style={styles.forecastDay}>{day.day}</Text>
                  <Text style={styles.forecastIcon}>{day.icon}</Text>
                  <Text style={styles.forecastCondition}>{day.condition}</Text>
                  <View style={styles.forecastTemps}>
                    <Text style={styles.forecastTempMax}>{day.tempMax}°</Text>
                    <Text style={styles.forecastTempMin}>{day.tempMin}°</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Travel Tips */}
        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>💡 Reisetipps</Text>
          <View style={styles.tipsGrid}>
            <View style={styles.tipCard}>
              <Text style={styles.tipIcon}>🧴</Text>
              <Text style={styles.tipTitle}>Sonnenschutz</Text>
              <Text style={styles.tipText}>UV-Index 8 - Verwende Sonnencreme mit LSF 50+</Text>
            </View>
            <View style={styles.tipCard}>
              <Text style={styles.tipIcon}>💧</Text>
              <Text style={styles.tipTitle}>Hydration</Text>
              <Text style={styles.tipText}>Trinke mindestens 3L Wasser pro Tag</Text>
            </View>
            <View style={styles.tipCard}>
              <Text style={styles.tipIcon}>🌧️</Text>
              <Text style={styles.tipTitle}>Regenzeit</Text>
              <Text style={styles.tipText}>Regenschirm für kurze Schauer einpacken</Text>
            </View>
            <View style={styles.tipCard}>
              <Text style={styles.tipIcon}>👕</Text>
              <Text style={styles.tipTitle}>Kleidung</Text>
              <Text style={styles.tipText}>Leichte, atmungsaktive Kleidung tragen</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  homeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  offlineBanner: {
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  offlineText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
  },
  currentWeatherCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  currentWeatherHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  locationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    flex: 1,
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentWeatherContent: {
    alignItems: 'center',
    marginBottom: 24,
  },
  temperatureContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 8,
  },
  temperature: {
    fontSize: 48,
    fontWeight: '800',
    color: '#0F172A',
  },
  condition: {
    fontSize: 18,
    color: '#64748B',
    fontWeight: '500',
  },
  weatherDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 16,
  },
  detailItem: {
    width: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 12,
  },
  detailLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  lastUpdate: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  alertsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 16,
  },
  alertCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  alertIcon: {
    fontSize: 24,
  },
  alertInfo: {
    flex: 1,
  },
  alertType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  alertLevel: {
    fontSize: 12,
    fontWeight: '600',
  },
  alertMessage: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  forecastSection: {
    marginBottom: 24,
  },
  forecastGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  forecastCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  forecastDay: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
  },
  forecastIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  forecastCondition: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 8,
    minHeight: 32,
  },
  forecastTemps: {
    flexDirection: 'row',
    gap: 8,
  },
  forecastTempMax: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  forecastTempMin: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  tipsSection: {
    marginBottom: 24,
  },
  tipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  tipCard: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  tipIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
  },
  tipText: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },
});