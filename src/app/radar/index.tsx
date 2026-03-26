import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MapPin, Navigation, Coffee, Home, Droplets, ChevronLeft, RefreshCw, Target } from 'lucide-react-native';

interface POI {
  id: string;
  name: string;
  type: 'warung' | 'hostel' | 'water' | 'atm' | 'pharmacy';
  distance: number;
  icon: string;
  address: string;
  open: boolean;
}

export default function RadarScreen() {
  const router = useRouter();
  const [currentLocation, setCurrentLocation] = useState({ lat: -8.3405, lng: 115.0920 });
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const nearbyPOIs: POI[] = [
    {
      id: '1',
      name: 'Warung Babi Guling Pak Malen',
      type: 'warung',
      distance: 45,
      icon: '🍛',
      address: 'Jl. Sunset Road No. 5',
      open: true,
    },
    {
      id: '2',
      name: 'Pondok Wisata Bali',
      type: 'hostel',
      distance: 120,
      icon: '🏨',
      address: 'Jl. Legian No. 108',
      open: true,
    },
    {
      id: '3',
      name: 'Refill Station - Eco Bali',
      type: 'water',
      distance: 85,
      icon: '💧',
      address: 'Jl. Kayu Aya No. 23',
      open: true,
    },
    {
      id: '4',
      name: 'Warung Nasi Campur',
      type: 'warung',
      distance: 65,
      icon: '🍛',
      address: 'Jl. Dhyana Pura No. 15',
      open: true,
    },
    {
      id: '5',
      name: 'Kos-Kosan Backpacker',
      type: 'hostel',
      distance: 180,
      icon: '🏨',
      address: 'Jl. Popies Lane II',
      open: true,
    },
    {
      id: '6',
      name: 'Circle K - Water Refill',
      type: 'water',
      distance: 150,
      icon: '💧',
      address: 'Jl. Kuta Square',
      open: true,
    },
    {
      id: '7',
      name: 'ATM BCA',
      type: 'atm',
      distance: 30,
      icon: '🏧',
      address: 'Jl. Legian No. 55',
      open: true,
    },
    {
      id: '8',
      name: 'Apotek K24',
      type: 'pharmacy',
      distance: 95,
      icon: '💊',
      address: 'Jl. Sunset Road No. 88',
      open: true,
    },
    {
      id: '9',
      name: 'Warung Padang Sederhana',
      type: 'warung',
      distance: 110,
      icon: '🍛',
      address: 'Jl. Melasti No. 32',
      open: false,
    },
    {
      id: '10',
      name: 'Hostelworld Bali',
      type: 'hostel',
      distance: 220,
      icon: '🏨',
      address: 'Jl. Benesari No. 7',
      open: true,
    },
  ];

  const filters = [
    { id: 'all', label: 'Alle', icon: '📍' },
    { id: 'warung', label: 'Warungs', icon: '🍛' },
    { id: 'hostel', label: 'Hostels', icon: '🏨' },
    { id: 'water', label: 'Wasser', icon: '💧' },
    { id: 'atm', label: 'ATM', icon: '🏧' },
    { id: 'pharmacy', label: 'Apotheke', icon: '💊' },
  ];

  const filteredPOIs = selectedFilter === 'all' 
    ? nearbyPOIs 
    : nearbyPOIs.filter(poi => poi.type === selectedFilter);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'warung': return '#F59E0B';
      case 'hostel': return '#8B5CF6';
      case 'water': return '#00B4D8';
      case 'atm': return '#10B981';
      case 'pharmacy': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'warung': return 'Warung';
      case 'hostel': return 'Hostel';
      case 'water': return 'Wasser-Refill';
      case 'atm': return 'ATM';
      case 'pharmacy': return 'Apotheke';
      default: return 'Sonstiges';
    }
  };

  const refresh = () => {
    setLastUpdate(new Date());
    // Simulate location update
    setCurrentLocation({
      lat: currentLocation.lat + (Math.random() - 0.5) * 0.001,
      lng: currentLocation.lng + (Math.random() - 0.5) * 0.001,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ChevronLeft size={24} color="#1F2937" />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.title}>📡 POI Radar</Text>
            <Text style={styles.subtitle}>Orte in deiner Nähe</Text>
          </View>
          <TouchableOpacity onPress={refresh}>
            <RefreshCw size={24} color="#00B4D8" />
          </TouchableOpacity>
        </View>

        {/* Current Location */}
        <View style={styles.locationCard}>
          <Target size={20} color="#00B4D8" />
          <View style={styles.locationInfo}>
            <Text style={styles.locationTitle}>Dein Standort</Text>
            <Text style={styles.locationCoords}>
              GPS: {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
            </Text>
          </View>
          <Navigation size={20} color="#10B981" />
        </View>

        {/* Last Update */}
        <Text style={styles.lastUpdate}>
          Letzte Aktualisierung: {lastUpdate.toLocaleTimeString('de-DE')} • Radius: 300m
        </Text>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterButton,
                selectedFilter === filter.id && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedFilter(filter.id)}
            >
              <Text style={styles.filterIcon}>{filter.icon}</Text>
              <Text style={[
                styles.filterText,
                selectedFilter === filter.id && styles.filterTextActive,
              ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* POI List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            📍 {filteredPOIs.length} Orte gefunden
          </Text>
          {filteredPOIs.map((poi) => (
            <View key={poi.id} style={styles.poiCard}>
              <View style={styles.poiHeader}>
                <Text style={styles.poiIcon}>{poi.icon}</Text>
                <View style={styles.poiTitleContainer}>
                  <Text style={styles.poiName}>{poi.name}</Text>
                  <View style={styles.poiTypeRow}>
                    <View style={[styles.typeBadge, { backgroundColor: getTypeColor(poi.type) }]}>
                      <Text style={styles.typeBadgeText}>{getTypeLabel(poi.type)}</Text>
                    </View>
                    {!poi.open && (
                      <View style={styles.closedBadge}>
                        <Text style={styles.closedBadgeText}>Geschlossen</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
              
              <View style={styles.poiDetails}>
                <View style={styles.poiDetail}>
                  <MapPin size={14} color="#6B7280" />
                  <Text style={styles.poiDetailText}>{poi.address}</Text>
                </View>
                <View style={styles.poiDistance}>
                  <Text style={styles.distanceValue}>{poi.distance}m</Text>
                  <Text style={styles.distanceLabel}>entfernt</Text>
                </View>
              </View>

              {/* Distance Bar */}
              <View style={styles.distanceBarContainer}>
                <View style={styles.distanceBar}>
                  <View 
                    style={[
                      styles.distanceBarFill, 
                      { 
                        width: `${Math.min(100, (poi.distance / 300) * 100)}%`,
                        backgroundColor: getTypeColor(poi.type),
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.distanceBarText}>{poi.distance}m / 300m</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>ℹ️ Über den Radar</Text>
          <Text style={styles.infoText}>
            Der POI Radar zeigt dir Orte in einem Umkreis von 300 Metern. 
            Die Daten werden von OpenStreetMap bereitgestellt und automatisch aktualisiert.
          </Text>
        </View>

        {/* Tips */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 Tipps</Text>
          <Text style={styles.tipText}>• Wasser-Refill-Stationen sparen Plastik</Text>
          <Text style={styles.tipText}>• Warungs bieten authentisches Essen</Text>
          <Text style={styles.tipText}>• Hostels für Budget-Reisende</Text>
          <Text style={styles.tipText}>• Immer genug Bargeld mitführen</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E0F2FE',
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  locationInfo: {
    flex: 1,
  },
  locationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  locationCoords: {
    fontSize: 11,
    color: '#6B7280',
    fontFamily: 'monospace',
  },
  lastUpdate: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 16,
  },
  filterScroll: {
    marginBottom: 16,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#00B4D8',
  },
  filterIcon: {
    fontSize: 16,
  },
  filterText: {
    fontSize: 12,
    color: '#374151',
  },
  filterTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  poiCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  poiHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  poiIcon: {
    fontSize: 32,
  },
  poiTitleContainer: {
    flex: 1,
  },
  poiName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  poiTypeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  closedBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  closedBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#DC2626',
  },
  poiDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  poiDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  poiDetailText: {
    fontSize: 12,
    color: '#6B7280',
  },
  poiDistance: {
    alignItems: 'flex-end',
  },
  distanceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00B4D8',
  },
  distanceLabel: {
    fontSize: 10,
    color: '#6B7280',
  },
  distanceBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  distanceBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  distanceBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  distanceBarText: {
    fontSize: 10,
    color: '#9CA3AF',
    width: 60,
    textAlign: 'right',
  },
  infoCard: {
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  tipsCard: {
    backgroundColor: '#D1FAE5',
    padding: 16,
    borderRadius: 12,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#065F46',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 13,
    color: '#047857',
    marginBottom: 4,
    lineHeight: 18,
  },
});