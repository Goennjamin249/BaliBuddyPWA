import React, { useState, memo, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { AlertTriangle, Shield, MapPin, Star, ChevronLeft, Search, CheckCircle, XCircle } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

interface Bar {
  id: string;
  name: string;
  location: string;
  rating: number;
  verified: boolean;
  description: string;
}

function BarsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  // Memoized verified bars
  const verifiedBars = useMemo<Bar[]>(() => [
    {
      id: '1',
      name: 'Potato Head Beach Club',
      location: 'Seminyak',
      rating: 4.8,
      verified: true,
      description: t('bars.potatoHeadDesc'),
    },
    {
      id: '2',
      name: 'La Favela',
      location: 'Seminyak',
      rating: 4.6,
      verified: true,
      description: t('bars.laFavelaDesc'),
    },
    {
      id: '3',
      name: 'Old Man\'s',
      location: 'Canggu',
      rating: 4.5,
      verified: true,
      description: t('bars.oldMansDesc'),
    },
    {
      id: '4',
      name: 'Single Fin',
      location: 'Uluwatu',
      rating: 4.7,
      verified: true,
      description: t('bars.singleFinDesc'),
    },
    {
      id: '5',
      name: 'Sky Garden',
      location: 'Kuta',
      rating: 4.3,
      verified: true,
      description: t('bars.skyGardenDesc'),
    },
    {
      id: '6',
      name: 'Mirror Lounge',
      location: 'Seminyak',
      rating: 4.4,
      verified: true,
      description: t('bars.mirrorLoungeDesc'),
    },
  ], [t]);

  // Memoized dangers
  const dangers = useMemo(() => [
    {
      icon: '☠️',
      title: t('bars.methanolPoisoning'),
      description: t('bars.methanolPoisoningDesc'),
      severity: 'critical',
    },
    {
      icon: '🍺',
      title: t('bars.cheapArak'),
      description: t('bars.cheapArakDesc'),
      severity: 'high',
    },
    {
      icon: '🏷️',
      title: t('bars.fakeBottles'),
      description: t('bars.fakeBottlesDesc'),
      severity: 'high',
    },
    {
      icon: '💰',
      title: t('bars.tooCheapDrinks'),
      description: t('bars.tooCheapDrinksDesc'),
      severity: 'medium',
    },
  ], [t]);

  // Memoized warning signs
  const warningSigns = useMemo(() => [
    t('bars.warningSign1'),
    t('bars.warningSign2'),
    t('bars.warningSign3'),
    t('bars.warningSign4'),
    t('bars.warningSign5'),
    t('bars.warningSign6'),
  ], [t]);

  // Memoized safety tips
  const safetyTips = useMemo(() => [
    t('bars.safetyTip1'),
    t('bars.safetyTip2'),
    t('bars.safetyTip3'),
    t('bars.safetyTip4'),
    t('bars.safetyTip5'),
  ], [t]);

  // Memoized filtered bars
  const filteredBars = useMemo(() => {
    return verifiedBars.filter(bar =>
      bar.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bar.location.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [verifiedBars, searchQuery]);

  // Memoized search handler
  const handleSearchChange = useCallback((text: string) => {
    setSearchQuery(text);
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
            <Text style={styles.title}>🍸 {t('bars.title')}</Text>
            <Text style={styles.subtitle}>{t('bars.subtitle')}</Text>
          </View>
        </View>

        {/* Critical Warning */}
        <View style={styles.criticalWarning}>
          <AlertTriangle size={32} color="#DC2626" />
          <View style={styles.criticalWarningContent}>
            <Text style={styles.criticalWarningTitle}>⚠️ {t('bars.lifeThreatening')}</Text>
            <Text style={styles.criticalWarningText}>
              {t('bars.lifeThreateningText')}
            </Text>
          </View>
        </View>

        {/* Dangers Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>☠️ {t('bars.dangers')}</Text>
          {dangers.map((danger, index) => (
            <View 
              key={index} 
              style={[
                styles.dangerCard,
                danger.severity === 'critical' && styles.dangerCardCritical,
                danger.severity === 'high' && styles.dangerCardHigh,
              ]}
            >
              <Text style={styles.dangerIcon}>{danger.icon}</Text>
              <View style={styles.dangerContent}>
                <Text style={styles.dangerTitle}>{danger.title}</Text>
                <Text style={styles.dangerDescription}>{danger.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Warning Signs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🚨 {t('bars.warningSigns')}</Text>
          <View style={styles.warningSignsCard}>
            {warningSigns.map((sign, index) => (
              <View key={index} style={styles.warningSignRow}>
                <XCircle size={16} color="#DC2626" />
                <Text style={styles.warningSignText}>{sign}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Verified Bars */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✅ {t('bars.verifiedBars')}</Text>
          <View style={styles.searchRow}>
            <Search size={20} color="#6B7280" />
            <TextInput
              style={styles.searchInput}
              placeholder={t('bars.searchPlaceholder')}
              value={searchQuery}
              onChangeText={handleSearchChange}
            />
          </View>
          
          {filteredBars.map((bar) => (
            <View key={bar.id} style={styles.barCard}>
              <View style={styles.barHeader}>
                <View style={styles.barTitleRow}>
                  <Text style={styles.barName}>{bar.name}</Text>
                  {bar.verified && (
                    <View style={styles.verifiedBadge}>
                      <CheckCircle size={14} color="#FFFFFF" />
                      <Text style={styles.verifiedText}>{t('bars.verified')}</Text>
                    </View>
                  )}
                </View>
                <View style={styles.ratingRow}>
                  <Star size={14} color="#F59E0B" />
                  <Text style={styles.ratingText}>{bar.rating}</Text>
                </View>
              </View>
              <View style={styles.barLocation}>
                <MapPin size={14} color="#6B7280" />
                <Text style={styles.barLocationText}>{bar.location}</Text>
              </View>
              <Text style={styles.barDescription}>{bar.description}</Text>
            </View>
          ))}
        </View>

        {/* Safety Tips */}
        <View style={styles.tipsCard}>
          <Shield size={24} color="#10B981" />
          <View style={styles.tipsContent}>
            <Text style={styles.tipsTitle}>💡 {t('bars.safetyTips')}</Text>
            {safetyTips.map((tip, index) => (
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
  criticalWarning: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#FEE2E2',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 3,
    borderColor: '#DC2626',
  },
  criticalWarningContent: {
    flex: 1,
  },
  criticalWarningTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#DC2626',
    marginBottom: 4,
  },
  criticalWarningText: {
    fontSize: 13,
    color: '#991B1B',
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
  dangerCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#6B7280',
  },
  dangerCardCritical: {
    borderLeftColor: '#DC2626',
    backgroundColor: '#FEF2F2',
  },
  dangerCardHigh: {
    borderLeftColor: '#F59E0B',
    backgroundColor: '#FEF3C7',
  },
  dangerIcon: {
    fontSize: 24,
  },
  dangerContent: {
    flex: 1,
  },
  dangerTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 2,
  },
  dangerDescription: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  warningSignsCard: {
    backgroundColor: '#FEE2E2',
    padding: 16,
    borderRadius: 12,
  },
  warningSignRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  warningSignText: {
    fontSize: 13,
    color: '#991B1B',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  barCard: {
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
  barHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  barTitleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  barName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#10B981',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F59E0B',
  },
  barLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  barLocationText: {
    fontSize: 12,
    color: '#6B7280',
  },
  barDescription: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 18,
  },
  tipsCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#D1FAE5',
    padding: 16,
    borderRadius: 12,
  },
  tipsContent: {
    flex: 1,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#065F46',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 13,
    color: '#047857',
    marginBottom: 4,
    lineHeight: 18,
  },
});

export default memo(BarsScreen);