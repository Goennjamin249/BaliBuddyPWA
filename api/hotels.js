/**
 * Hotels API Handler
 * Proxies requests to Overpass API and returns hotels as GeoJSON
 * 
 * @module api/hotels
 */

// ============================================================================
// Constants
// ============================================================================

/** Overpass API endpoint */
const OVERPASS_API_URL = 'https://overpass-api.de/api/interpreter';

/** Default search radius in meters */
const DEFAULT_RADIUS = 1000;

/** Maximum search radius in meters */
const MAX_RADIUS = 5000;

/** Request timeout in milliseconds */
const REQUEST_TIMEOUT_MS = 15_000;

/** Cache configuration */
const CACHE_CONFIG = {
  /** CDN cache duration in seconds (15 minutes) */
  sMaxAge: 900,
  /** Stale-while-revalidate duration in seconds (1 hour) */
  staleWhileRevalidate: 3600,
};

/** Coordinate validation bounds */
const COORDINATE_BOUNDS = {
  latitude: { min: -90, max: 90 },
  longitude: { min: -180, max: 180 },
};

// ============================================================================
// Types (JSDoc)
// ============================================================================

/**
 * @typedef {Object} HotelQueryParams
 * @property {string} [lat] - Latitude (-90 to 90)
 * @property {string} [lon] - Longitude (-180 to 180)
 * @property {string} [radius] - Search radius in meters (max 5000)
 */

/**
 * @typedef {Object} GeoJSONFeature
 * @property {string} type - Always "Feature"
 * @property {Object} geometry - GeoJSON geometry
 * @property {Object} properties - Feature properties
 */

/**
 * @typedef {Object} GeoJSONFeatureCollection
 * @property {string} type - Always "FeatureCollection"
 * @property {GeoJSONFeature[]} features - Array of features
 */

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Generates a short unique request ID for debugging
 * @returns {string} 8-character hex ID
 */
function generateRequestId() {
  return Math.random().toString(16).slice(2, 10);
}

/**
 * Validates and parses a coordinate value
 * @param {string|undefined} value - The coordinate value to validate
 * @param {number} min - Minimum allowed value
 * @param {number} max - Maximum allowed value
 * @returns {number|null} Parsed coordinate or null if invalid
 */
function validateCoordinate(value, min, max) {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const parsed = parseFloat(value);
  
  if (isNaN(parsed) || parsed < min || parsed > max) {
    return null;
  }

  return parsed;
}

/**
 * Validates and parses the radius parameter
 * @param {string|undefined} value - The radius value to validate
 * @returns {number} Parsed radius or default
 */
function validateRadius(value) {
  if (value === undefined || value === null || value === '') {
    return DEFAULT_RADIUS;
  }

  const parsed = parseInt(value, 10);
  
  if (isNaN(parsed) || parsed <= 0) {
    return DEFAULT_RADIUS;
  }

  return Math.min(parsed, MAX_RADIUS);
}

/**
 * Builds the Overpass QL query for hotels
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {number} radius - Search radius in meters
 * @returns {string} Overpass QL query
 */
function buildOverpassQuery(lat, lon, radius) {
  return `
[out:json][timeout:25];
(
  node(around:${radius},${lat},${lon})["tourism"="hotel"];
  way(around:${radius},${lat},${lon})["tourism"="hotel"];
  relation(around:${radius},${lat},${lon})["tourism"="hotel"];
);
out center;
`.trim();
}

/**
 * Converts Overpass API response to GeoJSON FeatureCollection
 * @param {Object} overpassData - Raw Overpass API response
 * @returns {GeoJSONFeatureCollection} GeoJSON FeatureCollection
 */
function convertToGeoJSON(overpassData) {
  const features = (overpassData.elements || []).map((element) => {
    // Get coordinates - use center for ways/relations, direct lat/lon for nodes
    let coordinates;
    if (element.type === 'node') {
      coordinates = [element.lon, element.lat];
    } else if (element.center) {
      coordinates = [element.center.lon, element.center.lat];
    } else {
      // Fallback - skip elements without coordinates
      return null;
    }

    // Extract relevant properties from OSM tags
    const tags = element.tags || {};
    const properties = {
      id: `${element.type}/${element.id}`,
      name: tags.name || 'Unbekanntes Hotel',
      stars: tags['stars'] || null,
      website: tags['website'] || null,
      phone: tags['phone'] || null,
      email: tags['email'] || null,
      addrStreet: tags['addr:street'] || null,
      addrHousenumber: tags['addr:housenumber'] || null,
      addrCity: tags['addr:city'] || null,
      openingHours: tags['opening_hours'] || null,
      wheelchair: tags['wheelchair'] || null,
      internetAccess: tags['internet_access'] || null,
      osmType: element.type,
      osmId: element.id,
    };

    return {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates,
      },
      properties,
    };
  }).filter(Boolean); // Remove null entries

  return {
    type: 'FeatureCollection',
    features,
  };
}

/**
 * Fetches data from Overpass API with timeout support
 * @param {string} query - Overpass QL query
 * @param {AbortSignal} signal - Abort signal for timeout
 * @returns {Promise<Object>} Overpass API response
 */
async function fetchOverpassData(query, signal) {
  const response = await fetch(OVERPASS_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'BaliBuddy-PWA/1.0',
    },
    body: `data=${encodeURIComponent(query)}`,
    signal,
  });

  if (!response.ok) {
    throw new Error(`Overpass API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Sets cache headers on the response
 * @param {import('http').ServerResponse} res - Response object
 */
function setCacheHeaders(res) {
  const { sMaxAge, staleWhileRevalidate } = CACHE_CONFIG;
  res.setHeader(
    'Cache-Control',
    `public, s-maxage=${sMaxAge}, stale-while-revalidate=${staleWhileRevalidate}`
  );
}

// ============================================================================
// Main Handler
// ============================================================================

/**
 * Hotels API request handler
 * 
 * @param {import('http').IncomingMessage & { query: HotelQueryParams }} req - Request object
 * @param {import('http').ServerResponse} res - Response object
 * @returns {Promise<void>}
 * 
 * @example
 * // GET /api/hotels?lat=-8.4095&lon=115.1889&radius=1000
 * // GET /api/hotels?lat=-8.4095&lon=115.1889 (uses default 1000m radius)
 */
export default async function handler(req, res) {
  const requestId = generateRequestId();

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      error: 'Method not allowed',
      code: 'METHOD_NOT_ALLOWED',
      requestId,
    });
  }

  // Parse and validate parameters
  const { lat, lon, radius: radiusParam } = req.query;

  const latitude = validateCoordinate(
    lat,
    COORDINATE_BOUNDS.latitude.min,
    COORDINATE_BOUNDS.latitude.max
  );

  const longitude = validateCoordinate(
    lon,
    COORDINATE_BOUNDS.longitude.min,
    COORDINATE_BOUNDS.longitude.max
  );

  if (latitude === null || longitude === null) {
    return res.status(400).json({
      error: 'Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180.',
      code: 'INVALID_COORDINATES',
      requestId,
    });
  }

  const radius = validateRadius(radiusParam);

  // Set up timeout controller
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    // Build and execute Overpass query
    const query = buildOverpassQuery(latitude, longitude, radius);
    const overpassData = await fetchOverpassData(query, controller.signal);

    clearTimeout(timeoutId);

    // Convert to GeoJSON
    const geoJSON = convertToGeoJSON(overpassData);

    // Set cache headers and return data
    setCacheHeaders(res);

    return res.status(200).json({
      ...geoJSON,
      _meta: {
        requestId,
        query: {
          lat: latitude,
          lon: longitude,
          radius,
        },
        resultCount: geoJSON.features.length,
        cachedAt: new Date().toISOString(),
      },
    });

  } catch (error) {
    clearTimeout(timeoutId);

    // Handle timeout specifically
    if (error.name === 'AbortError') {
      console.error(`[${requestId}] Hotels API timeout after ${REQUEST_TIMEOUT_MS}ms`);
      return res.status(504).json({
        error: 'Hotel search timeout',
        code: 'TIMEOUT',
        requestId,
      });
    }

    // Handle other errors
    console.error(`[${requestId}] Hotels API error:`, {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });

    return res.status(500).json({
      error: 'Failed to fetch hotel data',
      code: 'INTERNAL_ERROR',
      requestId,
    });
  }
}