/**
 * Earthquake API Handler
 * Proxies requests to BMKG (Indonesian Meteorological Agency) API
 * Returns earthquake data as GeoJSON for map visualization
 * 
 * @module api/earthquake
 */

// ============================================================================
// Constants
// ============================================================================

/** BMKG Auto Gempa API endpoint */
const BMKG_API_URL = 'https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json';

/** Request timeout in milliseconds */
const REQUEST_TIMEOUT_MS = 10_000;

/** Cache configuration */
const CACHE_CONFIG = {
  /** CDN cache duration in seconds (10 minutes) */
  sMaxAge: 600,
  /** Stale-while-revalidate duration in seconds (30 minutes) */
  staleWhileRevalidate: 1800,
};

// ============================================================================
// Types (JSDoc)
// ============================================================================

/**
 * @typedef {Object} EarthquakeProperties
 * @property {string} id - Earthquake ID
 * @property {string} date - Date of earthquake
 * @property {string} time - Time of earthquake (UTC)
 * @property {number} magnitude - Richter magnitude
 * @property {number} depth - Depth in km
 * @property {string} region - Geographic region name
 * @property {string} felt - Areas where earthquake was felt
 * @property {string} shakemap - URL to shakemap image
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
 * Converts BMKG earthquake data to GeoJSON FeatureCollection
 * @param {Object} bmkgData - Raw BMKG API response
 * @returns {GeoJSONFeatureCollection} GeoJSON FeatureCollection
 */
function convertToGeoJSON(bmkgData) {
  // BMKG autogempa.json returns a single earthquake object in Infogempa.gempa
  const gempa = bmkgData?.Infogempa?.gempa;
  
  if (!gempa) {
    return {
      type: 'FeatureCollection',
      features: [],
    };
  }

  // Parse coordinates from BMKG format "lat,lon"
  const coords = gempa.Coordinates?.split(',').map(Number) || [0, 0];
  const latitude = coords[0] || 0;
  const longitude = coords[1] || 0;

  // Parse magnitude
  const magnitude = parseFloat(gempa.Magnitude) || 0;

  // Parse depth (remove " km" suffix)
  const depthStr = gempa.Kedalaman?.replace(' km', '') || '0';
  const depth = parseFloat(depthStr) || 0;

  const properties = {
    id: gempa.DateTime || Date.now().toString(),
    date: gempa.Tanggal || '',
    time: gempa.Jam || '',
    dateTime: gempa.DateTime || '',
    magnitude,
    depth,
    region: gempa.Wilayah || '',
    felt: gempa.Dirasakan || '',
    shakemap: gempa.Shakemap ? `https://data.bmkg.go.id/DataMKG/TEWS/${gempa.Shakemap}` : null,
    potency: gempa.Potensi || '',
    warning: gempa.Warning || [],
  };

  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [longitude, latitude, -depth * 1000], // Convert depth to meters (negative = below surface)
        },
        properties,
      },
    ],
  };
}

/**
 * Fetches earthquake data from BMKG API with timeout support
 * @param {AbortSignal} signal - Abort signal for timeout
 * @returns {Promise<Object>} BMKG API response
 */
async function fetchEarthquakeData(signal) {
  const response = await fetch(BMKG_API_URL, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'BaliBuddy-PWA/1.0',
    },
    signal,
  });

  if (!response.ok) {
    throw new Error(`BMKG API error: ${response.status} ${response.statusText}`);
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
 * Earthquake API request handler
 * 
 * @param {import('http').IncomingMessage} req - Request object
 * @param {import('http').ServerResponse} res - Response object
 * @returns {Promise<void>}
 * 
 * @example
 * // GET /api/earthquake
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

  // Set up timeout controller
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    // Fetch earthquake data
    const bmkgData = await fetchEarthquakeData(controller.signal);

    clearTimeout(timeoutId);

    // Convert to GeoJSON
    const geoJSON = convertToGeoJSON(bmkgData);

    // Set cache headers and return data
    setCacheHeaders(res);

    return res.status(200).json({
      ...geoJSON,
      _meta: {
        requestId,
        resultCount: geoJSON.features.length,
        cachedAt: new Date().toISOString(),
      },
    });

  } catch (error) {
    clearTimeout(timeoutId);

    // Handle timeout specifically
    if (error.name === 'AbortError') {
      console.error(`[${requestId}] Earthquake API timeout after ${REQUEST_TIMEOUT_MS}ms`);
      return res.status(504).json({
        error: 'Earthquake data timeout',
        code: 'TIMEOUT',
        requestId,
      });
    }

    // Handle other errors
    console.error(`[${requestId}] Earthquake API error:`, {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });

    return res.status(500).json({
      error: 'Failed to fetch earthquake data',
      code: 'INTERNAL_ERROR',
      requestId,
    });
  }
}