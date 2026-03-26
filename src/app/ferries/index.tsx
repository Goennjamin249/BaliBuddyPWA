import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ship, MapPin, Clock, Navigation, RefreshCw, AlertCircle } from 'lucide-react-native';

interface Ferry {
  id: string;
  name: string;
  type: 'Fast Boat' | 'Ferry' | 'Speed Boat';
  latitude: number;
  longitude: number;
  destination: string;
  eta: string;
  status: 'active' | 'delayed' | 'cancelled';
  capacity: number;
  price: number;
  operator: string;
  departureTime: string;
}

const ferriesData: Ferry[] = [
  {
    id: '1',
    name: 'Bali Express',
    type: 'Fast Boat',
    latitude: -8.7183,
    longitude: 115.1687,
    destination: 'Gili Trawangan',
    eta: '45 min',
    status: 'active',
    capacity: 80,
    price: 450000,
    operator: 'Bali Fast Boats',
    departureTime: '09:00',
  },
  {
    id: '2',
    name: 'Gili Getaway',
    type: 'Speed Boat',
    latitude: -8.6477,
    longitude: 115.1378,
    destination: 'Gili Air',
    eta: '1h 15min',
    status: 'active',
    capacity: 60,
    price: 380000,
    operator: 'Gili Getaway',
    departureTime: '10:30',
  },
  {
    id: '3',
    name: 'Blue Water Express',
    type: 'Ferry',
    latitude: -8.5069,
    longitude: 115.2624,
    destination: 'Nusa Lembongan',
    eta: '30 min',
    status: 'active',
    capacity: 150,
    price: 175000,
    operator: 'Blue Water Express',
    departureTime: '11:00',
  },
  {
    id: '4',
    name: 'Scoot Cruise',
    type: 'Fast Boat',
    latitude: -8.7183,
    longitude: 115.1687,
    destination: 'Lombok',
    eta: '2h 30min',
    status: 'delayed',
    capacity: 100,
    price: 550000,
    operator: 'Scoot Cruise',
    departureTime: '14:00',
  },
];

export default function FerryTracker() {
  const { t } = useTranslation();
  const [ferries, setFerries] = useState<Ferry[]>(ferriesData);
  const [selectedFerry, setSelectedFerry] = useState<Ferry | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#90BE6D';
      case 'delayed': return '#F59E0B';
      case 'cancelled': return '#FF6B6B';
      default: return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Unterwegs';
      case 'delayed': return 'Verspätet';
      case 'cancelled': return 'Abgesagt';
      default: return 'Unbekannt';
    }
  };

  const getTypeIcon = (type: string) => {
    return <Ship size={20} color="#00B4D8" />;
  };

  const formatPrice = (price: number) => {
    return `Rp ${price.toLocaleString('de-DE')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t('ferries.title', 'Fähr-Tracker')}</Text>
          <Text style={styles.subtitle}>{t('ferries.subtitle', 'Echtzeit-Positionen')}</Text>
        </View>

        {/* Refresh Button */}
        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
          <RefreshCw size={20} color="#00B4D8" />
          <Text style={styles.refreshText}>Aktualisieren</Text>
        </TouchableOpacity>

        {/* Live Indicator */}
        <View style={styles.liveIndicator}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>Live-Daten (AIS)</Text>
        </View>

        {/* Ferries List */}
        <View style={styles.ferriesList}>
          {ferries.map((ferry) => (
            <TouchableOpacity 
              key={ferry.id} 
              style={[
                styles.ferryCard,
                selectedFerry?.id === ferry.id && styles.ferryCardSelected,
              ]}
              onPress={() => setSelectedFerry(selectedFerry?.id === ferry.id ? null : ferry)}
            >
              <View style={styles.ferryHeader}>
                <View style={styles.ferryTitleRow}>
                  <View style={styles.ferryIcon}>
                    {getTypeIcon(ferry.type)}
                  </View>
                  <View style={styles.ferryInfo}>
                    <Text style={styles.ferryName}>{ferry.name}</Text>
                    <Text style={styles.ferryOperator}>{ferry.operator}</Text>
                  </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(ferry.status) + '20' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(ferry.status) }]}>
                    {getStatusText(ferry.status)}
                  </Text>
                </View>
              </View>

              <View style={styles.ferryRoute}>
                <View style={styles.routePoint}>
                  <MapPin size={14} color="#6B7280" />
                  <Text style={styles.routeText}>Bali (Padangbai)</Text>
                </View>
                <Navigation size={16} color="#00B4D8" style={styles.routeArrow} />
                <View style={styles.routePoint}>
                  <MapPin size={14} color="#00B4D8" />
                  <Text style={styles.routeText}>{ferry.destination}</Text>
                </View>
              </View>

              <View style={styles.ferryMeta}>
                <View style={styles.metaItem}>
                  <Clock size={14} color="#6B7280" />
                  <Text style={styles.metaText}>Abfahrt: {ferry.departureTime}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Clock size={14} color="#6B7280" />
                  <Text style={styles.metaText}>ETA: {ferry.eta}</Text>
                </View>
              </View>

              {/* Expanded Details */}
              {selectedFerry?.id === ferry.id && (
                <View style={styles.ferryDetails}>
                  <View style={styles.detailsGrid}>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Typ</Text>
                      <Text style={styles.detailValue}>{ferry.type}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Kapazität</Text>
                      <Text style={styles.detailValue}>{ferry.capacity} Personen</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Preis</Text>
                      <Text style={styles.detailValue}>{formatPrice(ferry.price)}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Position</Text>
                      <Text style={styles.detailValue}>
                        {ferry.latitude.toFixed(4)}, {ferry.longitude.toFixed(4)}
                      </Text>
                    </View>
                  </View>

                  {ferry.status === 'delayed' && (
                    <View style={styles.delayWarning}>
                      <AlertCircle size={16} color="#F59E0B" />
                      <Text style={styles.delayText}>
                        Diese Fähre hat Verspätung. Bitte planen Sie zusätzliche Zeit ein.
                      </Text>
                    </View>
                  )}

                  <TouchableOpacity style={styles.bookButton}>
                    <Text style={styles.bookButtonText}>Ticket buchen</Text>
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>ℹ️ Hinweis</Text>
          <Text style={styles.infoText}>
            Die Positionsdaten werden über AIS (Automatic Identification System) empfangen. 
            Bei schlechtem Wetter kann es zu Verzögerungen kommen.
          </Text>
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <Text style={styles.legendTitle}>Legende</Text>
          <View style={styles.legendItems}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#90BE6D' }]} />
              <Text style={styles.legendText}>Unterwegs</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
              <Text style={styles.legendText}>Verspätet</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#FF6B6B' }]} />
              <Text style={styles.legendText}>Abgesagt</Text>
            </View>
          </View>
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
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F0F9FF',
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#00B4D8',
  },
  refreshText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00B4D8',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#90BE6D',
  },
  liveText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  ferriesList: {
    gap: 16,
    marginBottom: 20,
  },
  ferryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  ferryCardSelected: {
    borderWidth: 2,
    borderColor: '#00B4D8',
  },
  ferryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  ferryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  ferryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  ferryInfo: {
    flex: 1,
  },
  ferryName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 2,
  },
  ferryOperator: {
    fontSize: 12,
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  ferryRoute: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  routeText: {
    fontSize: 13,
    color: '#374151',
  },
  routeArrow: {
    transform: [{ rotate: '90deg' }],
  },
  ferryMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#6B7280',
  },
  ferryDetails: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  detailItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 12,
  },
  detailLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  delayWarning: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#FFFBEB',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  delayText: {
    fontSize: 12,
    color: '#92400E',
    flex: 1,
    lineHeight: 18,
  },
  bookButton: {
    backgroundColor: '#00B4D8',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  bookButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  infoCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#00B4D8',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0C4A6E',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 12,
    color: '#0369A1',
    lineHeight: 18,
  },
  legend: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  legendItems: {
    flexDirection: 'row',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
    color: '#6B7280',
  },
});
