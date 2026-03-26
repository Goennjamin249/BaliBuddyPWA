import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Shield, ArrowLeft, Home, Calculator, MapPin, Phone, Star, AlertTriangle, CheckCircle } from 'lucide-react-native';
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

const scooterRentals: ScooterRental[] = [
  {
    id: '1',
    name: 'Bali Scooter Rental Seminyak',
    type: 'scooter',
    pricePerDay: 80000,
    includes: ['Helm', 'Versicherung', '24h Support'],
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
    includes: ['Helm', 'Versicherung', 'Tankfüllung'],
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
    includes: ['Helm', 'Versicherung', 'Lieferung'],
    rating: 4.9,
    location: 'Ubud',
    phone: '+6281234567892',
    available: false,
  },
];

export default function ScooterScreen() {
  const router = useRouter();
  const [selectedRental, setSelectedRental] = useState<ScooterRental | null>(null);
  const [days, setDays] = useState<string>('3');
  const [squadSize, setSquadSize] = useState<string>('2');

  // Calculate total cost with dynamic pricing
  const totalCost = useMemo(() => {
    if (!selectedRental) return 0;
    const basePrice = selectedRental.pricePerDay;
    const dayCount = parseInt(days) || 1;
    const memberCount = parseInt(squadSize) || 1;
    
    return calculateDynamicPrice(basePrice * dayCount, 'per_person', memberCount);
  }, [selectedRental, days, squadSize]);

  // Handle phone call
  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  // Handle booking
  const handleBook = (rental: ScooterRental) => {
    if (!rental.available) {
      Alert.alert('Nicht verfügbar', 'Diese Option ist derzeit nicht verfügbar.');
      return;
    }
    
    Alert.alert(
      'Buchung bestätigen',
      `${rental.name}\n${days} Tag(e) für ${parseInt(squadSize)} Person(en)\nGesamt: Rp ${totalCost.toLocaleString('de-DE')}`,
      [
        { text: 'Abbrechen', style: 'cancel' },
        { 
          text: 'Anrufen', 
          onPress: () => handleCall(rental.phone)
        },
      ]
    );
  };

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
            <Text style={styles.title}>🛵 Scooter Check</Text>
            <Text style={styles.subtitle}>Sicherheitscheck & Miete</Text>
          </View>
          <TouchableOpacity 
            style={styles.homeButton}
            onPress={() => router.push('/')}
          >
            <Home size={20} color="#0F172A" />
          </TouchableOpacity>
        </View>

        {/* Safety Checklist */}
        <View style={styles.safetyCard}>
          <View style={styles.safetyHeader}>
            <Shield size={24} color="#10B981" />
            <Text style={styles.safetyTitle}>🛡️ Sicherheitscheck</Text>
          </View>
          <View style={styles.checklist}>
            {[
              'Helm mit Visier tragen',
              'Versicherung prüfen',
              'Bremsen testen',
              'Licht funktioniert',
              'Reifendruck prüfen',
              'Tankfüllung kontrollieren',
            ].map((item, index) => (
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
            <Text style={styles.calculatorTitle}>💰 Preiskalkulator</Text>
          </View>
          
          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Tage:</Text>
              <TextInput
                style={styles.input}
                value={days}
                onChangeText={setDays}
                placeholder="3"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Personen:</Text>
              <TextInput
                style={styles.input}
                value={squadSize}
                onChangeText={setSquadSize}
                placeholder="2"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.priceInfo}>
            <Text style={styles.priceLabel}>Preis pro Tag:</Text>
            <Text style={styles.priceValue}>
              {getPriceRange('transport', 'scooter')}
            </Text>
          </View>

          {selectedRental && (
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Gesamtkosten:</Text>
              <Text style={styles.totalValue}>Rp {totalCost.toLocaleString('de-DE')}</Text>
              {parseInt(squadSize) >= 3 && (
                <Text style={styles.discountBadge}>
                  🎉 Gruppenrabatt: {parseInt(squadSize) >= 5 ? '15%' : '10%'}
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Rental Options */}
        <View style={styles.rentalsSection}>
          <Text style={styles.sectionTitle}>🛵 Mietoptionen</Text>
          {scooterRentals.map((rental) => (
            <TouchableOpacity
              key={rental.id}
              style={[
                styles.rentalCard,
                selectedRental?.id === rental.id && styles.rentalCardSelected,
                !rental.available && styles.rentalCardUnavailable,
              ]}
              onPress={() => rental.available && setSelectedRental(rental)}
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
                  <Text style={styles.rentalPriceUnit}>/Tag</Text>
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
                  <Text style={styles.unavailableText}>Nicht verfügbar</Text>
                </View>
              )}

              {selectedRental?.id === rental.id && (
                <TouchableOpacity
                  style={styles.bookButton}
                  onPress={() => handleBook(rental)}
                >
                  <Phone size={16} color="#FFFFFF" />
                  <Text style={styles.bookButtonText}>Jetzt anrufen</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Tips */}
        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>💡 Tipps</Text>
          <View style={styles.tipsGrid}>
            <View style={styles.tipCard}>
              <Text style={styles.tipIcon}>🛡️</Text>
              <Text style={styles.tipTitle}>Versicherung</Text>
              <Text style={styles.tipText}>Immer Vollkasko wählen</Text>
            </View>
            <View style={styles.tipCard}>
              <Text style={styles.tipIcon}>📸</Text>
              <Text style={styles.tipTitle}>Fotos</Text>
              <Text style={styles.tipText}>Schäden vorher fotografieren</Text>
            </View>
            <View style={styles.tipCard}>
              <Text style={styles.tipIcon}>⛽</Text>
              <Text style={styles.tipTitle}>Tanken</Text>
              <Text style={styles.tipText}>Voll zurückgeben</Text>
            </View>
            <View style={styles.tipCard}>
              <Text style={styles.tipIcon}>🔒</Text>
              <Text style={styles.tipTitle}>Sicherheit</Text>
              <Text style={styles.tipText}>Helm immer tragen</Text>
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