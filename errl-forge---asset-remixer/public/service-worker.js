/**
 * Service Worker for Errl Forge
 * Provides offline support and asset caching
 */

const CACHE_NAME = 'errl-forge-v1';
const STATIC_CACHE_NAME = 'errl-forge-static-v1';
const API_CACHE_NAME = 'errl-forge-api-v1';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching static assets');
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[Service Worker] Failed to cache some static assets:', err);
      });
    })
  );
  self.skipWaiting(); // Activate immediately
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && 
              cacheName !== STATIC_CACHE_NAME && 
              cacheName !== API_CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim(); // Take control of all pages
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other protocols
  let url;
  try {
    url = new URL(request.url);
    if (!url.protocol.startsWith('http')) {
      return;
    }
  } catch (e) {
    // Invalid URL, skip
    return;
  }

  // Handle different types of requests
  if (url.origin === self.location.origin) {
    // Same-origin requests - try cache first, then network
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then((response) => {
          // Cache successful responses
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(STATIC_CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        }).catch(() => {
          // If offline and no cache, return offline page or fallback
          if (request.destination === 'document') {
            return caches.match('/index.html').then((cached) => {
              return cached || new Response('Offline', { status: 503 });
            });
          }
          // Return error response for other failed requests
          return new Response('Network error', { status: 503 });
        });
      })
    );
  } else {
    // Cross-origin requests (API calls, images, etc.)
    // CRITICAL: Skip intercepting maplestory.io requests to prevent CORB loops
    if (url.hostname.includes('maplestory.io')) {
      // Don't intercept - let browser handle directly to avoid CORB
      return;
    }
    
    // Use network-first strategy with cache fallback for other APIs
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Only cache JSON API responses, not images (to avoid CORB)
          if (response && response.status === 200) {
            const contentType = response.headers.get('content-type') || '';
            const isImage = contentType.startsWith('image/') || request.destination === 'image';
            const isJson = contentType.includes('application/json') || url.pathname.includes('/api/');
            
            // Only cache JSON API responses, skip images to prevent CORB
            if (isJson && !isImage) {
              if (url.hostname.includes('generativelanguage.googleapis.com') ||
                  url.hostname.includes('api.openai.com') ||
                  url.hostname.includes('api.anthropic.com')) {
                const responseToCache = response.clone();
                caches.open(API_CACHE_NAME).then((cache) => {
                  cache.put(request, responseToCache).catch(() => {
                    // Silently fail if caching fails (CORB protection)
                  });
                });
              }
            }
          }
          return response;
        })
        .catch((error) => {
          // Silently handle errors to prevent CORB-related crashes
          // Offline - try cache
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Return a placeholder for images
            if (request.destination === 'image') {
              return new Response(
                '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="#333"/><text x="50" y="50" text-anchor="middle" fill="#666" font-size="12">Offline</text></svg>',
                { headers: { 'Content-Type': 'image/svg+xml' } }
              );
            }
            // Return error response for other requests
            return new Response('Offline - resource not cached', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: { 'Content-Type': 'text/plain' }
            });
          }).catch(() => {
            // If cache.match also fails, return error response
            return new Response('Service unavailable', { status: 503 });
          });
        })
    );
  }
});

// Message handler for cache management
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_ASSET') {
    const { url, data } = event.data;
    caches.open(CACHE_NAME).then((cache) => {
      cache.put(url, new Response(data));
    });
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.delete(API_CACHE_NAME).then(() => {
      event.ports[0].postMessage({ success: true });
    });
  }
});

