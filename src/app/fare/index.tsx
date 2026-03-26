import React, { useState } from 'react';
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

const zones: Zone[] = [
  {
    id: '1',
    name: 'Kuta Beach Area',
    type: 'red',
    description: 'Hochtouristische Zone - überhöhte Taxipreise',
    tips: ['Nur Meter-Taxi nutzen', 'Grab/Gojek bevorzugen', 'Vorher Preis vereinbaren'],
  },
  {
    id: '2',
    name: 'Seminyak',
    type: 'red',
    description: 'Premium-Touristengebiet',
    tips: ['Feste Preise verlangen', 'Alternativ Scooter mieten'],
  },
  {
    id: '3',
    name: 'Ubud Center',
    type: 'yellow',
    description: 'Mittleres Risiko',
    tips: ['Handeln üblich', 'Local Price erfragen'],
  },
  {
    id: '4',
    name: 'Canggu',
    type: 'green',
    description: 'Surfer-Preise - fairer',
    tips: ['Normale Taxipreise', 'Gojek verfügbar'],
  },
  {
    id: '5',
    name: 'Airport Zone',
    type: 'red',
    description: 'Taxi-Mafia aktiv',
    tips: ['Fixpreis am Schalter', 'Grab am Parkplatz', 'Niemanden folgen'],
  },
];

const fareTable = {
  taxi: { base: 7000, perKm: 6500 },
  grab: { base: 8000, perKm: 4000 },
  gojek: { base: 5000, perKm: 3500 },
};

export default function FareEstimator() {
  const { t } = useTranslation();
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [distance, setDistance] = useState('');
  const [estimate, setEstimate] = useState<FareEstimate | null>(null);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);

  const calculateFare = () => {
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
  };

  const formatPrice = (price: number) => {
    return `Rp ${price.toLocaleString('de-DE')}`;
  };

  const getZoneColor = (type: string) => {
    switch (type) {
      case 'red': return '#FF6B6B';
      case 'yellow': return '#F59E0B';
      case 'green': return '#90BE6D';
      default: return '#6B7280';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t('fare.title', 'Fahrpreis-Rechner')}</Text>
          <Text style={styles.subtitle}>{t('fare.subtitle', 'Red Zone Radar')}</Text>
        </View>

        {/* Warning Banner */}
        <View style={styles.warningBanner}>
          <AlertTriangle size={20} color="#FF6B6B" />
          <Text style={styles.warningText}>
            ⚠️ Taxi-Mafia in Touristengebieten aktiv! Immer Meter-Taxi oder App nutzen.
          </Text>
        </View>

        {/* Fare Calculator */}
        <View style={styles.calculatorCard}>
          <Text style={styles.calculatorTitle}>Preis berechnen</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Von</Text>
            <View style={styles.inputRow}>
              <MapPin size={16} color="#6B7280" />
              <TextInput
                style={styles.input}
                placeholder="z.B. Flughafen"
                placeholderTextColor="#9CA3AF"
                value={fromLocation}
                onChangeText={setFromLocation}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nach</Text>
            <View style={styles.inputRow}>
              <Navigation size={16} color="#6B7280" />
              <TextInput
                style={styles.input}
                placeholder="z.B. Kuta"
                placeholderTextColor="#9CA3AF"
                value={toLocation}
                onChangeText={setToLocation}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Entfernung (km)</Text>
            <View style={styles.inputRow}>
              <Car size={16} color="#6B7280" />
              <TextInput
                style={styles.input}
                placeholder="z.B. 12"
                placeholderTextColor="#9CA3AF"
                value={distance}
                onChangeText={setDistance}
                keyboardType="numeric"
              />
            </View>
          </View>

          <TouchableOpacity style={styles.calculateButton} onPress={calculateFare}>
            <DollarSign size={20} color="#FFFFFF" />
            <Text style={styles.calculateButtonText}>Preis berechnen</Text>
          </TouchableOpacity>
        </View>

        {/* Result */}
        {estimate && (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>Geschätzter Preis</Text>
            
            <View style={styles.priceComparison}>
              <View style={styles.priceItem}>
                <Text style={styles.priceLabel}>Taxi (Meter)</Text>
                <Text style={styles.priceValue}>{formatPrice(estimate.estimatedFare + estimate.savings)}</Text>
              </View>
              <View style={styles.priceItem}>
                <Text style={styles.priceLabel}>Grab/Gojek</Text>
                <Text style={styles.priceValueHighlight}>{formatPrice(estimate.estimatedFare)}</Text>
              </View>
            </View>

            <View style={styles.savingsBadge}>
              <Text style={styles.savingsText}>💰 Ersparnis: {formatPrice(estimate.savings)}</Text>
            </View>

            <View style={styles.tripInfo}>
              <View style={styles.tripInfoItem}>
                <Car size={16} color="#6B7280" />
                <Text style={styles.tripInfoText}>{estimate.distance} km</Text>
              </View>
              <View style={styles.tripInfoItem}>
                <Clock size={16} color="#6B7280" />
                <Text style={styles.tripInfoText}>~{estimate.duration} Min.</Text>
              </View>
            </View>
          </View>
        )}

        {/* Price Table */}
        <View style={styles.priceTable}>
          <Text style={styles.sectionTitle}>📊 Preisvergleich pro km</Text>
          <View style={styles.tableRow}>
            <Text style={styles.tableHeader}>Transport</Text>
            <Text style={styles.tableHeader}>Grundpreis</Text>
            <Text style={styles.tableHeader}>pro km</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>🚕 Taxi</Text>
            <Text style={styles.tableCell}>Rp 7.000</Text>
            <Text style={styles.tableCellDanger}>Rp 6.500</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>🚗 Grab</Text>
            <Text style={styles.tableCell}>Rp 8.000</Text>
            <Text style={styles.tableCellSuccess}>Rp 4.000</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>🛵 Gojek</Text>
            <Text style={styles.tableCell}>Rp 5.000</Text>
            <Text style={styles.tableCellSuccess}>Rp 3.500</Text>
          </View>
        </View>

        {/* Red Zones */}
        <Text style={styles.sectionTitle}>🔴 Zonen-Warnungen</Text>
        <View style={styles.zonesList}>
          {zones.map((zone) => (
            <TouchableOpacity 
              key={zone.id} 
              style={[styles.zoneCard, { borderLeftColor: getZoneColor(zone.type) }]}
              onPress={() => setSelectedZone(selectedZone?.id === zone.id ? null : zone)}
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
                  <Text style={styles.tipsTitle}>Tipps:</Text>
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
          <Text style={styles.tipsTitle}>💡 Allgemeine Tipps</Text>
          <Text style={styles.tipsText}>
            • IMMER den Preis VORHER vereinbaren{'\n'}
            • Meter-Taxi verlangen oder Grab nutzen{'\n'}
            • Kleingeld bereithalten (keine großen Scheine){'\n'}
            • Bei Problemen: Touristenpolizei anrufen{'\n'}
            • Alternativ: Scooter mieten (günstiger)
          </Text>
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
  },
});
