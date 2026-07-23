const CACHE_NAME = 'chemerp-v2';
const urlsToCache = [
  '/',
  '/static/css/style.css',
  '/static/js/app.js',
  '/static/js/modules/dashboard.js',
  '/static/js/modules/inventory.js',
  '/static/js/modules/resource.js',
  '/static/js/modules/production.js',
  '/static/js/modules/lims.js',
  '/static/js/modules/qaqc.js',
  '/static/js/modules/sales.js',
  '/static/js/modules/finance.js',
  '/static/manifest.json',
  '/login',
  '/register',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  // Only intercept GET requests
  if (event.request.method !== 'GET') return;
  // Ignore API calls
  if (event.request.url.includes('/api/')) return;

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});
