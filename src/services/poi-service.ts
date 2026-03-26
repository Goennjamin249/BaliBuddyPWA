import {
  TripAdvisorPOI,
  searchPOIs as tripAdvisorSearch,
  TripAdvisorSearchParams,
} from "./tripadvisor";
import { fetchOverpassPOIs, OverpassPOI } from "./overpass";

// ============================================================================
// Types
// ============================================================================

/** Main POI category types */
export type POICategory =
  | "hotels"
  | "restaurants"
  | "attractions"
  | "water"
  | "laundry"
  | "atm"
  | "clinic";

/** TripAdvisor-specific categories (subset of POICategory) */
export type TripAdvisorCategory = "hotels" | "restaurants" | "attractions";

/** Map component POI type (subset for compatibility) */
export type POIMapType =
  | "water"
  | "laundry"
  | "atm"
  | "ferry"
  | "clinic"
  | "restaurant"
  | "hotel";

/** Data source for POIs */
export type POISource = "tripadvisor" | "osm";

/** Unified POI type */
export interface POI {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  rating?: number;
  review_count?: number;
  photo_url?: string;
  address: string;
  phone?: string;
  website?: string;
  category: POICategory;
  distance?: number;
  source: POISource;
  /** Additional fields for compatibility with Map component */
  type?: POIMapType;
  description?: string;
  details?: Record<string, unknown>;
}

/** Cached POI data structure */
interface CachedPOI {
  id: string;
  data: POI[];
  source: POISource;
  cached_at: number;
  expires_at: number;
  sector: string;
}

/** POI service configuration options */
export interface POIServiceConfig {
  /** Cache duration for TripAdvisor data in milliseconds (default: 24h) */
  tripAdvisorCacheDuration?: number;
  /** Cache duration for OSM data in milliseconds (default: 7 days) */
  osmCacheDuration?: number;
  /** Sector size for grid-based caching in degrees (default: 0.01) */
  sectorSize?: number;
  /** Maximum number of results to fetch (default: 20) */
  maxResults?: number;
  /** Default search radius in kilometers (default: 5) */
  defaultRadius?: number;
}

/** Custom error class for POI service errors */
export class POIServiceError extends Error {
  constructor(
    message: string,
    public readonly source: POISource,
    public readonly originalError?: unknown,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "POIServiceError";
  }
}

/** Error codes for better error handling */
const ERROR_CODES = {
  INVALID_COORDINATES: "INVALID_COORDINATES",
  INVALID_RADIUS: "INVALID_RADIUS",
  RATE_LIMITED: "RATE_LIMITED",
  API_FAILED: "API_FAILED",
  CACHE_ERROR: "CACHE_ERROR",
  NETWORK_ERROR: "NETWORK_ERROR",
} as const;

type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

// ============================================================================
// Constants
// ============================================================================

/** Cache key prefix for localStorage */
const CACHE_KEY_PREFIX = "poi_cache_" as const;

/** Data source constants */
const POI_SOURCE = {
  TRIPADVISOR: "tripadvisor",
  OSM: "osm",
} as const satisfies Record<string, POISource>;

/** Default cache durations in milliseconds */
const DEFAULT_CACHE_DURATIONS = {
  [POI_SOURCE.TRIPADVISOR]: 24 * 60 * 60 * 1000, // 24 hours
  [POI_SOURCE.OSM]: 7 * 24 * 60 * 60 * 1000, // 7 days
} as const satisfies Record<POISource, number>;

/** Default configuration values */
const DEFAULT_CONFIG: Required<POIServiceConfig> = {
  tripAdvisorCacheDuration: DEFAULT_CACHE_DURATIONS[POI_SOURCE.TRIPADVISOR],
  osmCacheDuration: DEFAULT_CACHE_DURATIONS[POI_SOURCE.OSM],
  sectorSize: 0.01,
  maxResults: 20,
  defaultRadius: 5,
} as const;

/** Fallback address text in German */
const FALLBACK_ADDRESS = "Adresse nicht verfügbar" as const;

/** Mapping from POI categories to Map component types */
const CATEGORY_TO_MAP_TYPE: Partial<Record<POICategory, POIMapType>> = {
  hotels: "hotel",
  restaurants: "restaurant",
  water: "water",
  laundry: "laundry",
  atm: "atm",
  clinic: "clinic",
} as const;

/** Coordinate validation bounds */
const COORDINATE_BOUNDS = {
  latitude: { min: -90, max: 90 },
  longitude: { min: -180, max: 180 },
} as const;

/** Radius validation bounds in kilometers */
const RADIUS_BOUNDS = {
  min: 0.1,
  max: 50,
} as const;

/** Maximum number of cached sectors to prevent memory issues */
const MAX_CACHED_SECTORS = 100 as const;

/** Retry configuration */
const RETRY_CONFIG = {
  maxRetries: 2,
  baseDelay: 1000, // 1 second
  maxDelay: 5000, // 5 seconds
} as const;

/** Active requests map for deduplication */
const activeRequests = new Map<string, Promise<POI[]>>();

/** Logger utility for structured logging */
const logger = {
  info: (message: string, data?: Record<string, unknown>) => {
    if (__DEV__) {
      console.log(`[POI Service] ${message}`, data || "");
    }
  },
  warn: (message: string, data?: Record<string, unknown>) => {
    if (__DEV__) {
      console.warn(`[POI Service] ${message}`, data || "");
    }
  },
  error: (message: string, error?: unknown) => {
    console.error(`[POI Service] ${message}`, error);
  },
};

// ============================================================================
// Configuration
// ============================================================================

let serviceConfig: Required<POIServiceConfig> = { ...DEFAULT_CONFIG };

/**
 * Configure the POI service
 * @param config - Partial configuration options
 */
export const configurePOIService = (config: POIServiceConfig): void => {
  serviceConfig = { ...DEFAULT_CONFIG, ...config };
};

/**
 * Get current service configuration
 */
export const getPOIServiceConfig = (): Required<POIServiceConfig> => ({
  ...serviceConfig,
});

// ============================================================================
// Cache Utilities
// ============================================================================

/**
 * Validate coordinate values
 * @param latitude - Latitude coordinate
 * @param longitude - Longitude coordinate
 * @throws Error if coordinates are invalid
 */
const validateCoordinates = (latitude: number, longitude: number): void => {
  if (
    latitude < COORDINATE_BOUNDS.latitude.min ||
    latitude > COORDINATE_BOUNDS.latitude.max
  ) {
    throw new Error(
      `Invalid latitude: ${latitude}. Must be between ${COORDINATE_BOUNDS.latitude.min} and ${COORDINATE_BOUNDS.latitude.max}`,
    );
  }
  if (
    longitude < COORDINATE_BOUNDS.longitude.min ||
    longitude > COORDINATE_BOUNDS.longitude.max
  ) {
    throw new Error(
      `Invalid longitude: ${longitude}. Must be between ${COORDINATE_BOUNDS.longitude.min} and ${COORDINATE_BOUNDS.longitude.max}`,
    );
  }
};

/**
 * Validate radius value
 * @param radius - Search radius in kilometers
 * @throws Error if radius is invalid
 */
const validateRadius = (radius: number): void => {
  if (radius < RADIUS_BOUNDS.min || radius > RADIUS_BOUNDS.max) {
    throw new Error(
      `Invalid radius: ${radius}. Must be between ${RADIUS_BOUNDS.min} and ${RADIUS_BOUNDS.max} km`,
    );
  }
};

/**
 * Generate sector key for grid-based caching
 * @param latitude - Latitude coordinate
 * @param longitude - Longitude coordinate
 * @param size - Sector size in degrees
 * @returns Sector key string
 */
const getSectorKey = (
  latitude: number,
  longitude: number,
  size: number = serviceConfig.sectorSize,
): string => {
  const latSector = Math.floor(latitude / size) * size;
  const lonSector = Math.floor(longitude / size) * size;
  return `${latSector.toFixed(2)}_${lonSector.toFixed(2)}`;
};

/**
 * Check if cached data is still valid
 * @param cache - Cached POI data
 * @returns True if cache is valid
 */
const isCacheValid = (cache: CachedPOI): boolean => {
  return Date.now() < cache.expires_at;
};

/**
 * Get cached POIs for a sector
 * @param sector - Sector key
 * @returns Cached POIs or null if not found/expired
 */
const getCachedPOIs = (sector: string): POI[] | null => {
  try {
    const cached = localStorage.getItem(`${CACHE_KEY_PREFIX}${sector}`);
    if (!cached) return null;

    const cacheData: CachedPOI = JSON.parse(cached);
    if (!isCacheValid(cacheData)) {
      localStorage.removeItem(`${CACHE_KEY_PREFIX}${sector}`);
      return null;
    }

    return cacheData.data;
  } catch {
    // Invalid JSON or localStorage error
    return null;
  }
};

/**
 * Cache POIs for a sector
 * @param sector - Sector key
 * @param pois - POIs to cache
 * @param source - Data source
 */
const cachePOIs = (
  sector: string,
  pois: POI[],
  source: POISource,
): void => {
  const cacheDuration =
    source === POI_SOURCE.TRIPADVISOR
      ? serviceConfig.tripAdvisorCacheDuration
      : serviceConfig.osmCacheDuration;

  const cacheData: CachedPOI = {
    id: `cache_${sector}_${Date.now()}`,
    data: pois,
    source,
    cached_at: Date.now(),
    expires_at: Date.now() + cacheDuration,
    sector,
  };

  try {
    localStorage.setItem(
      `${CACHE_KEY_PREFIX}${sector}`,
      JSON.stringify(cacheData),
    );
  } catch (error) {
    // Handle quota exceeded or other localStorage errors
    console.warn("Failed to cache POIs:", error);
  }
};

// ============================================================================
// POI Converters
// ============================================================================

/**
 * Convert TripAdvisor POI to unified POI format
 * @param poi - TripAdvisor POI
 * @returns Unified POI
 */
const convertTripAdvisorPOI = (poi: TripAdvisorPOI): POI => ({
  id: poi.location_id,
  name: poi.name,
  latitude: poi.latitude,
  longitude: poi.longitude,
  rating: poi.rating,
  review_count: poi.review_count,
  photo_url: poi.photo_url,
  address: poi.address,
  phone: poi.phone,
  website: poi.website,
  category: poi.category,
  distance: poi.distance,
  source: POI_SOURCE.TRIPADVISOR,
  type: CATEGORY_TO_MAP_TYPE[poi.category],
});

/**
 * Convert Overpass POI to unified POI format
 * @param poi - Overpass POI
 * @returns Unified POI
 */
const convertOverpassPOI = (poi: OverpassPOI): POI => ({
  id: poi.id,
  name: poi.name,
  latitude: poi.latitude,
  longitude: poi.longitude,
  address: poi.address || FALLBACK_ADDRESS,
  category: poi.type,
  distance: poi.distance,
  source: POI_SOURCE.OSM,
  type: CATEGORY_TO_MAP_TYPE[poi.type as POICategory],
});

/**
 * Check if an error is a rate limit error (HTTP 429)
 * @param error - The error to check
 * @returns True if the error is a rate limit error
 */
const isRateLimitError = (error: unknown): boolean => {
  if (error instanceof Error) {
    // Check for 429 in error message
    if (error.message.includes("429")) {
      return true;
    }
    // Check for status property (e.g., fetch Response errors)
    if ("status" in error && (error as { status: number }).status === 429) {
      return true;
    }
    // Check for statusCode property
    if (
      "statusCode" in error &&
      (error as { statusCode: number }).statusCode === 429
    ) {
      return true;
    }
  }
  return false;
};

/**
 * Sleep utility for retry delays
 * @param ms - Milliseconds to sleep
 */
const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Calculate exponential backoff delay
 * @param attempt - Current attempt number (0-based)
 * @returns Delay in milliseconds
 */
const getRetryDelay = (attempt: number): number => {
  const delay = RETRY_CONFIG.baseDelay * Math.pow(2, attempt);
  return Math.min(delay, RETRY_CONFIG.maxDelay);
};

/**
 * Manage cache size to prevent memory issues
 * Removes oldest expired entries if cache is too large
 */
const manageCacheSize = (): void => {
  try {
    const keys = Object.keys(localStorage);
    const cacheKeys = keys.filter((key) => key.startsWith(CACHE_KEY_PREFIX));

    if (cacheKeys.length <= MAX_CACHED_SECTORS) return;

    // Get all cache entries with their expiration times
    const cacheEntries = cacheKeys
      .map((key) => {
        try {
          const cached = localStorage.getItem(key);
          if (!cached) return null;
          const data: CachedPOI = JSON.parse(cached);
          return { key, expires_at: data.expires_at, is_valid: isCacheValid(data) };
        } catch {
          return null;
        }
      })
      .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

    // Sort by expiration time (oldest first)
    cacheEntries.sort((a, b) => a.expires_at - b.expires_at);

    // Remove oldest entries until we're under the limit
    const entriesToRemove = cacheEntries.slice(
      0,
      cacheKeys.length - MAX_CACHED_SECTORS + 10,
    );
    entriesToRemove.forEach((entry) => {
      localStorage.removeItem(entry.key);
    });

    logger.info("Cache cleanup completed", {
      removed: entriesToRemove.length,
      remaining: cacheKeys.length - entriesToRemove.length,
    });
  } catch (error) {
    logger.warn("Cache cleanup failed", { error });
  }
};

/**
 * Main fetch function with fallback logic
 * Fetches POIs from TripAdvisor first, falls back to OpenStreetMap if unavailable
 * @param latitude - Latitude coordinate
 * @param longitude - Longitude coordinate
 * @param radius - Search radius in kilometers (default: 5)
 * @param category - Optional category filter
 * @returns Array of POIs
 * @throws Error if coordinates or radius are invalid
 */
export const fetchPOIs = async (
  latitude: number,
  longitude: number,
  radius: number = serviceConfig.defaultRadius,
  category?: TripAdvisorCategory,
): Promise<POI[]> => {
  // Validate inputs
  validateCoordinates(latitude, longitude);
  validateRadius(radius);

  const sector = getSectorKey(latitude, longitude);
  const requestKey = `${sector}_${category || "all"}`;

  // Check for active request (deduplication)
  const activeRequest = activeRequests.get(requestKey);
  if (activeRequest) {
    logger.info("Deduplicating request", { requestKey });
    return activeRequest;
  }

  // Check cache first
  const cachedPOIs = getCachedPOIs(sector);
  if (cachedPOIs && cachedPOIs.length > 0) {
    logger.info("Returning cached POIs", {
      sector,
      count: cachedPOIs.length,
    });
    return cachedPOIs;
  }

  // Create new request promise
  const requestPromise = (async (): Promise<POI[]> => {
    try {
      // Try TripAdvisor API first with retry logic
      for (let attempt = 0; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
        try {
          const params: TripAdvisorSearchParams = {
            latitude,
            longitude,
            radius,
            category,
            limit: serviceConfig.maxResults,
          };

          const tripAdvisorResponse = await tripAdvisorSearch(params);

          if (
            tripAdvisorResponse.data &&
            tripAdvisorResponse.data.length > 0
          ) {
            const pois = tripAdvisorResponse.data.map(convertTripAdvisorPOI);
            cachePOIs(sector, pois, POI_SOURCE.TRIPADVISOR);
            logger.info("TripAdvisor fetch successful", {
              sector,
              count: pois.length,
              attempt,
            });
            return pois;
          }
          break; // No data, don't retry
        } catch (error: unknown) {
          if (isRateLimitError(error)) {
            logger.warn("TripAdvisor rate limited", { attempt });
            break; // Don't retry on rate limit
          }

          if (attempt < RETRY_CONFIG.maxRetries) {
            const delay = getRetryDelay(attempt);
            logger.warn("TripAdvisor fetch failed, retrying", {
              attempt,
              delay,
              error,
            });
            await sleep(delay);
          } else {
            logger.warn("TripAdvisor fetch failed after retries", {
              attempts: RETRY_CONFIG.maxRetries + 1,
              error,
            });
          }
        }
      }

      // Fallback to OpenStreetMap Overpass API with retry logic
      for (let attempt = 0; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
        try {
          const overpassPOIs = await fetchOverpassPOIs(
            latitude,
            longitude,
            radius,
          );

          if (overpassPOIs && overpassPOIs.length > 0) {
            const pois = overpassPOIs.map(convertOverpassPOI);
            cachePOIs(sector, pois, POI_SOURCE.OSM);
            logger.info("Overpass fetch successful", {
              sector,
              count: pois.length,
              attempt,
            });
            return pois;
          }
          break; // No data, don't retry
        } catch (error: unknown) {
          if (attempt < RETRY_CONFIG.maxRetries) {
            const delay = getRetryDelay(attempt);
            logger.warn("Overpass fetch failed, retrying", {
              attempt,
              delay,
              error,
            });
            await sleep(delay);
          } else {
            logger.error("Overpass fetch failed after retries", {
              attempts: RETRY_CONFIG.maxRetries + 1,
              error,
            });
          }
        }
      }

      // Both APIs failed
      logger.warn("Both APIs failed, returning empty array", { sector });
      return [];
    } finally {
      // Clean up active request
      activeRequests.delete(requestKey);
    }
  })();

  // Store active request for deduplication
  activeRequests.set(requestKey, requestPromise);

  return requestPromise;
};

/**
 * Fetch POIs by category
 * @param category - POI category to fetch
 * @param latitude - Latitude coordinate
 * @param longitude - Longitude coordinate
 * @param radius - Search radius in kilometers (default: 5)
 * @returns Array of POIs matching the category
 */
export const fetchPOIsByCategory = async (
  category: "hotels" | "restaurants" | "attractions",
  latitude: number,
  longitude: number,
  radius: number = serviceConfig.defaultRadius,
): Promise<POI[]> => {
  return fetchPOIs(latitude, longitude, radius, category);
};

/**
 * Get detailed information for a specific POI
 * Searches through all cached sectors for the POI
 * @param poiId - POI identifier
 * @param source - Data source (tripadvisor or osm)
 * @returns POI details or null if not found
 */
export const getPOIDetails = async (
  poiId: string,
  source: "tripadvisor" | "osm",
): Promise<POI | null> => {
  try {
    const keys = Object.keys(localStorage);
    const cacheKeys = keys.filter((key) => key.startsWith(CACHE_KEY_PREFIX));

    for (const cacheKey of cacheKeys) {
      const cached = localStorage.getItem(cacheKey);
      if (!cached) continue;

      const cacheData: CachedPOI = JSON.parse(cached);
      if (!isCacheValid(cacheData)) continue;
      if (cacheData.source !== source) continue;

      const poi = cacheData.data.find((p) => p.id === poiId);
      if (poi) return poi;
    }

    return null;
  } catch {
    return null;
  }
};

/**
 * Clear all cached POI data from localStorage
 */
export const clearPOICache = (): void => {
  const keys = Object.keys(localStorage);
  keys.forEach((key) => {
    if (key.startsWith(CACHE_KEY_PREFIX)) {
      localStorage.removeItem(key);
    }
  });
};

/**
 * Clear cached POI data for a specific sector
 * @param sector - Sector key to clear
 */
export const clearSectorCache = (sector: string): void => {
  localStorage.removeItem(`${CACHE_KEY_PREFIX}${sector}`);
};

/** Cache sector statistics */
interface CacheSectorStats {
  sector: string;
  source: POISource;
  poi_count: number;
  cached_at: string;
  expires_at: string;
  is_valid: boolean;
}

/** Cache statistics result */
interface CacheStats {
  total_cached_sectors: number;
  valid_sectors: number;
  expired_sectors: number;
  sectors: CacheSectorStats[];
}

/**
 * Get statistics about cached POI data
 * @returns Cache statistics including total sectors, cache keys, and expiration info
 */
export const getCacheStats = (): CacheStats => {
  const keys = Object.keys(localStorage);
  const cacheKeys = keys.filter((key) => key.startsWith(CACHE_KEY_PREFIX));

  const sectors: CacheSectorStats[] = cacheKeys
    .map((key) => {
      try {
        const cached = localStorage.getItem(key);
        if (!cached) return null;

        const cacheData: CachedPOI = JSON.parse(cached);
        return {
          sector: cacheData.sector,
          source: cacheData.source,
          poi_count: cacheData.data.length,
          cached_at: new Date(cacheData.cached_at).toISOString(),
          expires_at: new Date(cacheData.expires_at).toISOString(),
          is_valid: isCacheValid(cacheData),
        };
      } catch {
        return null;
      }
    })
    .filter((s): s is CacheSectorStats => s !== null);

  return {
    total_cached_sectors: cacheKeys.length,
    valid_sectors: sectors.filter((s) => s.is_valid).length,
    expired_sectors: sectors.filter((s) => !s.is_valid).length,
    sectors,
  };
};
