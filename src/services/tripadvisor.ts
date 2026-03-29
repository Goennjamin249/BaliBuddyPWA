import { Platform, Linking } from 'react-native';

// Booking.com API Types (via RapidAPI)
export interface BookingPOI {
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

export interface BookingSearchParams {
  latitude: number;
  longitude: number;
  category?: 'hotels' | 'restaurants' | 'attractions';
  radius?: number; // km
  limit?: number;
}

export interface BookingSearchResponse {
  data: BookingPOI[];
  total_results: number;
  source: 'booking.com';
}

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

// Real API: Search POIs via Booking.com API
export const searchPOIs = async (params: BookingSearchParams): Promise<BookingSearchResponse> => {
  try {
    const queryParams = new URLSearchParams({
      latitude: params.latitude.toString(),
      longitude: params.longitude.toString(),
      radius: (params.radius || 5).toString(),
      category: params.category || 'hotels',
      limit: (params.limit || 20).toString()
    });
    
    const response = await fetch(`/api/tripadvisor?${queryParams}`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Calculate distances for each POI
    const results = (data.data || []).map((poi: any) => ({
      ...poi,
      distance: calculateDistance(
        params.latitude,
        params.longitude,
        poi.latitude,
        poi.longitude
      ),
    }));

    // Sort by rating
    results.sort((a: any, b: any) => b.rating - a.rating);

    return {
      data: results,
      total_results: data.total_results || results.length,
      source: 'booking.com',
    };
  } catch (error) {
    console.error('Booking.com API error:', error);
    throw new Error('Failed to fetch accommodation data');
  }
};

// Real API: Get POI Details
export const getPOIDetails = async (locationId: string): Promise<BookingPOI | null> => {
  try {
    const response = await fetch(`/api/tripadvisor?locationId=${locationId}`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.data?.[0] || null;
  } catch (error) {
    console.error('Booking.com API error:', error);
    return null;
  }
};

// Get nearby POIs
export const getNearbyPOIs = async (
  latitude: number,
  longitude: number,
  radius: number = 5
): Promise<BookingPOI[]> => {
  const response = await searchPOIs({ latitude, longitude, radius });
  return response.data;
};

// Get POIs by category
export const getPOIsByCategory = async (
  category: 'hotels' | 'restaurants' | 'attractions',
  latitude: number,
  longitude: number
): Promise<BookingPOI[]> => {
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
