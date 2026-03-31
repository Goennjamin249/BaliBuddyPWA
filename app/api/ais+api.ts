/**
 * AIS API Proxy Route
 * Protects API keys and avoids CORS issues on web builds
 * @module AISApiRoute
 */

/**
 * Represents a vessel's AIS data
 */
interface Vessel {
  mmsi: string;
  name: string;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  vesselType: string;
}

/**
 * Represents a geographic bounding box
 */
interface BoundingBox {
  south: number;
  north: number;
  west: number;
  east: number;
}

/**
 * Response structure for AIS API requests
 */
interface AISResponse {
  vessels: Vessel[];
  bbox?: BoundingBox;
  source: string;
  message?: string;
  error?: string;
}

/**
 * Default coordinates for Bali region (Denpasar)
 * Used when no valid coordinates are provided
 */
const DEFAULT_COORDINATES = {
  lat: -8.4095,
  lon: 115.1889,
  radius: 0.5,
} as const;

/**
 * Mock vessel data for development/demo purposes
 * Used when AISSTREAM_API_KEY is not configured
 */
const MOCK_VESSELS: Vessel[] = [
  {
    mmsi: "525012345",
    name: "Bali Express 1",
    latitude: -8.5833,
    longitude: 115.5167,
    speed: 25,
    heading: 45,
    vesselType: "Passenger",
  },
  {
    mmsi: "525012346",
    name: "Blue Water Jet",
    latitude: -8.6833,
    longitude: 115.45,
    speed: 28,
    heading: 90,
    vesselType: "Passenger",
  },
];

/**
 * Validates and parses a coordinate parameter from URL search params
 * @param param - The raw parameter value
 * @param defaultValue - Default value if param is invalid
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 * @returns Parsed and validated coordinate value
 */
function parseCoordinate(
  param: string | null,
  defaultValue: number,
  min: number = -180,
  max: number = 180
): number {
  if (!param) return defaultValue;
  
  const parsed = parseFloat(param);
  
  if (isNaN(parsed)) {
    return defaultValue;
  }
  
  return Math.min(Math.max(parsed, min), max);
}

/**
 * Creates a JSON response with proper headers
 * @param data - Response data
 * @param status - HTTP status code
 * @param cacheMaxAge - Cache duration in seconds
 * @returns Response object
 */
function createJsonResponse(
  data: AISResponse,
  status: number = 200,
  cacheMaxAge: number = 30
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": `public, max-age=${cacheMaxAge}`,
      "X-Content-Type-Options": "nosniff",
    },
  });
}

/**
 * Calculates a bounding box from center coordinates and radius
 * @param lat - Center latitude
 * @param lon - Center longitude
 * @param radius - Radius in degrees
 * @returns BoundingBox object
 */
function calculateBoundingBox(
  lat: number,
  lon: number,
  radius: number
): BoundingBox {
  return {
    south: lat - radius,
    north: lat + radius,
    west: lon - radius,
    east: lon + radius,
  };
}

/**
 * AIS API GET handler
 * 
 * Query Parameters:
 * - lat: Latitude (default: -8.4095, range: -90 to 90)
 * - lon: Longitude (default: 115.1889, range: -180 to 180)
 * - radius: Search radius in degrees (default: 0.5, range: 0.01 to 10)
 * 
 * @param request - Request object
 * @returns JSON response with vessel data or error
 * 
 * @example
 * GET /api/ais?lat=-8.5&lon=115.2&radius=1.0
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;

    // Parse and validate query parameters
    const lat = parseCoordinate(
      searchParams.get("lat"),
      DEFAULT_COORDINATES.lat,
      -90,
      90
    );
    
    const lon = parseCoordinate(
      searchParams.get("lon"),
      DEFAULT_COORDINATES.lon,
      -180,
      180
    );
    
    const radius = parseCoordinate(
      searchParams.get("radius"),
      DEFAULT_COORDINATES.radius,
      0.01,
      10
    );

    const bbox = calculateBoundingBox(lat, lon, radius);

    // Get API key from server environment (never exposed to client)
    const apiKey = process.env.AISSTREAM_API_KEY;

    // Development mode: return mock data when no API key is configured
    if (!apiKey) {
      console.info(
        `[AIS API] No API key configured, returning mock data for bbox: ${JSON.stringify(bbox)}`
      );

      return createJsonResponse({
        vessels: MOCK_VESSELS,
        bbox,
        source: "mock",
        message: "Mock data - configure AISSTREAM_API_KEY for live data",
      });
    }

    // Production mode: connect to AISStream API
    // TODO: Implement actual AISStream WebSocket connection
    // For now, return structure indicating where real data would go
    console.info(
      `[AIS API] API key configured, would connect to AISStream for bbox: ${JSON.stringify(bbox)}`
    );

    return createJsonResponse({
      vessels: [],
      bbox,
      source: "ais-api",
      message: "AISStream WebSocket integration pending implementation",
    });
  } catch (error) {
    // Log detailed error information server-side
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error("[AIS API] Error processing request:", {
      message: errorMessage,
      stack: errorStack,
      url: request.url,
    });

    // Return user-friendly error response
    return createJsonResponse(
      {
        vessels: [],
        source: "error",
        error: "AIS-Dienst vorübergehend nicht verfügbar",
      },
      503, // Service Unavailable
      5 // Short cache for error responses
    );
  }
};
