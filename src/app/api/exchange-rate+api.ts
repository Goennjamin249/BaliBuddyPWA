/**
 * Exchange Rate API Proxy Route
 * Provides currency exchange rates with IDR as base
 */

interface ExchangeRateResponse {
  base: string;
  date: string;
  rates: Record<string, number>;
  source: string;
  message?: string;
}

const FALLBACK_RATES: Record<string, number> = {
  IDR: 1,
  EUR: 0.000057,
  USD: 0.000062,
  GBP: 0.00005,
  AUD: 0.000095,
  SGD: 0.000083,
  JPY: 0.0091,
  CHF: 0.000056,
  MYR: 0.00028,
  THB: 0.0021,
  KRW: 0.082,
  CNY: 0.00045,
};

function createJsonResponse(
  data: ExchangeRateResponse,
  status: number = 200,
  cacheMaxAge: number = 3600,
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
    const from = url.searchParams.get("from") || "IDR";

    // Try to fetch from exchangerate.host API
    const apiKey = process.env.EXCHANGE_RATE_API_KEY;

    if (apiKey) {
      try {
        const response = await fetch(
          `https://api.exchangerate.host/latest?base=${from}`,
          {
            headers: {
              Accept: "application/json",
            },
          },
        );

        if (response.ok) {
          const data = await response.json();
          return createJsonResponse({
            base: data.base || from,
            date: data.date || new Date().toISOString(),
            rates: data.rates || FALLBACK_RATES,
            source: "exchangerate-host",
          });
        }
      } catch (error) {
        console.error("Exchange rate API fetch error:", error);
      }
    }

    // Fallback to mock data
    return createJsonResponse({
      base: from,
      date: new Date().toISOString(),
      rates: FALLBACK_RATES,
      source: "fallback",
      message:
        "Using fallback rates - configure EXCHANGE_RATE_API_KEY for live data",
    });
  } catch (error) {
    console.error("Exchange Rate API error:", error);
    return createJsonResponse(
      {
        base: "IDR",
        date: new Date().toISOString(),
        rates: FALLBACK_RATES,
        source: "error",
      },
      503,
    );
  }
}
