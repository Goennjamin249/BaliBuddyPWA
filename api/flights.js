/**
 * Flights API Handler
 * Proxies requests to OpenSky Network API (free, no API key required)
 * Returns live flight data as GeoJSON for map visualization
 * 
 * @module api/flights
 */

// ============================================================================
// Constants
// ============================================================================

/** OpenSky Network API endpoint */
const OPENSKY_API_URL = 'https://opensky-network.org/api/states/all';

/** Request timeout in milliseconds (OpenSky has 10s limit for anonymous users) */
const REQUEST_TIMEOUT_MS = 10_000;

/** Cache configuration */
const CACHE_CONFIG = {
  /** CDN cache duration in seconds (5 minutes - flights move fast) */
  sMaxAge: 300,
  /** Stale-while-revalidate duration in seconds (10 minutes) */
  staleWhileRevalidate: 600,
};

/** Bali bounding box coordinates */
const BALI_BOUNDS = {
  lamin: -9.5,   // South
  lomin: 114.0,  // West
  lamax: -7.5,   // North
  lomax: 116.5,  // East
};

// ============================================================================
// Types (JSDoc)
// ============================================================================

/**
 * @typedef {Object} FlightQueryParams
 * @property {string} [lamin] - Minimum latitude (south bound)
 * @property {string} [lomin] - Minimum longitude (west bound)
 * @property {string} [lamax] - Maximum latitude (north bound)
 * @property {string} [lomax] - Maximum longitude (east bound)
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
 * @param {number} defaultValue - Default value if not provided
 * @param {number} min - Minimum allowed value
 * @param {number} max - Maximum allowed value
 * @returns {number} Parsed coordinate or default
 */
function validateCoordinate(value, defaultValue, min, max) {
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }

  const parsed = parseFloat(value);
  
  if (isNaN(parsed) || parsed < min || parsed > max) {
    return defaultValue;
  }

  return parsed;
}

/**
 * Builds the OpenSky API URL with bounding box parameters
 * @param {number} lamin - Minimum latitude
 * @param {number} lomin - Minimum longitude
 * @param {number} lamax - Maximum latitude
 * @param {number} lomax - Maximum longitude
 * @returns {string} Complete API URL
 */
function buildApiUrl(lamin, lomin, lamax, lomax) {
  const params = new URLSearchParams({
    lamin: lamin.toString(),
    lomin: lomin.toString(),
    lamax: lamax.toString(),
    lomax: lomax.toString(),
  });

  return `${OPENSKY_API_URL}?${params}`;
}

/**
 * Converts OpenSky API response to GeoJSON FeatureCollection
 * @param {Object} openSkyData - Raw OpenSky API response
 * @returns {GeoJSONFeatureCollection} GeoJSON FeatureCollection
 */
function convertToGeoJSON(openSkyData) {
  const features = (openSkyData.states || [])
    .filter((state) => {
      // Filter out flights without valid position data
      // OpenSky state array indices:
      // [0] icao24, [1] callsign, [2] origin_country, [3] time_position,
      // [4] last_contact, [5] longitude, [6] latitude, [7] baro_altitude,
      // [8] on_ground, [9] velocity, [10] true_track, [11] vertical_rate,
      // [12] sensors, [13] geo_altitude, [14] squawk, [15] spi, [16] position_source
      return state[5] !== null && state[6] !== null && !state[8]; // Has position and not on ground
    })
    .map((state) => {
      const properties = {
        id: state[0],
        callsign: (state[1] || '').trim(),
        originCountry: state[2],
        longitude: state[5],
        latitude: state[6],
        baroAltitude: state[7],
        onGround: state[8],
        velocity: state[9],
        trueTrack: state[10],
        verticalRate: state[12],
        geoAltitude: state[13],
        lastContact: state[4],
      };

      return {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [state[5], state[6], state[13] || state[7] || 0],
        },
        properties,
      };
    });

  return {
    type: 'FeatureCollection',
    features,
  };
}

/**
 * Fetches flight data from OpenSky API with timeout support
 * @param {string} url - API URL to fetch
 * @param {AbortSignal} signal - Abort signal for timeout
 * @returns {Promise<Object>} OpenSky API response
 */
async function fetchFlightData(url, signal) {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'BaliBuddy-PWA/1.0',
    },
    signal,
  });

  if (!response.ok) {
    throw new Error(`OpenSky API error: ${response.status} ${response.statusText}`);
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
 * Flights API request handler
 * 
 * @param {import('http').IncomingMessage & { query: FlightQueryParams }} req - Request object
 * @param {import('http').ServerResponse} res - Response object
 * @returns {Promise<void>}
 * 
 * @example
 * // GET /api/flights (uses Bali default bounds)
 * // GET /api/flights?lamin=-9&lomin=114&lamax=-7.5&lomax=116.5
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

  // Parse and validate bounding box parameters (default to Bali)
  const { lamin, lomin, lamax, lomax } = req.query;

  const bounds = {
    lamin: validateCoordinate(lamin, BALI_BOUNDS.lamin, -90, 90),
    lomin: validateCoordinate(lomin, BALI_BOUNDS.lomin, -180, 180),
    lamax: validateCoordinate(lamax, BALI_BOUNDS.lamax, -90, 90),
    lomax: validateCoordinate(lomax, BALI_BOUNDS.lomax, -180, 180),
  };

  // Set up timeout controller (OpenSky has 10s limit for anonymous users)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    // Fetch flight data
    const url = buildApiUrl(bounds.lamin, bounds.lomin, bounds.lamax, bounds.lomax);
    const openSkyData = await fetchFlightData(url, controller.signal);

    clearTimeout(timeoutId);

    // Convert to GeoJSON
    const geoJSON = convertToGeoJSON(openSkyData);

    // Set cache headers and return data
    setCacheHeaders(res);

    return res.status(200).json({
      ...geoJSON,
      _meta: {
        requestId,
        query: bounds,
        resultCount: geoJSON.features.length,
        cachedAt: new Date().toISOString(),
      },
    });

  } catch (error) {
    clearTimeout(timeoutId);

    // Handle timeout specifically
    if (error.name === 'AbortError') {
      console.error(`[${requestId}] Flights API timeout after ${REQUEST_TIMEOUT_MS}ms`);
      return res.status(504).json({
        error: 'Flight data timeout',
        code: 'TIMEOUT',
        requestId,
      });
    }

    // Handle other errors
    console.error(`[${requestId}] Flights API error:`, {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });

    return res.status(500).json({
      error: 'Failed to fetch flight data',
      code: 'INTERNAL_ERROR',
      requestId,
    });
  }
}