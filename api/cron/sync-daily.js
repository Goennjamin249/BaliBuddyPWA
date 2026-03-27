/**
 * Daily Sync Cron Job Endpoint
 * This endpoint is designed to be called by Vercel Cron Jobs to automatically
 * fetch and cache the latest currency and weather data once a day.
 */

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Verify cron secret for security (optional but recommended)
  const cronSecret = req.headers['authorization'];
  const expectedSecret = process.env.CRON_SECRET;

  if (expectedSecret && cronSecret !== `Bearer ${expectedSecret}`) {
    console.warn('[Cron] Unauthorized cron request');
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or missing cron secret'
    });
  }

  try {
    console.log('[Cron] Daily sync job started at:', new Date().toISOString());

    const results = {
      timestamp: Date.now(),
      startedAt: new Date().toISOString(),
      tasks: {}
    };

    // Task 1: Sync Currency Exchange Rates
    try {
      console.log('[Cron] Syncing currency exchange rates...');
      // TODO: Implement currency sync logic
      // Example: Fetch from exchange-rate API and update MongoDB
      results.tasks.currency = {
        status: 'pending',
        message: 'Currency sync not yet implemented'
      };
    } catch (error) {
      console.error('[Cron] Currency sync failed:', error);
      results.tasks.currency = {
        status: 'failed',
        error: error.message
      };
    }

    // Task 2: Sync Weather Data
    try {
      console.log('[Cron] Syncing weather data...');
      // TODO: Implement weather sync logic
      // Example: Fetch from Open-Meteo API and update MongoDB
      results.tasks.weather = {
        status: 'pending',
        message: 'Weather sync not yet implemented'
      };
    } catch (error) {
      console.error('[Cron] Weather sync failed:', error);
      results.tasks.weather = {
        status: 'failed',
        error: error.message
      };
    }

    // Task 3: Sync Ferry Schedules
    try {
      console.log('[Cron] Syncing ferry schedules...');
      // TODO: Implement ferry sync logic
      results.tasks.ferries = {
        status: 'pending',
        message: 'Ferry sync not yet implemented'
      };
    } catch (error) {
      console.error('[Cron] Ferry sync failed:', error);
      results.tasks.ferries = {
        status: 'failed',
        error: error.message
      };
    }

    results.completedAt = new Date().toISOString();
    results.status = 'completed';

    console.log('[Cron] Daily sync job completed:', results);

    return res.status(200).json({
      success: true,
      message: 'Daily sync job completed',
      data: results
    });

  } catch (error) {
    console.error('[Cron] Daily sync job failed:', error);
    return res.status(500).json({
      error: 'Cron job failed',
      message: error.message,
      timestamp: Date.now()
    });
  }
}

// Health check for cron endpoint
export async function healthCheck(req, res) {
  return res.status(200).json({
    status: 'healthy',
    service: 'cron-sync-daily',
    timestamp: Date.now(),
    nextRun: 'Daily at 00:00 UTC (configured in vercel.json)'
  });
}