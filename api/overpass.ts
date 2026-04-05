/**
 * Overpass API Proxy Endpunkt
 * Vermeidet CORS Fehler beim direkten Zugriff auf overpass-api.de
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

const OVERPASS_API = 'https://overpass-api.de/api/interpreter';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Header setzen
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // OPTIONS Preflight Request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Nur POST erlauben
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    
    const response = await fetch(OVERPASS_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept-Encoding': 'gzip, deflate, br',
        'User-Agent': 'BaliBuddyPWA/1.0 (+https://balibuddy.app)',
      },
      body: `data=${encodeURIComponent(body)}`,
      signal: AbortSignal.timeout(35000)
    });

    if (!response.ok) {
      return res.status(response.status).json({
        error: `Overpass API Error: ${response.status}`
      });
    }

    const data = await response.json();
    
    // Cache Header setzen - 12 Stunden Cache
    res.setHeader('Cache-Control', 'public, s-maxage=43200, stale-while-revalidate=86400');
    
    return res.status(200).json(data);

  } catch (error) {
    console.error('Overpass Proxy Error:', error);
    return res.status(503).json({
      error: 'Overpass API nicht erreichbar',
      elements: []
    });
  }
}