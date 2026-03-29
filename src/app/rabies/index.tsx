import React, { memo, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { AlertTriangle, Phone, MapPin, Shield, Heart, ChevronLeft, Clock, CheckCircle } from 'lucide-react-native';

function RabiesSOSScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  // Memoized emergency contacts
  const emergencyContacts = useMemo(() => [
    {
      id: 'ambulance',
      name: t('rabies.ambulance'),
      number: '118',
      icon: <Heart size={24} color="#EF4444" />,
      description: t('rabies.ambulanceDesc'),
    },
    {
      id: 'tourist_police',
      name: t('rabies.touristPolice'),
      number: '0361-224111',
      icon: <Shield size={24} color="#10B981" />,
      description: t('rabies.touristPoliceDesc'),
    },
  ], [t]);

  // Memoized PEP clinics
  const pepClinics = useMemo(() => [
    {
      id: '1',
      name: 'RSUP Sanglah',
      address: 'Jl. Diponegoro, Denpasar',
      phone: '0361-227911',
      distance: '2.5 km',
      hasPEP: true,
      open24h: true,
    },
    {
      id: '2',
      name: 'BIMC Hospital',
      address: 'Jl. Bypass Ngurah Rai, Kuta',
      phone: '0361-761263',
      distance: '5.1 km',
      hasPEP: true,
      open24h: true,
    },
    {
      id: '3',
      name: 'Kasih Ibu Hospital',
      address: 'Jl. Teuku Umar, Denpasar',
      phone: '0361-223036',
      distance: '3.2 km',
      hasPEP: true,
      open24h: false,
    },
  ], []);

  // Memoized first aid steps
  const firstAidSteps = useMemo(() => [
    {
      step: 1,
      title: t('rabies.step1Title'),
      description: t('rabies.step1Desc'),
      icon: '🧼',
    },
    {
      step: 2,
      title: t('rabies.step2Title'),
      description: t('rabies.step2Desc'),
      icon: '💧',
    },
    {
      step: 3,
      title: t('rabies.step3Title'),
      description: t('rabies.step3Desc'),
      icon: '🏥',
    },
    {
      step: 4,
      title: t('rabies.step4Title'),
      description: t('rabies.step4Desc'),
      icon: '💉',
    },
  ], [t]);

  // Memoized symptoms
  const symptoms = useMemo(() => [
    t('rabies.symptom1'),
    t('rabies.symptom2'),
    t('rabies.symptom3'),
    t('rabies.symptom4'),
    t('rabies.symptom5'),
    t('rabies.symptom6'),
  ], [t]);

  // Memoized prevention tips
  const preventionTips = useMemo(() => [
    t('rabies.prevention1'),
    t('rabies.prevention2'),
    t('rabies.prevention3'),
    t('rabies.prevention4'),
  ], [t]);

  // Memoized call handler
  const handleCall = useCallback((number: string) => {
    Linking.openURL(`tel:${number}`);
  }, []);

  // Memoized back handler
  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <ChevronLeft size={24} color="#1F2937" />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.title}>🐕 {t('rabies.title')}</Text>
            <Text style={styles.subtitle}>{t('rabies.subtitle')}</Text>
          </View>
        </View>

        {/* Alert Banner */}
        <View style={styles.alertBanner}>
          <AlertTriangle size={32} color="#DC2626" />
          <View style={styles.alertContent}>
            <Text style={styles.alertTitle}>{t('rabies.alertTitle')}</Text>
            <Text style={styles.alertText}>{t('rabies.alertText')}</Text>
          </View>
        </View>

        {/* Emergency Contacts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📞 {t('rabies.emergencyContacts')}</Text>
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

        {/* First Aid Steps */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🚑 {t('rabies.firstAid')}</Text>
          {firstAidSteps.map((step) => (
            <View key={step.step} style={styles.stepCard}>
              <View style={styles.stepHeader}>
                <Text style={styles.stepIcon}>{step.icon}</Text>
                <View style={styles.stepInfo}>
                  <Text style={styles.stepNumber}>{t('rabies.step')} {step.step}</Text>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                </View>
              </View>
              <Text style={styles.stepDescription}>{step.description}</Text>
            </View>
          ))}
        </View>

        {/* PEP Clinics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏥 {t('rabies.pepClinics')}</Text>
          {pepClinics.map((clinic) => (
            <View key={clinic.id} style={styles.clinicCard}>
              <View style={styles.clinicHeader}>
                <View style={styles.clinicTitleRow}>
                  <Text style={styles.clinicName}>{clinic.name}</Text>
                  {clinic.hasPEP && (
                    <View style={styles.pepBadge}>
                      <Text style={styles.pepBadgeText}>PEP</Text>
                    </View>
                  )}
                  {clinic.open24h && (
                    <View style={styles.open24hBadge}>
                      <Clock size={12} color="#10B981" />
                      <Text style={styles.open24hText}>24h</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.clinicDistance}>{clinic.distance}</Text>
              </View>
              <View style={styles.clinicDetails}>
                <View style={styles.clinicDetail}>
                  <MapPin size={14} color="#6B7280" />
                  <Text style={styles.clinicAddress}>{clinic.address}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.clinicPhone}
                  onPress={() => handleCall(clinic.phone)}
                >
                  <Phone size={14} color="#00B4D8" />
                  <Text style={styles.clinicPhoneText}>{clinic.phone}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Symptoms */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚠️ {t('rabies.symptoms')}</Text>
          <View style={styles.symptomsCard}>
            {symptoms.map((symptom, index) => (
              <View key={index} style={styles.symptomRow}>
                <AlertTriangle size={16} color="#F59E0B" />
                <Text style={styles.symptomText}>{symptom}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Prevention Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🛡️ {t('rabies.prevention')}</Text>
          <View style={styles.preventionCard}>
            {preventionTips.map((tip, index) => (
              <View key={index} style={styles.preventionRow}>
                <CheckCircle size={16} color="#10B981" />
                <Text style={styles.preventionText}>{tip}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Important Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ℹ️ {t('rabies.importantInfo')}</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>{t('rabies.infoText1')}</Text>
            <Text style={styles.infoText}>{t('rabies.infoText2')}</Text>
            <Text style={styles.infoText}>{t('rabies.infoText3')}</Text>
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
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FEE2E2',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#991B1B',
    marginBottom: 4,
  },
  alertText: {
    fontSize: 13,
    color: '#7F1D1D',
    lineHeight: 18,
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
  stepCard: {
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
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  stepIcon: {
    fontSize: 24,
  },
  stepInfo: {
    flex: 1,
  },
  stepNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: '#00B4D8',
    marginBottom: 2,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  stepDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  clinicCard: {
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
  clinicHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  clinicTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  clinicName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  pepBadge: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  pepBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  open24hBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  open24hText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#10B981',
  },
  clinicDistance: {
    fontSize: 12,
    color: '#00B4D8',
    fontWeight: '500',
  },
  clinicDetails: {
    gap: 8,
  },
  clinicDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  clinicAddress: {
    fontSize: 13,
    color: '#6B7280',
    flex: 1,
  },
  clinicPhone: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  clinicPhoneText: {
    fontSize: 13,
    color: '#00B4D8',
    fontWeight: '500',
  },
  symptomsCard: {
    backgroundColor: '#FFFBEB',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  symptomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  symptomText: {
    fontSize: 14,
    color: '#92400E',
    flex: 1,
  },
  preventionCard: {
    backgroundColor: '#F0FDF4',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  preventionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  preventionText: {
    fontSize: 14,
    color: '#166534',
    flex: 1,
  },
  infoCard: {
    backgroundColor: '#E0F2FE',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  infoText: {
    fontSize: 14,
    color: '#1E40AF',
    marginBottom: 8,
    lineHeight: 20,
  },
});

export default memo(RabiesSOSScreen);