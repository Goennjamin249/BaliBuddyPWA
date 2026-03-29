import React, { useState, memo, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MapPin, Droplets, Clock, Phone, ChevronLeft, Star, AlertTriangle, CheckCircle } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

interface WaterStation {
  id: string;
  name: string;
  location: string;
  address: string;
  waterType: 'free' | 'paid' | 'filtered';
  pricePerLiter?: number;
  openingHours: string;
  distance: number;
  rating: number;
  hasGeofencing: boolean;
  phone?: string;
}

function WaterRefillScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [selectedStation, setSelectedStation] = useState<WaterStation | null>(null);

  // Memoized water stations data
  const waterStations = useMemo<WaterStation[]>(() => [
    {
      id: '1',
      name: 'Bali Buddha Water Refill',
      location: 'Ubud',
      address: 'Jl. Raya Ubud No. 123',
      waterType: 'free',
      openingHours: '08:00 - 22:00',
      distance: 0.3,
      rating: 4.8,
      hasGeofencing: true,
      phone: '0361-123456',
    },
    {
      id: '2',
      name: 'Eco Water Station',
      location: 'Seminyak',
      address: 'Jl. Legian No. 456',
      waterType: 'paid',
      pricePerLiter: 2000,
      openingHours: '24h',
      distance: 0.5,
      rating: 4.5,
      hasGeofencing: true,
    },
    {
      id: '3',
      name: 'Mountain Spring Water',
      location: 'Kuta',
      address: 'Near Beachwalk Mall',
      waterType: 'free',
      openingHours: '06:00 - 18:00',
      distance: 0.8,
      rating: 4.2,
      hasGeofencing: false,
    },
    {
      id: '4',
      name: 'Filtered Water Station',
      location: 'Canggu',
      address: 'Jl. Batu Bolong No. 789',
      waterType: 'filtered',
      pricePerLiter: 5000,
      openingHours: '07:00 - 21:00',
      distance: 1.2,
      rating: 4.9,
      hasGeofencing: true,
      phone: '0361-234567',
    },
    {
      id: '5',
      name: 'Temple Water Fountain',
      location: 'Tanah Lot',
      address: 'Temple Complex',
      waterType: 'free',
      openingHours: '06:00 - 18:00',
      distance: 2.5,
      rating: 4.0,
      hasGeofencing: false,
    },
  ], []);

  // Memoized get water type info function
  const getWaterTypeInfo = useCallback((type: string) => {
    switch (type) {
      case 'free':
        return {
          label: t('water.free'),
          color: '#10B981',
          bgColor: '#D1FAE5',
          icon: '🆓',
        };
      case 'paid':
        return {
          label: t('water.paid'),
          color: '#F59E0B',
          bgColor: '#FEF3C7',
          icon: '💰',
        };
      case 'filtered':
        return {
          label: t('water.filtered'),
          color: '#00B4D8',
          bgColor: '#E0F2FE',
          icon: '💧',
        };
      default:
        return {
          label: t('water.unknown'),
          color: '#6B7280',
          bgColor: '#F3F4F6',
          icon: '❓',
        };
    }
  }, [t]);

  // Memoized station selection handler
  const handleStationSelect = useCallback((station: WaterStation) => {
    setSelectedStation(selectedStation?.id === station.id ? null : station);
  }, [selectedStation]);

  // Memoized call handler
  const handleCall = useCallback((phone: string) => {
    Linking.openURL(`tel:${phone}`);
  }, []);

  // Memoized back handler
  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  // Memoized tips
  const tips = useMemo(() => [
    t('water.tip1'),
    t('water.tip2'),
    t('water.tip3'),
    t('water.tip4'),
    t('water.tip5'),
  ], [t]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <ChevronLeft size={24} color="#1F2937" />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.title}>💧 {t('water.title')}</Text>
            <Text style={styles.subtitle}>{t('water.subtitle')}</Text>
          </View>
        </View>

        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Droplets size={20} color="#00B4D8" />
          <Text style={styles.infoText}>
            {t('water.infoBanner')}
          </Text>
        </View>

        {/* Water Type Legend */}
        <View style={styles.legendCard}>
          <Text style={styles.legendTitle}>{t('water.waterTypes')}:</Text>
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
              <Text style={styles.legendText}>{t('water.free')}</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
              <Text style={styles.legendText}>{t('water.paid')}</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#00B4D8' }]} />
              <Text style={styles.legendText}>{t('water.filtered')}</Text>
            </View>
          </View>
        </View>

        {/* Water Stations List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📍 {t('water.nearbyStations')}</Text>
          {waterStations.map((station) => {
            const typeInfo = getWaterTypeInfo(station.waterType);
            return (
              <TouchableOpacity 
                key={station.id} 
                style={[
                  styles.stationCard,
                  { borderLeftColor: typeInfo.color }
                ]}
                onPress={() => handleStationSelect(station)}
              >
                <View style={styles.stationHeader}>
                  <View style={styles.stationInfo}>
                    <Text style={styles.stationName}>{station.name}</Text>
                    <View style={styles.stationLocation}>
                      <MapPin size={14} color="#6B7280" />
                      <Text style={styles.locationText}>{station.location}</Text>
                      <Text style={styles.distanceText}>{station.distance} km</Text>
                    </View>
                  </View>
                  <View style={[styles.typeBadge, { backgroundColor: typeInfo.bgColor }]}>
                    <Text style={styles.typeBadgeText}>{typeInfo.icon} {typeInfo.label}</Text>
                  </View>
                </View>

                <View style={styles.stationDetails}>
                  <View style={styles.detailRow}>
                    <Clock size={14} color="#6B7280" />
                    <Text style={styles.detailText}>{station.openingHours}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <MapPin size={14} color="#6B7280" />
                    <Text style={styles.detailText}>{station.address}</Text>
                  </View>
                  {station.pricePerLiter && (
                    <View style={styles.detailRow}>
                      <Text style={styles.priceLabel}>{t('water.price')}:</Text>
                      <Text style={styles.priceText}>Rp {station.pricePerLiter.toLocaleString('de-DE')}/L</Text>
                    </View>
                  )}
                </View>

                <View style={styles.stationFeatures}>
                  <View style={styles.featureItem}>
                    <Star size={16} color="#F59E0B" />
                    <Text style={styles.featureText}>{station.rating}/5</Text>
                  </View>
                  <View style={styles.featureItem}>
                    {station.hasGeofencing ? (
                      <CheckCircle size={16} color="#10B981" />
                    ) : (
                      <AlertTriangle size={16} color="#F59E0B" />
                    )}
                    <Text style={styles.featureText}>
                      {station.hasGeofencing ? t('water.geofencing') : t('water.noGeofencing')}
                    </Text>
                  </View>
                </View>

                {/* Expanded Details */}
                {selectedStation?.id === station.id && (
                  <View style={styles.expandedDetails}>
                    {station.phone && (
                      <TouchableOpacity 
                        style={styles.callButton}
                        onPress={() => handleCall(station.phone!)}
                      >
                        <Phone size={16} color="#FFFFFF" />
                        <Text style={styles.callButtonText}>{t('water.callStation')}</Text>
                      </TouchableOpacity>
                    )}
                    
                    <View style={styles.stationTips}>
                      <Text style={styles.tipsTitle}>{t('water.stationTips')}:</Text>
                      <Text style={styles.tipText}>• {t('water.stationTip1')}</Text>
                      <Text style={styles.tipText}>• {t('water.stationTip2')}</Text>
                      <Text style={styles.tipText}>• {t('water.stationTip3')}</Text>
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Add Station Button */}
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>+ {t('water.addStation')}</Text>
        </TouchableOpacity>

        {/* Safety Tips */}
        <View style={styles.tipsCard}>
          <AlertTriangle size={20} color="#F59E0B" />
          <View style={styles.tipsContent}>
            <Text style={styles.tipsTitle}>⚠️ {t('water.safetyTips')}</Text>
            {tips.map((tip, index) => (
              <Text key={index} style={styles.tipText}>• {tip}</Text>
            ))}
          </View>
        </View>

        {/* Eco Info */}
        <View style={styles.ecoCard}>
          <Droplets size={20} color="#10B981" />
          <View style={styles.ecoContent}>
            <Text style={styles.ecoTitle}>🌱 {t('water.ecoTitle')}</Text>
            <Text style={styles.ecoText}>
              {t('water.ecoText')}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E0F7FA',
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
  headerText: {
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
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#E0F2FE',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#00B4D8',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#0369A1',
    lineHeight: 18,
  },
  legendCard: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  legendTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 11,
    color: '#6B7280',
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
  stationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  stationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  stationInfo: {
    flex: 1,
  },
  stationName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  stationLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationText: {
    fontSize: 12,
    color: '#6B7280',
  },
  distanceText: {
    fontSize: 11,
    color: '#00B4D8',
    fontWeight: '600',
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1F2937',
  },
  stationDetails: {
    gap: 6,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 12,
    color: '#6B7280',
    flex: 1,
  },
  priceLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  priceText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#90BE6D',
  },
  stationFeatures: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  featureText: {
    fontSize: 12,
    color: '#374151',
  },
  expandedDetails: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#00B4D8',
    paddingVertical: 12,
    borderRadius: 8,
  },
  callButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  stationTips: {
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 8,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#166534',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 12,
    color: '#15803D',
    marginBottom: 4,
    lineHeight: 16,
  },
  addButton: {
    backgroundColor: '#00B4D8',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  tipsCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  tipsContent: {
    flex: 1,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#92400E',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 13,
    color: '#78350F',
    marginBottom: 4,
    lineHeight: 18,
  },
  ecoCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#D1FAE5',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  ecoContent: {
    flex: 1,
  },
  ecoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#065F46',
    marginBottom: 6,
  },
  ecoText: {
    fontSize: 12,
    color: '#047857',
    lineHeight: 18,
  },
});

export default memo(WaterRefillScreen);