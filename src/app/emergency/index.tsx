import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { AlertTriangle, Phone, MapPin, Shield, Heart, ChevronLeft } from 'lucide-react-native';

export default function EmergencyScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  const emergencyContacts = [
    {
      id: 'police',
      name: 'Polizei',
      number: '110',
      icon: <Shield size={24} color="#3B82F6" />,
      description: 'Für Verbrechen und Sicherheitsprobleme',
    },
    {
      id: 'ambulance',
      name: 'Krankenwagen',
      number: '118',
      icon: <Heart size={24} color="#EF4444" />,
      description: 'Für medizinische Notfälle',
    },
    {
      id: 'fire',
      name: 'Feuerwehr',
      number: '113',
      icon: <AlertTriangle size={24} color="#F59E0B" />,
      description: 'Für Brände und Rettung',
    },
    {
      id: 'tourist_police',
      name: 'Touristenpolizei',
      number: '0361-224111',
      icon: <Shield size={24} color="#10B981" />,
      description: 'Speziell für Touristen',
    },
  ];

  const hospitals = [
    {
      id: '1',
      name: 'RSUP Sanglah',
      address: 'Jl. Diponegoro, Denpasar',
      phone: '0361-227911',
      distance: '2.5 km',
    },
    {
      id: '2',
      name: 'BIMC Hospital',
      address: 'Jl. Bypass Ngurah Rai, Kuta',
      phone: '0361-761263',
      distance: '5.1 km',
    },
  ];

  const handleCall = (number: string) => {
    Linking.openURL(`tel:${number}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ChevronLeft size={24} color="#1F2937" />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.title}>🚨 Notfall-Dashboard</Text>
            <Text style={styles.subtitle}>Sofortige Hilfe in Bali</Text>
          </View>
        </View>

        {/* Emergency Contacts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📞 Notfallkontakte</Text>
          {emergencyContacts.map((contact) => (
            <TouchableOpacity 
              key={contact.id}
              style={styles.contactCard}
              onPress={() => handleCall(contact.number)}
            >
              <View style={styles.contactIcon}>
                {contact.icon}
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>{contact.name}</Text>
                <Text style={styles.contactDescription}>{contact.description}</Text>
              </View>
              <View style={styles.contactNumber}>
                <Text style={styles.numberText}>{contact.number}</Text>
                <Phone size={16} color="#00B4D8" />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Nearest Hospitals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏥 Nächste Krankenhäuser</Text>
          {hospitals.map((hospital) => (
            <View key={hospital.id} style={styles.hospitalCard}>
              <View style={styles.hospitalHeader}>
                <Text style={styles.hospitalName}>{hospital.name}</Text>
                <Text style={styles.hospitalDistance}>{hospital.distance}</Text>
              </View>
              <View style={styles.hospitalDetails}>
                <View style={styles.hospitalDetail}>
                  <MapPin size={14} color="#6B7280" />
                  <Text style={styles.hospitalAddress}>{hospital.address}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.hospitalPhone}
                  onPress={() => handleCall(hospital.phone)}
                >
                  <Phone size={14} color="#00B4D8" />
                  <Text style={styles.hospitalPhoneText}>{hospital.phone}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Safety Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💡 Sicherheitstipps</Text>
          <View style={styles.tipsCard}>
            <Text style={styles.tipText}>• Bewahre Kopien deines Reisepasses sicher auf</Text>
            <Text style={styles.tipText}>• Teile deinen Standort mit Vertrauenspersonen</Text>
            <Text style={styles.tipText}>• Lade die Offline-Karte herunter</Text>
            <Text style={styles.tipText}>• Trage immer Bargeld für Notfälle mit</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEF2F2',
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  contactIcon: {
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  contactDescription: {
    fontSize: 12,
    color: '#6B7280',
  },
  contactNumber: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  numberText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00B4D8',
  },
  hospitalCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  hospitalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  hospitalName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  hospitalDistance: {
    fontSize: 12,
    color: '#00B4D8',
    fontWeight: '500',
  },
  hospitalDetails: {
    gap: 8,
  },
  hospitalDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  hospitalAddress: {
    fontSize: 13,
    color: '#6B7280',
    flex: 1,
  },
  hospitalPhone: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  hospitalPhoneText: {
    fontSize: 13,
    color: '#00B4D8',
    fontWeight: '500',
  },
  tipsCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tipText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
    lineHeight: 20,
  },
});