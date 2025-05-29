// Define el nombre de la caché y la versión actual de tu PWA.
// Cambia este número (o el nombre) cada vez que hagas cambios importantes
// en los archivos estáticos para asegurar que los usuarios obtengan la nueva versión.
const CACHE_NAME = 'ghibli-pwa-cache-v1.0.1'; // Versión actualizada

// Lista de archivos estáticos que se cachearán durante la instalación del Service Worker.
// Asegúrate de incluir todos los recursos esenciales para que tu app funcione offline.
const urlsToCache = [
  '/', // Si la raíz de tu app es el directorio del repositorio
  '/index.html',
  '/styles.css',
  '/app.js',
  '/trivia.js',
  '/manifest.json',
  '/IMG/studio-ghibli-seeklogo.png',
  '/IMG/2151068379.jpg'
  // Asegúrate de revisar TODAS las rutas aquí, incluyendo cualquier otra imagen, fuente, etc.
];

// URLs de la API de Studio Ghibli que queremos cachear.
// Usamos un proxy, así que la URL real que llega al Service Worker será la del proxy.
const API_URLS_TO_CACHE = [
  'https://api.allorigins.win/raw?url=https://ghibliapi.vercel.app/films',
  'https://api.allorigins.win/raw?url=https://ghibliapi.vercel.app/people',
  'https://api.allorigins.win/raw?url=https://ghibliapi.vercel.app/species',
  'https://api.allorigins.win/raw?url=https://ghibliapi.vercel.app/locations',
  'https://api.allorigins.win/raw?url=https://ghibliapi.vercel.app/vehicles'
];

// Evento 'install': Se dispara cuando el Service Worker se instala por primera vez.
// Aquí cacheamos los recursos estáticos esenciales.
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Cacheando archivos estáticos:', urlsToCache);
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('[Service Worker] Falló la caché de archivos estáticos durante la instalación:', error);
      })
  );
});

// Evento 'activate': Se dispara cuando el Service Worker se activa.
// Aquí limpiamos cachés antiguas para asegurar que solo la versión actual esté activa.
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activando...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Si el nombre de la caché no coincide con el CACHE_NAME actual, la eliminamos.
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Eliminando caché antigua:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Asegura que el Service Worker toma el control de la página inmediatamente.
  return self.clients.claim();
});

// Evento 'fetch': Se dispara cada vez que la página hace una petición de red.
// Aquí interceptamos las peticiones y decidimos si servir desde la caché o la red.
self.addEventListener('fetch', (event) => {
  // Ignorar peticiones de extensiones de Chrome u otras que no sean HTTP/HTTPS
  if (!(event.request.url.startsWith('http:') || event.request.url.startsWith('https:'))) {
    return;
  }

  // Estrategia para recursos estáticos (Cache-First):
  // Intenta encontrar el recurso en la caché. Si lo encuentra, lo devuelve.
  // Si no, va a la red, lo cachea y luego lo devuelve.
  const isStaticAsset = urlsToCache.some(url => event.request.url.includes(url.replace(/^\//, ''))); // Compara URLs de forma más flexible
  if (isStaticAsset || event.request.mode === 'navigate') { // Para navegación (HTML) y assets
    event.respondWith(
      caches.match(event.request).then((response) => {
        if (response) {
          console.log('[Service Worker] Sirviendo desde caché (estático):', event.request.url);
          return response;
        }
        console.log('[Service Worker] Obteniendo de la red (estático):', event.request.url);
        return fetch(event.request).then((networkResponse) => {
          // Solo cachear respuestas válidas
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return networkResponse;
        }).catch((error) => {
          console.error('[Service Worker] Falló la petición de red para estático:', event.request.url, error);
          // Opcional: devolver una página offline si es una navegación y no hay caché
          // return caches.match('/offline.html');
        });
      })
    );
    return; // Termina la ejecución para peticiones estáticas
  }

  // Estrategia para las APIs de Ghibli (Stale-While-Revalidate):
  // Sirve la respuesta de la caché inmediatamente si está disponible,
  // pero también hace una petición a la red para actualizar la caché en segundo plano.
  const isGhibliApi = API_URLS_TO_CACHE.some(apiUrl => event.request.url.includes(apiUrl));
  if (isGhibliApi) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(event.request);
        const networkFetch = fetch(event.request).then(async (networkResponse) => {
          // Solo cachear respuestas válidas de la red
          if (networkResponse && networkResponse.status === 200) {
            await cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch((error) => {
          console.error('[Service Worker] Falló la petición de red para API:', event.request.url, error);
          // Si la red falla y no hay caché, puedes devolver un error o un fallback
          return new Response('<h1>Error de conexión o datos no disponibles</h1>', { status: 503, headers: { 'Content-Type': 'text/html' } });
        });

        // Si hay una respuesta en caché, la devolvemos inmediatamente.
        // La petición de red continuará en segundo plano para actualizar la caché.
        return cachedResponse || networkFetch;
      })
    );
    return; // Termina la ejecución para peticiones de API
  }

  // Para otras peticiones no manejadas explícitamente, simplemente ir a la red.
  event.respondWith(fetch(event.request));
});