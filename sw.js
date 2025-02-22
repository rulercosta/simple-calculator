const CACHE_NAME = 'calculator-app-v1';
const ASSETS = [
  '/simple-calculator/',
  '/simple-calculator/index.html',
  '/simple-calculator/static/styles.css',
  '/simple-calculator/static/script.js',
  '/simple-calculator/static/main.js',
  '/simple-calculator/static/calculator.js',
  '/simple-calculator/static/calculator-layout.js',
  '/simple-calculator/static/manifest.json',
  '/simple-calculator/README.md',
  '/simple-calculator/static/android-chrome-192x192.png',
  '/simple-calculator/static/android-chrome-512x512.png',
  '/simple-calculator/static/apple-touch-icon.png',
  '/simple-calculator/static/favicon-32x32.png',
  '/simple-calculator/static/favicon-16x16.png',
  '/simple-calculator/static/favicon.ico'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return Promise.allSettled(
          ASSETS.map(asset =>
            cache.add(asset).catch(error => {
              console.warn(`Failed to cache asset: ${asset}`, error);
            })
          )
        );
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request)
          .then((fetchResponse) => {
            return caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, fetchResponse.clone());
                return fetchResponse;
              });
          });
      })
      .catch(() => {
        return new Response('Offline content not available');
      })
  );
});
