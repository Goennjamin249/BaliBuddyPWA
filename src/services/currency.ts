/**
 * Centralized currency service for all currency-related operations
 * Eliminates duplicated API calls across components
 * Implements request deduplication and caching
 */

import db from "../db/index";
import { Q } from "@nozbe/watermelondb";

// Frankfurter API - Open Source Exchange Rate API
const FRANKFURTER_API = "https://api.frankfurter.app/latest?from=EUR";

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

  // 1. Check WatermelonDB Cache first
  try {
    const settingsCollection = db.collections.get("settings");
    const cachedRate = await settingsCollection
      .query(Q.where("key", "exchange_rate_eur_idr"))
      .fetch();
    
    if (cachedRate.length > 0) {
      const rateData = JSON.parse((cachedRate[0] as any).value);
      // Cache is valid for 24 hours
      if (Date.now() - rateData.timestamp < 86400000) {
        return rateData.idr;
      }
    }
  } catch {
    // Ignore cache read errors
  }

  // 2. Fetch from Frankfurter API
  inFlightRequest = (async () => {
    try {
      const res = await fetch(FRANKFURTER_API, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        cache: 'no-cache'
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      if (data.rates?.IDR) {
        const rateValue = data.rates.IDR;
        
        // 3. Save to WatermelonDB persistent cache
        try {
          await db.write(async () => {
            const collection = db.collections.get("settings");
            const existing = await collection
              .query(Q.where("key", "exchange_rate_eur_idr"))
              .fetch();
            
            if (existing.length > 0) {
              await existing[0].update((record: any) => {
                record.value = JSON.stringify({
                  eur: 1,
                  idr: rateValue,
                  timestamp: Date.now()
                });
              });
            } else {
              await collection.create((record: any) => {
                record.key = "exchange_rate_eur_idr";
                record.value = JSON.stringify({
                  eur: 1,
                  idr: rateValue,
                  timestamp: Date.now()
                });
              });
            }
          });
        } catch {
          // Ignore save errors
        }

        return rateValue;
      }
      throw new Error("Invalid exchange rate data");
    } catch {
      // 4. OFFLINE FALLBACK: Load last known rate from database
      try {
        const settingsCollection = db.collections.get("settings");
        const cachedRate = await settingsCollection
          .query(Q.where("key", "exchange_rate_eur_idr"))
          .fetch();
        
        if (cachedRate.length > 0) {
          const rateData = JSON.parse((cachedRate[0] as any).value);
          return rateData.idr;
        }
      } catch {
        // Fallback to default if database also fails
      }
      
      return 17200; // Final default fallback rate
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
  try {
    const settingsCollection = db.collections.get("settings");
    const cachedRate = await settingsCollection
      .query(Q.where("key", "exchange_rate_eur_idr"))
      .fetch();
    
    if (cachedRate.length > 0) {
      const rateData = JSON.parse((cachedRate[0] as any).value);
      return rateData.idr;
    }
  } catch {
    // Ignore errors
  }
  
  return 17200;
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