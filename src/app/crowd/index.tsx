import React, { useState, memo, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Users, MapPin, Clock, TrendingUp, ChevronLeft, RefreshCw } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

interface CrowdData {
  id: string;
  name: string;
  location: string;
  crowdLevel: 'low' | 'medium' | 'high' | 'very-high';
  crowdPercentage: number;
  bestTime: string;
  currentVisitors: number;
  icon: string;
}

function CrowdScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Memoized crowd data
  const crowdData = useMemo<CrowdData[]>(() => [
    {
      id: '1',
      name: t('crowd.tanahLot'),
      location: 'Tabanan',
      crowdLevel: 'high',
      crowdPercentage: 75,
      bestTime: '06:00 - 08:00',
      currentVisitors: 450,
      icon: '🛕',
    },
    {
      id: '2',
      name: t('crowd.tegallalang'),
      location: 'Ubud',
      crowdLevel: 'medium',
      crowdPercentage: 55,
      bestTime: '07:00 - 09:00',
      currentVisitors: 280,
      icon: '🌾',
    },
    {
      id: '3',
      name: t('crowd.uluwatu'),
      location: 'Uluwatu',
      crowdLevel: 'very-high',
      crowdPercentage: 90,
      bestTime: '16:00 - 17:00',
      currentVisitors: 620,
      icon: '🌅',
    },
    {
      id: '4',
      name: t('crowd.monkeyForest'),
      location: 'Ubud',
      crowdLevel: 'medium',
      crowdPercentage: 60,
      bestTime: '08:00 - 10:00',
      currentVisitors: 320,
      icon: '🐒',
    },
    {
      id: '5',
      name: t('crowd.kutaBeach'),
      location: 'Kuta',
      crowdLevel: 'high',
      crowdPercentage: 80,
      bestTime: '06:00 - 08:00',
      currentVisitors: 580,
      icon: '🏖️',
    },
    {
      id: '6',
      name: t('crowd.tirtaEmpul'),
      location: 'Tampaksiring',
      crowdLevel: 'low',
      crowdPercentage: 30,
      bestTime: '07:00 - 09:00',
      currentVisitors: 120,
      icon: '💧',
    },
    {
      id: '7',
      name: t('crowd.seminyakBeach'),
      location: 'Seminyak',
      crowdLevel: 'medium',
      crowdPercentage: 50,
      bestTime: '17:00 - 19:00',
      currentVisitors: 250,
      icon: '🌊',
    },
    {
      id: '8',
      name: t('crowd.gitgitWaterfall'),
      location: 'Singaraja',
      crowdLevel: 'low',
      crowdPercentage: 25,
      bestTime: '08:00 - 10:00',
      currentVisitors: 80,
      icon: '💦',
    },
  ], [t]);

  // Memoized get crowd color function
  const getCrowdColor = useCallback((level: string) => {
    switch (level) {
      case 'low': return '#10B981';
      case 'medium': return '#F59E0B';
      case 'high': return '#F97316';
      case 'very-high': return '#DC2626';
      default: return '#6B7280';
    }
  }, []);

  // Memoized get crowd label function
  const getCrowdLabel = useCallback((level: string) => {
    switch (level) {
      case 'low': return t('crowd.low');
      case 'medium': return t('crowd.medium');
      case 'high': return t('crowd.high');
      case 'very-high': return t('crowd.veryHigh');
      default: return t('crowd.unknown');
    }
  }, [t]);

  // Memoized get crowd emoji function
  const getCrowdEmoji = useCallback((level: string) => {
    switch (level) {
      case 'low': return '😊';
      case 'medium': return '😐';
      case 'high': return '😰';
      case 'very-high': return '🤯';
      default: return '❓';
    }
  }, []);

  // Memoized refresh handler
  const refresh = useCallback(() => {
    setLastUpdate(new Date());
  }, []);

  // Memoized back handler
  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  // Memoized tips
  const tips = useMemo(() => [
    t('crowd.tip1'),
    t('crowd.tip2'),
    t('crowd.tip3'),
    t('crowd.tip4'),
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
            <Text style={styles.title}>👥 {t('crowd.title')}</Text>
            <Text style={styles.subtitle}>{t('crowd.subtitle')}</Text>
          </View>
          <TouchableOpacity onPress={refresh}>
            <RefreshCw size={24} color="#00B4D8" />
          </TouchableOpacity>
        </View>

        {/* Last Update */}
        <Text style={styles.lastUpdate}>
          {t('crowd.lastUpdate')}: {lastUpdate.toLocaleTimeString('de-DE')}
        </Text>

        {/* Legend */}
        <View style={styles.legendCard}>
          <Text style={styles.legendTitle}>{t('crowd.legend')}:</Text>
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
              <Text style={styles.legendText}>{t('crowd.low')}</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
              <Text style={styles.legendText}>{t('crowd.medium')}</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#F97316' }]} />
              <Text style={styles.legendText}>{t('crowd.high')}</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#DC2626' }]} />
              <Text style={styles.legendText}>{t('crowd.veryHigh')}</Text>
            </View>
          </View>
        </View>

        {/* Crowd Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📍 {t('crowd.popularPlaces')}</Text>
          {crowdData.map((place) => (
            <View key={place.id} style={styles.crowdCard}>
              <View style={styles.crowdHeader}>
                <Text style={styles.crowdIcon}>{place.icon}</Text>
                <View style={styles.crowdTitleContainer}>
                  <Text style={styles.crowdName}>{place.name}</Text>
                  <View style={styles.crowdLocation}>
                    <MapPin size={12} color="#6B7280" />
                    <Text style={styles.crowdLocationText}>{place.location}</Text>
                  </View>
                </View>
                <View style={[styles.crowdBadge, { backgroundColor: getCrowdColor(place.crowdLevel) }]}>
                  <Text style={styles.crowdBadgeEmoji}>{getCrowdEmoji(place.crowdLevel)}</Text>
                  <Text style={styles.crowdBadgeText}>{getCrowdLabel(place.crowdLevel)}</Text>
                </View>
              </View>

              {/* Progress Bar */}
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressBarFill, 
                      { 
                        width: `${place.crowdPercentage}%`,
                        backgroundColor: getCrowdColor(place.crowdLevel),
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.progressText}>{place.crowdPercentage}%</Text>
              </View>

              {/* Details */}
              <View style={styles.crowdDetails}>
                <View style={styles.crowdDetail}>
                  <Users size={14} color="#6B7280" />
                  <Text style={styles.crowdDetailText}>{place.currentVisitors} {t('crowd.visitors')}</Text>
                </View>
                <View style={styles.crowdDetail}>
                  <Clock size={14} color="#10B981" />
                  <Text style={styles.crowdDetailText}>{t('crowd.bestTime')}: {place.bestTime}</Text>
                </View>
              </View>

              {/* Recommendation */}
              {place.crowdLevel === 'high' || place.crowdLevel === 'very-high' ? (
                <View style={styles.warningBadge}>
                  <Text style={styles.warningText}>
                    ⚠️ {t('crowd.recommendation')}
                  </Text>
                </View>
              ) : null}
            </View>
          ))}
        </View>

        {/* Tips */}
        <View style={styles.tipsCard}>
          <TrendingUp size={20} color="#0369A1" />
          <View style={styles.tipsContent}>
            <Text style={styles.tipsTitle}>💡 {t('crowd.tipsTitle')}</Text>
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
    backgroundColor: '#F0FDF4',
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
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
  lastUpdate: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 16,
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
  crowdCard: {
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
  crowdHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  crowdIcon: {
    fontSize: 32,
  },
  crowdTitleContainer: {
    flex: 1,
  },
  crowdName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  crowdLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  crowdLocationText: {
    fontSize: 12,
    color: '#6B7280',
  },
  crowdBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  crowdBadgeEmoji: {
    fontSize: 14,
  },
  crowdBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    width: 40,
    textAlign: 'right',
  },
  crowdDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  crowdDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  crowdDetailText: {
    fontSize: 12,
    color: '#6B7280',
  },
  warningBadge: {
    backgroundColor: '#FEF3C7',
    padding: 8,
    borderRadius: 6,
    marginTop: 4,
  },
  warningText: {
    fontSize: 11,
    color: '#92400E',
  },
  tipsCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#E0F2FE',
    padding: 16,
    borderRadius: 12,
  },
  tipsContent: {
    flex: 1,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0369A1',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 13,
    color: '#0C4A6E',
    marginBottom: 4,
    lineHeight: 18,
  },
});

export default memo(CrowdScreen);