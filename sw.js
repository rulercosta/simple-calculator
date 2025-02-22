const CACHE_NAME = 'calculator-v1';
const urlsToCache = [
  '/simple-calculator/',
  '/simple-calculator/index.html',
  '/simple-calculator/static/styles.css',
  '/simple-calculator/static/script.js',
  '/simple-calculator/static/manifest.json',
  '/simple-calculator/README.md',
  '/simple-calculator/static/android-chrome-192x192.png',
  '/simple-calculator/static/android-chrome-512x512.png',
  '/simple-calculator/static/apple-touch-icon.png',
  '/simple-calculator/static/favicon-32x32.png',
  '/simple-calculator/static/favicon-16x16.png',
  '/simple-calculator/static/favicon.ico',
  'https://fonts.cdnfonts.com/css/sf-pro-display',
  'https://fonts.cdnfonts.com/s/15861/SFPRODISPLAYREGULAR.woff',
  'https://fonts.cdnfonts.com/s/15861/SFPRODISPLAYMEDIUM.woff',
  'https://fonts.cdnfonts.com/s/15861/SFPRODISPLAYBOLD.woff'  
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting()) 
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request)
          .then(response => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            if (event.request.mode === 'navigate') {
              return caches.match('/index.html');
            }
            return new Response('Network error happened', {
              status: 408,
              headers: { 'Content-Type': 'text/plain' },
            });
          });
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim()) 
  );
});
