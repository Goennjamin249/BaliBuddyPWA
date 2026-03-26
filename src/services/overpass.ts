// OpenStreetMap Overpass API Service

export interface OverpassPOI {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  type: 'hotels' | 'restaurants' | 'attractions' | 'water' | 'laundry' | 'atm' | 'clinic';
  address?: string;
  distance?: number;
}

// Overpass API endpoint
const OVERPASS_API_URL = 'https://overpass-api.de/api/interpreter';

// Build Overpass query for POIs
const buildOverpassQuery = (
  latitude: number,
  longitude: number,
  radius: number = 5
): string => {
  const radiusMeters = radius * 1000;
  
  return `
    [out:json][timeout:25];
    (
      // Hotels
      node["tourism"="hotel"](around:${radiusMeters},${latitude},${longitude});
      way["tourism"="hotel"](around:${radiusMeters},${latitude},${longitude});
      relation["tourism"="hotel"](around:${radiusMeters},${latitude},${longitude});
      
      // Restaurants
      node["amenity"="restaurant"](around:${radiusMeters},${latitude},${longitude});
      way["amenity"="restaurant"](around:${radiusMeters},${latitude},${longitude});
      relation["amenity"="restaurant"](around:${radiusMeters},${latitude},${longitude});
      
      // Attractions
      node["tourism"="attraction"](around:${radiusMeters},${latitude},${longitude});
      way["tourism"="attraction"](around:${radiusMeters},${latitude},${longitude});
      relation["tourism"="attraction"](around:${radiusMeters},${latitude},${longitude});
      
      // Water
      node["amenity"="drinking_water"](around:${radiusMeters},${latitude},${longitude});
      
      // Laundry
      node["shop"="laundry"](around:${radiusMeters},${latitude},${longitude});
      way["shop"="laundry"](around:${radiusMeters},${latitude},${longitude});
      
      // ATMs
      node["amenity"="atm"](around:${radiusMeters},${latitude},${longitude});
      
      // Clinics/Hospitals
      node["amenity"="hospital"](around:${radiusMeters},${latitude},${longitude});
      node["amenity"="clinic"](around:${radiusMeters},${latitude},${longitude});
      node["amenity"="pharmacy"](around:${radiusMeters},${latitude},${longitude});
    );
    out body;
    >;
    out skel qt;
  `;
};

// Calculate distance between two coordinates
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Determine POI type from OSM tags
const getPOIType = (tags: any): OverpassPOI['type'] => {
  if (tags.tourism === 'hotel') return 'hotels';
  if (tags.amenity === 'restaurant') return 'restaurants';
  if (tags.tourism === 'attraction') return 'attractions';
  if (tags.amenity === 'drinking_water') return 'water';
  if (tags.shop === 'laundry') return 'laundry';
  if (tags.amenity === 'atm') return 'atm';
  if (tags.amenity === 'hospital' || tags.amenity === 'clinic' || tags.amenity === 'pharmacy') return 'clinic';
  return 'attractions'; // default
};

// Get POI name from OSM tags
const getPOIName = (tags: any): string => {
  return tags.name || tags['name:en'] || tags['name:de'] || 'Unbekannter Ort';
};

// Get address from OSM tags
const getAddress = (tags: any): string | undefined => {
  if (tags['addr:street'] && tags['addr:housenumber']) {
    return `${tags['addr:street']} ${tags['addr:housenumber']}`;
  }
  if (tags['addr:street']) {
    return tags['addr:street'];
  }
  if (tags['addr:city']) {
    return tags['addr:city'];
  }
  return undefined;
};

// Parse Overpass API response
const parseOverpassResponse = (data: any, userLat: number, userLon: number): OverpassPOI[] => {
  const pois: OverpassPOI[] = [];
  
  if (!data.elements) return pois;

  data.elements.forEach((element: any) => {
    // Only process nodes with tags
    if (element.type === 'node' && element.tags) {
      const poi: OverpassPOI = {
        id: `osm_${element.id}`,
        name: getPOIName(element.tags),
        latitude: element.lat,
        longitude: element.lon,
        type: getPOIType(element.tags),
        address: getAddress(element.tags),
        distance: calculateDistance(userLat, userLon, element.lat, element.lon),
      };
      
      pois.push(poi);
    }
  });

  return pois;
};

// Fetch POIs from Overpass API
export const fetchOverpassPOIs = async (
  latitude: number,
  longitude: number,
  radius: number = 5
): Promise<OverpassPOI[]> => {
  try {
    const query = buildOverpassQuery(latitude, longitude, radius);
    
    const response = await fetch(OVERPASS_API_URL, {
      method: 'POST',
      body: query,
      headers: {
        'Content-Type': 'text/plain',
      },
    });

    if (!response.ok) {
      throw new Error(`Overpass API error: ${response.status}`);
    }

    const data = await response.json();
    return parseOverpassResponse(data, latitude, longitude);
  } catch (error) {
    console.error('Error fetching from Overpass API:', error);
    throw error;
  }
};

// Fetch POIs by category
export const fetchOverpassPOIsByCategory = async (
  category: 'hotels' | 'restaurants' | 'attractions',
  latitude: number,
  longitude: number,
  radius: number = 5
): Promise<OverpassPOI[]> => {
  const allPOIs = await fetchOverpassPOIs(latitude, longitude, radius);
  return allPOIs.filter(poi => poi.type === category);
};

// Get POI details (stub for compatibility)
export const getOverpassPOIDetails = async (poiId: string): Promise<OverpassPOI | null> => {
  // Overpass doesn't provide detailed POI info in a single query
  // This would require a separate query for the specific POI
  return null;
};