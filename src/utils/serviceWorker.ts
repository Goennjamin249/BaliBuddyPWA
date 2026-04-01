/**
 * Service Worker Registration for BaliBuddy PWA
 */

export function registerServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    console.log('[SW] Service Worker not supported');
    return;
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((registration) => {
        console.log('[SW] Service Worker registered:', registration.scope);
        
        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('[SW] New content available, refresh to update');
              }
            });
          }
        });
      })
      .catch((error) => {
        console.error('[SW] Service Worker registration failed:', error);
      });
  });
}

export async function unregisterServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    await registration.unregister();
    console.log('[SW] Service Worker unregistered');
  } catch (error) {
    console.error('[SW] Failed to unregister Service Worker:', error);
  }
}
