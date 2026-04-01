/* eslint-disable no-restricted-globals */
/* Service Worker for BaliBuddy PWA - Offline-First Asset Caching */

const CACHE_NAME = 'balibuddy-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch event - Cache-First strategy for assets, Network-First for API
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Cache-First for static assets (images, fonts, JS, CSS)
  if (
    url.pathname.startsWith('/_expo/') ||
    url.pathname.startsWith('/assets/') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.match(/\.(png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/)
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then((networkResponse) => {
          // Cache successful responses
          if (networkResponse.ok) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // Network-First for API requests (with cache fallback)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse.ok) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Fallback to cache if network fails
          return caches.match(request);
        })
    );
    return;
  }

  // Default: Network-First with cache fallback
  event.respondWith(
    fetch(request)
      .catch(() => {
        return caches.match(request);
      })
  );
});

// Handle messages from main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
