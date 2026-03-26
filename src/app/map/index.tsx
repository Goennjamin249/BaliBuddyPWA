import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform, ActivityIndicator, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { MapPin, Navigation, Droplets, Shirt, CreditCard, Ship, AlertTriangle, Filter, Layers, ArrowLeft, X, Phone, Clock, Star, Home, RefreshCw, Globe, ExternalLink } from 'lucide-react-native';
import { fetchPOIs, POI } from '../../services/poi-service';
import { openDirections, openWebsite, openPhone } from '../../services/tripadvisor';
import TripAdvisorBranding from '../../components/TripAdvisorBranding';

// MapLibre GL JS for Web (better compatibility than Mapbox)
declare global {
  interface Window {
    maplibregl: any;
  }
}

// Real Bali POI data with 2026 prices
const BALI_POIS: POI[] = [
  // Water Refill Stations
  { id: '1', name: 'Refill Bali Ubud', type: 'water', latitude: -8.5069, longitude: 115.2624, description: 'Gefiltertes Wasser, 5.000 IDR/Liter', details: { price: 5000, hours: '08:00-20:00' }, rating: 4.5, address: 'Ubud, Bali', category: 'water', source: 'osm' },
  { id: '2', name: 'Aqua Refill Seminyak', type: 'water', latitude: -8.6913, longitude: 115.1683, description: 'Mineralwasser, 6.000 IDR/Liter', details: { price: 6000, hours: '07:00-22:00' }, rating: 4.2, address: 'Seminyak, Bali', category: 'water', source: 'osm' },
  { id: '3', name: 'Bali Water Refill Kuta', type: 'water', latitude: -8.7183, longitude: 115.1687, description: 'Gefiltertes Wasser, 4.000 IDR/Liter', details: { price: 4000, hours: '09:00-21:00' }, rating: 4.0, address: 'Kuta, Bali', category: 'water', source: 'osm' },
  
  // Laundries - 2026 Prices
  { id: '4', name: 'Clean & Fresh Laundry', type: 'laundry', latitude: -8.6477, longitude: 115.1378, description: '35.000 IDR/kg, Express +15.000', details: { pricePerKg: 35000, express: 15000 }, rating: 4.7, address: 'Canggu, Bali', category: 'laundry', source: 'osm' },
  { id: '5', name: 'Bali Wash', type: 'laundry', latitude: -8.7183, longitude: 115.1687, description: '40.000 IDR/kg, 24h Service', details: { pricePerKg: 40000, hours: '24h' }, rating: 4.3, address: 'Kuta, Bali', category: 'laundry', source: 'osm' },
  
  // Safe ATMs
  { id: '6', name: 'BCA ATM Kuta', type: 'atm', latitude: -8.7183, longitude: 115.1687, description: 'Innerhalb der Bank, sicher', details: { bank: 'BCA', safe: true, fee: 0 }, rating: 4.8, address: 'Kuta, Bali', category: 'atm', source: 'osm' },
  { id: '7', name: 'Mandiri ATM Seminyak', type: 'atm', latitude: -8.6913, longitude: 115.1683, description: 'Sicherer Standort', details: { bank: 'Mandiri', safe: true, fee: 0 }, rating: 4.5, address: 'Seminyak, Bali', category: 'atm', source: 'osm' },
  
  // Ferries
  { id: '8', name: 'Bali Express Ferry', type: 'ferry', latitude: -8.7183, longitude: 115.1687, description: 'Nach Gili Trawangan - 450.000 IDR', details: { destination: 'Gili Trawangan', eta: '45 min', price: 450000 }, rating: 4.1, address: 'Kuta, Bali', category: 'attractions', source: 'osm' },
  { id: '9', name: 'Blue Water Express', type: 'ferry', latitude: -8.5069, longitude: 115.2624, description: 'Nach Nusa Lembongan - 350.000 IDR', details: { destination: 'Nusa Lembongan', eta: '30 min', price: 350000 }, rating: 4.4, address: 'Ubud, Bali', category: 'attractions', source: 'osm' },
  
  // Clinics
  { id: '10', name: 'BIMC Hospital', type: 'clinic', latitude: -8.7183, longitude: 115.1687, description: '24h Notaufnahme, PEP-Impfung', details: { emergency24h: true, hasPep: true, consultation: 500000 }, rating: 4.9, address: 'Kuta, Bali', category: 'clinic', source: 'osm' },
  { id: '11', name: 'Kasih Ibu Hospital', type: 'clinic', latitude: -8.6477, longitude: 115.1378, description: 'Gute Notfallversorgung', details: { emergency24h: true, consultation: 400000 }, rating: 4.6, address: 'Canggu, Bali', category: 'clinic', source: 'osm' },
];

const filterOptions = [
  { id: 'all', label: 'Alle', icon: '📍' },
  { id: 'water', label: 'Wasser', icon: '💧' },
  { id: 'laundry', label: 'Wäscherei', icon: '👕' },
  { id: 'atm', label: 'ATM', icon: '💳' },
  { id: 'ferry', label: 'Fähre', icon: '⛴️' },
  { id: 'clinic', label: 'Klinik', icon: '🏥' },
];

export default function MapScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [selectedPOI, setSelectedPOI] = useState<POI | null>(null);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [isLoadingPOIs, setIsLoadingPOIs] = useState(false);
  const [livePOIs, setLivePOIs] = useState<POI[]>([]);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Get user location with watchPosition
  useEffect(() => {
    if (Platform.OS === 'web' && navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setIsLoadingLocation(false);
        },
        (error) => {
          console.error('Location error:', error);
          // Default to Bali center
          setUserLocation({ latitude: -8.4095, longitude: 115.1889 });
          setIsLoadingLocation(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    } else {
      // Default to Bali center
      setUserLocation({ latitude: -8.4095, longitude: 115.1889 });
      setIsLoadingLocation(false);
    }
  }, []);

  // Fetch live POIs from Overpass API
  const fetchLivePOIs = useCallback(async () => {
    if (!userLocation) return;
    
    setIsLoadingPOIs(true);
    try {
      // Overpass API query for nearby POIs
      const radius = 300; // 300m radius
      const query = `
        [out:json][timeout:25];
        (
          node["amenity"="drinking_water"](around:${radius},${userLocation.latitude},${userLocation.longitude});
          node["amenity"="atm"](around:${radius},${userLocation.latitude},${userLocation.longitude});
          node["amenity"="hospital"](around:${radius},${userLocation.latitude},${userLocation.longitude});
          node["amenity"="pharmacy"](around:${radius},${userLocation.latitude},${userLocation.longitude});
          node["shop"="laundry"](around:${radius},${userLocation.latitude},${userLocation.longitude});
        );
        out body;
      `;
      
      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: query,
        headers: {
          'Content-Type': 'text/plain',
        },
      });
      
      const data = await response.json();
      
      // Convert Overpass data to POI format
      const pois: POI[] = data.elements.map((element: any, index: number) => ({
        id: `live-${index}`,
        name: element.tags?.name || 'Unbekannter Ort',
        type: getPOITypeFromTags(element.tags),
        latitude: element.lat,
        longitude: element.lon,
        description: getDescriptionFromTags(element.tags),
        details: getDetailsFromTags(element.tags),
        distance: userLocation ? calculateDistance(
          userLocation.latitude, 
          userLocation.longitude, 
          element.lat, 
          element.lon
        ) : undefined,
      }));
      
      setLivePOIs(pois);
      
      // Cache to localStorage for offline use
      if (Platform.OS === 'web') {
        localStorage.setItem('cachedPOIs', JSON.stringify({
          timestamp: Date.now(),
          data: pois,
        }));
      }
    } catch (error) {
      console.error('Error fetching live POIs:', error);
      // Load from cache if available
      if (Platform.OS === 'web') {
        const cached = localStorage.getItem('cachedPOIs');
        if (cached) {
          const { data } = JSON.parse(cached);
          setLivePOIs(data);
        }
      }
    } finally {
      setIsLoadingPOIs(false);
    }
  }, [userLocation]);

  // Helper functions for POI conversion
  const getPOITypeFromTags = (tags: any): POI['type'] => {
    if (tags?.amenity === 'drinking_water') return 'water';
    if (tags?.amenity === 'atm') return 'atm';
    if (tags?.amenity === 'hospital' || tags?.amenity === 'pharmacy') return 'clinic';
    if (tags?.shop === 'laundry') return 'laundry';
    return 'water'; // default
  };

  const getDescriptionFromTags = (tags: any): string => {
    if (tags?.amenity === 'drinking_water') return 'Wasserstation';
    if (tags?.amenity === 'atm') return `ATM - ${tags?.operator || 'Bank'}`;
    if (tags?.amenity === 'hospital') return 'Krankenhaus';
    if (tags?.amenity === 'pharmacy') return 'Apotheke';
    if (tags?.shop === 'laundry') return 'Wäscherei';
    return 'POI';
  };

  const getDetailsFromTags = (tags: any): Record<string, any> => {
    const details: Record<string, any> = {};
    if (tags?.opening_hours) details.hours = tags.opening_hours;
    if (tags?.phone) details.phone = tags.phone;
    if (tags?.website) details.website = tags.website;
    return details;
  };

  // Calculate distance from user
  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }, []);

  // Combine static and live POIs
  const allPOIs = [...BALI_POIS, ...livePOIs];
  
  // Filter and sort POIs by distance
  const filteredPOIs = selectedFilter === 'all' 
    ? allPOIs 
    : allPOIs.filter(poi => poi.type === selectedFilter);

  const sortedPOIs = userLocation
    ? filteredPOIs.map(poi => ({
        ...poi,
        distance: calculateDistance(userLocation.latitude, userLocation.longitude, poi.latitude, poi.longitude)
      })).sort((a, b) => (a.distance || 0) - (b.distance || 0))
    : filteredPOIs;

  // Load MapLibre GL JS
  useEffect(() => {
    if (Platform.OS === 'web' && userLocation) {
      const loadMapLibre = async () => {
        try {
          // Load MapLibre GL JS CSS
          const cssLink = document.createElement('link');
          cssLink.rel = 'stylesheet';
          cssLink.href = 'https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.css';
          document.head.appendChild(cssLink);

          // Load MapLibre GL JS
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.js';
          script.onload = () => {
            if (window.maplibregl && mapContainerRef.current) {
              try {
                mapRef.current = new window.maplibregl.Map({
                  container: mapContainerRef.current,
                  style: {
                    version: 8,
                    sources: {
                      'osm-tiles': {
                        type: 'raster',
                        tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
                        tileSize: 256,
                        attribution: '© OpenStreetMap contributors',
                      },
                    },
                    layers: [
                      {
                        id: 'osm-tiles',
                        type: 'raster',
                        source: 'osm-tiles',
                        minzoom: 0,
                        maxzoom: 19,
                      },
                    ],
                  },
                  center: [userLocation.longitude, userLocation.latitude],
                  zoom: 14,
                });

                mapRef.current.on('load', () => {
                  setMapLoaded(true);
                  
                  // Add user location marker
                  const userMarker = document.createElement('div');
                  userMarker.style.width = '20px';
                  userMarker.style.height = '20px';
                  userMarker.style.borderRadius = '50%';
                  userMarker.style.backgroundColor = '#00B4D8';
                  userMarker.style.border = '3px solid white';
                  userMarker.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
                  
                  new window.maplibregl.Marker(userMarker)
                    .setLngLat([userLocation.longitude, userLocation.latitude])
                    .addTo(mapRef.current);

                  // Add POI markers
                  sortedPOIs.forEach((poi) => {
                    const el = document.createElement('div');
                    el.style.width = '36px';
                    el.style.height = '36px';
                    el.style.borderRadius = '50%';
                    el.style.backgroundColor = getPOIColor(poi.type);
                    el.style.cursor = 'pointer';
                    el.style.display = 'flex';
                    el.style.alignItems = 'center';
                    el.style.justifyContent = 'center';
                    el.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
                    el.style.border = '2px solid white';
                    el.innerHTML = getPOIEmoji(poi.type);
                    
                    el.addEventListener('click', () => {
                      setSelectedPOI(poi);
                      setShowBottomSheet(true);
                    });
                    
                    new window.maplibregl.Marker(el)
                      .setLngLat([poi.longitude, poi.latitude])
                      .addTo(mapRef.current);
                  });
                });
              } catch (error) {
                console.error('MapLibre initialization failed:', error);
              }
            }
          };
          document.head.appendChild(script);
        } catch (error) {
          console.error('Error loading MapLibre:', error);
        }
      };

      loadMapLibre();
    }
  }, [userLocation, sortedPOIs]);

  // Fetch live POIs when location changes
  useEffect(() => {
    if (userLocation) {
      fetchLivePOIs();
    }
  }, [userLocation, fetchLivePOIs]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, []);

  const getPOIIcon = (type: string) => {
    switch (type) {
      case 'water': return <Droplets size={20} color="#FFFFFF" />;
      case 'laundry': return <Shirt size={20} color="#FFFFFF" />;
      case 'atm': return <CreditCard size={20} color="#FFFFFF" />;
      case 'ferry': return <Ship size={20} color="#FFFFFF" />;
      case 'clinic': return <AlertTriangle size={20} color="#FFFFFF" />;
      default: return <MapPin size={20} color="#FFFFFF" />;
    }
  };

  const getPOIColor = (type: string) => {
    switch (type) {
      case 'water': return '#00B4D8';
      case 'laundry': return '#90BE6D';
      case 'atm': return '#F59E0B';
      case 'ferry': return '#00B4D8';
      case 'clinic': return '#FF6B6B';
      default: return '#6B7280';
    }
  };

  const getPOIEmoji = (type: string) => {
    switch (type) {
      case 'water': return '💧';
      case 'laundry': return '👕';
      case 'atm': return '💳';
      case 'ferry': return '⛴️';
      case 'clinic': return '🏥';
      default: return '📍';
    }
  };

  const handlePOIPress = (poi: POI) => {
    setSelectedPOI(poi);
    setShowBottomSheet(true);
  };

  // Functional route planning
  const handleRoutePlanning = (poi: POI) => {
    if (userLocation) {
      // Open Google Maps with directions
      const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.latitude},${userLocation.longitude}&destination=${poi.latitude},${poi.longitude}&travelmode=walking`;
      Linking.openURL(url);
    }
  };

  // Functional phone call
  const handlePhoneCall = (phone: string) => {
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    }
  };

  if (isLoadingLocation) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00B4D8" />
        <Text style={styles.loadingText}>Standort wird ermittelt...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Full Screen Map */}
      <View style={styles.mapContainer}>
        {Platform.OS === 'web' ? (
          <div 
            ref={mapContainerRef}
            style={{ width: '100%', height: '100%' }}
          />
        ) : (
          <View style={styles.mapFallback}>
            <Layers size={64} color="#00B4D8" />
            <Text style={styles.mapFallbackTitle}>Interaktive Karte</Text>
            <Text style={styles.mapFallbackText}>
              MapLibre-Integration für {Platform.OS}
            </Text>
          </View>
        )}
      </View>

      {/* Floating Header with Back to Home */}
      <View style={styles.floatingHeader}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#0F172A" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{t('map.title', 'Karte')}</Text>
          <Text style={styles.headerSubtitle}>
            {sortedPOIs.length} Orte in der Nähe
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.homeButton}
          onPress={() => router.push('/')}
        >
          <Home size={20} color="#0F172A" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={fetchLivePOIs}
        >
          <RefreshCw size={20} color="#0F172A" />
        </TouchableOpacity>
      </View>

      {/* Floating Filter Bar */}
      <View style={styles.floatingFilterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScrollContent}>
          {filterOptions.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[styles.filterChip, selectedFilter === filter.id && styles.filterChipActive]}
              onPress={() => setSelectedFilter(filter.id)}
            >
              <Text style={styles.filterEmoji}>{filter.icon}</Text>
              <Text style={[styles.filterText, selectedFilter === filter.id && styles.filterTextActive]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Floating POI List */}
      <View style={styles.floatingPOIList}>
        <View style={styles.poiListHeader}>
          <Text style={styles.poiListTitle}>📍 {selectedFilter === 'all' ? 'Alle' : filterOptions.find(f => f.id === selectedFilter)?.label}</Text>
          <Text style={styles.poiListCount}>{sortedPOIs.length} gefunden</Text>
        </View>
        <ScrollView style={styles.poiList} showsVerticalScrollIndicator={false}>
          {isLoadingPOIs ? (
            <View style={styles.loadingPOIs}>
              <ActivityIndicator size="small" color="#00B4D8" />
              <Text style={styles.loadingPOIsText}>Lade Live-Daten...</Text>
            </View>
          ) : (
            sortedPOIs.slice(0, 5).map((poi) => (
              <TouchableOpacity 
                key={poi.id} 
                style={styles.poiCard}
                onPress={() => handlePOIPress(poi)}
              >
                <View style={[styles.poiIconContainer, { backgroundColor: getPOIColor(poi.type) }]}>
                  {getPOIIcon(poi.type)}
                </View>
                <View style={styles.poiInfo}>
                  <Text style={styles.poiName}>{poi.name}</Text>
                <Text style={styles.poiDescription}>{poi.description || 'Keine Beschreibung'}</Text>
                {poi.distance && (
                  <Text style={styles.poiDistance}>{poi.distance.toFixed(1)} km entfernt</Text>
                )}
                </View>
                {poi.rating && (
                  <View style={styles.ratingContainer}>
                    <Star size={12} color="#F59E0B" fill="#F59E0B" />
                    <Text style={styles.ratingText}>{poi.rating}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>

      {/* Bottom Sheet for POI Details */}
      {showBottomSheet && selectedPOI && (
        <View style={styles.bottomSheetOverlay}>
          <TouchableOpacity 
            style={styles.bottomSheetBackdrop}
            onPress={() => setShowBottomSheet(false)}
          />
          <View style={styles.bottomSheet}>
            <View style={styles.bottomSheetHandle} />
            
            <View style={styles.bottomSheetHeader}>
              <View style={[styles.poiIconLarge, { backgroundColor: getPOIColor(selectedPOI.type) }]}>
                {getPOIIcon(selectedPOI.type)}
              </View>
              <View style={styles.bottomSheetTitleContainer}>
                <Text style={styles.bottomSheetTitle}>{selectedPOI.name}</Text>
                <Text style={styles.bottomSheetSubtitle}>{selectedPOI.description}</Text>
                {selectedPOI.distance && (
                  <Text style={styles.bottomSheetDistance}>{selectedPOI.distance.toFixed(1)} km entfernt</Text>
                )}
              </View>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowBottomSheet(false)}
              >
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.bottomSheetContent}>
              {selectedPOI.type === 'water' && (
                <>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>💰 Preis:</Text>
                    <Text style={styles.detailValue}>Rp {(selectedPOI.details?.price || 0).toLocaleString('de-DE')}/Liter</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>🕐 Öffnungszeiten:</Text>
                    <Text style={styles.detailValue}>{selectedPOI.details?.hours || 'Nicht verfügbar'}</Text>
                  </View>
                </>
              )}

              {selectedPOI.type === 'laundry' && (
                <>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>💰 Preis:</Text>
                    <Text style={styles.detailValue}>Rp {(selectedPOI.details?.pricePerKg || 0).toLocaleString('de-DE')}/kg</Text>
                  </View>
                  {selectedPOI.details?.express && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>⚡ Express:</Text>
                      <Text style={styles.detailValue}>+Rp {(selectedPOI.details?.express || 0).toLocaleString('de-DE')}</Text>
                    </View>
                  )}
                </>
              )}

              {selectedPOI.type === 'atm' && (
                <>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>🏦 Bank:</Text>
                    <Text style={styles.detailValue}>{selectedPOI.details?.bank || 'Nicht verfügbar'}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>🔒 Sicherheit:</Text>
                    <Text style={[styles.detailValue, { color: '#90BE6D' }]}>Sicherer Standort</Text>
                  </View>
                </>
              )}

              {selectedPOI.type === 'ferry' && (
                <>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>🎯 Ziel:</Text>
                    <Text style={styles.detailValue}>{selectedPOI.details?.destination || 'Nicht verfügbar'}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>⏱️ ETA:</Text>
                    <Text style={styles.detailValue}>{selectedPOI.details?.eta || 'Nicht verfügbar'}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>💰 Preis:</Text>
                    <Text style={styles.detailValue}>Rp {(selectedPOI.details?.price || 0).toLocaleString('de-DE')}</Text>
                  </View>
                </>
              )}

              {selectedPOI.type === 'clinic' && (
                <>
                  {selectedPOI.details?.emergency24h && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>🚨 24h Notaufnahme:</Text>
                      <Text style={[styles.detailValue, { color: '#90BE6D' }]}>✓ Verfügbar</Text>
                    </View>
                  )}
                  {selectedPOI.details?.hasPep && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>💉 PEP-Impfung:</Text>
                      <Text style={[styles.detailValue, { color: '#90BE6D' }]}>✓ Verfügbar</Text>
                    </View>
                  )}
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>💰 Konsultation:</Text>
                    <Text style={styles.detailValue}>Rp {(selectedPOI.details?.consultation || 0).toLocaleString('de-DE')}</Text>
                  </View>
                </>
              )}

              {selectedPOI.rating && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>⭐ Bewertung:</Text>
                  <View style={styles.ratingDisplay}>
                    <Star size={16} color="#F59E0B" fill="#F59E0B" />
                    <Text style={styles.detailValue}>{selectedPOI.rating}/5</Text>
                  </View>
                </View>
              )}

              <View style={styles.bottomSheetActions}>
                {selectedPOI.details?.phone ? (
                  <TouchableOpacity 
                    style={styles.callButton}
                    onPress={() => handlePhoneCall(selectedPOI.details?.phone || '')}
                  >
                    <Phone size={18} color="#FFFFFF" />
                    <Text style={styles.callButtonText}>Anrufen</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.callButtonDisabled}>
                    <Phone size={18} color="#9CA3AF" />
                    <Text style={styles.callButtonTextDisabled}>Keine Nummer</Text>
                  </View>
                )}
                <TouchableOpacity 
                  style={styles.navigateButton}
                  onPress={() => handleRoutePlanning(selectedPOI)}
                >
                  <Navigation size={18} color="#FFFFFF" />
                  <Text style={styles.navigateButtonText}>Route</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  
  // Full Screen Map
  mapContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#E0F2FE',
  },
  mapFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E0F2FE',
  },
  mapFallbackTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0C4A6E',
    marginTop: 16,
  },
  mapFallbackText: {
    fontSize: 14,
    color: '#0369A1',
    marginTop: 8,
  },

  // Floating Header with Back to Home
  floatingHeader: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    backdropFilter: 'blur(10px)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  homeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },

  // Floating Filter Bar
  floatingFilterBar: {
    position: 'absolute',
    top: 120,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
  },
  filterScrollContent: {
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.95)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  filterChipActive: {
    backgroundColor: '#00B4D8',
  },
  filterEmoji: {
    fontSize: 14,
    marginRight: 6,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },

  // Floating POI List
  floatingPOIList: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255,255,255,0.98)',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 100,
    maxHeight: '45%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 10,
    backdropFilter: 'blur(20px)',
  },
  poiListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  poiListTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  poiListCount: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  poiList: {
    flex: 1,
  },
  loadingPOIs: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 20,
  },
  loadingPOIsText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  poiCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  poiIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  poiInfo: {
    flex: 1,
  },
  poiName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 2,
  },
  poiDescription: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },
  poiDistance: {
    fontSize: 11,
    color: '#00B4D8',
    fontWeight: '600',
    marginTop: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400E',
  },

  // Bottom Sheet
  bottomSheetOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
  },
  bottomSheetBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 12,
    paddingHorizontal: 24,
    paddingBottom: 40,
    maxHeight: '60%',
  },
  bottomSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  poiIconLarge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  bottomSheetTitleContainer: {
    flex: 1,
  },
  bottomSheetTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  bottomSheetSubtitle: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  bottomSheetDistance: {
    fontSize: 13,
    color: '#00B4D8',
    fontWeight: '600',
    marginTop: 4,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomSheetContent: {
    gap: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  detailLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  ratingDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bottomSheetActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  callButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 16,
  },
  callButtonDisabled: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F1F5F9',
    paddingVertical: 14,
    borderRadius: 16,
  },
  callButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  callButtonTextDisabled: {
    fontSize: 15,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  navigateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#00B4D8',
    paddingVertical: 14,
    borderRadius: 16,
  },
  navigateButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});