/**
 * Dictionary Screen for BaliBuddy
 * Indonesian-German dictionary with fuzzy search
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Search, Book, Copy, Check, Filter } from 'lucide-react-native';
import { FlashList } from '@shopify/flash-list';
import GlobalHeader from '../../components/GlobalHeader';
import { searchDictionary, dictionaryData, dictionaryCategories, DictionaryEntry } from '../../services/dictionary';

export default function DictionaryScreen() {
  const { t, i18n } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Alle');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showCategories, setShowCategories] = useState(false);

  const lang = i18n.language === 'de' ? 'de' : 'en';

  // Search dictionary
  const results = searchDictionary(searchQuery, selectedCategory);

  // Copy to clipboard
  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Copy error:', error);
    }
  };

  // Render dictionary entry
  const renderEntry = ({ item }: { item: DictionaryEntry }) => (
    <View style={styles.entryCard}>
      <View style={styles.entryHeader}>
        <View style={styles.entryMain}>
          <Text style={styles.entryIndonesian}>{item.indonesian}</Text>
          <Text style={styles.entryPronunciation}>{item.pronunciation}</Text>
        </View>
        <TouchableOpacity
          style={styles.copyButton}
          onPress={() => copyToClipboard(item.indonesian, item.id)}
        >
          {copiedId === item.id ? (
            <Check size={16} color="#10B981" />
          ) : (
            <Copy size={16} color="#64748B" />
          )}
        </TouchableOpacity>
      </View>
      
      <View style={styles.entryTranslation}>
        <Text style={styles.entryGerman}>{item.german}</Text>
        <Text style={styles.entryEnglish}>{item.english}</Text>
      </View>
      
      <View style={styles.entryCategory}>
        <Text style={styles.categoryBadge}>{item.category}</Text>
      </View>
      
      {item.examples.length > 0 && (
        <View style={styles.examplesSection}>
          <Text style={styles.examplesTitle}>
            {i18n.language === 'de' ? 'Beispiele:' : 'Examples:'}
          </Text>
          {item.examples.map((example, idx) => (
            <View key={idx} style={styles.example}>
              <Text style={styles.exampleIndonesian}>{example.indonesian}</Text>
              <Text style={styles.exampleGerman}>{example.german}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <GlobalHeader 
        title={t('survival.dictionary', 'Wörterbuch')} 
        showBackButton={true} 
        showSettings={false} 
      />

      <View style={styles.content}>
        {/* Search Bar */}
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Search size={20} color="#94A3B8" />
            <TextInput
              style={styles.searchInput}
              placeholder={i18n.language === 'de' ? 'Suchen...' : 'Search...'}
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Book size={20} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>
          
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setShowCategories(!showCategories)}
          >
            <Filter size={20} color="#64748B" />
          </TouchableOpacity>
        </View>

        {/* Category Filter */}
        {showCategories && (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesScroll}
          >
            {dictionaryCategories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryChip,
                  selectedCategory === category && styles.categoryChipActive,
                ]}
                onPress={() => {
                  setSelectedCategory(category);
                  setShowCategories(false);
                }}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    selectedCategory === category && styles.categoryChipTextActive,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Results Count */}
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsCount}>
            {results.length} {i18n.language === 'de' ? 'Einträge' : 'entries'}
          </Text>
        </View>

        {/* Dictionary List */}
        {results.length > 0 ? (
        <FlashList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={renderEntry}
          contentContainerStyle={styles.listContent}
        />
        ) : (
          <View style={styles.emptyState}>
            <Book size={48} color="#94A3B8" />
            <Text style={styles.emptyText}>
              {i18n.language === 'de' 
                ? 'Keine Einträge gefunden' 
                : 'No entries found'
              }
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0FDF4',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  searchSection: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#0F172A',
    paddingVertical: 12,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoriesScroll: {
    marginBottom: 12,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },
  resultsHeader: {
    marginBottom: 8,
  },
  resultsCount: {
    fontSize: 14,
    color: '#64748B',
  },
  listContent: {
    paddingBottom: 24,
  },
  entryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  entryMain: {
    flex: 1,
  },
  entryIndonesian: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  entryPronunciation: {
    fontSize: 14,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  copyButton: {
    padding: 4,
  },
  entryTranslation: {
    marginBottom: 8,
  },
  entryGerman: {
    fontSize: 16,
    color: '#10B981',
    fontWeight: '600',
    marginBottom: 2,
  },
  entryEnglish: {
    fontSize: 14,
    color: '#64748B',
  },
  entryCategory: {
    marginBottom: 12,
  },
  categoryBadge: {
    fontSize: 12,
    color: '#64748B',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  examplesSection: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  examplesTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
  },
  example: {
    marginBottom: 8,
  },
  exampleIndonesian: {
    fontSize: 14,
    color: '#0F172A',
    marginBottom: 2,
  },
  exampleGerman: {
    fontSize: 14,
    color: '#64748B',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 16,
  },
});
