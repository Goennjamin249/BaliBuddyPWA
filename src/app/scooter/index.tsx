import React, { useState, useMemo, memo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Shield, ArrowLeft, Home, Calculator, MapPin, Phone, Star, AlertTriangle, CheckCircle } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { BALI_PRICES_2026, calculateDynamicPrice, getPriceRange } from '../../constants/bali-prices';

interface ScooterRental {
  id: string;
  name: string;
  type: 'scooter' | 'car';
  pricePerDay: number;
  includes: string[];
  rating: number;
  location: string;
  phone: string;
  available: boolean;
}

function ScooterScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [selectedRental, setSelectedRental] = useState<ScooterRental | null>(null);
  const [days, setDays] = useState<string>('3');
  const [squadSize, setSquadSize] = useState<string>('2');

  // Memoized scooter rentals
  const scooterRentals = useMemo<ScooterRental[]>(() => [
    {
      id: '1',
      name: 'Bali Scooter Rental Seminyak',
      type: 'scooter',
      pricePerDay: 80000,
      includes: [t('scooter.helmet'), t('scooter.insurance'), t('scooter.support24h')],
      rating: 4.8,
      location: 'Seminyak',
      phone: '+6281234567890',
      available: true,
    },
    {
      id: '2',
      name: 'Kuta Bike Rental',
      type: 'scooter',
      pricePerDay: 100000,
      includes: [t('scooter.helmet'), t('scooter.insurance'), t('scooter.fuel')],
      rating: 4.5,
      location: 'Kuta',
      phone: '+6281234567891',
      available: true,
    },
    {
      id: '3',
      name: 'Ubud Scooter Center',
      type: 'scooter',
      pricePerDay: 120000,
      includes: [t('scooter.helmet'), t('scooter.insurance'), t('scooter.delivery')],
      rating: 4.9,
      location: 'Ubud',
      phone: '+6281234567892',
      available: false,
    },
  ], [t]);

  // Memoized safety checklist
  const safetyChecklist = useMemo(() => [
    t('scooter.check1'),
    t('scooter.check2'),
    t('scooter.check3'),
    t('scooter.check4'),
    t('scooter.check5'),
    t('scooter.check6'),
  ], [t]);

  // Memoized tips
  const tips = useMemo(() => [
    {
      icon: '🛡️',
      title: t('scooter.insurance'),
      text: t('scooter.insuranceTip'),
    },
    {
      icon: '📸',
      title: t('scooter.photos'),
      text: t('scooter.photosTip'),
    },
    {
      icon: '⛽',
      title: t('scooter.fuel'),
      text: t('scooter.fuelTip'),
    },
    {
      icon: '🔒',
      title: t('scooter.safety'),
      text: t('scooter.safetyTip'),
    },
  ], [t]);

  // Calculate total cost with dynamic pricing
  const totalCost = useMemo(() => {
    if (!selectedRental) return 0;
    const basePrice = selectedRental.pricePerDay;
    const dayCount = parseInt(days) || 1;
    const memberCount = parseInt(squadSize) || 1;
    
    return calculateDynamicPrice(basePrice * dayCount, 'per_person', memberCount);
  }, [selectedRental, days, squadSize]);

  // Memoized handle phone call
  const handleCall = useCallback((phone: string) => {
    Linking.openURL(`tel:${phone}`);
  }, []);

  // Memoized handle booking
  const handleBook = useCallback((rental: ScooterRental) => {
    if (!rental.available) {
      Alert.alert(t('scooter.notAvailable'), t('scooter.notAvailableText'));
      return;
    }
    
    Alert.alert(
      t('scooter.confirmBooking'),
      `${rental.name}\n${days} ${t('scooter.days')} ${parseInt(squadSize)} ${t('scooter.persons')}\n${t('scooter.total')}: Rp ${totalCost.toLocaleString('de-DE')}`,
      [
        { text: t('scooter.cancel'), style: 'cancel' },
        { 
          text: t('scooter.call'), 
          onPress: () => handleCall(rental.phone)
        },
      ]
    );
  }, [days, squadSize, totalCost, handleCall, t]);

  // Memoized rental selection handler
  const handleRentalSelect = useCallback((rental: ScooterRental) => {
    if (rental.available) {
      setSelectedRental(rental);
    }
  }, []);

  // Memoized back handler
  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  // Memoized home handler
  const handleHome = useCallback(() => {
    router.push('/');
  }, [router]);

  // Memoized days change handler
  const handleDaysChange = useCallback((text: string) => {
    setDays(text);
  }, []);

  // Memoized squad size change handler
  const handleSquadSizeChange = useCallback((text: string) => {
    setSquadSize(text);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleBack}
          >
            <ArrowLeft size={24} color="#0F172A" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.title}>🛵 {t('scooter.title')}</Text>
            <Text style={styles.subtitle}>{t('scooter.subtitle')}</Text>
          </View>
          <TouchableOpacity 
            style={styles.homeButton}
            onPress={handleHome}
          >
            <Home size={20} color="#0F172A" />
          </TouchableOpacity>
        </View>

        {/* Safety Checklist */}
        <View style={styles.safetyCard}>
          <View style={styles.safetyHeader}>
            <Shield size={24} color="#10B981" />
            <Text style={styles.safetyTitle}>🛡️ {t('scooter.safetyCheck')}</Text>
          </View>
          <View style={styles.checklist}>
            {safetyChecklist.map((item, index) => (
              <View key={index} style={styles.checklistItem}>
                <CheckCircle size={16} color="#10B981" />
                <Text style={styles.checklistText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Price Calculator */}
        <View style={styles.calculatorCard}>
          <View style={styles.calculatorHeader}>
            <Calculator size={24} color="#00B4D8" />
            <Text style={styles.calculatorTitle}>💰 {t('scooter.priceCalculator')}</Text>
          </View>
          
          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('scooter.days')}:</Text>
              <TextInput
                style={styles.input}
                value={days}
                onChangeText={handleDaysChange}
                placeholder="3"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('scooter.persons')}:</Text>
              <TextInput
                style={styles.input}
                value={squadSize}
                onChangeText={handleSquadSizeChange}
                placeholder="2"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.priceInfo}>
            <Text style={styles.priceLabel}>{t('scooter.pricePerDay')}:</Text>
            <Text style={styles.priceValue}>
              {getPriceRange('transport', 'scooter')}
            </Text>
          </View>

          {selectedRental && (
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>{t('scooter.totalCost')}:</Text>
              <Text style={styles.totalValue}>Rp {totalCost.toLocaleString('de-DE')}</Text>
              {parseInt(squadSize) >= 3 && (
                <Text style={styles.discountBadge}>
                  🎉 {t('scooter.groupDiscount')}: {parseInt(squadSize) >= 5 ? '15%' : '10%'}
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Rental Options */}
        <View style={styles.rentalsSection}>
          <Text style={styles.sectionTitle}>🛵 {t('scooter.rentalOptions')}</Text>
          {scooterRentals.map((rental) => (
            <TouchableOpacity
              key={rental.id}
              style={[
                styles.rentalCard,
                selectedRental?.id === rental.id && styles.rentalCardSelected,
                !rental.available && styles.rentalCardUnavailable,
              ]}
              onPress={() => handleRentalSelect(rental)}
              disabled={!rental.available}
            >
              <View style={styles.rentalHeader}>
                <View style={styles.rentalInfo}>
                  <Text style={styles.rentalName}>{rental.name}</Text>
                  <View style={styles.rentalMeta}>
                    <MapPin size={14} color="#64748B" />
                    <Text style={styles.rentalLocation}>{rental.location}</Text>
                    <Star size={14} color="#F59E0B" fill="#F59E0B" />
                    <Text style={styles.rentalRating}>{rental.rating}</Text>
                  </View>
                </View>
                <View style={styles.rentalPrice}>
                  <Text style={styles.rentalPriceValue}>
                    Rp {rental.pricePerDay.toLocaleString('de-DE')}
                  </Text>
                  <Text style={styles.rentalPriceUnit}>/{t('scooter.day')}</Text>
                </View>
              </View>

              <View style={styles.rentalIncludes}>
                {rental.includes.map((item, index) => (
                  <View key={index} style={styles.includeItem}>
                    <CheckCircle size={12} color="#10B981" />
                    <Text style={styles.includeText}>{item}</Text>
                  </View>
                ))}
              </View>

              {!rental.available && (
                <View style={styles.unavailableBadge}>
                  <AlertTriangle size={14} color="#DC2626" />
                  <Text style={styles.unavailableText}>{t('scooter.notAvailable')}</Text>
                </View>
              )}

              {selectedRental?.id === rental.id && (
                <TouchableOpacity
                  style={styles.bookButton}
                  onPress={() => handleBook(rental)}
                >
                  <Phone size={16} color="#FFFFFF" />
                  <Text style={styles.bookButtonText}>{t('scooter.callNow')}</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Tips */}
        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>💡 {t('scooter.tips')}</Text>
          <View style={styles.tipsGrid}>
            {tips.map((tip, index) => (
              <View key={index} style={styles.tipCard}>
                <Text style={styles.tipIcon}>{tip.icon}</Text>
                <Text style={styles.tipTitle}>{tip.title}</Text>
                <Text style={styles.tipText}>{tip.text}</Text>
              </View>
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
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
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
  safetyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  safetyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  safetyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  checklist: {
    gap: 12,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checklistText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  calculatorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  calculatorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  calculatorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  priceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  priceLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  totalContainer: {
    backgroundColor: '#F0FDF4',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 4,
  },
  totalValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#10B981',
    marginBottom: 8,
  },
  discountBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '600',
    color: '#065F46',
  },
  rentalsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 16,
  },
  rentalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  rentalCardSelected: {
    borderColor: '#00B4D8',
  },
  rentalCardUnavailable: {
    opacity: 0.6,
  },
  rentalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  rentalInfo: {
    flex: 1,
  },
  rentalName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
  },
  rentalMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rentalLocation: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  rentalRating: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F59E0B',
  },
  rentalPrice: {
    alignItems: 'flex-end',
  },
  rentalPriceValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#00B4D8',
  },
  rentalPriceUnit: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  rentalIncludes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  includeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  includeText: {
    fontSize: 11,
    color: '#065F46',
    fontWeight: '500',
  },
  unavailableBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 12,
  },
  unavailableText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '600',
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#00B4D8',
    paddingVertical: 12,
    borderRadius: 12,
  },
  bookButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
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

export default memo(ScooterScreen);