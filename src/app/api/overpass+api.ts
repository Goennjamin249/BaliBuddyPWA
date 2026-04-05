/**
 * Overpass API Proxy Route
 * Proxies OpenStreetMap Overpass API queries for POI data
 */

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
      "Access-Control-Allow-Origin": "*",
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.text();

    // Use multiple Overpass API endpoints for redundancy
    const endpoints = [
      "https://overpass-api.de/api/interpreter",
      "https://overpass.private.coffee/api/interpreter",
      "https://overpass.nchc.org.tw/api/interpreter",
    ];

    let lastError: Error | null = null;

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          body,
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          signal: AbortSignal.timeout(10000),
        });

        if (response.ok) {
          const data = await response.json();
          return createJsonResponse(data);
        }

        lastError = new Error(`Endpoint ${endpoint} returned ${response.status}`);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error("Unknown error");
        console.warn(`Overpass endpoint ${endpoint} failed:`, lastError.message);
      }
    }

    throw lastError || new Error("All Overpass endpoints failed");
  } catch (error) {
    console.error("Overpass API error:", error);

    // Return empty result on error
    return createJsonResponse(
      {
        version: 0.6,
        generator: "Overpass API (fallback)",
        elements: [],
        error: error instanceof Error ? error.message : "Unknown error",
      },
      503
    );
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const data = url.searchParams.get("data");

    if (!data) {
      return createJsonResponse(
        { error: "Missing 'data' parameter" },
        400
      );
    }

    // Forward to POST handler
    return await POST(
      new Request(request.url, {
        method: "POST",
        body: data,
      })
    );
  } catch (error) {
    console.error("Overpass API error:", error);
    return createJsonResponse(
      { error: error instanceof Error ? error.message : "Unknown error" },
      503
    );
  }
}
