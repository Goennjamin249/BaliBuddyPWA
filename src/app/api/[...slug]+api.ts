/**
 * Catch-All API Route for BaliBuddy PWA
 * Consolidates all API endpoints into a single serverless function
 * to stay within Vercel's 12 function limit
 *
 * Uses Expo Router API format
 */

import syncHandler from "../../../api/sync";

// Route mapping for catch-all API routes
const routeHandlers: Record<string, (req: any, res: any) => Promise<void>> = {
  sync: syncHandler,
};

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
 * Validate and parse route parameters
 */
function validateParams(params: { slug: string[] } | undefined): { route: string; slug: string[] } {
  const slug = params?.slug || [];
  const route = slug[0] || "";
  
  if (!route) {
    throw new Error("Missing route parameter. Expected: /api/[route]");
  }
  
  return { route, slug };
}

/**
 * Parse request body safely
 */
async function parseRequestBody(request: Request, method: string): Promise<any> {
  if (method !== "POST" && method !== "PUT") {
    return {};
  }
  
  try {
    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      return await request.json();
    }
    return {};
  } catch (error) {
    console.warn(`Failed to parse request body for ${method} ${request.url}:`, error);
    return {};
  }
}

/**
 * Parse query parameters from URL
 */
function parseQueryParams(url: string): Record<string, string> {
  const parsedUrl = new URL(url);
  const query: Record<string, string> = {};
  parsedUrl.searchParams.forEach((value, key) => {
    query[key] = value;
  });
  return query;
}

/**
 * Main handler for catch-all API route
 * Expo Router API format
 */
export async function GET(
  request: Request,
  { params }: { params: { slug: string[] } },
) {
  return handleRequest(request, params, "GET");
}

export async function POST(
  request: Request,
  { params }: { params: { slug: string[] } },
) {
  return handleRequest(request, params, "POST");
}

export async function PUT(
  request: Request,
  { params }: { params: { slug: string[] } },
) {
  return handleRequest(request, params, "PUT");
}

export async function DELETE(
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
  let route: string;
  
  try {
    const validated = validateParams(params);
    route = validated.route;
  } catch (error) {
    console.error(`Invalid route parameters:`, error);
    return Response.json(
      {
        error: "Invalid route parameters",
        message: error instanceof Error ? error.message : "Missing route segment",
        availableRoutes: Object.keys(routeHandlers),
      },
      { status: 400 },
    );
  }

  // Check if route exists
  const handler = routeHandlers[route];
  if (!handler) {
    console.warn(`Route not found: ${route}`);
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
    const query = parseQueryParams(request.url);

    // Parse body for POST/PUT requests
    const body = await parseRequestBody(request, method);

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
    console.error(`API Error [${route}] [${method}]:`, error);
    
    const isDevelopment = process.env.NODE_ENV === "development";
    
    return Response.json(
      {
        error: "Internal Server Error",
        route,
        method,
        message: error instanceof Error ? error.message : "Unknown error",
        ...(isDevelopment && { stack: error instanceof Error ? error.stack : undefined }),
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
