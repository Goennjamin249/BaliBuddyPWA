import React, { useState, memo, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Users, MapPin, Calendar, DollarSign, ChevronLeft, Plus, MessageCircle } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

interface RideShare {
  id: string;
  destination: string;
  date: string;
  spotsTotal: number;
  spotsAvailable: number;
  costPerPerson: number;
  totalCost: number;
  organizer: string;
  description: string;
}

function RideShareScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  // Memoized initial rides
  const initialRides = useMemo<RideShare[]>(() => [
    {
      id: '1',
      destination: t('rideshare.ubudTrip'),
      date: '2026-03-28',
      spotsTotal: 4,
      spotsAvailable: 2,
      costPerPerson: 175000,
      totalCost: 700000,
      organizer: 'Max M.',
      description: t('rideshare.ubudDescription'),
    },
    {
      id: '2',
      destination: t('rideshare.nusaPenida'),
      date: '2026-03-30',
      spotsTotal: 4,
      spotsAvailable: 3,
      costPerPerson: 200000,
      totalCost: 800000,
      organizer: 'Sarah K.',
      description: t('rideshare.nusaPenidaDescription'),
    },
    {
      id: '3',
      destination: t('rideshare.uluwatu'),
      date: '2026-04-01',
      spotsTotal: 3,
      spotsAvailable: 1,
      costPerPerson: 217000,
      totalCost: 650000,
      organizer: 'Tom B.',
      description: t('rideshare.uluwatuDescription'),
    },
  ], [t]);

  const [rides, setRides] = useState<RideShare[]>(initialRides);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDestination, setNewDestination] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newSpots, setNewSpots] = useState('');
  const [newCost, setNewCost] = useState('');
  const [newDescription, setNewDescription] = useState('');

  // Memoized format IDR function
  const formatIDR = useCallback((amount: number) => amount.toLocaleString('id-ID'), []);

  // Memoized add ride handler
  const addRide = useCallback(() => {
    if (newDestination && newDate && newSpots && newCost) {
      const spots = parseInt(newSpots);
      const cost = parseInt(newCost);
      if (!isNaN(spots) && !isNaN(cost) && spots > 0 && cost > 0) {
        setRides(prev => [{
          id: Date.now().toString(),
          destination: newDestination,
          date: newDate,
          spotsTotal: spots,
          spotsAvailable: spots - 1,
          costPerPerson: Math.round(cost / spots),
          totalCost: cost,
          organizer: t('rideshare.you'),
          description: newDescription || t('rideshare.noDescription'),
        }, ...prev]);
        setNewDestination('');
        setNewDate('');
        setNewSpots('');
        setNewCost('');
        setNewDescription('');
        setShowAddForm(false);
      }
    }
  }, [newDestination, newDate, newSpots, newCost, newDescription, t]);

  // Memoized show form handler
  const handleShowForm = useCallback(() => {
    setShowAddForm(true);
  }, []);

  // Memoized hide form handler
  const handleHideForm = useCallback(() => {
    setShowAddForm(false);
  }, []);

  // Memoized input handlers
  const handleDestinationChange = useCallback((text: string) => {
    setNewDestination(text);
  }, []);

  const handleDateChange = useCallback((text: string) => {
    setNewDate(text);
  }, []);

  const handleSpotsChange = useCallback((text: string) => {
    setNewSpots(text);
  }, []);

  const handleCostChange = useCallback((text: string) => {
    setNewCost(text);
  }, []);

  const handleDescriptionChange = useCallback((text: string) => {
    setNewDescription(text);
  }, []);

  // Memoized back handler
  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  // Memoized tips
  const tips = useMemo(() => [
    t('rideshare.tip1'),
    t('rideshare.tip2'),
    t('rideshare.tip3'),
    t('rideshare.tip4'),
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
            <Text style={styles.title}>🚗 {t('rideshare.title')}</Text>
            <Text style={styles.subtitle}>{t('rideshare.subtitle')}</Text>
          </View>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <DollarSign size={24} color="#90BE6D" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>{t('rideshare.fullDayDriver')}</Text>
            <Text style={styles.infoText}>
              {t('rideshare.baseCosts')}
            </Text>
          </View>
        </View>

        {/* Add Ride Button */}
        {!showAddForm && (
          <TouchableOpacity 
            style={styles.addRideButton}
            onPress={handleShowForm}
          >
            <Plus size={20} color="#FFFFFF" />
            <Text style={styles.addRideButtonText}>{t('rideshare.createRide')}</Text>
          </TouchableOpacity>
        )}

        {/* Add Ride Form */}
        {showAddForm && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>🚗 {t('rideshare.createRide')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('rideshare.destinationPlaceholder')}
              value={newDestination}
              onChangeText={handleDestinationChange}
            />
            <TextInput
              style={styles.input}
              placeholder={t('rideshare.datePlaceholder')}
              value={newDate}
              onChangeText={handleDateChange}
            />
            <TextInput
              style={styles.input}
              placeholder={t('rideshare.spotsPlaceholder')}
              value={newSpots}
              onChangeText={handleSpotsChange}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder={t('rideshare.costPlaceholder')}
              value={newCost}
              onChangeText={handleCostChange}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder={t('rideshare.descriptionPlaceholder')}
              value={newDescription}
              onChangeText={handleDescriptionChange}
            />
            <View style={styles.formButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={handleHideForm}
              >
                <Text style={styles.cancelButtonText}>{t('rideshare.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.submitButton}
                onPress={addRide}
              >
                <Text style={styles.submitButtonText}>{t('rideshare.create')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Available Rides */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🚘 {t('rideshare.availableRides')}</Text>
          {rides.map((ride) => (
            <View key={ride.id} style={styles.rideCard}>
              <View style={styles.rideHeader}>
                <Text style={styles.rideDestination}>{ride.destination}</Text>
                <View style={[
                  styles.spotsBadge,
                  ride.spotsAvailable === 0 && styles.spotsBadgeFull,
                ]}>
                  <Text style={styles.spotsBadgeText}>
                    {ride.spotsAvailable}/{ride.spotsTotal} {t('rideshare.spots')}
                  </Text>
                </View>
              </View>
              
              <Text style={styles.rideDescription}>{ride.description}</Text>
              
              <View style={styles.rideDetails}>
                <View style={styles.rideDetail}>
                  <Calendar size={14} color="#6B7280" />
                  <Text style={styles.rideDetailText}>{ride.date}</Text>
                </View>
                <View style={styles.rideDetail}>
                  <Users size={14} color="#6B7280" />
                  <Text style={styles.rideDetailText}>{ride.organizer}</Text>
                </View>
              </View>

              <View style={styles.rideFooter}>
                <View style={styles.costInfo}>
                  <Text style={styles.costLabel}>{t('rideshare.perPerson')}:</Text>
                  <Text style={styles.costValue}>IDR {formatIDR(ride.costPerPerson)}</Text>
                </View>
                <View style={styles.costInfo}>
                  <Text style={styles.costLabel}>{t('rideshare.total')}:</Text>
                  <Text style={styles.costTotal}>IDR {formatIDR(ride.totalCost)}</Text>
                </View>
              </View>

              {ride.spotsAvailable > 0 && (
                <TouchableOpacity style={styles.joinButton}>
                  <MessageCircle size={16} color="#FFFFFF" />
                  <Text style={styles.joinButtonText}>{t('rideshare.join')}</Text>
                </TouchableOpacity>
              )}

              {ride.spotsAvailable === 0 && (
                <View style={styles.fullBadge}>
                  <Text style={styles.fullBadgeText}>{t('rideshare.full')}</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Tips */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 {t('rideshare.tips')}</Text>
          {tips.map((tip, index) => (
            <Text key={index} style={styles.tipText}>• {tip}</Text>
          ))}
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  infoCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#D1FAE5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#065F46',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: '#047857',
    lineHeight: 18,
  },
  addRideButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#00B4D8',
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  addRideButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    fontSize: 14,
    marginBottom: 8,
  },
  formButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  submitButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#00B4D8',
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
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
  rideCard: {
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
  rideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  rideDestination: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  spotsBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  spotsBadgeFull: {
    backgroundColor: '#FEE2E2',
  },
  spotsBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#065F46',
  },
  rideDescription: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 12,
    lineHeight: 18,
  },
  rideDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  rideDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rideDetailText: {
    fontSize: 12,
    color: '#6B7280',
  },
  rideFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginBottom: 12,
  },
  costInfo: {
    alignItems: 'center',
  },
  costLabel: {
    fontSize: 11,
    color: '#6B7280',
  },
  costValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#90BE6D',
  },
  costTotal: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#00B4D8',
    padding: 12,
    borderRadius: 8,
  },
  joinButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  fullBadge: {
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  fullBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DC2626',
  },
  tipsCard: {
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 12,
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

export default memo(RideShareScreen);