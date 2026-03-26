import { Platform, Linking } from 'react-native';

// TripAdvisor API Types
export interface TripAdvisorPOI {
  location_id: string;
  name: string;
  latitude: number;
  longitude: number;
  rating: number;
  review_count: number;
  photo_url: string;
  web_url: string;
  address: string;
  phone?: string;
  website?: string;
  category: 'hotels' | 'restaurants' | 'attractions';
  price_level?: string;
  distance?: number;
}

export interface TripAdvisorSearchParams {
  latitude: number;
  longitude: number;
  category?: 'hotels' | 'restaurants' | 'attractions';
  radius?: number; // km
  limit?: number;
}

export interface TripAdvisorSearchResponse {
  data: TripAdvisorPOI[];
  total_results: number;
  source: 'tripadvisor';
}

// Mock TripAdvisor Data for Bali 2026
const MOCK_TRIPADVISOR_DATA: TripAdvisorPOI[] = [
  // Hotels
  {
    location_id: 'ta_hotel_001',
    name: 'Four Seasons Resort Bali at Sayan',
    latitude: -8.5069,
    longitude: 115.2624,
    rating: 5.0,
    review_count: 4521,
    photo_url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
    web_url: 'https://www.tripadvisor.com/Hotel_Review-g297694-d1762912',
    address: 'Sayan, Ubud, Gianyar, Bali 80571',
    phone: '+62361977577',
    website: 'https://www.fourseasons.com/sayan/',
    category: 'hotels',
    price_level: '$$$$',
  },
  {
    location_id: 'ta_hotel_002',
    name: 'Alila Seminyak',
    latitude: -8.6913,
    longitude: 115.1683,
    rating: 4.5,
    review_count: 2341,
    photo_url: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800',
    web_url: 'https://www.tripadvisor.com/Hotel_Review-g469404-d2362912',
    address: 'Jl. Taman Ganesha No. 9, Seminyak, Bali',
    phone: '+623613021888',
    website: 'https://www.alilahotels.com/seminyak',
    category: 'hotels',
    price_level: '$$$',
  },
  // Restaurants
  {
    location_id: 'ta_restaurant_001',
    name: 'Locavore',
    latitude: -8.5069,
    longitude: 115.2624,
    rating: 4.5,
    review_count: 1876,
    photo_url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
    web_url: 'https://www.tripadvisor.com/Restaurant_Review-g297694-d3456789',
    address: 'Jl. Dewisita No. 10, Ubud, Bali',
    phone: '+62361977733',
    website: 'https://locavore.co.id',
    category: 'restaurants',
    price_level: '$$$$',
  },
  {
    location_id: 'ta_restaurant_002',
    name: 'Warung Babi Guling Ibu Oka',
    latitude: -8.5069,
    longitude: 115.2624,
    rating: 4.0,
    review_count: 3421,
    photo_url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
    web_url: 'https://www.tripadvisor.com/Restaurant_Review-g297694-d1234567',
    address: 'Jl. Tegal Sari No. 2, Ubud, Bali',
    category: 'restaurants',
    price_level: '$',
  },
  // Attractions
  {
    location_id: 'ta_attraction_001',
    name: 'Tegallalang Rice Terrace',
    latitude: -8.4312,
    longitude: 115.2793,
    rating: 4.5,
    review_count: 8765,
    photo_url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800',
    web_url: 'https://www.tripadvisor.com/Attraction_Review-g297694-d3234567',
    address: 'Tegallalang, Ubud, Gianyar, Bali',
    category: 'attractions',
  },
  {
    location_id: 'ta_attraction_002',
    name: 'Tanah Lot Temple',
    latitude: -8.6212,
    longitude: 115.0868,
    rating: 4.5,
    review_count: 12453,
    photo_url: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=800',
    web_url: 'https://www.tripadvisor.com/Attraction_Review-g297694-d4567890',
    address: 'Beraban, Kediri, Tabanan, Bali',
    category: 'attractions',
  },
  {
    location_id: 'ta_attraction_003',
    name: 'Sacred Monkey Forest Sanctuary',
    latitude: -8.5181,
    longitude: 115.2583,
    rating: 4.5,
    review_count: 9876,
    photo_url: 'https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?w=800',
    web_url: 'https://www.tripadvisor.com/Attraction_Review-g297694-d5678901',
    address: 'Jl. Monkey Forest, Ubud, Gianyar, Bali',
    website: 'https://monkeyforestubud.com',
    category: 'attractions',
  },
];

// Calculate distance
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Generate TripAdvisor affiliate URL
const generateTripAdvisorUrl = (locationId: string): string => {
  const affiliateId = 'demo'; // In production, use process.env.EXPO_PUBLIC_TRIPADVISOR_API_KEY
  return `https://www.tripadvisor.com/Attraction_Review-${locationId}?partner=${affiliateId}`;
};

// Mock API: Search POIs
export const searchPOIs = async (params: TripAdvisorSearchParams): Promise<TripAdvisorSearchResponse> => {
  await new Promise(resolve => setTimeout(resolve, 800));

  let results = MOCK_TRIPADVISOR_DATA.map(poi => ({
    ...poi,
    distance: calculateDistance(params.latitude, params.longitude, poi.latitude, poi.longitude),
  }));

  // Filter by category
  if (params.category) {
    results = results.filter(poi => poi.category === params.category);
  }

  // Filter by radius
  if (params.radius) {
    results = results.filter(poi => poi.distance! <= params.radius!);
  }

  // Sort by rating
  results.sort((a, b) => b.rating - a.rating);

  // Limit results
  if (params.limit) {
    results = results.slice(0, params.limit);
  }

  return {
    data: results,
    total_results: results.length,
    source: 'tripadvisor',
  };
};

// Mock API: Get POI Details
export const getPOIDetails = async (locationId: string): Promise<TripAdvisorPOI | null> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return MOCK_TRIPADVISOR_DATA.find(poi => poi.location_id === locationId) || null;
};

// Get nearby POIs
export const getNearbyPOIs = async (
  latitude: number,
  longitude: number,
  radius: number = 5
): Promise<TripAdvisorPOI[]> => {
  const response = await searchPOIs({ latitude, longitude, radius });
  return response.data;
};

// Get POIs by category
export const getPOIsByCategory = async (
  category: 'hotels' | 'restaurants' | 'attractions',
  latitude: number,
  longitude: number
): Promise<TripAdvisorPOI[]> => {
  const response = await searchPOIs({ latitude, longitude, category });
  return response.data;
};

// Open directions in native maps
export const openDirections = (latitude: number, longitude: number, name: string): void => {
  const url = Platform.select({
    ios: `maps:?q=${name}&ll=${latitude},${longitude}`,
    android: `geo:${latitude},${longitude}?q=${name}`,
    web: `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
  });
  
  if (url) {
    Linking.openURL(url);
  }
};

// Open website
export const openWebsite = (url: string): void => {
  Linking.openURL(url);
};

// Open phone
export const openPhone = (phone: string): void => {
  Linking.openURL(`tel:${phone}`);
};

// Track POI view
export const trackPOIView = (locationId: string): void => {
  const views = JSON.parse(localStorage.getItem('poi_views') || '[]');
  views.push({
    location_id: locationId,
    viewed_at: new Date().toISOString(),
  });
  localStorage.setItem('poi_views', JSON.stringify(views));
};

// Get POI stats
export const getPOIStats = () => {
  const views = JSON.parse(localStorage.getItem('poi_views') || '[]');
  return {
    total_views: views.length,
    last_view: views.length > 0 ? views[views.length - 1] : null,
  };
};