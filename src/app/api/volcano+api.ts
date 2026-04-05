/**
 * Volcano API Proxy Route
 * Provides volcano alert data for Bali region
 */

interface VolcanoAlert {
  id: string;
  name: string;
  status: string;
  alertLevel: number;
  description: string;
  lastEruption: string;
  recommendations: string[];
}

const MOCK_VOLCANOES: VolcanoAlert[] = [
  {
    id: "agung",
    name: "Mount Agung",
    status: "Normal",
    alertLevel: 1,
    description: "Mount Agung is currently at normal activity level",
    lastEruption: "2019-06-27",
    recommendations: [
      "Keep safe distance from crater",
      "Follow local authority guidelines",
      "Monitor official updates",
    ],
  },
  {
    id: "batur",
    name: "Mount Batur",
    status: "Normal",
    alertLevel: 1,
    description: "Mount Batur is currently at normal activity level",
    lastEruption: "2000-01-01",
    recommendations: [
      "Safe for hiking with guide",
      "Check weather conditions before visit",
    ],
  },
];

function createJsonResponse(
  data: { volcanoes: VolcanoAlert[]; source: string; message?: string },
  status: number = 200,
  cacheMaxAge: number = 900
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
    // In production, fetch from PVMBG (Indonesian volcano monitoring agency)
    // For now, return mock data
    return createJsonResponse({
      volcanoes: MOCK_VOLCANOES,
      source: "mock",
      message: "Volcano data for Bali region",
    });
  } catch (error) {
    console.error("Volcano API error:", error);
    return createJsonResponse(
      {
        volcanoes: [],
        source: "error",
        message: "Volcano data temporarily unavailable",
      },
      503
    );
  }
}
