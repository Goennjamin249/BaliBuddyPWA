import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Calendar, Clock, AlertTriangle, CheckCircle, Plus, Trash2 } from 'lucide-react-native';

interface VisaEntry {
  id: string;
  entryDate: Date;
  visaType: 'VOA' | 'B211' | 'KITAS';
  duration: number; // days
  isExtended: boolean;
}

export default function VisaTracker() {
  const { t } = useTranslation();
  const [entryDate, setEntryDate] = useState('');
  const [selectedVisaType, setSelectedVisaType] = useState<'VOA' | 'B211' | 'KITAS'>('VOA');
  const [visaEntries, setVisaEntries] = useState<VisaEntry[]>([]);
  const [currentEntry, setCurrentEntry] = useState<VisaEntry | null>(null);

  useEffect(() => {
    // Initialize with sample data
    const sampleEntry: VisaEntry = {
      id: '1',
      entryDate: new Date(),
      visaType: 'VOA',
      duration: 30,
      isExtended: false,
    };
    setVisaEntries([sampleEntry]);
    setCurrentEntry(sampleEntry);
    setEntryDate(sampleEntry.entryDate.toISOString().split('T')[0]);
  }, []);

  const calculateDaysRemaining = (entry: VisaEntry): number => {
    const today = new Date();
    const entryDateObj = new Date(entry.entryDate);
    const expiryDate = new Date(entryDateObj);
    expiryDate.setDate(expiryDate.getDate() + entry.duration);
    
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getExpiryDate = (entry: VisaEntry): Date => {
    const entryDateObj = new Date(entry.entryDate);
    const expiryDate = new Date(entryDateObj);
    expiryDate.setDate(expiryDate.getDate() + entry.duration);
    return expiryDate;
  };

  const getStatusColor = (daysRemaining: number): string => {
    if (daysRemaining <= 0) return '#FF6B6B'; // Expired
    if (daysRemaining <= 7) return '#FB923C'; // Warning
    if (daysRemaining <= 14) return '#F59E0B'; // Caution
    return '#90BE6D'; // Safe
  };

  const getStatusText = (daysRemaining: number): string => {
    if (daysRemaining <= 0) return 'ABGELAUFEN';
    if (daysRemaining <= 7) return 'Kritisch';
    if (daysRemaining <= 14) return 'Achtung';
    return 'In Ordnung';
  };

  const addVisaEntry = () => {
    if (!entryDate) {
      Alert.alert('Fehler', 'Bitte gib ein Einreisedatum ein.');
      return;
    }

    const newEntry: VisaEntry = {
      id: Date.now().toString(),
      entryDate: new Date(entryDate),
      visaType: selectedVisaType,
      duration: selectedVisaType === 'VOA' ? 30 : selectedVisaType === 'B211' ? 60 : 365,
      isExtended: false,
    };

    setVisaEntries([...visaEntries, newEntry]);
    setCurrentEntry(newEntry);
    setEntryDate('');
  };

  const extendVisa = (id: string) => {
    setVisaEntries(visaEntries.map(entry => {
      if (entry.id === id) {
        return {
          ...entry,
          duration: entry.duration + 30,
          isExtended: true,
        };
      }
      return entry;
    }));
    
    if (currentEntry?.id === id) {
      setCurrentEntry({
        ...currentEntry,
        duration: currentEntry.duration + 30,
        isExtended: true,
      });
    }
    
    Alert.alert('Erfolg', 'Visum wurde um 30 Tage verlängert.');
  };

  const deleteEntry = (id: string) => {
    Alert.alert(
      'Löschen',
      'Möchtest du diesen Eintrag wirklich löschen?',
      [
        { text: 'Abbrechen', style: 'cancel' },
        { 
          text: 'Löschen', 
          style: 'destructive',
          onPress: () => {
            const filtered = visaEntries.filter(e => e.id !== id);
            setVisaEntries(filtered);
            if (currentEntry?.id === id) {
              setCurrentEntry(filtered[0] || null);
            }
          }
        },
      ]
    );
  };

  const daysRemaining = currentEntry ? calculateDaysRemaining(currentEntry) : 0;
  const expiryDate = currentEntry ? getExpiryDate(currentEntry) : null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t('visa.title')}</Text>
          <Text style={styles.subtitle}>{t('visa.subtitle')}</Text>
        </View>

        {/* Current Status Card */}
        {currentEntry && (
          <View style={[styles.statusCard, { borderLeftColor: getStatusColor(daysRemaining) }]}>
            <View style={styles.statusHeader}>
              <View style={styles.statusBadge}>
                <Text style={[styles.statusBadgeText, { color: getStatusColor(daysRemaining) }]}>
                  {getStatusText(daysRemaining)}
                </Text>
              </View>
              <Text style={styles.visaType}>{currentEntry.visaType}</Text>
            </View>

            <View style={styles.daysContainer}>
              <Text style={[styles.daysNumber, { color: getStatusColor(daysRemaining) }]}>
                {daysRemaining > 0 ? daysRemaining : 0}
              </Text>
              <Text style={styles.daysLabel}>
                {daysRemaining > 0 ? 'Tage verbleibend' : 'Tage überfällig'}
              </Text>
            </View>

            <View style={styles.dateInfo}>
              <View style={styles.dateRow}>
                <Calendar size={16} color="#6B7280" />
                <Text style={styles.dateLabel}>Einreise:</Text>
                <Text style={styles.dateValue}>
                  {new Date(currentEntry.entryDate).toLocaleDateString('de-DE')}
                </Text>
              </View>
              <View style={styles.dateRow}>
                <Clock size={16} color="#6B7280" />
                <Text style={styles.dateLabel}>Ablauf:</Text>
                <Text style={styles.dateValue}>
                  {expiryDate?.toLocaleDateString('de-DE')}
                </Text>
              </View>
            </View>

            {daysRemaining <= 14 && daysRemaining > 0 && (
              <View style={styles.warningBanner}>
                <AlertTriangle size={16} color="#F59E0B" />
                <Text style={styles.warningText}>
                  {daysRemaining <= 7 
                    ? '⚠️ Sofort handeln! Visum läuft bald ab!'
                    : 'Plane deine Verlängerung oder Ausreise.'}
                </Text>
              </View>
            )}

            {daysRemaining <= 0 && (
              <View style={styles.dangerBanner}>
                <AlertTriangle size={16} color="#FF6B6B" />
                <Text style={styles.dangerText}>
                  ⛔ OVERSTAY! Strafen: 1 Mio. IDR pro Tag, max. 60 Tage
                </Text>
              </View>
            )}

            {!currentEntry.isExtended && (
              <TouchableOpacity 
                style={styles.extendButton}
                onPress={() => extendVisa(currentEntry.id)}
              >
                <Text style={styles.extendButtonText}>+ 30 Tage verlängern</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Add New Entry */}
        <View style={styles.addCard}>
          <Text style={styles.addCardTitle}>Neuen Eintrag hinzufügen</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Einreisedatum</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#9CA3AF"
              value={entryDate}
              onChangeText={setEntryDate}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Visumtyp</Text>
            <View style={styles.visaTypeSelector}>
              {(['VOA', 'B211', 'KITAS'] as const).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.visaTypeOption,
                    selectedVisaType === type && styles.visaTypeOptionActive,
                  ]}
                  onPress={() => setSelectedVisaType(type)}
                >
                  <Text style={[
                    styles.visaTypeOptionText,
                    selectedVisaType === type && styles.visaTypeOptionTextActive,
                  ]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.visaInfoCard}>
            <Text style={styles.visaInfoTitle}>
              {selectedVisaType === 'VOA' && 'Visa on Arrival (VoA)'}
              {selectedVisaType === 'B211' && 'Tourist Visa B211A'}
              {selectedVisaType === 'KITAS' && 'Temporary Stay Permit'}
            </Text>
            <Text style={styles.visaInfoText}>
              {selectedVisaType === 'VOA' && '• 30 Tage gültig\n• Einmal verlängerbar (+30 Tage)\n• Kosten: 500.000 IDR\n• Kann NICHT in anderes Visum umgewandelt werden'}
              {selectedVisaType === 'B211' && '• 60 Tage gültig\n• Zweimal verlängerbar (je +30 Tage)\n• Kosten: ~2.000.000 IDR\n• Sozial-/Kulturvisum'}
              {selectedVisaType === 'KITAS' && '• 6-12 Monate gültig\n• Verlängerbar\n• Kosten: ~8.000.000 IDR\n• Für Arbeit/Rente/Familie'}
            </Text>
          </View>

          <TouchableOpacity style={styles.addButton} onPress={addVisaEntry}>
            <Plus size={20} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Eintrag hinzufügen</Text>
          </TouchableOpacity>
        </View>

        {/* Visa Types Info */}
        <View style={styles.infoSection}>
          <Text style={styles.infoSectionTitle}>Visumarten für Indonesien</Text>
          
          <View style={styles.infoCard}>
            <Text style={styles.infoCardTitle}>🏖️ Visa on Arrival (VoA)</Text>
            <Text style={styles.infoCardText}>
              Die beliebteste Option für Backpacker. 30 Tage, einmal verlängerbar.
            </Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoCardTitle}>🛂 B211A Touristenvisum</Text>
            <Text style={styles.infoCardText}>
              Für längere Aufenthalte. 60 Tage, zweimal verlängerbar (max. 180 Tage).
            </Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoCardTitle}>🏠 KITAS</Text>
            <Text style={styles.infoCardText}>
              Für längere Aufenthalte. Erforderlich für Arbeit, Studium oder Rente.
            </Text>
          </View>
        </View>

        {/* Penalties Warning */}
        <View style={styles.penaltiesCard}>
          <AlertTriangle size={24} color="#FF6B6B" />
          <View style={styles.penaltiesContent}>
            <Text style={styles.penaltiesTitle}>Strafen bei Overstay</Text>
            <Text style={styles.penaltiesText}>
              • 1.000.000 IDR pro Tag (ca. 60€){'\n'}
              • Maximal 60 Tage Overstay erlaubt{'\n'}
              • Danach: Abschiebung + Einreiseverbot{'\n'}
              • Flughafen kann gesperrt werden
            </Text>
          </View>
        </View>

        {/* History */}
        {visaEntries.length > 1 && (
          <View style={styles.historySection}>
            <Text style={styles.historyTitle}>Vergangene Aufenthalte</Text>
            {visaEntries.slice().reverse().map((entry) => {
              const days = calculateDaysRemaining(entry);
              const expired = days <= 0;
              return (
                <View key={entry.id} style={styles.historyCard}>
                  <View style={styles.historyInfo}>
                    <Text style={styles.historyDate}>
                      {new Date(entry.entryDate).toLocaleDateString('de-DE')}
                    </Text>
                    <Text style={styles.historyType}>{entry.visaType}</Text>
                  </View>
                  <View style={styles.historyStatus}>
                    <Text style={[styles.historyStatusText, { color: expired ? '#FF6B6B' : '#90BE6D' }]}>
                      {expired ? 'Beendet' : 'Aktiv'}
                    </Text>
                    <TouchableOpacity onPress={() => deleteEntry(entry.id)}>
                      <Trash2 size={16} color="#FF6B6B" />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}
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
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    borderLeftWidth: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  visaType: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  daysContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  daysNumber: {
    fontSize: 64,
    fontWeight: 'bold',
  },
  daysLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  dateInfo: {
    gap: 12,
    marginBottom: 16,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateLabel: {
    fontSize: 13,
    color: '#6B7280',
    width: 70,
  },
  dateValue: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1F2937',
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFBEB',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  warningText: {
    fontSize: 12,
    color: '#92400E',
    flex: 1,
  },
  dangerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
  },
  dangerText: {
    fontSize: 12,
    color: '#991B1B',
    flex: 1,
    fontWeight: '600',
  },
  extendButton: {
    backgroundColor: '#00B4D8',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  extendButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  addCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  addCardTitle: {
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
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#1F2937',
  },
  visaTypeSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  visaTypeOption: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  visaTypeOptionActive: {
    backgroundColor: '#00B4D8',
  },
  visaTypeOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  visaTypeOptionTextActive: {
    color: '#FFFFFF',
  },
  visaInfoCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  visaInfoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0C4A6E',
    marginBottom: 8,
  },
  visaInfoText: {
    fontSize: 12,
    color: '#0369A1',
    lineHeight: 18,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#90BE6D',
    paddingVertical: 14,
    borderRadius: 12,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  infoSection: {
    marginBottom: 20,
  },
  infoSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  infoCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 6,
  },
  infoCardText: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
  },
  penaltiesCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
  },
  penaltiesContent: {
    flex: 1,
  },
  penaltiesTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#991B1B',
    marginBottom: 6,
  },
  penaltiesText: {
    fontSize: 12,
    color: '#7F1D1D',
    lineHeight: 18,
  },
  historySection: {
    marginBottom: 20,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  historyCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  historyInfo: {
    flex: 1,
  },
  historyDate: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 2,
  },
  historyType: {
    fontSize: 12,
    color: '#6B7280',
  },
  historyStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  historyStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
});