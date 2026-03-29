/**
 * Weather API Handler
 * Proxies requests to Open-Meteo API (free, no API key required)
 * 
 * @module api/weather
 */

// ============================================================================
// Constants
// ============================================================================

/** Default coordinates: Bali, Indonesia */
const DEFAULT_COORDINATES = {
  lat: -8.4095,
  lng: 115.1889,
};

/** Default timezone for Bali */
const DEFAULT_TIMEZONE = 'Asia/Makassar';

/** Open-Meteo API endpoint */
const OPEN_METEO_API_URL = 'https://api.open-meteo.com/v1/forecast';

/** Request timeout in milliseconds */
const REQUEST_TIMEOUT_MS = 10_000;

/** Cache configuration */
const CACHE_CONFIG = {
  /** CDN cache duration in seconds (15 minutes) */
  sMaxAge: 900,
  /** Stale-while-revalidate duration in seconds (1 hour) */
  staleWhileRevalidate: 3600,
};

/** Weather parameters to fetch from Open-Meteo */
const WEATHER_PARAMS = {
  current: 'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,uv_index',
  daily: 'weather_code,temperature_2m_max,temperature_2m_min',
  forecastDays: '5',
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
 * @typedef {Object} Coordinate
 * @property {number} lat - Latitude
 * @property {number} lng - Longitude
 */

/**
 * @typedef {Object} ErrorResponse
 * @property {string} error - Error message
 * @property {string} [code] - Error code for programmatic handling
 * @property {string} [requestId] - Unique request identifier for debugging
 */

/**
 * @typedef {Object} WeatherQueryParams
 * @property {string} [lat] - Latitude (-90 to 90)
 * @property {string} [lng] - Longitude (-180 to 180)
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
 * @returns {number|null} Parsed coordinate or null if invalid
 */
function validateCoordinate(value, defaultValue, min, max) {
  // Return default for missing values
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }

  // Parse and validate
  const parsed = parseFloat(value);
  
  if (isNaN(parsed) || parsed < min || parsed > max) {
    return null;
  }

  return parsed;
}

/**
 * Builds the Open-Meteo API URL with query parameters
 * @param {number} latitude - Validated latitude
 * @param {number} longitude - Validated longitude
 * @returns {string} Complete API URL
 */
function buildApiUrl(latitude, longitude) {
  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    current: WEATHER_PARAMS.current,
    daily: WEATHER_PARAMS.daily,
    timezone: DEFAULT_TIMEZONE,
    forecast_days: WEATHER_PARAMS.forecastDays,
  });

  return `${OPEN_METEO_API_URL}?${params}`;
}

/**
 * Fetches weather data with timeout support
 * @param {string} url - API URL to fetch
 * @param {AbortSignal} signal - Abort signal for timeout
 * @returns {Promise<Response>} Fetch response
 */
async function fetchWithTimeout(url, signal) {
  return fetch(url, {
    method: 'GET',
    headers: { 
      accept: 'application/json',
      'User-Agent': 'BaliBuddy-PWA/1.0',
    },
    signal,
  });
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
 * Weather API request handler
 * 
 * @param {import('http').IncomingMessage & { query: WeatherQueryParams }} req - Request object
 * @param {import('http').ServerResponse} res - Response object
 * @returns {Promise<void>}
 * 
 * @example
 * // GET /api/weather?lat=-8.4095&lng=115.1889
 * // GET /api/weather (uses Bali defaults)
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

  // Parse and validate coordinates
  const { lat, lng } = req.query;

  const latitude = validateCoordinate(
    lat, 
    DEFAULT_COORDINATES.lat, 
    COORDINATE_BOUNDS.latitude.min, 
    COORDINATE_BOUNDS.latitude.max
  );
  
  const longitude = validateCoordinate(
    lng, 
    DEFAULT_COORDINATES.lng, 
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

  // Set up timeout controller
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    // Fetch weather data
    const url = buildApiUrl(latitude, longitude);
    const response = await fetchWithTimeout(url, controller.signal);

    clearTimeout(timeoutId);

    // Handle API errors
    if (!response.ok) {
      console.error(`[${requestId}] Open-Meteo API error:`, {
        status: response.status,
        statusText: response.statusText,
        url,
      });

      return res.status(502).json({ 
        error: 'Weather service unavailable',
        code: 'UPSTREAM_ERROR',
        requestId,
      });
    }

    const data = await response.json();

    // Set cache headers and return data
    setCacheHeaders(res);
    
    return res.status(200).json({
      ...data,
      _meta: {
        requestId,
        cachedAt: new Date().toISOString(),
      },
    });

  } catch (error) {
    clearTimeout(timeoutId);

    // Handle timeout specifically
    if (error.name === 'AbortError') {
      console.error(`[${requestId}] Weather API timeout after ${REQUEST_TIMEOUT_MS}ms`);
      return res.status(504).json({ 
        error: 'Weather service timeout',
        code: 'TIMEOUT',
        requestId,
      });
    }

    // Handle other errors
    console.error(`[${requestId}] Weather API error:`, {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });

    return res.status(500).json({ 
      error: 'Failed to fetch weather data',
      code: 'INTERNAL_ERROR',
      requestId,
    });
  }
}