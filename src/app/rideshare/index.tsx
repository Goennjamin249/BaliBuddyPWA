import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Users, MapPin, Calendar, DollarSign, ChevronLeft, Plus, MessageCircle } from 'lucide-react-native';

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

export default function RideShareScreen() {
  const router = useRouter();
  const [rides, setRides] = useState<RideShare[]>([
    {
      id: '1',
      destination: 'Ubud Tagesausflug',
      date: '2026-03-28',
      spotsTotal: 4,
      spotsAvailable: 2,
      costPerPerson: 175000,
      totalCost: 700000,
      organizer: 'Max M.',
      description: 'Tegallalang Rice Terraces, Monkey Forest, Tirta Empul',
    },
    {
      id: '2',
      destination: 'Nusa Penida Tour',
      date: '2026-03-30',
      spotsTotal: 4,
      spotsAvailable: 3,
      costPerPerson: 200000,
      totalCost: 800000,
      organizer: 'Sarah K.',
      description: 'Kelingking Beach, Angel Billabong, Broken Beach',
    },
    {
      id: '3',
      destination: 'Uluwatu Sunset',
      date: '2026-04-01',
      spotsTotal: 3,
      spotsAvailable: 1,
      costPerPerson: 217000,
      totalCost: 650000,
      organizer: 'Tom B.',
      description: 'Uluwatu Temple, Kecak Dance, Jimbaran Bay Dinner',
    },
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newDestination, setNewDestination] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newSpots, setNewSpots] = useState('');
  const [newCost, setNewCost] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const formatIDR = (amount: number) => amount.toLocaleString('id-ID');

  const addRide = () => {
    if (newDestination && newDate && newSpots && newCost) {
      const spots = parseInt(newSpots);
      const cost = parseInt(newCost);
      if (!isNaN(spots) && !isNaN(cost) && spots > 0 && cost > 0) {
        setRides([{
          id: Date.now().toString(),
          destination: newDestination,
          date: newDate,
          spotsTotal: spots,
          spotsAvailable: spots - 1,
          costPerPerson: Math.round(cost / spots),
          totalCost: cost,
          organizer: 'Du',
          description: newDescription || 'Keine Beschreibung',
        }, ...rides]);
        setNewDestination('');
        setNewDate('');
        setNewSpots('');
        setNewCost('');
        setNewDescription('');
        setShowAddForm(false);
      }
    }
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
            <Text style={styles.title}>🚗 Ride-Share</Text>
            <Text style={styles.subtitle}>Fahrer-Kosten teilen</Text>
          </View>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <DollarSign size={24} color="#90BE6D" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Ganztägiger Fahrer</Text>
            <Text style={styles.infoText}>
              Basiskosten: IDR 650.000 - 800.000{'\n'}
              Teile die Kosten mit anderen Reisenden!
            </Text>
          </View>
        </View>

        {/* Add Ride Button */}
        {!showAddForm && (
          <TouchableOpacity 
            style={styles.addRideButton}
            onPress={() => setShowAddForm(true)}
          >
            <Plus size={20} color="#FFFFFF" />
            <Text style={styles.addRideButtonText}>Neue Fahrt erstellen</Text>
          </TouchableOpacity>
        )}

        {/* Add Ride Form */}
        {showAddForm && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>🚗 Neue Fahrt erstellen</Text>
            <TextInput
              style={styles.input}
              placeholder="Ziel (z.B. Ubud)"
              value={newDestination}
              onChangeText={setNewDestination}
            />
            <TextInput
              style={styles.input}
              placeholder="Datum (z.B. 2026-03-28)"
              value={newDate}
              onChangeText={setNewDate}
            />
            <TextInput
              style={styles.input}
              placeholder="Anzahl Plätze (inkl. dir)"
              value={newSpots}
              onChangeText={setNewSpots}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Gesamtkosten in IDR"
              value={newCost}
              onChangeText={setNewCost}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Beschreibung (optional)"
              value={newDescription}
              onChangeText={setNewDescription}
            />
            <View style={styles.formButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowAddForm(false)}
              >
                <Text style={styles.cancelButtonText}>Abbrechen</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.submitButton}
                onPress={addRide}
              >
                <Text style={styles.submitButtonText}>Erstellen</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Available Rides */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🚘 Verfügbare Fahrten</Text>
          {rides.map((ride) => (
            <View key={ride.id} style={styles.rideCard}>
              <View style={styles.rideHeader}>
                <Text style={styles.rideDestination}>{ride.destination}</Text>
                <View style={[
                  styles.spotsBadge,
                  ride.spotsAvailable === 0 && styles.spotsBadgeFull,
                ]}>
                  <Text style={styles.spotsBadgeText}>
                    {ride.spotsAvailable}/{ride.spotsTotal} Plätze
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
                  <Text style={styles.costLabel}>Pro Person:</Text>
                  <Text style={styles.costValue}>IDR {formatIDR(ride.costPerPerson)}</Text>
                </View>
                <View style={styles.costInfo}>
                  <Text style={styles.costLabel}>Gesamt:</Text>
                  <Text style={styles.costTotal}>IDR {formatIDR(ride.totalCost)}</Text>
                </View>
              </View>

              {ride.spotsAvailable > 0 && (
                <TouchableOpacity style={styles.joinButton}>
                  <MessageCircle size={16} color="#FFFFFF" />
                  <Text style={styles.joinButtonText}>Mitfahren</Text>
                </TouchableOpacity>
              )}

              {ride.spotsAvailable === 0 && (
                <View style={styles.fullBadge}>
                  <Text style={styles.fullBadgeText}>Ausgebucht</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Tips */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 Tipps</Text>
          <Text style={styles.tipText}>• Treffe dich immer an öffentlichen Orten</Text>
          <Text style={styles.tipText}>• Teile deine Reiseroute mit Freunden</Text>
          <Text style={styles.tipText}>• Bezahle erst bei Abfahrt</Text>
          <Text style={styles.tipText}>• Klare Absprache über Stopps</Text>
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