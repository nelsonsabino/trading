const CACHE_NAME = 'trading-app-v1';

// Determina o caminho base da app (ex: "/trading" no GitHub Pages)
const BASE_PATH = self.location.pathname.replace(/\/service-worker\.js$/, '');

const urlsToCache = [
  '/index.html',
  '/alarms-create.html',
  '/alarms-manage.html',
  '/asset-details.html',
  '/changelog.html',
  '/manage.html',
  '/market-scan.html',
  '/stats.html',
  '/strategies-manager.html',
  '/css/base.css',
  '/css/layout.css',
  '/css/components.css',
  '/css/buttons.css',
  '/css/tables.css',
  '/css/forms-modals.css',
  '/css/charts.css',
  '/css/strategy-builder.css',
  '/css/footer.css',
  '/css/dark-mode.css',
  '/css/responsive.css',
  '/css/navigation-menu.css',
  '/js/alarms-create.js',
  '/js/alarms-manage.js',
  '/js/app.js',
  '/js/asset-details.js',
  '/js/changelog.js',
  '/js/config.js',
  '/js/dark-mode.js',
  '/js/dom-elements.js',
  '/js/firebase-service.js',
  '/js/handlers.js',
  '/js/manage.js',
  '/js/market-scan.js',
  '/js/modals.js',
  '/js/navigation.js',
  '/js/services.js',
  '/js/state.js',
  '/js/stats.js',
  '/js/strategies-manager.js',
  '/js/ui.js',
  '/js/utils.js',
  '/js/version.js',
  '/apple-touch-icon.png',
  '/favicon-32x32.png',
  '/favicon-16x16.png',
  '/favicon.ico',
  '/favicon.svg',
  '/web-app-manifest-192x192.png',
  '/web-app-manifest-512x512.png',
  '/site.webmanifest'
].map(path => `${BASE_PATH}${path}`);

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Cacheando shell da aplicação');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('Service Worker: Falha ao cachear durante a instalação:', error);
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
      .catch((error) => {
        console.error('Service Worker: Falha no fetch:', event.request.url, error);
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Apagando cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
