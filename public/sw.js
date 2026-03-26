const CACHE_NAME = 'balibuddy-v2';
const STATIC_CACHE = 'balibuddy-static-v2';
const DYNAMIC_CACHE = 'balibuddy-dynamic-v2';
const OFFLINE_CACHE = 'balibuddy-offline-v2';

// App Shell - Core assets for offline functionality
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/images/android/launchericon-192x192.png',
  '/assets/images/android/launchericon-512x512.png',
  '/assets/images/ios/180.png',
  '/assets/images/ios/192.png'
];

// Offline fallback page
const OFFLINE_FALLBACK = '/offline.html';

// API endpoints to cache with network-first strategy
const API_CACHE_PATTERNS = [
  /api\.exchangerate-api\.com/,
  /api\.bmkg\.go\.id/,
  /magma\.esdm\.go\.id/,
  /overpass-api\.de/
];

// Static assets patterns
const STATIC_PATTERNS = [
  /\.js$/,
  /\.css$/,
  /\.png$/,
  /\.jpg$/,
  /\.jpeg$/,
  /\.svg$/,
  /\.woff2?$/,
  /\.ttf$/,
  /\.eot$/
];

// Install event - cache app shell and offline fallback
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker v2...');
  
  event.waitUntil(
    Promise.all([
      // Cache App Shell
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('[SW] Caching App Shell');
        return cache.addAll(APP_SHELL);
      }),
      // Cache offline fallback page
      caches.open(OFFLINE_CACHE).then((cache) => {
        console.log('[SW] Caching offline fallback');
        return cache.add(OFFLINE_FALLBACK).catch(() => {
          // If offline.html doesn't exist, create a basic one
          const offlineResponse = new Response(
            createOfflineHTML(),
            { headers: { 'Content-Type': 'text/html' } }
          );
          return cache.put(OFFLINE_FALLBACK, offlineResponse);
        });
      })
    ]).then(() => {
      console.log('[SW] Installation complete');
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker v2...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => {
              return name !== STATIC_CACHE && 
                     name !== DYNAMIC_CACHE && 
                     name !== OFFLINE_CACHE;
            })
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('[SW] Activation complete');
        return self.clients.claim();
      })
  );
});

// Fetch event - intelligent caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and chrome-extension requests
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') {
    return;
  }

  // Handle navigation requests (HTML pages)
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request));
    return;
  }

  // Handle API requests with network-first strategy
  if (API_CACHE_PATTERNS.some(pattern => pattern.test(url.href))) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Handle static assets with cache-first strategy
  if (STATIC_PATTERNS.some(pattern => pattern.test(url.pathname))) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Default strategy: stale-while-revalidate
  event.respondWith(staleWhileRevalidate(request));
});

// Handle navigation requests with offline fallback
async function handleNavigationRequest(request) {
  try {
    // Try network first for navigation
    const networkResponse = await fetch(request);
    
    // Cache successful navigation responses
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed for navigation, serving offline fallback');
    
    // Try to serve from cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Serve offline fallback page
    const offlineCache = await caches.open(OFFLINE_CACHE);
    const offlineResponse = await offlineCache.match(OFFLINE_FALLBACK);
    
    if (offlineResponse) {
      return offlineResponse;
    }
    
    // Ultimate fallback - inline offline page
    return new Response(
      createOfflineHTML(),
      {
        status: 503,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      }
    );
  }
}

// Cache-first strategy (for static assets)
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    // Return cached version and update in background
    updateCache(request);
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Cache-first failed:', request.url);
    return new Response('', { status: 404 });
  }
}

// Network-first strategy (for API calls)
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network-first fallback to cache:', request.url);
    
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline JSON response for API calls
    return new Response(
      JSON.stringify({
        error: 'Offline',
        message: 'Diese Daten sind offline nicht verfügbar',
        cached: false,
        timestamp: new Date().toISOString()
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      }
    );
  }
}

// Stale-while-revalidate strategy
async function staleWhileRevalidate(request) {
  const cachedResponse = await caches.match(request);
  
  const fetchPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        caches.open(DYNAMIC_CACHE)
          .then((cache) => cache.put(request, networkResponse.clone()));
      }
      return networkResponse;
    })
    .catch(() => cachedResponse);

  return cachedResponse || fetchPromise;
}

// Background cache update
async function updateCache(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse);
    }
  } catch (error) {
    // Silent fail for background updates
  }
}

// Create offline HTML fallback
function createOfflineHTML() {
  return `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="theme-color" content="#00B4D8">
  <title>BaliBuddy - Offline</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #E0F2FE 0%, #F8FAFC 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    
    .container {
      text-align: center;
      max-width: 400px;
      background: white;
      border-radius: 24px;
      padding: 40px 32px;
      box-shadow: 0 20px 40px rgba(0, 180, 216, 0.1);
    }
    
    .icon {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, #00B4D8, #90BE6D);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;
      font-size: 40px;
    }
    
    h1 {
      color: #0F172A;
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 12px;
    }
    
    p {
      color: #64748B;
      font-size: 16px;
      line-height: 1.6;
      margin-bottom: 24px;
    }
    
    .features {
      text-align: left;
      background: #F8FAFC;
      border-radius: 16px;
      padding: 20px;
      margin-bottom: 24px;
    }
    
    .feature {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 0;
      color: #0F172A;
      font-size: 14px;
    }
    
    .feature:not(:last-child) {
      border-bottom: 1px solid #E2E8F0;
    }
    
    .retry-btn {
      background: linear-gradient(135deg, #00B4D8, #0098B8);
      color: white;
      border: none;
      padding: 16px 32px;
      border-radius: 16px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
      width: 100%;
    }
    
    .retry-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(0, 180, 216, 0.3);
    }
    
    .retry-btn:active {
      transform: translateY(0);
    }
    
    .status {
      margin-top: 20px;
      padding: 12px;
      background: #FEF3C7;
      border-radius: 12px;
      font-size: 13px;
      color: #92400E;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">🌴</div>
    <h1>Du bist offline</h1>
    <p>Keine Sorge! BaliBuddy funktioniert auch ohne Internet. Einige Features sind bereits verfügbar:</p>
    
    <div class="features">
      <div class="feature">💧 Gespeicherte Wasser-Stationen</div>
      <div class="feature">🏥 Klinik-Standorte</div>
      <div class="feature">💳 Sichere ATMs</div>
      <div class="feature">👕 Wäschereien</div>
      <div class="feature">⛴️ Fähr-Verbindungen</div>
    </div>
    
    <button class="retry-btn" onclick="window.location.reload()">
      🔄 Erneut versuchen
    </button>
    
    <div class="status">
      📱 Tipp: Installiere BaliBuddy als App für beste Offline-Erfahrung!
    </div>
  </div>
  
  <script>
    // Auto-retry when back online
    window.addEventListener('online', () => {
      window.location.reload();
    });
    
    // Check connection status
    if (navigator.onLine) {
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  </script>
</body>
</html>
  `;
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'sync-expenses') {
    event.waitUntil(syncExpenses());
  }
  if (event.tag === 'sync-itinerary') {
    event.waitUntil(syncItinerary());
  }
  if (event.tag === 'sync-favorites') {
    event.waitUntil(syncFavorites());
  }
});

async function syncExpenses() {
  console.log('[SW] Syncing offline expenses...');
  // Implementation would sync with backend when online
}

async function syncItinerary() {
  console.log('[SW] Syncing offline itinerary changes...');
  // Implementation would sync with backend when online
}

async function syncFavorites() {
  console.log('[SW] Syncing offline favorites...');
  // Implementation would sync with backend when online
}

// Push notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body || 'Neue Benachrichtigung von BaliBuddy',
      icon: '/assets/images/android/launchericon-192x192.png',
      badge: '/assets/images/android/launchericon-96x96.png',
      vibrate: [100, 50, 100],
      data: {
        url: data.url || '/',
        dateOfArrival: Date.now(),
        primaryKey: data.primaryKey || 1
      },
      actions: [
        { 
          action: 'open', 
          title: 'Öffnen',
          icon: '/assets/images/android/launchericon-96x96.png'
        },
        { 
          action: 'close', 
          title: 'Schließen' 
        }
      ],
      requireInteraction: false,
      silent: false
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'BaliBuddy', options)
    );
  }
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'close') {
    return;
  }
  
  const url = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if app is already open
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(url);
            return client.focus();
          }
        }
        // Open new window if app not open
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

// Message handling from main app
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

console.log('[SW] Service Worker v2 loaded');