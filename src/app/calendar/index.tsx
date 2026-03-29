import React, { useState, memo, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Calendar, ChevronLeft, ChevronRight, Info, CheckCircle, XCircle } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

function CalendarScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [currentDay, setCurrentDay] = useState(1);

  // Pawukon cycle is 210 days
  const pawukonCycle = 210;
  const daysRemaining = pawukonCycle - currentDay;

  // Memoized temple dos
  const templeDos = useMemo(() => [
    { icon: '🧣', text: t('calendar.templeDo1') },
    { icon: '🙏', text: t('calendar.templeDo2') },
    { icon: '👟', text: t('calendar.templeDo3') },
    { icon: '📸', text: t('calendar.templeDo4') },
    { icon: '💰', text: t('calendar.templeDo5') },
  ], [t]);

  // Memoized temple donts
  const templeDonts = useMemo(() => [
    { icon: '🚫', text: t('calendar.templeDont1') },
    { icon: '⬆️', text: t('calendar.templeDont2') },
    { icon: '👣', text: t('calendar.templeDont3') },
    { icon: '👕', text: t('calendar.templeDont4') },
    { icon: '🗣️', text: t('calendar.templeDont5') },
  ], [t]);

  // Memoized upcoming ceremonies
  const upcomingCeremonies = useMemo(() => [
    { name: 'Galungan', description: t('calendar.galunganDesc'), daysUntil: 45 },
    { name: 'Kuningan', description: t('calendar.kuninganDesc'), daysUntil: 55 },
    { name: 'Nyepi', description: t('calendar.nyepiDesc'), daysUntil: 120 },
  ], [t]);

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
            <Text style={styles.title}>📅 {t('calendar.title')}</Text>
            <Text style={styles.subtitle}>{t('calendar.subtitle')}</Text>
          </View>
        </View>

        {/* Pawukon Cycle Card */}
        <View style={styles.cycleCard}>
          <View style={styles.cycleHeader}>
            <Calendar size={32} color="#90BE6D" />
            <Text style={styles.cycleTitle}>{t('calendar.pawukonCycle')}</Text>
          </View>
          <View style={styles.cycleProgress}>
            <View style={styles.progressBar}>
              <View 
                style={[styles.progressFill, { width: `${(currentDay / pawukonCycle) * 100}%` }]} 
              />
            </View>
            <Text style={styles.progressText}>
              {t('calendar.day')} {currentDay} {t('calendar.of')} {pawukonCycle}
            </Text>
          </View>
          <View style={styles.cycleInfo}>
            <View style={styles.cycleStat}>
              <Text style={styles.cycleStatValue}>{daysRemaining}</Text>
              <Text style={styles.cycleStatLabel}>{t('calendar.daysRemaining')}</Text>
            </View>
            <View style={styles.cycleStat}>
              <Text style={styles.cycleStatValue}>30</Text>
              <Text style={styles.cycleStatLabel}>{t('calendar.weeks')}</Text>
            </View>
            <View style={styles.cycleStat}>
              <Text style={styles.cycleStatValue}>10</Text>
              <Text style={styles.cycleStatLabel}>{t('calendar.threeWeekCycles')}</Text>
            </View>
          </View>
          <Text style={styles.cycleDescription}>
            {t('calendar.pawukonDescription')}
          </Text>
        </View>

        {/* Temple Dos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✅ {t('calendar.templeDos')}</Text>
          {templeDos.map((item, index) => (
            <View key={index} style={styles.doCard}>
              <Text style={styles.doIcon}>{item.icon}</Text>
              <CheckCircle size={20} color="#10B981" />
              <Text style={styles.doText}>{item.text}</Text>
            </View>
          ))}
        </View>

        {/* Temple Don'ts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>❌ {t('calendar.templeDonts')}</Text>
          {templeDonts.map((item, index) => (
            <View key={index} style={styles.dontCard}>
              <Text style={styles.dontIcon}>{item.icon}</Text>
              <XCircle size={20} color="#DC2626" />
              <Text style={styles.dontText}>{item.text}</Text>
            </View>
          ))}
        </View>

        {/* Upcoming Ceremonies */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎉 {t('calendar.upcomingCeremonies')}</Text>
          {upcomingCeremonies.map((ceremony, index) => (
            <View key={index} style={styles.ceremonyCard}>
              <View style={styles.ceremonyHeader}>
                <Text style={styles.ceremonyName}>{ceremony.name}</Text>
                <View style={styles.ceremonyBadge}>
                  <Text style={styles.ceremonyBadgeText}>{t('calendar.inDays')} {ceremony.daysUntil} {t('calendar.days')}</Text>
                </View>
              </View>
              <Text style={styles.ceremonyDescription}>{ceremony.description}</Text>
            </View>
          ))}
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Info size={20} color="#00B4D8" />
          <Text style={styles.infoText}>
            {t('calendar.odalanInfo')}
          </Text>
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  cycleCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cycleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  cycleTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  cycleProgress: {
    marginBottom: 16,
  },
  progressBar: {
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#90BE6D',
    borderRadius: 6,
  },
  progressText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  cycleInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingVertical: 12,
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
  },
  cycleStat: {
    alignItems: 'center',
  },
  cycleStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#90BE6D',
  },
  cycleStatLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  cycleDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  doCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#D1FAE5',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  doIcon: {
    fontSize: 20,
  },
  doText: {
    fontSize: 14,
    color: '#065F46',
    flex: 1,
    lineHeight: 20,
  },
  dontCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  dontIcon: {
    fontSize: 20,
  },
  dontText: {
    fontSize: 14,
    color: '#991B1B',
    flex: 1,
    lineHeight: 20,
  },
  ceremonyCard: {
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
  ceremonyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ceremonyName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  ceremonyBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  ceremonyBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#92400E',
  },
  ceremonyDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  infoBox: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#E0F2FE',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#0C4A6E',
    flex: 1,
    lineHeight: 18,
  },
});

export default memo(CalendarScreen);