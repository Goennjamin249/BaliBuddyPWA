/**
 * TripAdvisor API Proxy Route
 * Provides attraction and restaurant data for Bali
 * Note: This is a mock implementation - real TripAdvisor API requires partnership
 */

interface Attraction {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviewCount: number;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  description: string;
  image?: string;
  priceLevel: number;
  openNow: boolean;
}

const MOCK_ATTRACTIONS: Attraction[] = [
  {
    id: "1",
    name: "Tanah Lot Temple",
    category: "Temple",
    rating: 4.5,
    reviewCount: 25000,
    location: {
      lat: -8.6211,
      lng: 115.0868,
      address: "Beraban, Kediri, Tabanan Regency, Bali",
    },
    description: "Ancient Hindu shrine perched on a rock formation in the sea",
    priceLevel: 2,
    openNow: true,
  },
  {
    id: "2",
    name: "Tegalalang Rice Terrace",
    category: "Nature",
    rating: 4.3,
    reviewCount: 18000,
    location: {
      lat: -8.4333,
      lng: 115.2833,
      address: "Tegalalang, Gianyar Regency, Bali",
    },
    description: "Famous terraced rice paddies with stunning views",
    priceLevel: 1,
    openNow: true,
  },
  {
    id: "3",
    name: "Uluwatu Temple",
    category: "Temple",
    rating: 4.6,
    reviewCount: 30000,
    location: {
      lat: -8.8291,
      lng: 115.0844,
      address: "Pecatu, South Kuta, Badung Regency, Bali",
    },
    description: "Clifftop temple with traditional Kecak dance performances",
    priceLevel: 2,
    openNow: true,
  },
];

const MOCK_RESTAURANTS: Attraction[] = [
  {
    id: "r1",
    name: "Warung Babi Guling Ibu Oka",
    category: "Restaurant",
    rating: 4.4,
    reviewCount: 5000,
    location: {
      lat: -8.5069,
      lng: 115.2625,
      address: "Jl. Tegal Wangi, Ubud, Gianyar",
    },
    description: "Famous Balinese suckling pig restaurant",
    priceLevel: 2,
    openNow: true,
  },
  {
    id: "r2",
    name: "La Lucciola",
    category: "Restaurant",
    rating: 4.5,
    reviewCount: 3500,
    location: {
      lat: -8.6919,
      lng: 115.1681,
      address: "Jl. Kayu Aya, Seminyak Beach",
    },
    description: "Upscale Italian dining with ocean views",
    priceLevel: 4,
    openNow: true,
  },
];

function createJsonResponse(
  data: any,
  status: number = 200,
  cacheMaxAge: number = 3600
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": `public, max-age=${cacheMaxAge}`,
    },
  });
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const type = url.searchParams.get("type") || "attractions";
    const lat = parseFloat(url.searchParams.get("lat") || "-8.5");
    const lng = parseFloat(url.searchParams.get("lng") || "115.2");

    // In production, integrate with TripAdvisor Content API
    // For now, return mock data
    const data =
      type === "restaurants" ? MOCK_RESTAURANTS : MOCK_ATTRACTIONS;

    return createJsonResponse({
      [type]: data,
      location: { lat, lng },
      source: "mock",
      message:
        "TripAdvisor data is mocked - real API requires partnership access",
    });
  } catch (error) {
    console.error("TripAdvisor API error:", error);
    return createJsonResponse(
      {
        error: "TripAdvisor data temporarily unavailable",
      },
      503
    );
  }
}
