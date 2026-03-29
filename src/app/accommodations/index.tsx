import React, { useState, memo, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MapPin, Star, DollarSign, Wifi, Car, Coffee, ChevronLeft, Search, ExternalLink, Heart } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

interface Accommodation {
  id: string;
  name: string;
  type: 'hotel' | 'hostel' | 'villa' | 'guesthouse';
  location: string;
  pricePerNight: number;
  rating: number;
  reviewCount: number;
  amenities: string[];
  imageUrl?: string;
  bookingUrl: string;
  isFavorite: boolean;
}

function AccommodationsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<'all' | 'budget' | 'mid' | 'luxury'>('all');

  // Memoized accommodations data
  const accommodations = useMemo<Accommodation[]>(() => [
    {
      id: '1',
      name: 'Kuta Beach Hostel',
      type: 'hostel',
      location: 'Kuta',
      pricePerNight: 150000,
      rating: 4.2,
      reviewCount: 234,
      amenities: ['wifi', 'breakfast', 'pool'],
      bookingUrl: 'https://booking.com/kuta-beach-hostel',
      isFavorite: false,
    },
    {
      id: '2',
      name: 'Seminyak Boutique Hotel',
      type: 'hotel',
      location: 'Seminyak',
      pricePerNight: 850000,
      rating: 4.7,
      reviewCount: 567,
      amenities: ['wifi', 'pool', 'spa', 'restaurant'],
      bookingUrl: 'https://booking.com/seminyak-boutique',
      isFavorite: false,
    },
    {
      id: '3',
      name: 'Ubud Rice Terrace Villa',
      type: 'villa',
      location: 'Ubud',
      pricePerNight: 1200000,
      rating: 4.9,
      reviewCount: 189,
      amenities: ['wifi', 'pool', 'kitchen', 'view'],
      bookingUrl: 'https://booking.com/ubud-rice-terrace',
      isFavorite: false,
    },
    {
      id: '4',
      name: 'Canggu Surf Guesthouse',
      type: 'guesthouse',
      location: 'Canggu',
      pricePerNight: 350000,
      rating: 4.5,
      reviewCount: 312,
      amenities: ['wifi', 'breakfast', 'surfboard'],
      bookingUrl: 'https://booking.com/canggu-surf',
      isFavorite: false,
    },
    {
      id: '5',
      name: 'Nusa Dua Resort',
      type: 'hotel',
      location: 'Nusa Dua',
      pricePerNight: 2500000,
      rating: 4.8,
      reviewCount: 891,
      amenities: ['wifi', 'pool', 'spa', 'beach', 'restaurant'],
      bookingUrl: 'https://booking.com/nusa-dua-resort',
      isFavorite: false,
    },
  ], []);

  // State for accommodations (to allow favorite toggling)
  const [accommodationsList, setAccommodationsList] = useState<Accommodation[]>(accommodations);

  // Update accommodations when accommodations changes
  React.useEffect(() => {
    setAccommodationsList(accommodations);
  }, [accommodations]);

  // Memoized accommodation types
  const accommodationTypes = useMemo(() => [
    { id: 'all', name: t('accommodations.all'), icon: '🏠' },
    { id: 'hotel', name: t('accommodations.hotel'), icon: '🏨' },
    { id: 'hostel', name: t('accommodations.hostel'), icon: '🛏️' },
    { id: 'villa', name: t('accommodations.villa'), icon: '🏡' },
    { id: 'guesthouse', name: t('accommodations.guesthouse'), icon: '🏠' },
  ], [t]);

  // Memoized price ranges
  const priceRanges = useMemo(() => [
    { id: 'all', name: t('accommodations.allPrices') },
    { id: 'budget', name: t('accommodations.budget'), max: 300000 },
    { id: 'mid', name: t('accommodations.midRange'), min: 300000, max: 1000000 },
    { id: 'luxury', name: t('accommodations.luxury'), min: 1000000 },
  ], [t]);

  // Memoized format IDR function
  const formatIDR = useCallback((amount: number) => amount.toLocaleString('id-ID'), []);

  // Memoized toggle favorite handler
  const toggleFavorite = useCallback((id: string) => {
    setAccommodationsList(prev => prev.map(acc => 
      acc.id === id ? { ...acc, isFavorite: !acc.isFavorite } : acc
    ));
  }, []);

  // Memoized filtered accommodations
  const filteredAccommodations = useMemo(() => {
    return accommodationsList.filter(acc => {
      const matchesSearch = 
        acc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        acc.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = selectedType === 'all' || acc.type === selectedType;
      
      let matchesPrice = true;
      if (priceRange !== 'all') {
        const range = priceRanges.find(r => r.id === priceRange);
        if (range) {
          if (range.min && acc.pricePerNight < range.min) matchesPrice = false;
          if (range.max && acc.pricePerNight > range.max) matchesPrice = false;
        }
      }
      
      return matchesSearch && matchesType && matchesPrice;
    });
  }, [accommodationsList, searchQuery, selectedType, priceRange, priceRanges]);

  // Memoized search handler
  const handleSearchChange = useCallback((text: string) => {
    setSearchQuery(text);
  }, []);

  // Memoized type selection handler
  const handleTypeSelect = useCallback((typeId: string) => {
    setSelectedType(typeId);
  }, []);

  // Memoized price range selection handler
  const handlePriceRangeSelect = useCallback((rangeId: string) => {
    setPriceRange(rangeId as 'all' | 'budget' | 'mid' | 'luxury');
  }, []);

  // Memoized booking handler
  const handleBooking = useCallback((url: string) => {
    Linking.openURL(url);
  }, []);

  // Memoized back handler
  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  // Memoized amenity icon function
  const getAmenityIcon = useCallback((amenity: string) => {
    switch (amenity) {
      case 'wifi': return <Wifi size={14} color="#6B7280" />;
      case 'parking': return <Car size={14} color="#6B7280" />;
      case 'breakfast': return <Coffee size={14} color="#6B7280" />;
      default: return null;
    }
  }, []);

  // Memoized favorite count
  const favoriteCount = useMemo(() => 
    accommodationsList.filter(acc => acc.isFavorite).length
  , [accommodationsList]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <ChevronLeft size={24} color="#1F2937" />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.title}>🏠 {t('accommodations.title')}</Text>
            <Text style={styles.subtitle}>{t('accommodations.subtitle')}</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search size={20} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('accommodations.search')}
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={handleSearchChange}
          />
        </View>

        {/* Favorites Toggle */}
        <TouchableOpacity 
          style={[styles.favoritesToggle, favoriteCount > 0 && styles.favoritesToggleActive]}
          onPress={() => {/* Toggle favorites view */}}
        >
          <Heart size={20} color={favoriteCount > 0 ? '#FFFFFF' : '#FF6B6B'} fill={favoriteCount > 0 ? '#FFFFFF' : 'none'} />
          <Text style={[styles.favoritesToggleText, favoriteCount > 0 && styles.favoritesToggleTextActive]}>
            {t('accommodations.favorites')} ({favoriteCount})
          </Text>
        </TouchableOpacity>

        {/* Type Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeList}>
          {accommodationTypes.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.typeChip,
                selectedType === type.id && styles.typeChipActive,
              ]}
              onPress={() => handleTypeSelect(type.id)}
            >
              <Text style={styles.typeIcon}>{type.icon}</Text>
              <Text
                style={[
                  styles.typeChipText,
                  selectedType === type.id && styles.typeChipTextActive,
                ]}
              >
                {type.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Price Range Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.priceList}>
          {priceRanges.map((range) => (
            <TouchableOpacity
              key={range.id}
              style={[
                styles.priceChip,
                priceRange === range.id && styles.priceChipActive,
              ]}
              onPress={() => handlePriceRangeSelect(range.id)}
            >
              <Text
                style={[
                  styles.priceChipText,
                  priceRange === range.id && styles.priceChipTextActive,
                ]}
              >
                {range.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Accommodations List */}
        <View style={styles.accommodationsList}>
          {filteredAccommodations.map((accommodation) => (
            <View key={accommodation.id} style={styles.accommodationCard}>
              <View style={styles.accommodationHeader}>
                <View style={styles.accommodationInfo}>
                  <Text style={styles.accommodationName}>{accommodation.name}</Text>
                  <View style={styles.accommodationMeta}>
                    <MapPin size={14} color="#6B7280" />
                    <Text style={styles.accommodationLocation}>{accommodation.location}</Text>
                    <Star size={14} color="#F59E0B" fill="#F59E0B" />
                    <Text style={styles.accommodationRating}>{accommodation.rating}</Text>
                    <Text style={styles.accommodationReviews}>({accommodation.reviewCount})</Text>
                  </View>
                </View>
                <TouchableOpacity 
                  style={styles.favoriteButton}
                  onPress={() => toggleFavorite(accommodation.id)}
                >
                  <Heart 
                    size={20} 
                    color="#FF6B6B" 
                    fill={accommodation.isFavorite ? '#FF6B6B' : 'none'} 
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.accommodationDetails}>
                <View style={styles.priceContainer}>
                  <DollarSign size={16} color="#90BE6D" />
                  <Text style={styles.priceText}>
                    IDR {formatIDR(accommodation.pricePerNight)}/{t('accommodations.night')}
                  </Text>
                </View>
                
                <View style={styles.amenitiesContainer}>
                  {accommodation.amenities.slice(0, 3).map((amenity, index) => (
                    <View key={index} style={styles.amenityTag}>
                      {getAmenityIcon(amenity)}
                      <Text style={styles.amenityText}>{amenity}</Text>
                    </View>
                  ))}
                  {accommodation.amenities.length > 3 && (
                    <Text style={styles.moreAmenities}>+{accommodation.amenities.length - 3}</Text>
                  )}
                </View>
              </View>

              <TouchableOpacity 
                style={styles.bookButton}
                onPress={() => handleBooking(accommodation.bookingUrl)}
              >
                <ExternalLink size={16} color="#FFFFFF" />
                <Text style={styles.bookButtonText}>{t('accommodations.bookNow')}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Empty State */}
        {filteredAccommodations.length === 0 && (
          <View style={styles.emptyState}>
            <MapPin size={48} color="#9CA3AF" />
            <Text style={styles.emptyStateText}>{t('accommodations.noAccommodationsFound')}</Text>
            <Text style={styles.emptyStateSubtext}>
              {t('accommodations.tryDifferentSearch')}
            </Text>
          </View>
        )}

        {/* Stats */}
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>
            {filteredAccommodations.length} {t('accommodations.accommodations')} • {favoriteCount} {t('accommodations.favorites')}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0FDF4',
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
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  favoritesToggleActive: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  favoritesToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#991B1B',
  },
  favoritesToggleTextActive: {
    color: '#FFFFFF',
  },
  typeList: {
    marginBottom: 12,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
    gap: 6,
  },
  typeChipActive: {
    backgroundColor: '#00B4D8',
  },
  typeIcon: {
    fontSize: 14,
  },
  typeChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  typeChipTextActive: {
    color: '#FFFFFF',
  },
  priceList: {
    marginBottom: 16,
  },
  priceChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  priceChipActive: {
    backgroundColor: '#90BE6D',
  },
  priceChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  priceChipTextActive: {
    color: '#FFFFFF',
  },
  accommodationsList: {
    gap: 16,
  },
  accommodationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  accommodationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  accommodationInfo: {
    flex: 1,
  },
  accommodationName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  accommodationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  accommodationLocation: {
    fontSize: 12,
    color: '#6B7280',
  },
  accommodationRating: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F59E0B',
  },
  accommodationReviews: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  favoriteButton: {
    padding: 8,
  },
  accommodationDetails: {
    marginBottom: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#90BE6D',
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  amenityTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  amenityText: {
    fontSize: 11,
    color: '#6B7280',
  },
  moreAmenities: {
    fontSize: 11,
    color: '#9CA3AF',
    alignSelf: 'center',
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#00B4D8',
    padding: 12,
    borderRadius: 8,
  },
  bookButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
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

export default memo(AccommodationsScreen);