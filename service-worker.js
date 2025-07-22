// service-worker.js - COM CAMINHOS ABSOLUTOS CORRETOS PARA GITHUB PAGES

const CACHE_NAME = 'trading-app-v1.3'; // Atualizamos a versão para forçar um novo cache
const BASE_PATH = '/trading'; // O nome do seu repositório

const urlsToCache = [
  `${BASE_PATH}/`, 
  `${BASE_PATH}/index.html`,
  `${BASE_PATH}/alarms-create.html`,
  `${BASE_PATH}/alarms-manage.html`,
  `${BASE_PATH}/asset-details.html`,
  `${BASE_PATH}/changelog.html`,
  `${BASE_PATH}/manage.html`,
  `${BASE_PATH}/market-scan.html`,
  `${BASE_PATH}/stats.html`,
  `${BASE_PATH}/strategies-manager.html`,
  // CSS
  `${BASE_PATH}/css/base.css`,
  `${BASE_PATH}/css/layout.css`,
  `${BASE_PATH}/css/components.css`,
  `${BASE_PATH}/css/buttons.css`,
  `${BASE_PATH}/css/tables.css`,
  `${BASE_PATH}/css/forms-modals.css`,
  `${BASE_PATH}/css/charts.css`,
  `${BASE_PATH}/css/strategy-builder.css`,
  `${BASE_PATH}/css/footer.css`,
  `${BASE_PATH}/css/dark-mode.css`,
  `${BASE_PATH}/css/responsive.css`,
  `${BASE_PATH}/css/navigation-menu.css`,
  // JS
  `${BASE_PATH}/js/alarms-create.js`,
  `${BASE_PATH}/js/alarms-manage.js`,
  `${BASE_PATH}/js/app.js`,
  `${BASE_PATH}/js/asset-details.js`,
  `${BASE_PATH}/js/changelog.js`,
  `${BASE_PATH}/js/config.js`,
  `${BASE_PATH}/js/dark-mode.js`,
  `${BASE_PATH}/js/dom-elements.js`,
  `${BASE_PATH}/js/firebase-service.js`,
  `${BASE_PATH}/js/handlers.js`,
  `${BASE_PATH}/js/manage.js`,
  `${BASE_PATH}/js/market-scan.js`,
  `${BASE_PATH}/js/modals.js`,
  `${BASE_PATH}/js/navigation.js`,
  `${BASE_PATH}/js/services.js`,
  `${BASE_PATH}/js/state.js`,
  `${BASE_PATH}/js/stats.js`,
  `${BASE_PATH}/js/strategies-manager.js`,
  `${BASE_PATH}/js/ui.js`,
  `${BASE_PATH}/js/utils.js`,
  `${BASE_PATH}/js/version.js`,
  // Ícones
  `${BASE_PATH}/apple-touch-icon.png`,
  `${BASE_PATH}/favicon-32x32.png`,
  `${BASE_PATH}/favicon-16x16.png`,
  `${BASE_PATH}/favicon.ico`,
  `${BASE_PATH}/favicon.svg`,
  `${BASE_PATH}/web-app-manifest-192x192.png`,
  `${BASE_PATH}/web-app-manifest-512x512.png`,
  `${BASE_PATH}/site.webmanifest`
];

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
      .then((response) => {
        return response || fetch(event.request);
      })
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
