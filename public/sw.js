/* Service worker du back-office Groupe SERMA — offline-first.
 *
 * Stratégies :
 *  - /_next/static/*, icônes, polices → CacheFirst (fichiers immuables hashés)
 *  - Navigations (HTML) + payloads RSC  → NetworkFirst + repli cache local
 *  - Téléchargements /api/back-office/files/* → NetworkFirst + cache
 *  - Page de secours /back-office/offline préchargée à l'installation
 *  - Background Sync « bo-flush » → réveil du moteur de synchronisation
 *    dès que la connexion revient
 */

const VERSION = "v1";
const STATIC_CACHE = `serma-bo-static-${VERSION}`;
const PAGES_CACHE = `serma-bo-pages-${VERSION}`;
const RUNTIME_CACHE = `serma-bo-runtime-${VERSION}`;

const PRECACHE_URLS = [
  "/back-office/offline",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-maskable-192.png",
  "/icons/icon-maskable-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(PAGES_CACHE);
      await Promise.allSettled(PRECACHE_URLS.map((url) => cache.add(url)));
      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => ![STATIC_CACHE, PAGES_CACHE, RUNTIME_CACHE].includes(k))
          .map((k) => caches.delete(k))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});

/** Fetch avec délai d'attente : évite de bloquer sur une connexion lente. */
async function fetchWithTimeout(request, ms) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(request, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) cache.put(request, response.clone());
  return response;
}

async function networkFirst(request, cacheName, { timeout = 8000 } = {}) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetchWithTimeout(request, timeout);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await cache.match(request, { ignoreSearch: false });
    if (cached) return cached;
    throw new Error("offline");
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  // Le service worker ne doit pas cacher la revalidation dev
  if (url.pathname.startsWith("/_next/webpack-hmr")) return;

  // 1. Assets statiques immuables (JS/CSS hashés, icônes, polices)
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname === "/logo.svg" ||
    /\.(?:png|jpg|jpeg|svg|webp|woff2?|ttf)$/i.test(url.pathname)
  ) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // 2. Navigations HTML → NetworkFirst + repli cache + page hors-ligne
  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          return await networkFirst(request, PAGES_CACHE, { timeout: 8000 });
        } catch {
          const fallback = await caches.match("/back-office/offline");
          return (
            fallback ||
            new Response(
              "<!doctype html><html lang=fr><meta charset=utf-8><title>Hors-ligne</title>" +
                "<body style='background:#0C193D;color:#fff;font-family:sans-serif;display:flex;" +
                "align-items:center;justify-content:center;height:100vh;margin:0'>" +
                "<div style=text-align:center><h1>Mode hors-ligne</h1>" +
                "<p style=color:#ffffff99>Ouvrez une page déjà consultée, ou reconnectez-vous.</p></div></body></html>",
              { headers: { "Content-Type": "text/html; charset=utf-8" }, status: 200 }
            )
          );
        }
      })()
    );
    return;
  }

  // 3. Payloads RSC (navigation client-side Next.js) → NetworkFirst + cache
  if (url.searchParams.has("_rsc") || request.headers.get("RSC") === "1") {
    event.respondWith(
      (async () => {
        try {
          return await networkFirst(request, PAGES_CACHE, { timeout: 6000 });
        } catch {
          return new Response("", { status: 503, statusText: "Offline" });
        }
      })()
    );
    return;
  }

  // 4. Téléchargements de fichiers du back-office → NetworkFirst + cache
  if (url.pathname.startsWith("/api/back-office/files/")) {
    event.respondWith(
      (async () => {
        try {
          return await networkFirst(request, RUNTIME_CACHE, { timeout: 15000 });
        } catch {
          return new Response("Fichier indisponible hors-ligne.", { status: 503 });
        }
      })()
    );
    return;
  }
});

// Background Sync : la connexion revient → réveil du moteur de synchro
self.addEventListener("sync", (event) => {
  if (event.tag === "bo-flush") {
    event.waitUntil(
      self.clients.matchAll({ includeUncontrolled: true }).then((clients) => {
        clients.forEach((client) => client.postMessage({ type: "BO_FLUSH" }));
        // L'app est peut-être fermée : on tente aussi une notification directe
        // via l'API (le moteur rouvrira à la prochaine visite).
        return Promise.resolve();
      })
    );
  }
});
