import React, { memo, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { AlertTriangle, Shield, Car, Calendar, Camera, ChevronLeft } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

function LawsScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  // Memoized laws data
  const laws = useMemo(() => [
    {
      id: 'drugs',
      icon: '💊',
      title: t('laws.drugsTitle'),
      severity: 'critical',
      details: [
        t('laws.drugsDetail1'),
        t('laws.drugsDetail2'),
        t('laws.drugsDetail3'),
        t('laws.drugsDetail4'),
      ],
    },
    {
      id: 'traffic',
      icon: '🛵',
      title: t('laws.trafficTitle'),
      severity: 'high',
      details: [
        t('laws.trafficDetail1'),
        t('laws.trafficDetail2'),
        t('laws.trafficDetail3'),
        t('laws.trafficDetail4'),
      ],
    },
    {
      id: 'visa',
      icon: '📄',
      title: t('laws.visaTitle'),
      severity: 'high',
      details: [
        t('laws.visaDetail1'),
        t('laws.visaDetail2'),
        t('laws.visaDetail3'),
        t('laws.visaDetail4'),
      ],
    },
    {
      id: 'sacred',
      icon: '🛕',
      title: t('laws.sacredTitle'),
      severity: 'critical',
      details: [
        t('laws.sacredDetail1'),
        t('laws.sacredDetail2'),
        t('laws.sacredDetail3'),
        t('laws.sacredDetail4'),
      ],
    },
  ], [t]);

  // Memoized severity color function
  const getSeverityColor = useCallback((severity: string) => {
    switch (severity) {
      case 'critical': return '#DC2626';
      case 'high': return '#F59E0B';
      default: return '#6B7280';
    }
  }, []);

  // Memoized severity background function
  const getSeverityBg = useCallback((severity: string) => {
    switch (severity) {
      case 'critical': return '#FEF2F2';
      case 'high': return '#FEF3C7';
      default: return '#F3F4F6';
    }
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
            <Text style={styles.title}>⚖️ {t('laws.title')}</Text>
            <Text style={styles.subtitle}>{t('laws.subtitle')}</Text>
          </View>
        </View>

        {/* Warning Banner */}
        <View style={styles.warningBanner}>
          <AlertTriangle size={24} color="#DC2626" />
          <View style={styles.warningTextContainer}>
            <Text style={styles.warningTitle}>⚠️ {t('laws.warningTitle')}</Text>
            <Text style={styles.warningText}>
              {t('laws.warningText')}
            </Text>
          </View>
        </View>

        {/* Laws Cards */}
        {laws.map((law) => (
          <View 
            key={law.id} 
            style={[styles.lawCard, { backgroundColor: getSeverityBg(law.severity) }]}
          >
            <View style={styles.lawHeader}>
              <Text style={styles.lawIcon}>{law.icon}</Text>
              <View style={styles.lawTitleContainer}>
                <Text style={styles.lawTitle}>{law.title}</Text>
                <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(law.severity) }]}>
                  <Text style={styles.severityText}>
                    {law.severity === 'critical' ? t('laws.critical') : t('laws.high')}
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.lawDetails}>
              {law.details.map((detail, index) => (
                <View key={index} style={styles.detailRow}>
                  <Text style={styles.detailBullet}>•</Text>
                  <Text style={styles.detailText}>{detail}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* Emergency Contact */}
        <View style={styles.emergencyCard}>
          <Shield size={24} color="#00B4D8" />
          <View style={styles.emergencyInfo}>
            <Text style={styles.emergencyTitle}>{t('laws.emergencyTitle')}</Text>
            <Text style={styles.emergencyText}>
              {t('laws.emergencyText')}
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
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FEE2E2',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#DC2626',
  },
  warningTextContainer: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#DC2626',
    marginBottom: 4,
  },
  warningText: {
    fontSize: 13,
    color: '#991B1B',
    lineHeight: 18,
  },
  lawCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  lawHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  lawIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  lawTitleContainer: {
    flex: 1,
  },
  lawTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 6,
  },
  severityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  severityText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  lawDetails: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  detailBullet: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 8,
    marginTop: 2,
  },
  detailText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
    lineHeight: 20,
  },
  emergencyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#E0F2FE',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  emergencyInfo: {
    flex: 1,
  },
  emergencyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0369A1',
    marginBottom: 4,
  },
  emergencyText: {
    fontSize: 13,
    color: '#0C4A6E',
    lineHeight: 18,
  },
});

export default memo(LawsScreen);