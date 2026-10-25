// ============================================================
// Ninja Combat Academy - Ultra-Speed Service Worker (PWA Cache)
// ============================================================
const CACHE_NAME = 'nca-speed-v3.6.0';
const STATIC_ASSETS = [
  './',
  './index.html',
  './assets/css/style.css?v=3.5.0',
  './assets/css/glass-ui.css?v=3.5.0',
  './assets/js/main.js?v=3.5.0',
  './assets/js/premium-features.js?v=3.5.0',
  './assets/images/logo.png',
  './assets/images/favicon.png',
  './assets/images/founder_sensei_dhruv.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Stale-while-revalidate for speed
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
