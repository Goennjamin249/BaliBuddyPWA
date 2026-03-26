import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Search, Tag, TrendingDown, Info } from 'lucide-react-native';

interface PriceItem {
  id: string;
  item_name: string;
  category: string;
  min_price_idr: number;
  max_price_idr: number;
  market_type: string;
  bargaining_tips: string;
}

const priceData: PriceItem[] = [
  { id: '1', item_name: 'Nasi Goreng', category: 'food', min_price_idr: 15000, max_price_idr: 35000, market_type: 'warung', bargaining_tips: 'Ask for local price, avoid tourist areas' },
  { id: '2', item_name: 'Mie Goreng', category: 'food', min_price_idr: 15000, max_price_idr: 30000, market_type: 'warung', bargaining_tips: 'Similar to nasi goreng pricing' },
  { id: '3', item_name: 'Bintang Beer (small)', category: 'drinks', min_price_idr: 25000, max_price_idr: 50000, market_type: 'bar', bargaining_tips: 'Cheaper at minimarkets' },
  { id: '4', item_name: 'Water Bottle (1.5L)', category: 'drinks', min_price_idr: 3000, max_price_idr: 8000, market_type: 'minimarket', bargaining_tips: 'Fixed price at convenience stores' },
  { id: '5', item_name: 'Scooter Rental (per day)', category: 'transport', min_price_idr: 60000, max_price_idr: 100000, market_type: 'rental', bargaining_tips: 'Negotiate for longer rentals' },
  { id: '6', item_name: 'Taxi (per km)', category: 'transport', min_price_idr: 6500, max_price_idr: 10000, market_type: 'taxi', bargaining_tips: 'Use Grab or Gojek for fixed prices' },
  { id: '7', item_name: 'Sarong', category: 'clothing', min_price_idr: 30000, max_price_idr: 100000, market_type: 'market', bargaining_tips: 'Start at 50% of asking price' },
  { id: '8', item_name: 'Bali SIM Card (tourist)', category: 'services', min_price_idr: 50000, max_price_idr: 150000, market_type: 'shop', bargaining_tips: 'Buy at official Telkomsel shops' },
  { id: '9', item_name: 'Laundry (per kg)', category: 'services', min_price_idr: 6000, max_price_idr: 15000, market_type: 'laundry', bargaining_tips: 'Hotel laundry is more expensive' },
  { id: '10', item_name: 'Temple Entrance', category: 'attractions', min_price_idr: 20000, max_price_idr: 60000, market_type: 'entrance', bargaining_tips: 'Fixed prices, sarong rental extra' },
];

const categories = ['all', 'food', 'drinks', 'transport', 'clothing', 'services', 'attractions'];

export default function BargainingGuide() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredItems = priceData.filter(item => {
    const matchesSearch = item.item_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatPrice = (price: number) => {
    return `Rp ${price.toLocaleString('de-DE')}`;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'food': return '🍜';
      case 'drinks': return '🍺';
      case 'transport': return '🛵';
      case 'clothing': return '👕';
      case 'services': return '🛠️';
      case 'attractions': return '🏛️';
      default: return '🏷️';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t('bargaining.title')}</Text>
          <Text style={styles.subtitle}>{t('bargaining.subtitle')}</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search size={20} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('bargaining.search')}
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Category Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryList}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryChip,
                selectedCategory === category && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === category && styles.categoryChipTextActive,
                ]}
              >
                {category === 'all' ? 'Alle' : getCategoryIcon(category) + ' ' + category.charAt(0).toUpperCase() + category.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Price Items */}
        <View style={styles.itemsList}>
          {filteredItems.map((item) => (
            <View key={item.id} style={styles.itemCard}>
              <View style={styles.itemHeader}>
                <View style={styles.itemTitleRow}>
                  <Text style={styles.itemIcon}>{getCategoryIcon(item.category)}</Text>
                  <Text style={styles.itemName}>{item.item_name}</Text>
                </View>
                <View style={styles.marketBadge}>
                  <Text style={styles.marketBadgeText}>{item.market_type}</Text>
                </View>
              </View>

              <View style={styles.priceContainer}>
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Min:</Text>
                  <Text style={styles.priceValue}>{formatPrice(item.min_price_idr)}</Text>
                </View>
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Max:</Text>
                  <Text style={styles.priceValue}>{formatPrice(item.max_price_idr)}</Text>
                </View>
              </View>

              <View style={styles.priceRange}>
                <View style={styles.priceRangeBar}>
                  <View style={styles.priceRangeFill} />
                </View>
                <Text style={styles.priceRangeText}>
                  Differenz: {formatPrice(item.max_price_idr - item.min_price_idr)}
                </Text>
              </View>

              <View style={styles.tipsContainer}>
                <TrendingDown size={16} color="#90BE6D" />
                <Text style={styles.tipsText}>{item.bargaining_tips}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Bargaining Tips Card */}
        <View style={styles.tipsCard}>
          <View style={styles.tipsCardHeader}>
            <Info size={20} color="#00B4D8" />
            <Text style={styles.tipsCardTitle}>Handelstipps</Text>
          </View>
          <View style={styles.tipsList}>
            <Text style={styles.tipItem}>• Immer mit einem Lächeln handeln</Text>
            <Text style={styles.tipItem}>• Mit 50% des Angebotspreises beginnen</Text>
            <Text style={styles.tipItem}>• Bargeld in kleinen Scheinen bereithalten</Text>
            <Text style={styles.tipItem}>• Bereit wegzugehen (Walking Away Taktik)</Text>
            <Text style={styles.tipItem}>• Nach dem "Local Price" fragen</Text>
            <Text style={styles.tipItem}>• Auf Touristenmärkten höher einplanen</Text>
          </View>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Tag size={20} color="#F59E0B" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Preisübersicht</Text>
            <Text style={styles.infoText}>
              Die Preise sind Richtwerte. Marktpreise können variieren. Handeln ist auf Märkten üblich, in Geschäften meist nicht möglich.
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
    marginBottom: 16,
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
  categoryList: {
    marginBottom: 16,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: '#00B4D8',
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },
  itemsList: {
    gap: 16,
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
  },
  marketBadge: {
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  marketBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#00B4D8',
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  priceRow: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  priceRange: {
    marginBottom: 12,
  },
  priceRangeBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  priceRangeFill: {
    width: '100%',
    height: '100%',
    backgroundColor: '#90BE6D',
    borderRadius: 3,
  },
  priceRangeText: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'right',
  },
  tipsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  tipsText: {
    fontSize: 13,
    color: '#166534',
    flex: 1,
    lineHeight: 18,
  },
  tipsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tipsCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  tipsCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  tipsList: {
    gap: 8,
  },
  tipItem: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    gap: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#A16207',
    lineHeight: 18,
  },
});