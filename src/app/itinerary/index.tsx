import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { Plus, Calendar, Clock, MapPin, Users, GripVertical, Trash2, Edit3, ArrowLeft, DollarSign, Calculator } from 'lucide-react-native';

interface ItineraryItem {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  order: number;
  squadId?: string;
  basePrice?: number;
  priceType?: 'per_person' | 'per_group' | 'fixed';
}

interface SquadMember {
  id: string;
  name: string;
  email?: string;
}

// Bali 2026 Real Prices
const BALI_PRICES_2026 = {
  scooter: { min: 80000, max: 150000, unit: 'IDR/Tag' },
  driver: { min: 500000, max: 800000, unit: 'IDR/Tag' },
  laundry: { min: 35000, max: 50000, unit: 'IDR/kg' },
  overstay: 1000000, // IDR/Tag
  temple: { min: 30000, max: 50000, unit: 'IDR' },
  dinner: { min: 50000, max: 150000, unit: 'IDR/Person' },
  breakfast: { min: 25000, max: 60000, unit: 'IDR/Person' },
  tour: { min: 300000, max: 600000, unit: 'IDR/Gruppe' },
  massage: { min: 100000, max: 200000, unit: 'IDR' },
  surf: { min: 350000, max: 500000, unit: 'IDR/Person' },
};

const sampleItinerary: ItineraryItem[] = [
  {
    id: '1',
    title: 'Ankunft am Flughafen',
    description: 'Pickup vom Hotel organisieren',
    date: '2026-04-15',
    time: '14:00',
    location: 'Ngurah Rai International Airport',
    order: 1,
    basePrice: 300000,
    priceType: 'per_group',
  },
  {
    id: '2',
    title: 'Check-in Hotel',
    description: 'Gepäck ablegen und frisch machen',
    date: '2026-04-15',
    time: '16:00',
    location: 'Seminyak Beach Hotel',
    order: 2,
    basePrice: 0,
    priceType: 'fixed',
  },
  {
    id: '3',
    title: 'Tanah Lot Tempel bei Sonnenuntergang',
    description: 'Tempelbesuch und Fotos',
    date: '2026-04-15',
    time: '17:00',
    location: 'Tanah Lot, Tabanan',
    order: 3,
    basePrice: 40000,
    priceType: 'per_person',
  },
  {
    id: '4',
    title: 'Abendessen in Seminyak',
    description: 'Lokales Essen probieren',
    date: '2026-04-15',
    time: '20:00',
    location: 'Seminyak Village',
    order: 4,
    basePrice: 100000,
    priceType: 'per_person',
  },
];

const sampleSquad: SquadMember[] = [
  { id: '1', name: 'Max', email: 'max@example.com' },
  { id: '2', name: 'Anna', email: 'anna@example.com' },
  { id: '3', name: 'Tom' },
];

export default function ItineraryPlanner() {
  const { t } = useTranslation();
  const router = useRouter();
  const [itinerary, setItinerary] = useState<ItineraryItem[]>(sampleItinerary);
  const [squad, setSquad] = useState<SquadMember[]>(sampleSquad);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<ItineraryItem | null>(null);
  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    basePrice: 0,
    priceType: 'per_person' as 'per_person' | 'per_group' | 'fixed',
  });
  const [newMember, setNewMember] = useState({ name: '', email: '' });

  // Dynamic price calculation based on squad size
  const calculateDynamicPrice = useMemo(() => {
    return (basePrice: number, priceType: 'per_person' | 'per_group' | 'fixed', memberCount: number) => {
      if (priceType === 'fixed') return basePrice;
      if (priceType === 'per_person') {
        // Group discount: 10% off for 3-4 people, 15% off for 5+ people
        const discount = memberCount >= 5 ? 0.15 : memberCount >= 3 ? 0.10 : 0;
        return basePrice * memberCount * (1 - discount);
      }
      if (priceType === 'per_group') return basePrice;
      return basePrice;
    };
  }, []);

  // Calculate total costs
  const totalCosts = useMemo(() => {
    const memberCount = squad.length;
    let totalPerPerson = 0;
    let totalGroup = 0;

    itinerary.forEach(item => {
      if (item.basePrice && item.priceType) {
        const cost = calculateDynamicPrice(item.basePrice, item.priceType, memberCount);
        if (item.priceType === 'per_person') {
          totalPerPerson += cost;
        } else {
          totalGroup += cost;
        }
      }
    });

    return {
      perPerson: totalPerPerson / memberCount,
      group: totalGroup,
      total: totalPerPerson + totalGroup,
      perPersonShare: (totalPerPerson + totalGroup) / memberCount,
    };
  }, [itinerary, squad, calculateDynamicPrice]);

  const moveItem = (fromIndex: number, toIndex: number) => {
    const newItinerary = [...itinerary];
    const [removed] = newItinerary.splice(fromIndex, 1);
    newItinerary.splice(toIndex, 0, removed);
    setItinerary(newItinerary.map((item, idx) => ({ ...item, order: idx + 1 })));
  };

  const addItem = () => {
    if (!newItem.title || !newItem.date) {
      Alert.alert('Fehler', 'Bitte Titel und Datum eingeben');
      return;
    }

    const item: ItineraryItem = {
      id: Date.now().toString(),
      ...newItem,
      order: itinerary.length + 1,
    };

    setItinerary([...itinerary, item]);
    setNewItem({ 
      title: '', 
      description: '', 
      date: '', 
      time: '', 
      location: '', 
      basePrice: 0, 
      priceType: 'per_person' 
    });
    setShowAddForm(false);
  };

  const deleteItem = (id: string) => {
    Alert.alert(
      'Löschen',
      'Möchtest du diesen Eintrag wirklich löschen?',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: () => {
            setItinerary(itinerary.filter(item => item.id !== id));
          },
        },
      ]
    );
  };

  const addSquadMember = () => {
    if (!newMember.name) {
      Alert.alert('Fehler', 'Bitte Name eingeben');
      return;
    }

    const member: SquadMember = {
      id: Date.now().toString(),
      ...newMember,
    };

    setSquad([...squad, member]);
    setNewMember({ name: '', email: '' });
  };

  const removeSquadMember = (id: string) => {
    if (squad.length <= 1) {
      Alert.alert('Fehler', 'Mindestens ein Mitglied muss bleiben');
      return;
    }
    setSquad(squad.filter(member => member.id !== id));
  };

  const formatIDR = (amount: number) => {
    return amount.toLocaleString('id-ID');
  };

  const getPriceTypeLabel = (priceType: string) => {
    switch (priceType) {
      case 'per_person': return 'pro Person';
      case 'per_group': return 'pro Gruppe';
      case 'fixed': return 'Festpreis';
      default: return '';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#0F172A" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.title}>{t('itinerary.title', 'Reiseplaner')}</Text>
            <Text style={styles.subtitle}>{t('itinerary.subtitle', 'Tage planen & teilen')}</Text>
          </View>
        </View>

        {/* Cost Summary Card */}
        <View style={styles.costSummaryCard}>
          <View style={styles.costSummaryHeader}>
            <Calculator size={24} color="#00B4D8" />
            <Text style={styles.costSummaryTitle}>💰 Kostenübersicht</Text>
          </View>
          <View style={styles.costSummaryContent}>
            <View style={styles.costRow}>
              <Text style={styles.costLabel}>Gesamtkosten:</Text>
              <Text style={styles.costValue}>IDR {formatIDR(totalCosts.total)}</Text>
            </View>
            <View style={styles.costRow}>
              <Text style={styles.costLabel}>Pro Person ({squad.length} Personen):</Text>
              <Text style={styles.costValueHighlight}>IDR {formatIDR(totalCosts.perPersonShare)}</Text>
            </View>
            {squad.length >= 3 && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>
                  🎉 Gruppenrabatt: {squad.length >= 5 ? '15%' : '10%'} aktiv!
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Squad Section */}
        <View style={styles.squadSection}>
          <Text style={styles.sectionTitle}>👥 Squad ({squad.length})</Text>
          <View style={styles.squadList}>
            {squad.map((member) => (
              <View key={member.id} style={styles.squadMember}>
                <View style={styles.squadAvatar}>
                  <Text style={styles.squadAvatarText}>{member.name.charAt(0)}</Text>
                </View>
                <View style={styles.squadInfo}>
                  <Text style={styles.squadName}>{member.name}</Text>
                  {member.email && <Text style={styles.squadEmail}>{member.email}</Text>}
                </View>
                <TouchableOpacity onPress={() => removeSquadMember(member.id)}>
                  <Trash2 size={16} color="#FF6B6B" />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* Add Member */}
          <View style={styles.addMemberForm}>
            <TextInput
              style={styles.input}
              placeholder="Name"
              placeholderTextColor="#9CA3AF"
              value={newMember.name}
              onChangeText={(text) => setNewMember({ ...newMember, name: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Email (optional)"
              placeholderTextColor="#9CA3AF"
              value={newMember.email}
              onChangeText={(text) => setNewMember({ ...newMember, email: text })}
            />
            <TouchableOpacity style={styles.addMemberButton} onPress={addSquadMember}>
              <Plus size={16} color="#FFFFFF" />
              <Text style={styles.addMemberButtonText}>Hinzufügen</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Itinerary Section */}
        <View style={styles.itinerarySection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📅 Reiseplan</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setShowAddForm(true)}
            >
              <Plus size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Add Form */}
          {showAddForm && (
            <View style={styles.addForm}>
              <TextInput
                style={styles.input}
                placeholder="Titel *"
                placeholderTextColor="#9CA3AF"
                value={newItem.title}
                onChangeText={(text) => setNewItem({ ...newItem, title: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Beschreibung"
                placeholderTextColor="#9CA3AF"
                value={newItem.description}
                onChangeText={(text) => setNewItem({ ...newItem, description: text })}
              />
              <View style={styles.dateTimeRow}>
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  placeholder="Datum *"
                  placeholderTextColor="#9CA3AF"
                  value={newItem.date}
                  onChangeText={(text) => setNewItem({ ...newItem, date: text })}
                />
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  placeholder="Uhrzeit"
                  placeholderTextColor="#9CA3AF"
                  value={newItem.time}
                  onChangeText={(text) => setNewItem({ ...newItem, time: text })}
                />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Ort"
                placeholderTextColor="#9CA3AF"
                value={newItem.location}
                onChangeText={(text) => setNewItem({ ...newItem, location: text })}
              />
              <View style={styles.priceRow}>
                <TextInput
                  style={[styles.input, styles.priceInput]}
                  placeholder="Preis (IDR)"
                  placeholderTextColor="#9CA3AF"
                  value={newItem.basePrice.toString()}
                  onChangeText={(text) => setNewItem({ ...newItem, basePrice: parseInt(text) || 0 })}
                  keyboardType="numeric"
                />
                <View style={styles.priceTypeSelector}>
                  {(['per_person', 'per_group', 'fixed'] as const).map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.priceTypeButton,
                        newItem.priceType === type && styles.priceTypeButtonActive
                      ]}
                      onPress={() => setNewItem({ ...newItem, priceType: type })}
                    >
                      <Text style={[
                        styles.priceTypeText,
                        newItem.priceType === type && styles.priceTypeTextActive
                      ]}>
                        {getPriceTypeLabel(type)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View style={styles.formButtons}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={() => setShowAddForm(false)}
                >
                  <Text style={styles.cancelButtonText}>Abbrechen</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={addItem}>
                  <Text style={styles.saveButtonText}>Speichern</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Itinerary List */}
          <View style={styles.itineraryList}>
            {itinerary.map((item, index) => (
              <View key={item.id} style={styles.itineraryCard}>
                <View style={styles.dragHandle}>
                  <GripVertical size={20} color="#9CA3AF" />
                </View>
                
                <View style={styles.itineraryContent}>
                  <View style={styles.itineraryHeader}>
                    <Text style={styles.itineraryOrder}>#{item.order}</Text>
                    <Text style={styles.itineraryTitle}>{item.title}</Text>
                  </View>
                  
                  {item.description && (
                    <Text style={styles.itineraryDescription}>{item.description}</Text>
                  )}
                  
                  <View style={styles.itineraryMeta}>
                    <View style={styles.metaItem}>
                      <Calendar size={14} color="#6B7280" />
                      <Text style={styles.metaText}>{item.date}</Text>
                    </View>
                    {item.time && (
                      <View style={styles.metaItem}>
                        <Clock size={14} color="#6B7280" />
                        <Text style={styles.metaText}>{item.time}</Text>
                      </View>
                    )}
                  </View>
                  
                  {item.location && (
                    <View style={styles.itineraryLocation}>
                      <MapPin size={14} color="#00B4D8" />
                      <Text style={styles.locationText}>{item.location}</Text>
                    </View>
                  )}

                  {/* Price Display */}
                  {item.basePrice && item.basePrice > 0 && (
                    <View style={styles.priceDisplay}>
                      <DollarSign size={14} color="#10B981" />
                      <Text style={styles.priceText}>
                        IDR {formatIDR(calculateDynamicPrice(item.basePrice, item.priceType || 'per_person', squad.length))}
                      </Text>
                      <Text style={styles.priceTypeLabel}>
                        ({getPriceTypeLabel(item.priceType || 'per_person')})
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.itineraryActions}>
                  {index > 0 && (
                    <TouchableOpacity 
                      style={styles.moveButton}
                      onPress={() => moveItem(index, index - 1)}
                    >
                      <Text style={styles.moveButtonText}>↑</Text>
                    </TouchableOpacity>
                  )}
                  {index < itinerary.length - 1 && (
                    <TouchableOpacity 
                      style={styles.moveButton}
                      onPress={() => moveItem(index, index + 1)}
                    >
                      <Text style={styles.moveButtonText}>↓</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={() => deleteItem(item.id)}
                  >
                    <Trash2 size={16} color="#FF6B6B" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Share Button */}
        <TouchableOpacity style={styles.shareButton}>
          <Users size={20} color="#FFFFFF" />
          <Text style={styles.shareButtonText}>Plan mit Squad teilen</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },

  // Cost Summary Card
  costSummaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  costSummaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  costSummaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  costSummaryContent: {
    gap: 12,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  costLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  costValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  costValueHighlight: {
    fontSize: 18,
    fontWeight: '800',
    color: '#00B4D8',
  },
  discountBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginTop: 8,
  },
  discountText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#065F46',
    textAlign: 'center',
  },

  // Squad Section
  squadSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 16,
  },
  squadList: {
    gap: 12,
    marginBottom: 16,
  },
  squadMember: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  squadAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#00B4D8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  squadAvatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  squadInfo: {
    flex: 1,
  },
  squadName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  squadEmail: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  addMemberForm: {
    gap: 10,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 14,
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '500',
  },
  addMemberButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#00B4D8',
    paddingVertical: 14,
    borderRadius: 16,
  },
  addMemberButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Itinerary Section
  itinerarySection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#90BE6D',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  addForm: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  priceRow: {
    gap: 12,
  },
  priceInput: {
    marginBottom: 8,
  },
  priceTypeSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  priceTypeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  priceTypeButtonActive: {
    backgroundColor: '#00B4D8',
  },
  priceTypeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  priceTypeTextActive: {
    color: '#FFFFFF',
  },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#90BE6D',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  itineraryList: {
    gap: 12,
  },
  itineraryCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  dragHandle: {
    justifyContent: 'center',
    marginRight: 12,
  },
  itineraryContent: {
    flex: 1,
  },
  itineraryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  itineraryOrder: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00B4D8',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  itineraryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    flex: 1,
  },
  itineraryDescription: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 8,
    lineHeight: 18,
  },
  itineraryMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  itineraryLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  locationText: {
    fontSize: 12,
    color: '#00B4D8',
    fontWeight: '500',
    flex: 1,
  },
  priceDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  priceText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#065F46',
  },
  priceTypeLabel: {
    fontSize: 11,
    color: '#065F46',
    fontWeight: '500',
  },
  itineraryActions: {
    justifyContent: 'center',
    gap: 8,
    marginLeft: 12,
  },
  moveButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moveButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#00B4D8',
    paddingVertical: 18,
    borderRadius: 20,
    marginTop: 8,
    shadowColor: '#00B4D8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});