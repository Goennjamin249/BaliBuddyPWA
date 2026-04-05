/**
 * Centralized currency service for all currency-related operations
 * Eliminates duplicated API calls across components
 * Implements request deduplication and caching
 */

import { getCachedRate, saveRate } from "../utils/storage";

// Exchange rate API endpoint (supports CORS for localhost development)
const EXCHANGE_RATE_API = "https://api.exchangerate-api.com/v4/latest/EUR";

// In-memory cache to prevent duplicate concurrent requests
let inFlightRequest: Promise<number> | null = null;

/**
 * Fetch the latest EUR to IDR exchange rate
 * Falls back to cached rate if API is unavailable
 * Deduplicates concurrent requests
 */
export async function fetchExchangeRate(): Promise<number> {
  // If there's already a request in flight, return that promise
  if (inFlightRequest) {
    return inFlightRequest;
  }

  // Check cache first - rates only change once per day
  const cached = await getCachedRate();
  if (cached) return Number(cached);

  // Create new request with deduplication
  inFlightRequest = (async () => {
    try {
      const res = await fetch(EXCHANGE_RATE_API, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        cache: 'force-cache'
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      if (data.rates?.IDR) {
        await saveRate({ eur: 1, idr: data.rates.IDR, timestamp: Date.now() });
        return data.rates.IDR;
      }
      throw new Error("Invalid exchange rate data");
    } catch {
      // Silent fail - use cache without logging errors to console
      const fallbackCached = await getCachedRate();
      if (fallbackCached) return Number(fallbackCached);
      return 17200; // Default fallback rate
    } finally {
      inFlightRequest = null;
    }
  })();

  return inFlightRequest;
}

/**
 * Get cached exchange rate
 */
export async function getCachedExchangeRate(): Promise<number> {
  const cached = await getCachedRate();
  return cached ? Number(cached) : 17200;
}

/**
 * Convert amount between currencies
 */
export function convertCurrency(
  amount: number,
  rate: number,
  reversed: boolean
): number {
  return reversed ? amount / rate : amount * rate;
}

/**
 * Format amount as IDR (Indonesian Rupiah)
 */
export function formatIDR(n: number): string {
  return `Rp${Math.round(n).toLocaleString("de-DE")}`;
}

/**
 * Format amount as EUR (Euro)
 */
export function formatEUR(n: number): string {
  return `\u20AC${n.toFixed(2)}`;
}