import React, { useState, useEffect, memo, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MapPin, Droplets, Shirt, RefreshCw, ChevronLeft, Filter, Navigation } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

interface POI {
  id: string;
  name: string;
  type: 'water' | 'laundry';
  latitude: number;
  longitude: number;
  address?: string;
  openingHours?: string;
  price?: string;
  distance?: number;
}

function LiveScannerScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [pois, setPois] = useState<POI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'water' | 'laundry'>('all');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Simulated POI data (in real app, this would come from Overpass API)
  const samplePOIs = useMemo<POI[]>(() => [
    {
      id: '1',
      name: 'Bali Buddha Water Refill',
      type: 'water',
      latitude: -8.3405,
      longitude: 115.0920,
      address: 'Jl. Raya Ubud, Gianyar',
      openingHours: '08:00 - 22:00',
      price: 'Kostenlos',
      distance: 0.3,
    },
    {
      id: '2',
      name: 'Eco Water Station',
      type: 'water',
      latitude: -8.3450,
      longitude: 115.0950,
      address: 'Jl. Monkey Forest, Ubud',
      openingHours: '24h',
      price: '2.000 IDR/L',
      distance: 0.5,
    },
    {
      id: '3',
      name: 'Clean & Fresh Laundry',
      type: 'laundry',
      latitude: -8.3420,
      longitude: 115.0880,
      address: 'Jl. Hanoman, Ubud',
      openingHours: '08:00 - 20:00',
      price: '8.000 IDR/kg',
      distance: 0.4,
    },
    {
      id: '4',
      name: 'Express Laundry 24h',
      type: 'laundry',
      latitude: -8.3380,
      longitude: 115.0940,
      address: 'Jl. Raya Seminyak',
      openingHours: '24h',
      price: '10.000 IDR/kg',
      distance: 0.6,
    },
    {
      id: '5',
      name: 'Mountain Spring Water',
      type: 'water',
      latitude: -8.3500,
      longitude: 115.1000,
      address: 'Tegallalang',
      openingHours: '06:00 - 18:00',
      price: 'Kostenlos',
      distance: 1.2,
    },
    {
      id: '6',
      name: 'Quick Wash Laundry',
      type: 'laundry',
      latitude: -8.3350,
      longitude: 115.0850,
      address: 'Jl. Legian, Kuta',
      openingHours: '09:00 - 21:00',
      price: '7.000 IDR/kg',
      distance: 0.8,
    },
  ], []);

  // Fetch POIs from Overpass API (simulated)
  const fetchPOIs = useCallback(async () => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In real implementation, this would call the Overpass API
      // const response = await fetch('/api/overpass?type=water,laundry');
      // const data = await response.json();
      
      setPois(samplePOIs);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching POIs:', error);
    } finally {
      setIsLoading(false);
    }
  }, [samplePOIs]);

  // Fetch POIs on mount
  useEffect(() => {
    fetchPOIs();
  }, [fetchPOIs]);

  // Memoized filtered POIs
  const filteredPOIs = useMemo(() => {
    return pois.filter(poi => {
      if (filter === 'all') return true;
      return poi.type === filter;
    });
  }, [pois, filter]);

  // Memoized filter handlers
  const handleFilterAll = useCallback(() => setFilter('all'), []);
  const handleFilterWater = useCallback(() => setFilter('water'), []);
  const handleFilterLaundry = useCallback(() => setFilter('laundry'), []);

  // Memoized back handler
  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  // Memoized refresh handler
  const handleRefresh = useCallback(() => {
    fetchPOIs();
  }, [fetchPOIs]);

  // Get POI type info
  const getPOITypeInfo = useCallback((type: 'water' | 'laundry') => {
    if (type === 'water') {
      return {
        icon: <Droplets size={20} color="#00B4D8" />,
        label: t('scanner.waterRefill'),
        color: '#00B4D8',
        bgColor: '#E0F2FE',
      };
    }
    return {
      icon: <Shirt size={20} color="#9333EA" />,
      label: t('scanner.laundry'),
      color: '#9333EA',
      bgColor: '#F3E8FF',
    };
  }, [t]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <ChevronLeft size={24} color="#1F2937" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.title}>📍 {t('scanner.liveScanner')}</Text>
            <Text style={styles.subtitle}>{t('scanner.subtitle')}</Text>
          </View>
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw size={20} color={isLoading ? "#9CA3AF" : "#00B4D8"} />
          </TouchableOpacity>
        </View>

        {/* Status Banner */}
        {lastUpdate && (
          <View style={styles.statusBanner}>
            <Navigation size={16} color="#10B981" />
            <Text style={styles.statusText}>
              {t('scanner.lastUpdate')}: {lastUpdate.toLocaleTimeString('de-DE')}
            </Text>
          </View>
        )}

        {/* Filter Buttons */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
            onPress={handleFilterAll}
          >
            <Filter size={16} color={filter === 'all' ? '#FFFFFF' : '#6B7280'} />
            <Text style={[styles.filterButtonText, filter === 'all' && styles.filterButtonTextActive]}>
              {t('scanner.all')} ({pois.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'water' && styles.filterButtonWater]}
            onPress={handleFilterWater}
          >
            <Droplets size={16} color={filter === 'water' ? '#FFFFFF' : '#00B4D8'} />
            <Text style={[styles.filterButtonText, filter === 'water' && styles.filterButtonTextActive]}>
              {t('scanner.water')} ({pois.filter(p => p.type === 'water').length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'laundry' && styles.filterButtonLaundry]}
            onPress={handleFilterLaundry}
          >
            <Shirt size={16} color={filter === 'laundry' ? '#FFFFFF' : '#9333EA'} />
            <Text style={[styles.filterButtonText, filter === 'laundry' && styles.filterButtonTextActive]}>
              {t('scanner.laundry')} ({pois.filter(p => p.type === 'laundry').length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Loading State */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00B4D8" />
            <Text style={styles.loadingText}>{t('scanner.searching')}</Text>
          </View>
        )}

        {/* POI List */}
        {!isLoading && (
          <View style={styles.poiList}>
            {filteredPOIs.map((poi) => {
              const typeInfo = getPOITypeInfo(poi.type);
              return (
                <View key={poi.id} style={styles.poiCard}>
                  <View style={styles.poiHeader}>
                    <View style={[styles.poiIconContainer, { backgroundColor: typeInfo.bgColor }]}>
                      {typeInfo.icon}
                    </View>
                    <View style={styles.poiInfo}>
                      <Text style={styles.poiName}>{poi.name}</Text>
                      <View style={styles.poiTypeBadge}>
                        <Text style={[styles.poiTypeText, { color: typeInfo.color }]}>
                          {typeInfo.label}
                        </Text>
                      </View>
                    </View>
                    {poi.distance && (
                      <View style={styles.distanceBadge}>
                        <Text style={styles.distanceText}>{poi.distance} km</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.poiDetails}>
                    {poi.address && (
                      <View style={styles.detailRow}>
                        <MapPin size={14} color="#6B7280" />
                        <Text style={styles.detailText}>{poi.address}</Text>
                      </View>
                    )}
                    {poi.openingHours && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>{t('scanner.hours')}:</Text>
                        <Text style={styles.detailText}>{poi.openingHours}</Text>
                      </View>
                    )}
                    {poi.price && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>{t('scanner.price')}:</Text>
                        <Text style={[styles.detailText, styles.priceText]}>{poi.price}</Text>
                      </View>
                    )}
                  </View>

                  <TouchableOpacity style={styles.navigateButton}>
                    <Navigation size={16} color="#FFFFFF" />
                    <Text style={styles.navigateButtonText}>{t('scanner.navigate')}</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}

        {/* Empty State */}
        {!isLoading && filteredPOIs.length === 0 && (
          <View style={styles.emptyState}>
            <MapPin size={48} color="#9CA3AF" />
            <Text style={styles.emptyStateText}>{t('scanner.noPOIsFound')}</Text>
            <Text style={styles.emptyStateSubtext}>
              {t('scanner.tryDifferentFilter')}
            </Text>
          </View>
        )}

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>💡 {t('scanner.tips')}</Text>
          <Text style={styles.infoText}>• {t('scanner.tip1')}</Text>
          <Text style={styles.infoText}>• {t('scanner.tip2')}</Text>
          <Text style={styles.infoText}>• {t('scanner.tip3')}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0FDF4',
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  refreshButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#D1FAE5',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  statusText: {
    fontSize: 13,
    color: '#065F46',
    fontWeight: '500',
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterButtonActive: {
    backgroundColor: '#00B4D8',
    borderColor: '#00B4D8',
  },
  filterButtonWater: {
    backgroundColor: '#00B4D8',
    borderColor: '#00B4D8',
  },
  filterButtonLaundry: {
    backgroundColor: '#9333EA',
    borderColor: '#9333EA',
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  poiList: {
    gap: 16,
  },
  poiCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  poiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  poiIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  poiInfo: {
    flex: 1,
  },
  poiName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  poiTypeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
  },
  poiTypeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  distanceBadge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  distanceText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#00B4D8',
  },
  poiDetails: {
    gap: 8,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  detailText: {
    fontSize: 13,
    color: '#374151',
    flex: 1,
  },
  priceText: {
    fontWeight: '600',
    color: '#90BE6D',
  },
  navigateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#00B4D8',
    paddingVertical: 12,
    borderRadius: 8,
  },
  navigateButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    marginTop: 20,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: '#E0F2FE',
    borderRadius: 16,
    padding: 16,
    marginTop: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#00B4D8',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0C4A6E',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#0369A1',
    marginBottom: 4,
    lineHeight: 18,
  },
});

export default memo(LiveScannerScreen);