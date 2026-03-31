/**
 * Catch-All API Route for BaliBuddy PWA
 * Consolidates all API endpoints into a single serverless function
 * to stay within Vercel's 12 function limit
 *
 * Uses Expo Router API format
 */

// Import sync handler
import syncHandler from "../../../api/sync";

// Route mapping for catch-all API routes
const routeHandlers: Record<string, (req: any, res: any) => Promise<void>> = {
  sync: syncHandler,
};

/**
 * Create Express-like request object from Expo Router request
 */
function createExpressLikeRequest(req: any, params: { slug: string[] }) {
  const slug = params.slug;
  const route = slug[0] || "";

  return {
    method: req.method || "GET",
    query: req.query || {},
    body: req.body || {},
    headers: req.headers || {},
    url: req.url || "",
    route,
  };
}

/**
 * Create Express-like response object
 */
function createExpressLikeResponse() {
  let statusCode = 200;
  let headers: Record<string, string> = {};
  let body: any = null;

  return {
    status: (code: number) => {
      statusCode = code;
      return {
        json: (data: any) => {
          body = data;
          return { statusCode, headers, body };
        },
        send: (data: any) => {
          body = data;
          return { statusCode, headers, body };
        },
      };
    },
    setHeader: (key: string, value: string) => {
      headers[key] = value;
    },
    get statusCode() {
      return statusCode;
    },
    get headers() {
      return headers;
    },
    get body() {
      return body;
    },
  };
}

/**
 * Main handler for catch-all API route
 * Expo Router API format
 */
export function GET(
  request: Request,
  { params }: { params: { slug: string[] } },
) {
  return handleRequest(request, params, "GET");
}

export function POST(
  request: Request,
  { params }: { params: { slug: string[] } },
) {
  return handleRequest(request, params, "POST");
}

export function PUT(
  request: Request,
  { params }: { params: { slug: string[] } },
) {
  return handleRequest(request, params, "PUT");
}

export function DELETE(
  request: Request,
  { params }: { params: { slug: string[] } },
) {
  return handleRequest(request, params, "DELETE");
}

async function handleRequest(
  request: Request,
  params: { slug: string[] } | undefined,
  method: string,
) {
  const slug = params?.slug || [];
  const route = slug[0] || "";

  // Check if route exists
  const handler = routeHandlers[route];
  if (!handler) {
    return Response.json(
      {
        error: `Route not found: ${route}`,
        availableRoutes: Object.keys(routeHandlers),
      },
      { status: 404 },
    );
  }

  try {
    // Parse query parameters
    const url = new URL(request.url);
    const query: Record<string, string> = {};
    url.searchParams.forEach((value, key) => {
      query[key] = value;
    });

    // Parse body for POST/PUT requests
    let body = {};
    if (method === "POST" || method === "PUT") {
      try {
        body = await request.json();
      } catch (e) {
        // Body might be empty or not JSON
        body = {};
      }
    }

    // Create Express-like request/response objects
    const req = {
      method,
      query,
      body,
      headers: Object.fromEntries(request.headers.entries()),
      url: request.url,
      route,
    };
    const res = createExpressLikeResponse();

    // Call the handler
    await handler(req, res);

    // Return response
    return Response.json(res.body, {
      status: res.statusCode,
      headers: res.headers,
    });
  } catch (error) {
    console.error(`API Error [${route}]:`, error);
    return Response.json(
      {
        error: "Internal Server Error",
        route,
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

/**
 * Health check endpoint
 */
export function OPTIONS() {
  return Response.json({
    status: "ok",
    routes: Object.keys(routeHandlers),
    timestamp: new Date().toISOString(),
  });
}
