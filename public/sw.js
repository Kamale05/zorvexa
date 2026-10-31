// Zorvexa Service Worker — Advanced Offline Access & Unstable Connection Strategy
const VERSION = 'zorvexa-v2.1';
const CACHE_STATIC = `zorvexa-static-${VERSION}`;
const CACHE_RUNTIME = `zorvexa-runtime-${VERSION}`;
const CACHE_IMAGES = `zorvexa-images-${VERSION}`;
const CACHE_FONTS = `zorvexa-fonts-${VERSION}`;

const CURRENT_CACHES = [CACHE_STATIC, CACHE_RUNTIME, CACHE_IMAGES, CACHE_FONTS];

// Core shell assets to precache immediately on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/offline.html',
  '/favicon.svg',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg',
  '/icons/icon-maskable-512.svg'
];

// Max items allowed in image cache to manage device storage
const MAX_IMAGE_CACHE_ITEMS = 60;

// Helper to trim cache size
async function trimCache(cacheName, maxItems) {
  try {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    if (keys.length > maxItems) {
      // Delete oldest items
      const deleteCount = keys.length - maxItems;
      for (let i = 0; i < deleteCount; i++) {
        await cache.delete(keys[i]);
      }
    }
  } catch (err) {
    console.warn('[SW] Cache trim error:', err);
  }
}

// 1. Install Event — Pre-cache App Shell & Assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_STATIC).then(async (cache) => {
      // Cache each asset individually so one missing asset doesn't break the whole installation
      await Promise.allSettled(
        PRECACHE_ASSETS.map(async (url) => {
          try {
            const response = await fetch(url, { cache: 'no-cache' });
            if (response && response.ok) {
              await cache.put(url, response);
            }
          } catch (err) {
            console.warn(`[SW] Precache item failed for ${url}:`, err);
          }
        })
      );
    })
  );
  self.skipWaiting();
});

// 2. Activate Event — Clean up outdated caches and take control
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (!CURRENT_CACHES.includes(key)) {
            console.log('[SW] Deleting old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Fetch Event — Routing & Strategies for Unstable Network
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Bypass non-GET requests immediately
  if (request.method !== 'GET') {
    return;
  }

  // Bypass Firebase Auth, Firestore streams, and Internal APIs
  // Firestore has its own robust IndexedDB client-side offline persistence
  if (
    url.hostname.includes('firestore.googleapis.com') ||
    url.hostname.includes('identitytoolkit.googleapis.com') ||
    url.hostname.includes('securetoken.googleapis.com') ||
    url.hostname.includes('firebaseinstallations.googleapis.com') ||
    url.pathname.startsWith('/api/') ||
    url.protocol.startsWith('chrome-extension')
  ) {
    return;
  }

  // Strategy A: Navigation (HTML pages)
  // Network-First with 2.5s Timeout -> fallback to Cached index.html -> fallback to offline.html
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          // Timeout race: if network takes > 2500ms (unstable/poor connection), fallback immediately to cached shell
          const networkPromise = fetch(request);
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Network timeout')), 2500)
          );

          const networkResponse = await Promise.race([networkPromise, timeoutPromise]);
          if (networkResponse && networkResponse.status === 200) {
            const cache = await caches.open(CACHE_STATIC);
            cache.put('/index.html', networkResponse.clone());
            return networkResponse;
          }
        } catch {
          // Network failed or timed out — proceed to cache
        }

        // Return cached index.html (SPA handles routing clientside)
        const cachedIndex = await caches.match('/index.html');
        if (cachedIndex) {
          return cachedIndex;
        }

        // Fallback to offline fallback page
        const cachedOffline = await caches.match('/offline.html');
        if (cachedOffline) {
          return cachedOffline;
        }

        return new Response('Offline — Please check your connection.', {
          status: 503,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });
      })()
    );
    return;
  }

  // Strategy B: Google Fonts & Web Fonts (Cache-First)
  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.open(CACHE_FONTS).then(async (cache) => {
        const cachedResponse = await cache.match(request);
        if (cachedResponse) {
          return cachedResponse;
        }
        try {
          const networkResponse = await fetch(request);
          if (networkResponse && (networkResponse.status === 200 || networkResponse.type === 'opaque')) {
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        } catch {
          return cachedResponse || Response.error();
        }
      })
    );
    return;
  }

  // Strategy C: Media & Images (Stale-While-Revalidate with caching)
  if (
    request.destination === 'image' ||
    url.pathname.match(/\.(png|jpg|jpeg|webp|gif|svg|ico)$/i) ||
    url.hostname.includes('images.unsplash.com') ||
    url.hostname.includes('firebasestorage.googleapis.com')
  ) {
    event.respondWith(
      caches.open(CACHE_IMAGES).then(async (cache) => {
        const cachedResponse = await cache.match(request);

        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && (networkResponse.status === 200 || networkResponse.type === 'opaque')) {
              cache.put(request, networkResponse.clone());
              trimCache(CACHE_IMAGES, MAX_IMAGE_CACHE_ITEMS);
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        // Return cached image immediately if available, otherwise wait for network
        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // Strategy D: Static Assets, Scripts & Styles (Vite /assets/*, .js, .css)
  // Stale-While-Revalidate: instant load from cache + background revalidation
  event.respondWith(
    caches.match(request).then(async (cachedResponse) => {
      const fetchPromise = fetch(request)
        .then(async (networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const cacheToUse = url.pathname.startsWith('/assets/') ? CACHE_STATIC : CACHE_RUNTIME;
            const cache = await caches.open(cacheToUse);
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});

// 4. Message Event for manual triggers or updates
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
    );
  }
});
