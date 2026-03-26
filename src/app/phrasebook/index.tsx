import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Search, Volume2, Star, BookOpen } from 'lucide-react-native';

interface Phrase {
  id: string;
  category: string;
  indonesian: string;
  german: string;
  english: string;
  pronunciation: string;
  isFavorite: boolean;
}

const phraseData: Phrase[] = [
  // Greetings
  { id: '1', category: 'greetings', indonesian: 'Selamat pagi', german: 'Guten Morgen', english: 'Good morning', pronunciation: 'seh-lah-mat pa-gi', isFavorite: false },
  { id: '2', category: 'greetings', indonesian: 'Selamat siang', german: 'Guten Tag', english: 'Good afternoon', pronunciation: 'seh-lah-mat see-ang', isFavorite: false },
  { id: '3', category: 'greetings', indonesian: 'Selamat malam', german: 'Guten Abend', english: 'Good evening', pronunciation: 'seh-lah-mat ma-lam', isFavorite: false },
  { id: '4', category: 'greetings', indonesian: 'Apa kabar?', german: 'Wie geht es Ihnen?', english: 'How are you?', pronunciation: 'ah-pa ka-bar', isFavorite: false },
  { id: '5', category: 'greetings', indonesian: 'Baik, terima kasih', german: 'Gut, danke', english: 'Fine, thank you', pronunciation: 'ba-ik, teh-ree-mah ka-seeh', isFavorite: false },
  
  // Directions
  { id: '6', category: 'directions', indonesian: 'Di mana...?', german: 'Wo ist...?', english: 'Where is...?', pronunciation: 'dee mah-na', isFavorite: false },
  { id: '7', category: 'directions', indonesian: 'Kiri', german: 'Links', english: 'Left', pronunciation: 'kee-ree', isFavorite: false },
  { id: '8', category: 'directions', indonesian: 'Kanan', german: 'Rechts', english: 'Right', pronunciation: 'kah-nan', isFavorite: false },
  { id: '9', category: 'directions', indonesian: 'Lurus', german: 'Geradeaus', english: 'Straight', pronunciation: 'loo-roos', isFavorite: false },
  { id: '10', category: 'directions', indonesian: 'Berhenti', german: 'Stopp/Halt', english: 'Stop', pronunciation: 'ber-hen-tee', isFavorite: false },
  
  // Food
  { id: '11', category: 'food', indonesian: 'Saya mau pesan', german: 'Ich möchte bestellen', english: 'I want to order', pronunciation: 'sah-ya ma-ow peh-san', isFavorite: false },
  { id: '12', category: 'food', indonesian: 'Berapa harganya?', german: 'Wie viel kostet das?', english: 'How much is it?', pronunciation: 'beh-rah-pa har-gan-ya', isFavorite: false },
  { id: '13', category: 'food', indonesian: 'Tidak pedas', german: 'Nicht scharf', english: 'Not spicy', pronunciation: 'tee-dak peh-das', isFavorite: false },
  { id: '14', category: 'food', indonesian: 'Air putih', german: 'Wasser', english: 'Water', pronunciation: 'ah-ir poo-teeh', isFavorite: false },
  { id: '15', category: 'food', indonesian: 'Nasi goreng', german: 'Gebratener Reis', english: 'Fried rice', pronunciation: 'nah-see go-reng', isFavorite: false },
  
  // Emergency
  { id: '16', category: 'emergency', indonesian: 'Tolong!', german: 'Hilfe!', english: 'Help!', pronunciation: 'toh-long', isFavorite: false },
  { id: '17', category: 'emergency', indonesian: 'Panggil dokter', german: 'Rufen Sie einen Arzt', english: 'Call a doctor', pronunciation: 'pang-gil dok-ter', isFavorite: false },
  { id: '18', category: 'emergency', indonesian: 'Saya sakit', german: 'Ich bin krank', english: 'I am sick', pronunciation: 'sah-ya sah-kit', isFavorite: false },
  { id: '19', category: 'emergency', indonesian: 'Di mana rumah sakit?', german: 'Wo ist das Krankenhaus?', english: 'Where is the hospital?', pronunciation: 'dee mah-na roo-mah sah-kit', isFavorite: false },
  { id: '20', category: 'emergency', indonesian: 'Kecelakaan', german: 'Unfall', english: 'Accident', pronunciation: 'keh-cheh-la-ka-an', isFavorite: false },
  
  // Shopping
  { id: '21', category: 'shopping', indonesian: 'Terlalu mahal', german: 'Zu teuer', english: 'Too expensive', pronunciation: 'ter-la-loo ma-hal', isFavorite: false },
  { id: '22', category: 'shopping', indonesian: 'Boleh kurang?', german: 'Kann man handeln?', english: 'Can I bargain?', pronunciation: 'bo-leh koo-rang', isFavorite: false },
  { id: '23', category: 'shopping', indonesian: 'Saya beli', german: 'Ich nehme es', english: 'I will buy it', pronunciation: 'sah-ya beh-lee', isFavorite: false },
  { id: '24', category: 'shopping', indonesian: 'Di mana ATM?', german: 'Wo ist der Geldautomat?', english: 'Where is the ATM?', pronunciation: 'dee mah-na ah-teh-em', isFavorite: false },
  
  // Transport
  { id: '25', category: 'transport', indonesian: 'Berapa ongkosnya?', german: 'Wie viel kostet die Fahrt?', english: 'How much is the fare?', pronunciation: 'beh-rah-pa ong-kos-nya', isFavorite: false },
  { id: '26', category: 'transport', indonesian: 'Ke bandara', german: 'Zum Flughafen', english: 'To the airport', pronunciation: 'keh ban-da-ra', isFavorite: false },
  { id: '27', category: 'transport', indonesian: 'Pakai meter', german: 'Mit Taxameter', english: 'Use the meter', pronunciation: 'pa-ka-ee meh-ter', isFavorite: false },
];

const categories = [
  { id: 'all', name: 'Alle', icon: '📚' },
  { id: 'greetings', name: 'Begrüßungen', icon: '👋' },
  { id: 'directions', name: 'Wegbeschreibung', icon: '🧭' },
  { id: 'food', name: 'Essen & Trinken', icon: '🍜' },
  { id: 'emergency', name: 'Notfall', icon: '🆘' },
  { id: 'shopping', name: 'Einkaufen', icon: '🛒' },
  { id: 'transport', name: 'Transport', icon: '🚗' },
];

export default function Phrasebook() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [phrases, setPhrases] = useState<Phrase[]>(phraseData);

  const toggleFavorite = (id: string) => {
    setPhrases(phrases.map(phrase => 
      phrase.id === id ? { ...phrase, isFavorite: !phrase.isFavorite } : phrase
    ));
  };

  const filteredPhrases = phrases.filter(phrase => {
    const matchesSearch = 
      phrase.indonesian.toLowerCase().includes(searchQuery.toLowerCase()) ||
      phrase.german.toLowerCase().includes(searchQuery.toLowerCase()) ||
      phrase.english.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || phrase.category === selectedCategory;
    const matchesFavorites = !showFavoritesOnly || phrase.isFavorite;
    return matchesSearch && matchesCategory && matchesFavorites;
  });

  const playAudio = (text: string) => {
    // In a real app, this would use text-to-speech
    console.log('Playing audio for:', text);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t('phrasebook.title')}</Text>
          <Text style={styles.subtitle}>{t('phrasebook.subtitle')}</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search size={20} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('phrasebook.search')}
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Favorites Toggle */}
        <TouchableOpacity 
          style={[styles.favoritesToggle, showFavoritesOnly && styles.favoritesToggleActive]}
          onPress={() => setShowFavoritesOnly(!showFavoritesOnly)}
        >
          <Star size={20} color={showFavoritesOnly ? '#FFFFFF' : '#F59E0B'} fill={showFavoritesOnly ? '#FFFFFF' : 'none'} />
          <Text style={[styles.favoritesToggleText, showFavoritesOnly && styles.favoritesToggleTextActive]}>
            {t('phrasebook.favorites')} ({phrases.filter(p => p.isFavorite).length})
          </Text>
        </TouchableOpacity>

        {/* Category Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryList}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryChip,
                selectedCategory === category.id && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === category.id && styles.categoryChipTextActive,
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Phrases List */}
        <View style={styles.phrasesList}>
          {filteredPhrases.map((phrase) => (
            <View key={phrase.id} style={styles.phraseCard}>
              <View style={styles.phraseHeader}>
                <View style={styles.phraseContent}>
                  <Text style={styles.indonesianText}>{phrase.indonesian}</Text>
                  <Text style={styles.germanText}>{phrase.german}</Text>
                  <Text style={styles.englishText}>{phrase.english}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.favoriteButton}
                  onPress={() => toggleFavorite(phrase.id)}
                >
                  <Star 
                    size={20} 
                    color="#F59E0B" 
                    fill={phrase.isFavorite ? '#F59E0B' : 'none'} 
                  />
                </TouchableOpacity>
              </View>
              
              <View style={styles.pronunciationContainer}>
                <Text style={styles.pronunciationLabel}>Aussprache:</Text>
                <Text style={styles.pronunciationText}>{phrase.pronunciation}</Text>
                <TouchableOpacity 
                  style={styles.audioButton}
                  onPress={() => playAudio(phrase.indonesian)}
                >
                  <Volume2 size={16} color="#00B4D8" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Empty State */}
        {filteredPhrases.length === 0 && (
          <View style={styles.emptyState}>
            <BookOpen size={48} color="#9CA3AF" />
            <Text style={styles.emptyStateText}>Keine Ausdrücke gefunden</Text>
            <Text style={styles.emptyStateSubtext}>
              Versuche eine andere Suche oder Kategorie
            </Text>
          </View>
        )}

        {/* Stats */}
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>
            {filteredPhrases.length} Ausdrücke • {phrases.filter(p => p.isFavorite).length} Favoriten
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  favoritesToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  favoritesToggleActive: {
    backgroundColor: '#F59E0B',
    borderColor: '#F59E0B',
  },
  favoritesToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
  },
  favoritesToggleTextActive: {
    color: '#FFFFFF',
  },
  categoryList: {
    marginBottom: 16,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
    gap: 6,
  },
  categoryChipActive: {
    backgroundColor: '#00B4D8',
  },
  categoryIcon: {
    fontSize: 14,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },
  phrasesList: {
    gap: 12,
  },
  phraseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  phraseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  phraseContent: {
    flex: 1,
  },
  indonesianText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  germanText: {
    fontSize: 14,
    color: '#00B4D8',
    marginBottom: 2,
  },
  englishText: {
    fontSize: 12,
    color: '#6B7280',
  },
  favoriteButton: {
    padding: 8,
  },
  pronunciationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 10,
    borderRadius: 10,
    gap: 8,
  },
  pronunciationLabel: {
    fontSize: 11,
    color: '#6B7280',
  },
  pronunciationText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
    flex: 1,
    fontStyle: 'italic',
  },
  audioButton: {
    padding: 4,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    marginTop: 20,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  statsContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  statsText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});