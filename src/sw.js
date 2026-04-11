const CACHE_NAME = 'weather-react-v1';
const ASSETS = ['/', '/index.html', '/src/main.jsx', '/src/styles.css'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Network-first for API calls to Open-Meteo, fallback to cache
  if (url.origin.includes('open-meteo.com') || url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // Cache-first for assets
  event.respondWith(caches.match(req).then((cached) => cached || fetch(req)));
});
