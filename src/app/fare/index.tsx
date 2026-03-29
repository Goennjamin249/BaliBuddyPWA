import React, { useState, memo, useCallback, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { MapPin, Navigation, AlertTriangle, Car, Clock, DollarSign } from 'lucide-react-native';

interface Zone {
  id: string;
  name: string;
  type: 'red' | 'yellow' | 'green';
  description: string;
  tips: string[];
}

interface FareEstimate {
  distance: number;
  duration: number;
  estimatedFare: number;
  savings: number;
}

function FareEstimator() {
  const { t } = useTranslation();
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [distance, setDistance] = useState('');
  const [estimate, setEstimate] = useState<FareEstimate | null>(null);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);

  // Memoized zones data
  const zones = useMemo<Zone[]>(() => [
    {
      id: '1',
      name: t('fare.kutaBeach'),
      type: 'red',
      description: t('fare.kutaBeachDesc'),
      tips: [t('fare.kutaTip1'), t('fare.kutaTip2'), t('fare.kutaTip3')],
    },
    {
      id: '2',
      name: t('fare.seminyak'),
      type: 'red',
      description: t('fare.seminyakDesc'),
      tips: [t('fare.seminyakTip1'), t('fare.seminyakTip2')],
    },
    {
      id: '3',
      name: t('fare.ubudCenter'),
      type: 'yellow',
      description: t('fare.ubudCenterDesc'),
      tips: [t('fare.ubudTip1'), t('fare.ubudTip2')],
    },
    {
      id: '4',
      name: t('fare.canggu'),
      type: 'green',
      description: t('fare.cangguDesc'),
      tips: [t('fare.cangguTip1'), t('fare.cangguTip2')],
    },
    {
      id: '5',
      name: t('fare.airportZone'),
      type: 'red',
      description: t('fare.airportZoneDesc'),
      tips: [t('fare.airportTip1'), t('fare.airportTip2'), t('fare.airportTip3')],
    },
  ], [t]);

  // Memoized fare table
  const fareTable = useMemo(() => ({
    taxi: { base: 7000, perKm: 6500 },
    grab: { base: 8000, perKm: 4000 },
    gojek: { base: 5000, perKm: 3500 },
  }), []);

  // Memoized calculate fare handler
  const calculateFare = useCallback(() => {
    const dist = parseFloat(distance) || 5;
    const duration = Math.round(dist * 3); // ~3 min per km in traffic
    
    const taxiFare = fareTable.taxi.base + (dist * fareTable.taxi.perKm);
    const grabFare = fareTable.grab.base + (dist * fareTable.grab.perKm);
    const savings = taxiFare - grabFare;
    
    setEstimate({
      distance: dist,
      duration,
      estimatedFare: grabFare,
      savings,
    });
  }, [distance, fareTable]);

  // Memoized format price function
  const formatPrice = useCallback((price: number) => {
    return `Rp ${price.toLocaleString('de-DE')}`;
  }, []);

  // Memoized get zone color function
  const getZoneColor = useCallback((type: string) => {
    switch (type) {
      case 'red': return '#FF6B6B';
      case 'yellow': return '#F59E0B';
      case 'green': return '#90BE6D';
      default: return '#6B7280';
    }
  }, []);

  // Memoized zone selection handler
  const handleZoneSelect = useCallback((zone: Zone) => {
    setSelectedZone(selectedZone?.id === zone.id ? null : zone);
  }, [selectedZone]);

  // Memoized input handlers
  const handleFromLocationChange = useCallback((text: string) => {
    setFromLocation(text);
  }, []);

  const handleToLocationChange = useCallback((text: string) => {
    setToLocation(text);
  }, []);

  const handleDistanceChange = useCallback((text: string) => {
    setDistance(text);
  }, []);

  // Memoized general tips
  const generalTips = useMemo(() => [
    t('fare.generalTip1'),
    t('fare.generalTip2'),
    t('fare.generalTip3'),
    t('fare.generalTip4'),
    t('fare.generalTip5'),
  ], [t]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t('fare.title')}</Text>
          <Text style={styles.subtitle}>{t('fare.subtitle')}</Text>
        </View>

        {/* Warning Banner */}
        <View style={styles.warningBanner}>
          <AlertTriangle size={20} color="#FF6B6B" />
          <Text style={styles.warningText}>
            ⚠️ {t('fare.warning')}
          </Text>
        </View>

        {/* Fare Calculator */}
        <View style={styles.calculatorCard}>
          <Text style={styles.calculatorTitle}>{t('fare.calculatePrice')}</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t('fare.from')}</Text>
            <View style={styles.inputRow}>
              <MapPin size={16} color="#6B7280" />
              <TextInput
                style={styles.input}
                placeholder={t('fare.fromPlaceholder')}
                placeholderTextColor="#9CA3AF"
                value={fromLocation}
                onChangeText={handleFromLocationChange}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t('fare.to')}</Text>
            <View style={styles.inputRow}>
              <Navigation size={16} color="#6B7280" />
              <TextInput
                style={styles.input}
                placeholder={t('fare.toPlaceholder')}
                placeholderTextColor="#9CA3AF"
                value={toLocation}
                onChangeText={handleToLocationChange}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t('fare.distance')}</Text>
            <View style={styles.inputRow}>
              <Car size={16} color="#6B7280" />
              <TextInput
                style={styles.input}
                placeholder={t('fare.distancePlaceholder')}
                placeholderTextColor="#9CA3AF"
                value={distance}
                onChangeText={handleDistanceChange}
                keyboardType="numeric"
              />
            </View>
          </View>

          <TouchableOpacity style={styles.calculateButton} onPress={calculateFare}>
            <DollarSign size={20} color="#FFFFFF" />
            <Text style={styles.calculateButtonText}>{t('fare.calculate')}</Text>
          </TouchableOpacity>
        </View>

        {/* Result */}
        {estimate && (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>{t('fare.estimatedPrice')}</Text>
            
            <View style={styles.priceComparison}>
              <View style={styles.priceItem}>
                <Text style={styles.priceLabel}>{t('fare.taxiMeter')}</Text>
                <Text style={styles.priceValue}>{formatPrice(estimate.estimatedFare + estimate.savings)}</Text>
              </View>
              <View style={styles.priceItem}>
                <Text style={styles.priceLabel}>{t('fare.grabGojek')}</Text>
                <Text style={styles.priceValueHighlight}>{formatPrice(estimate.estimatedFare)}</Text>
              </View>
            </View>

            <View style={styles.savingsBadge}>
              <Text style={styles.savingsText}>💰 {t('fare.savings')}: {formatPrice(estimate.savings)}</Text>
            </View>

            <View style={styles.tripInfo}>
              <View style={styles.tripInfoItem}>
                <Car size={16} color="#6B7280" />
                <Text style={styles.tripInfoText}>{estimate.distance} km</Text>
              </View>
              <View style={styles.tripInfoItem}>
                <Clock size={16} color="#6B7280" />
                <Text style={styles.tripInfoText}>~{estimate.duration} {t('fare.minutes')}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Price Table */}
        <View style={styles.priceTable}>
          <Text style={styles.sectionTitle}>📊 {t('fare.priceComparison')}</Text>
          <View style={styles.tableRow}>
            <Text style={styles.tableHeader}>{t('fare.transport')}</Text>
            <Text style={styles.tableHeader}>{t('fare.basePrice')}</Text>
            <Text style={styles.tableHeader}>{t('fare.perKm')}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>🚕 {t('fare.taxi')}</Text>
            <Text style={styles.tableCell}>Rp 7.000</Text>
            <Text style={styles.tableCellDanger}>Rp 6.500</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>🚗 {t('fare.grab')}</Text>
            <Text style={styles.tableCell}>Rp 8.000</Text>
            <Text style={styles.tableCellSuccess}>Rp 4.000</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>🛵 {t('fare.gojek')}</Text>
            <Text style={styles.tableCell}>Rp 5.000</Text>
            <Text style={styles.tableCellSuccess}>Rp 3.500</Text>
          </View>
        </View>

        {/* Red Zones */}
        <Text style={styles.sectionTitle}>🔴 {t('fare.zoneWarnings')}</Text>
        <View style={styles.zonesList}>
          {zones.map((zone) => (
            <TouchableOpacity 
              key={zone.id} 
              style={[styles.zoneCard, { borderLeftColor: getZoneColor(zone.type) }]}
              onPress={() => handleZoneSelect(zone)}
            >
              <View style={styles.zoneHeader}>
                <View style={[styles.zoneBadge, { backgroundColor: getZoneColor(zone.type) }]}>
                  <Text style={styles.zoneBadgeText}>
                    {zone.type === 'red' ? '🔴' : zone.type === 'yellow' ? '🟡' : '🟢'}
                  </Text>
                </View>
                <Text style={styles.zoneName}>{zone.name}</Text>
              </View>
              <Text style={styles.zoneDescription}>{zone.description}</Text>
              
              {selectedZone?.id === zone.id && (
                <View style={styles.zoneTips}>
                  <Text style={styles.tipsTitle}>{t('fare.tips')}:</Text>
                  {zone.tips.map((tip, index) => (
                    <Text key={index} style={styles.tipItem}>• {tip}</Text>
                  ))}
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Tips */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 {t('fare.generalTips')}</Text>
          {generalTips.map((tip, index) => (
            <Text key={index} style={styles.tipsText}>• {tip}</Text>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
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
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: '#991B1B',
    lineHeight: 18,
  },
  calculatorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  calculatorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1F2937',
  },
  calculateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#00B4D8',
    paddingVertical: 14,
    borderRadius: 12,
  },
  calculateButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  priceComparison: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  priceItem: {
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  priceValueHighlight: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00B4D8',
  },
  savingsBadge: {
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  savingsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#166534',
  },
  tripInfo: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
  },
  tripInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tripInfoText: {
    fontSize: 13,
    color: '#6B7280',
  },
  priceTable: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tableHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    flex: 1,
    textAlign: 'center',
  },
  tableCell: {
    fontSize: 13,
    color: '#1F2937',
    flex: 1,
    textAlign: 'center',
  },
  tableCellSuccess: {
    fontSize: 13,
    color: '#90BE6D',
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  tableCellDanger: {
    fontSize: 13,
    color: '#FF6B6B',
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  zonesList: {
    gap: 12,
    marginBottom: 20,
  },
  zoneCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  zoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  zoneBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoneBadgeText: {
    fontSize: 12,
  },
  zoneName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  zoneDescription: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
  },
  zoneTips: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  tipItem: {
    fontSize: 13,
    color: '#374151',
    marginBottom: 4,
    lineHeight: 18,
  },
  tipsCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  tipsText: {
    fontSize: 13,
    color: '#92400E',
    lineHeight: 20,
    marginBottom: 4,
  },
});

export default memo(FareEstimator);