/**
 * Ferry API Proxy Route
 * Provides ferry/vessel tracking data for Bali region
 */

interface Vessel {
  mmsi: string;
  name: string;
  type: string;
  latitude: number;
  longitude: number;
  destination: string;
  eta: string;
  status: string;
}

const MOCK_FERRIES: Vessel[] = [
  {
    mmsi: "525012345",
    name: "Bali Express 1",
    type: "Passenger Ferry",
    latitude: -8.5833,
    longitude: 115.5167,
    destination: "Nusa Penida",
    eta: "2024-01-15T10:30:00Z",
    status: "active",
  },
  {
    mmsi: "525012346",
    name: "Blue Water Jet",
    type: "Fast Boat",
    latitude: -8.6833,
    longitude: 115.45,
    destination: "Lembongan",
    eta: "2024-01-15T11:00:00Z",
    status: "active",
  },
  {
    mmsi: "525012347",
    name: "Gilimanuk Ferry",
    type: "Car Ferry",
    latitude: -8.15,
    longitude: 114.43,
    destination: "Java",
    eta: "2024-01-15T09:45:00Z",
    status: "active",
  },
];

function createJsonResponse(
  data: { vessels: Vessel[]; source: string; message?: string },
  status: number = 200,
  cacheMaxAge: number = 300
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": `public, max-age=${cacheMaxAge}`,
    },
  });
}

export async function GET() {
  try {
    // In production, fetch from MarineTraffic or AISStream API
    // For now, return mock data
    return createJsonResponse({
      vessels: MOCK_FERRIES,
      source: "mock",
      message: "Ferry data for Bali region - configure AISSTREAM_API_KEY for live data",
    });
  } catch (error) {
    console.error("Ferry API error:", error);
    return createJsonResponse(
      {
        vessels: [],
        source: "error",
        message: "Ferry data temporarily unavailable",
      },
      503
    );
  }
}
