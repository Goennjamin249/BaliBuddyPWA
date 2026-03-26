import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { Plus, Check, Package, Shirt, Sun, Cloud, Umbrella, Trash2, CloudRain, ArrowLeft } from 'lucide-react-native';

interface PackingItem {
  id: string;
  name: string;
  category: string;
  isPacked: boolean;
  isCustom: boolean;
  weatherBased: boolean;
  activityBased: string;
}

const defaultPackingList: PackingItem[] = [
  // Kleidung
  { id: '1', name: 'T-Shirts (5x)', category: 'Kleidung', isPacked: false, isCustom: false, weatherBased: true, activityBased: '' },
  { id: '2', name: 'Shorts (3x)', category: 'Kleidung', isPacked: false, isCustom: false, weatherBased: true, activityBased: '' },
  { id: '3', name: 'Badehose/Bikini', category: 'Kleidung', isPacked: false, isCustom: false, weatherBased: false, activityBased: 'Strand' },
  { id: '4', name: 'Sarong', category: 'Kleidung', isPacked: false, isCustom: false, weatherBased: false, activityBased: 'Tempel' },
  { id: '5', name: 'Leichte Jacke', category: 'Kleidung', isPacked: false, isCustom: false, weatherBased: true, activityBased: '' },
  { id: '6', name: 'Regenjacke', category: 'Kleidung', isPacked: false, isCustom: false, weatherBased: true, activityBased: '' },
  
  // Schuhe
  { id: '7', name: 'Flip-Flops', category: 'Schuhe', isPacked: false, isCustom: false, weatherBased: false, activityBased: 'Strand' },
  { id: '8', name: 'Wanderschuhe', category: 'Schuhe', isPacked: false, isCustom: false, weatherBased: false, activityBased: 'Wandern' },
  { id: '9', name: 'Sandalen', category: 'Schuhe', isPacked: false, isCustom: false, weatherBased: false, activityBased: '' },
  
  // Toilettenartikel
  { id: '10', name: 'Sonnencreme SPF 50+', category: 'Toilettenartikel', isPacked: false, isCustom: false, weatherBased: true, activityBased: '' },
  { id: '11', name: 'Mückenschutz', category: 'Toilettenartikel', isPacked: false, isCustom: false, weatherBased: false, activityBased: '' },
  { id: '12', name: 'Shampoo/Duschgel', category: 'Toilettenartikel', isPacked: false, isCustom: false, weatherBased: false, activityBased: '' },
  { id: '13', name: 'Zahnbürste & Zahnpasta', category: 'Toilettenartikel', isPacked: false, isCustom: false, weatherBased: false, activityBased: '' },
  
  // Elektronik
  { id: '14', name: 'Ladegerät & Kabel', category: 'Elektronik', isPacked: false, isCustom: false, weatherBased: false, activityBased: '' },
  { id: '15', name: 'Powerbank', category: 'Elektronik', isPacked: false, isCustom: false, weatherBased: false, activityBased: '' },
  { id: '16', name: 'Adapter (Typ C/F)', category: 'Elektronik', isPacked: false, isCustom: false, weatherBased: false, activityBased: '' },
  
  // Dokumente
  { id: '17', name: 'Reisepass', category: 'Dokumente', isPacked: false, isCustom: false, weatherBased: false, activityBased: '' },
  { id: '18', name: 'Visum-Papier', category: 'Dokumente', isPacked: false, isCustom: false, weatherBased: false, activityBased: '' },
  { id: '19', name: 'Flugtickets', category: 'Dokumente', isPacked: false, isCustom: false, weatherBased: false, activityBased: '' },
  { id: '20', name: 'Versicherungskarte', category: 'Dokumente', isPacked: false, isCustom: false, weatherBased: false, activityBased: '' },
  
  // Sonstiges
  { id: '21', name: 'Rucksack/Daypack', category: 'Sonstiges', isPacked: false, isCustom: false, weatherBased: false, activityBased: '' },
  { id: '22', name: 'Wasserflasche', category: 'Sonstiges', isPacked: false, isCustom: false, weatherBased: false, activityBased: '' },
  { id: '23', name: 'Regenschirm', category: 'Sonstiges', isPacked: false, isCustom: false, weatherBased: true, activityBased: '' },
];

const categories = [...new Set(defaultPackingList.map(item => item.category))];

export default function PackingList() {
  const { t } = useTranslation();
  const router = useRouter();
  const [items, setItems] = useState<PackingItem[]>(defaultPackingList);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Kleidung');
  const [filter, setFilter] = useState<'all' | 'packed' | 'unpacked'>('all');

  const togglePacked = (id: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, isPacked: !item.isPacked } : item
    ));
  };

  const addItem = () => {
    if (!newItemName.trim()) {
      Alert.alert('Fehler', 'Bitte gib einen Namen ein');
      return;
    }

    const newItem: PackingItem = {
      id: Date.now().toString(),
      name: newItemName,
      category: selectedCategory,
      isPacked: false,
      isCustom: true,
      weatherBased: false,
      activityBased: '',
    };

    setItems([...items, newItem]);
    setNewItemName('');
    setShowAddForm(false);
  };

  const deleteItem = (id: string) => {
    Alert.alert(
      'Löschen',
      'Möchtest du diesen Artikel wirklich löschen?',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: () => {
            setItems(items.filter(item => item.id !== id));
          },
        },
      ]
    );
  };

  const filteredItems = items.filter(item => {
    if (filter === 'packed') return item.isPacked;
    if (filter === 'unpacked') return !item.isPacked;
    return true;
  });

  const packedCount = items.filter(item => item.isPacked).length;
  const totalCount = items.length;
  const progress = totalCount > 0 ? (packedCount / totalCount) * 100 : 0;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Kleidung': return <Shirt size={16} color="#00B4D8" />;
      case 'Toilettenartikel': return <Package size={16} color="#90BE6D" />;
      default: return <Package size={16} color="#6B7280" />;
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
            <ArrowLeft size={24} color="#1F2937" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.title}>{t('packing.title', 'Packliste')}</Text>
            <Text style={styles.subtitle}>{t('packing.subtitle', 'Wetter- & aktivitätsbasiert')}</Text>
          </View>
        </View>

        {/* Progress Card */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Fortschritt</Text>
            <Text style={styles.progressText}>{packedCount}/{totalCount}</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressPercent}>{Math.round(progress)}% eingepackt</Text>
        </View>

        {/* Filter Buttons */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterButtonText, filter === 'all' && styles.filterButtonTextActive]}>
              Alle ({items.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'unpacked' && styles.filterButtonActive]}
            onPress={() => setFilter('unpacked')}
          >
            <Text style={[styles.filterButtonText, filter === 'unpacked' && styles.filterButtonTextActive]}>
              Einzupacken ({items.length - packedCount})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'packed' && styles.filterButtonActive]}
            onPress={() => setFilter('packed')}
          >
            <Text style={[styles.filterButtonText, filter === 'packed' && styles.filterButtonTextActive]}>
              Eingepackt ({packedCount})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Weather Tips */}
        <View style={styles.weatherTips}>
          <View style={styles.weatherTip}>
            <Sun size={20} color="#F59E0B" />
            <Text style={styles.weatherTipText}>
              {'Sonnig: Sonnencreme & Hut einpacken'}
            </Text>
          </View>
          <View style={styles.weatherTip}>
            <CloudRain size={20} color="#00B4D8" />
            <Text style={styles.weatherTipText}>
              {'Regenzeit: Regenjacke nicht vergessen'}
            </Text>
          </View>
        </View>

        {/* Add Item Button */}
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowAddForm(true)}
        >
          <Plus size={20} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Artikel hinzufügen</Text>
        </TouchableOpacity>

        {/* Add Form */}
        {showAddForm && (
          <View style={styles.addForm}>
            <TextInput
              style={styles.input}
              placeholder="Artikelname"
              placeholderTextColor="#9CA3AF"
              value={newItemName}
              onChangeText={setNewItemName}
            />
            
            <Text style={styles.formLabel}>Kategorie:</Text>
            <View style={styles.categorySelector}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryChip,
                    selectedCategory === category && styles.categoryChipActive,
                  ]}
                  onPress={() => setSelectedCategory(category)}
                >
                  <Text style={[
                    styles.categoryChipText,
                    selectedCategory === category && styles.categoryChipTextActive,
                  ]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.formButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowAddForm(false)}
              >
                <Text style={styles.cancelButtonText}>Abbrechen</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={addItem}>
                <Text style={styles.saveButtonText}>Hinzufügen</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Packing List by Category */}
        {categories.map((category) => {
          const categoryItems = filteredItems.filter(item => item.category === category);
          if (categoryItems.length === 0) return null;

          return (
            <View key={category} style={styles.categorySection}>
              <View style={styles.categoryHeader}>
                {getCategoryIcon(category)}
                <Text style={styles.categoryTitle}>{category}</Text>
                <Text style={styles.categoryCount}>
                  {categoryItems.filter(i => i.isPacked).length}/{categoryItems.length}
                </Text>
              </View>

              {categoryItems.map((item) => (
                <View key={item.id} style={styles.packingItem}>
                  <TouchableOpacity 
                    style={styles.checkboxContainer}
                    onPress={() => togglePacked(item.id)}
                  >
                    <View style={[styles.checkbox, item.isPacked && styles.checkboxChecked]}>
                      {item.isPacked && <Check size={16} color="#FFFFFF" />}
                    </View>
                  </TouchableOpacity>

                  <View style={styles.itemInfo}>
                    <Text style={[styles.itemName, item.isPacked && styles.itemNameChecked]}>
                      {item.name}
                    </Text>
                    <View style={styles.itemTags}>
                      {item.weatherBased && (
                        <View style={styles.weatherTag}>
                          <Cloud size={10} color="#00B4D8" />
                          <Text style={styles.weatherTagText}>Wetter</Text>
                        </View>
                      )}
                      {item.activityBased && (
                        <View style={styles.activityTag}>
                          <Text style={styles.activityTagText}>{item.activityBased}</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {item.isCustom && (
                    <TouchableOpacity onPress={() => deleteItem(item.id)}>
                      <Trash2 size={16} color="#FF6B6B" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          );
        })}

        {/* Tips */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 Pack-Tipps</Text>
          <View style={styles.tipsList}>
            <Text style={styles.tipItem}>• Leichte Kleidung für tropisches Klima</Text>
            <Text style={styles.tipItem}>• Sarong für Tempelbesuche</Text>
            <Text style={styles.tipItem}>• Regenschutz in der Regenzeit (Okt-März)</Text>
            <Text style={styles.tipItem}>• Bequeme Schuhe für Wanderungen</Text>
            <Text style={styles.tipItem}>• Kopfbedeckung gegen Sonne</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
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
  progressCard: {
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
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  progressText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#00B4D8',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#90BE6D',
    borderRadius: 4,
  },
  progressPercent: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'right',
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterButtonActive: {
    backgroundColor: '#00B4D8',
    borderColor: '#00B4D8',
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  weatherTips: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  weatherTip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFBEB',
    padding: 12,
    borderRadius: 12,
  },
  weatherTipText: {
    fontSize: 11,
    color: '#92400E',
    flex: 1,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#90BE6D',
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  addForm: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#1F2937',
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginTop: 8,
  },
  categorySelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryChipActive: {
    backgroundColor: '#00B4D8',
    borderColor: '#00B4D8',
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#90BE6D',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  categorySection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
  },
  categoryCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  packingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  checkboxContainer: {
    padding: 4,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#90BE6D',
    borderColor: '#90BE6D',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 4,
  },
  itemNameChecked: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  itemTags: {
    flexDirection: 'row',
    gap: 6,
  },
  weatherTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  weatherTagText: {
    fontSize: 10,
    color: '#0369A1',
  },
  activityTag: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  activityTagText: {
    fontSize: 10,
    color: '#166534',
  },
  tipsCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#90BE6D',
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#166534',
    marginBottom: 12,
  },
  tipsList: {
    gap: 8,
  },
  tipItem: {
    fontSize: 13,
    color: '#15803D',
    lineHeight: 18,
  },
});