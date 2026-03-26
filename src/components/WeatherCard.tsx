import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WeatherData } from '../services/weather';

interface WeatherCardProps {
  weather: WeatherData | null;
  isLoading?: boolean;
}

export default function WeatherCard({ weather, isLoading }: WeatherCardProps) {
  if (isLoading) {
    return (
      <View style={styles.card}>
        <Text style={styles.loading}>Lade Wetterdaten...</Text>
      </View>
    );
  }

  if (!weather) {
    return (
      <View style={styles.card}>
        <Text style={styles.error}>Keine Wetterdaten verfügbar</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.icon}>{weather.icon}</Text>
        <View style={styles.tempContainer}>
          <Text style={styles.temperature}>{weather.temperature}°C</Text>
          <Text style={styles.description}>{weather.description}</Text>
        </View>
      </View>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Text style={styles.label}>📍 Ort:</Text>
          <Text style={styles.value}>{weather.location}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>💧 Luftfeuchtigkeit:</Text>
          <Text style={styles.value}>{weather.humidity}%</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>💨 Wind:</Text>
          <Text style={styles.value}>{weather.windSpeed} km/h aus {weather.windDirection}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>🌡️ Gefühlt:</Text>
          <Text style={styles.value}>{weather.feelsLike}°C</Text>
        </View>
      </View>

      {/* BMKG Attribution - REQUIRED */}
      <View style={styles.attribution}>
        <Text style={styles.attributionText}>
          Datenquelle: BMKG (Meteorology, Climatology, and Geophysics Agency)
        </Text>
        <Text style={styles.attributionLink}>
          https://data.bmkg.go.id
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    margin: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  icon: {
    fontSize: 48,
    marginRight: 16,
  },
  tempContainer: {
    flex: 1,
  },
  temperature: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#00B4D8',
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  details: {
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    paddingTop: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: '#666',
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  loading: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    padding: 20,
  },
  error: {
    fontSize: 16,
    color: '#FF6B6B',
    textAlign: 'center',
    padding: 20,
  },
  attribution: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    alignItems: 'center',
  },
  attributionText: {
    fontSize: 11,
    color: '#999',
    textAlign: 'center',
  },
  attributionLink: {
    fontSize: 11,
    color: '#00B4D8',
    marginTop: 2,
  },
});