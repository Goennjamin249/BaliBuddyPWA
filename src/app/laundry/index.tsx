import React, { useState, memo, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MapPin, Shirt, Clock, Phone, ChevronLeft, Star, AlertTriangle, CheckCircle, DollarSign } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

interface Laundry {
  id: string;
  name: string;
  location: string;
  address: string;
  pricePerKg: number;
  services: string[];
  openingHours: string;
  distance: number;
  rating: number;
  phone?: string;
}

function LaundryFinderScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [selectedLaundry, setSelectedLaundry] = useState<Laundry | null>(null);

  // Memoized laundries data
  const laundries = useMemo<Laundry[]>(() => [
    {
      id: '1',
      name: 'Clean & Fresh Laundry',
      location: 'Ubud',
      address: 'Jl. Hanoman No. 123',
      pricePerKg: 8000,
      services: ['Wash', 'Dry', 'Iron'],
      openingHours: '08:00 - 20:00',
      distance: 0.3,
      rating: 4.8,
      phone: '0361-123456',
    },
    {
      id: '2',
      name: 'Express Laundry 24h',
      location: 'Seminyak',
      address: 'Jl. Legian No. 456',
      pricePerKg: 10000,
      services: ['Wash', 'Dry', 'Iron', 'Express'],
      openingHours: '24h',
      distance: 0.5,
      rating: 4.5,
      phone: '0361-234567',
    },
    {
      id: '3',
      name: 'Budget Laundry',
      location: 'Kuta',
      address: 'Near Beachwalk Mall',
      pricePerKg: 6000,
      services: ['Wash', 'Dry'],
      openingHours: '09:00 - 21:00',
      distance: 0.8,
      rating: 4.2,
    },
    {
      id: '4',
      name: 'Premium Dry Clean',
      location: 'Canggu',
      address: 'Jl. Batu Bolong No. 789',
      pricePerKg: 15000,
      services: ['Wash', 'Dry', 'Iron', 'Dry Clean', 'Express'],
      openingHours: '07:00 - 22:00',
      distance: 1.2,
      rating: 4.9,
      phone: '0361-345678',
    },
    {
      id: '5',
      name: 'Local Warung Laundry',
      location: 'Denpasar',
      address: 'Jl. Veteran No. 321',
      pricePerKg: 5000,
      services: ['Wash', 'Dry'],
      openingHours: '08:00 - 18:00',
      distance: 2.5,
      rating: 4.0,
    },
  ], []);

  // Memoized get service icon function
  const getServiceIcon = useCallback((service: string) => {
    switch (service) {
      case 'Wash': return '🧺';
      case 'Dry': return '🌀';
      case 'Iron': return '👔';
      case 'Dry Clean': return '✨';
      case 'Express': return '⚡';
      default: return '•';
    }
  }, []);

  // Memoized laundry selection handler
  const handleLaundrySelect = useCallback((laundry: Laundry) => {
    setSelectedLaundry(selectedLaundry?.id === laundry.id ? null : laundry);
  }, [selectedLaundry]);

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
    t('laundry.tip1'),
    t('laundry.tip2'),
    t('laundry.tip3'),
    t('laundry.tip4'),
    t('laundry.tip5'),
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
            <Text style={styles.title}>🧺 {t('laundry.title')}</Text>
            <Text style={styles.subtitle}>{t('laundry.subtitle')}</Text>
          </View>
        </View>

        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Shirt size={20} color="#9333EA" />
          <Text style={styles.infoText}>
            {t('laundry.infoBanner')}
          </Text>
        </View>

        {/* Price Legend */}
        <View style={styles.legendCard}>
          <Text style={styles.legendTitle}>{t('laundry.priceRange')}:</Text>
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
              <Text style={styles.legendText}>{t('laundry.budget')} ({"<7k/kg"})</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
              <Text style={styles.legendText}>{t('laundry.midRange')} (7-12k/kg)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#9333EA' }]} />
              <Text style={styles.legendText}>{t('laundry.premium')} ({">12k/kg"})</Text>
            </View>
          </View>
        </View>

        {/* Laundries List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📍 {t('laundry.nearbyLaundries')}</Text>
          {laundries.map((laundry) => {
            const priceColor = laundry.pricePerKg < 7000 ? '#10B981' : laundry.pricePerKg < 12000 ? '#F59E0B' : '#9333EA';
            return (
              <TouchableOpacity 
                key={laundry.id} 
                style={[
                  styles.laundryCard,
                  { borderLeftColor: priceColor }
                ]}
                onPress={() => handleLaundrySelect(laundry)}
              >
                <View style={styles.laundryHeader}>
                  <View style={styles.laundryInfo}>
                    <Text style={styles.laundryName}>{laundry.name}</Text>
                    <View style={styles.laundryLocation}>
                      <MapPin size={14} color="#6B7280" />
                      <Text style={styles.locationText}>{laundry.location}</Text>
                      <Text style={styles.distanceText}>{laundry.distance} km</Text>
                    </View>
                  </View>
                  <View style={[styles.priceBadge, { backgroundColor: priceColor + '20' }]}>
                    <DollarSign size={14} color={priceColor} />
                    <Text style={[styles.priceBadgeText, { color: priceColor }]}>
                      Rp {laundry.pricePerKg.toLocaleString('de-DE')}/kg
                    </Text>
                  </View>
                </View>

                <View style={styles.laundryDetails}>
                  <View style={styles.detailRow}>
                    <Clock size={14} color="#6B7280" />
                    <Text style={styles.detailText}>{laundry.openingHours}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <MapPin size={14} color="#6B7280" />
                    <Text style={styles.detailText}>{laundry.address}</Text>
                  </View>
                </View>

                <View style={styles.servicesContainer}>
                  {laundry.services.map((service, index) => (
                    <View key={index} style={styles.serviceTag}>
                      <Text style={styles.serviceText}>{getServiceIcon(service)} {service}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.laundryFeatures}>
                  <View style={styles.featureItem}>
                    <Star size={16} color="#F59E0B" />
                    <Text style={styles.featureText}>{laundry.rating}/5</Text>
                  </View>
                </View>

                {/* Expanded Details */}
                {selectedLaundry?.id === laundry.id && (
                  <View style={styles.expandedDetails}>
                    {laundry.phone && (
                      <TouchableOpacity 
                        style={styles.callButton}
                        onPress={() => handleCall(laundry.phone!)}
                      >
                        <Phone size={16} color="#FFFFFF" />
                        <Text style={styles.callButtonText}>{t('laundry.callLaundry')}</Text>
                      </TouchableOpacity>
                    )}
                    
                    <View style={styles.laundryTips}>
                      <Text style={styles.tipsTitle}>{t('laundry.laundryTips')}:</Text>
                      <Text style={styles.tipText}>• {t('laundry.laundryTip1')}</Text>
                      <Text style={styles.tipText}>• {t('laundry.laundryTip2')}</Text>
                      <Text style={styles.tipText}>• {t('laundry.laundryTip3')}</Text>
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Add Laundry Button */}
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>+ {t('laundry.addLaundry')}</Text>
        </TouchableOpacity>

        {/* Service Types Info */}
        <View style={styles.serviceInfoCard}>
          <Shirt size={20} color="#9333EA" />
          <View style={styles.serviceInfoContent}>
            <Text style={styles.serviceInfoTitle}>🧺 {t('laundry.serviceTypes')}</Text>
            <Text style={styles.serviceInfoText}>
              {t('laundry.serviceTypesInfo')}
            </Text>
          </View>
        </View>

        {/* Tips */}
        <View style={styles.tipsCard}>
          <AlertTriangle size={20} color="#F59E0B" />
          <View style={styles.tipsContent}>
            <Text style={styles.tipsTitle}>💡 {t('laundry.tips')}</Text>
            {tips.map((tip, index) => (
              <Text key={index} style={styles.tipText}>• {tip}</Text>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3E8FF',
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
    backgroundColor: '#F3E8FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#9333EA',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#581C87',
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
  laundryCard: {
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
  laundryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  laundryInfo: {
    flex: 1,
  },
  laundryName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  laundryLocation: {
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
    color: '#9333EA',
    fontWeight: '600',
  },
  priceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priceBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  laundryDetails: {
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
  servicesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  serviceTag: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  serviceText: {
    fontSize: 11,
    color: '#581C87',
    fontWeight: '500',
  },
  laundryFeatures: {
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
    backgroundColor: '#9333EA',
    paddingVertical: 12,
    borderRadius: 8,
  },
  callButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  laundryTips: {
    backgroundColor: '#F3E8FF',
    padding: 12,
    borderRadius: 8,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#581C87',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 12,
    color: '#7C3AED',
    marginBottom: 4,
    lineHeight: 16,
  },
  addButton: {
    backgroundColor: '#9333EA',
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
  serviceInfoCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#F3E8FF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#9333EA',
  },
  serviceInfoContent: {
    flex: 1,
  },
  serviceInfoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#581C87',
    marginBottom: 6,
  },
  serviceInfoText: {
    fontSize: 12,
    color: '#7C3AED',
    lineHeight: 18,
  },
  tipsCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 12,
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
});

export default memo(LaundryFinderScreen);