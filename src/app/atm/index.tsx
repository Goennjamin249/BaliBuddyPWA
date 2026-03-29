import React, { useState, memo, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MapPin, Shield, AlertTriangle, Clock, Phone, ChevronLeft, CheckCircle, XCircle } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

interface ATM {
  id: string;
  bankName: string;
  location: string;
  address: string;
  isInsideBank: boolean;
  hasSecurityGuard: boolean;
  hasSkimmingProtection: boolean;
  openingHours: string;
  distance: number;
  safetyRating: 'safe' | 'moderate' | 'risky';
  phone?: string;
}

function SafeATMScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [selectedATM, setSelectedATM] = useState<ATM | null>(null);

  // Memoized ATMs data
  const atms = useMemo<ATM[]>(() => [
    {
      id: '1',
      bankName: 'BCA',
      location: 'Kuta',
      address: 'Jl. Raya Kuta No. 123',
      isInsideBank: true,
      hasSecurityGuard: true,
      hasSkimmingProtection: true,
      openingHours: '08:00 - 21:00',
      distance: 0.3,
      safetyRating: 'safe',
      phone: '0361-123456',
    },
    {
      id: '2',
      bankName: 'Mandiri',
      location: 'Seminyak',
      address: 'Jl. Legian No. 456',
      isInsideBank: true,
      hasSecurityGuard: true,
      hasSkimmingProtection: true,
      openingHours: '08:00 - 20:00',
      distance: 0.5,
      safetyRating: 'safe',
      phone: '0361-234567',
    },
    {
      id: '3',
      bankName: 'BNI',
      location: 'Ubud',
      address: 'Jl. Monkey Forest No. 789',
      isInsideBank: false,
      hasSecurityGuard: false,
      hasSkimmingProtection: true,
      openingHours: '24h',
      distance: 0.8,
      safetyRating: 'moderate',
    },
    {
      id: '4',
      bankName: 'BRI',
      location: 'Canggu',
      address: 'Jl. Batu Bolong No. 321',
      isInsideBank: true,
      hasSecurityGuard: true,
      hasSkimmingProtection: true,
      openingHours: '08:00 - 19:00',
      distance: 1.2,
      safetyRating: 'safe',
      phone: '0361-345678',
    },
    {
      id: '5',
      bankName: 'ATM Bersama',
      location: 'Kuta Beach',
      address: 'Near Beachwalk Mall',
      isInsideBank: false,
      hasSecurityGuard: false,
      hasSkimmingProtection: false,
      openingHours: '24h',
      distance: 0.2,
      safetyRating: 'risky',
    },
  ], []);

  // Memoized get safety color function
  const getSafetyColor = useCallback((rating: string) => {
    switch (rating) {
      case 'safe': return '#10B981';
      case 'moderate': return '#F59E0B';
      case 'risky': return '#FF6B6B';
      default: return '#6B7280';
    }
  }, []);

  // Memoized get safety label function
  const getSafetyLabel = useCallback((rating: string) => {
    switch (rating) {
      case 'safe': return t('atm.safe');
      case 'moderate': return t('atm.moderate');
      case 'risky': return t('atm.risky');
      default: return t('atm.unknown');
    }
  }, [t]);

  // Memoized ATM selection handler
  const handleATMSelect = useCallback((atm: ATM) => {
    setSelectedATM(selectedATM?.id === atm.id ? null : atm);
  }, [selectedATM]);

  // Memoized call handler
  const handleCall = useCallback((phone: string) => {
    Linking.openURL(`tel:${phone}`);
  }, []);

  // Memoized back handler
  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  // Memoized safety tips
  const safetyTips = useMemo(() => [
    t('atm.tip1'),
    t('atm.tip2'),
    t('atm.tip3'),
    t('atm.tip4'),
    t('atm.tip5'),
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
            <Text style={styles.title}>🏦 {t('atm.title')}</Text>
            <Text style={styles.subtitle}>{t('atm.subtitle')}</Text>
          </View>
        </View>

        {/* Warning Banner */}
        <View style={styles.warningBanner}>
          <AlertTriangle size={20} color="#FF6B6B" />
          <Text style={styles.warningText}>
            ⚠️ {t('atm.warning')}
          </Text>
        </View>

        {/* Safety Legend */}
        <View style={styles.legendCard}>
          <Text style={styles.legendTitle}>{t('atm.safetyLegend')}:</Text>
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
              <Text style={styles.legendText}>{t('atm.safe')}</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
              <Text style={styles.legendText}>{t('atm.moderate')}</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#FF6B6B' }]} />
              <Text style={styles.legendText}>{t('atm.risky')}</Text>
            </View>
          </View>
        </View>

        {/* ATM List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📍 {t('atm.nearbyATMs')}</Text>
          {atms.map((atm) => (
            <TouchableOpacity 
              key={atm.id} 
              style={[
                styles.atmCard,
                { borderLeftColor: getSafetyColor(atm.safetyRating) }
              ]}
              onPress={() => handleATMSelect(atm)}
            >
              <View style={styles.atmHeader}>
                <View style={styles.atmInfo}>
                  <Text style={styles.bankName}>{atm.bankName}</Text>
                  <View style={styles.atmLocation}>
                    <MapPin size={14} color="#6B7280" />
                    <Text style={styles.locationText}>{atm.location}</Text>
                    <Text style={styles.distanceText}>{atm.distance} km</Text>
                  </View>
                </View>
                <View style={[styles.safetyBadge, { backgroundColor: getSafetyColor(atm.safetyRating) }]}>
                  <Text style={styles.safetyBadgeText}>{getSafetyLabel(atm.safetyRating)}</Text>
                </View>
              </View>

              <View style={styles.atmDetails}>
                <View style={styles.detailRow}>
                  <Clock size={14} color="#6B7280" />
                  <Text style={styles.detailText}>{atm.openingHours}</Text>
                </View>
                <View style={styles.detailRow}>
                  <MapPin size={14} color="#6B7280" />
                  <Text style={styles.detailText}>{atm.address}</Text>
                </View>
              </View>

              {/* Safety Features */}
              <View style={styles.safetyFeatures}>
                <View style={styles.featureItem}>
                  {atm.isInsideBank ? (
                    <CheckCircle size={16} color="#10B981" />
                  ) : (
                    <XCircle size={16} color="#FF6B6B" />
                  )}
                  <Text style={styles.featureText}>{t('atm.insideBank')}</Text>
                </View>
                <View style={styles.featureItem}>
                  {atm.hasSecurityGuard ? (
                    <CheckCircle size={16} color="#10B981" />
                  ) : (
                    <XCircle size={16} color="#FF6B6B" />
                  )}
                  <Text style={styles.featureText}>{t('atm.securityGuard')}</Text>
                </View>
                <View style={styles.featureItem}>
                  {atm.hasSkimmingProtection ? (
                    <CheckCircle size={16} color="#10B981" />
                  ) : (
                    <XCircle size={16} color="#FF6B6B" />
                  )}
                  <Text style={styles.featureText}>{t('atm.skimmingProtection')}</Text>
                </View>
              </View>

              {/* Expanded Details */}
              {selectedATM?.id === atm.id && (
                <View style={styles.expandedDetails}>
                  {atm.phone && (
                    <TouchableOpacity 
                      style={styles.callButton}
                      onPress={() => handleCall(atm.phone!)}
                    >
                      <Phone size={16} color="#FFFFFF" />
                      <Text style={styles.callButtonText}>{t('atm.callBank')}</Text>
                    </TouchableOpacity>
                  )}
                  
                  {atm.safetyRating === 'risky' && (
                    <View style={styles.riskyWarning}>
                      <AlertTriangle size={16} color="#FF6B6B" />
                      <Text style={styles.riskyWarningText}>
                        {t('atm.riskyWarning')}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Safety Tips */}
        <View style={styles.tipsCard}>
          <Shield size={20} color="#00B4D8" />
          <View style={styles.tipsContent}>
            <Text style={styles.tipsTitle}>🛡️ {t('atm.safetyTips')}</Text>
            {safetyTips.map((tip, index) => (
              <Text key={index} style={styles.tipText}>• {tip}</Text>
            ))}
          </View>
        </View>

        {/* Skimming Info */}
        <View style={styles.skimmingCard}>
          <AlertTriangle size={20} color="#F59E0B" />
          <View style={styles.skimmingContent}>
            <Text style={styles.skimmingTitle}>⚠️ {t('atm.skimmingTitle')}</Text>
            <Text style={styles.skimmingText}>
              {t('atm.skimmingText')}
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
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: '#991B1B',
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
  atmCard: {
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
  atmHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  atmInfo: {
    flex: 1,
  },
  bankName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  atmLocation: {
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
  safetyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  safetyBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  atmDetails: {
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
  safetyFeatures: {
    gap: 6,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  riskyWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 8,
  },
  riskyWarningText: {
    fontSize: 12,
    color: '#991B1B',
    flex: 1,
    lineHeight: 16,
  },
  tipsCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#E0F2FE',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  tipsContent: {
    flex: 1,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0C4A6E',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 13,
    color: '#0369A1',
    marginBottom: 4,
    lineHeight: 18,
  },
  skimmingCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#FFFBEB',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  skimmingContent: {
    flex: 1,
  },
  skimmingTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#92400E',
    marginBottom: 6,
  },
  skimmingText: {
    fontSize: 12,
    color: '#78350F',
    lineHeight: 18,
  },
});

export default memo(SafeATMScreen);