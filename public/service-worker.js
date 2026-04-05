 
/**
 * BaliBuddy PWA Service Worker
 * Caching strategy:
 * - NetworkFirst for HTML, API routes, and critical assets
 * - StaleWhileRevalidate for JS/CSS bundles
 * - CacheFirst for static assets (images, fonts, map tiles)
 */

const CACHE_NAME = 'balibuddy-v1';
const RUNTIME_CACHE = 'balibuddy-runtime-v1';

// Assets to precache on install
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME && key !== RUNTIME_CACHE)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) return;

  // HTML pages – NetworkFirst
  if (request.destination === 'document' || url.pathname.endsWith('.html')) {
    event.respondWith(networkFirst(request, CACHE_NAME));
    return;
  }

  // API routes – NetworkFirst with 5-second stale timeout
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request, RUNTIME_CACHE, 5));
    return;
  }

  // JS & CSS bundles – StaleWhileRevalidate
  if (
    request.destination === 'script' ||
    request.destination === 'style'
  ) {
    event.respondWith(staleWhileRevalidate(request, RUNTIME_CACHE));
    return;
  }

  // Images, fonts, icons – CacheFirst
  if (
    request.destination === 'image' ||
    request.destination === 'font' ||
    url.pathname.match(/\.(png|jpg|jpeg|gif|webp|svg|ico|woff2?|ttf|eot)$/)
  ) {
    event.respondWith(cacheFirst(request, RUNTIME_CACHE));
    return;
  }

  // Map tiles – CacheFirst with long TTL
  if (
    url.hostname.includes('tile.openstreetmap') ||
    url.hostname.includes('mapbox') ||
    url.hostname.includes('maplibre')
  ) {
    event.respondWith(cacheFirst(request, RUNTIME_CACHE));
    return;
  }

  // Everything else – NetworkFirst
  event.respondWith(networkFirst(request, RUNTIME_CACHE));
});

/**
 * NetworkFirst: Try network, fallback to cache.
 * @param {Request} request
 * @param {string} cacheName
 * @param {number} staleTimeout – seconds before falling back to cache
 */
async function networkFirst(request, cacheName, staleTimeout = 3) {
  const timeoutMs = staleTimeout * 1000;

  try {
    const networkResponse = await fetchWithTimeout(request, timeoutMs);
    if (networkResponse && networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
  } catch {
    // Network failed – try cache
  }

  const cachedResponse = await caches.match(request);
  if (cachedResponse) return cachedResponse;

  // If nothing in cache, return a generic offline fallback
  if (request.destination === 'document') {
    return caches.match('/index.html');
  }

  return new Response('Offline', {
    status: 503,
    statusText: 'Service Unavailable',
  });
}

/**
 * CacheFirst: Try cache, fallback to network.
 */
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch {
    return new Response('Offline', { status: 503 });
  }
}

/**
 * StaleWhileRevalidate: Return cache immediately, update in background.
 */
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await caches.match(request);

  const networkFetch = fetch(request).then(async (res) => {
    if (res.ok) cache.put(request, res.clone());
    return res;
  }).catch(() => null);

  return cached || networkFetch || new Response('Offline', { status: 503 });
}

/**
 * Fetch with timeout.
 */
function fetchWithTimeout(request, timeoutMs) {
  return Promise.race([
    fetch(request),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), timeoutMs)
    ),
  ]);
}
