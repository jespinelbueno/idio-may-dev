// Bump this version when changing the cache strategy or needing a clean asset cache.
const CACHE_NAME = "idio-site-v5";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names
      .filter((name) => name.startsWith("idio-site-") && name !== CACHE_NAME)
      .map((name) => caches.delete(name)));
    await self.clients.claim();
  })());
});

const saveResponse = (cache, request, response, event) => {
  const cacheControl = response.headers.get("cache-control") || "";
  if (response.ok && response.type === "basic" && !response.redirected
    && !/\b(?:no-store|private|no-cache)\b/i.test(cacheControl)) {
    event.waitUntil(cache.put(request, response.clone()).catch(() => {
      // Storage can be unavailable or full; the network response remains usable.
    }));
  }
  return response;
};

const staleWhileRevalidate = async (request, event) => {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  const refresh = fetch(request)
    .then((response) => saveResponse(cache, request, response, event));

  if (cached) {
    event.waitUntil(refresh.catch(() => {}));
    return cached;
  }

  return refresh;
};

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET" || request.headers.has("range")
    || request.headers.has("authorization") || request.cache === "no-store") return;

  const url = new URL(request.url);
  const scope = new URL(self.registration.scope);
  if (url.origin !== scope.origin || !url.pathname.startsWith(scope.pathname)) return;
  // Query variants must not create persistent, attacker-controlled cache entries.
  if (url.search) return;

  const path = url.pathname.slice(scope.pathname.length);
  // Cache only public media. Documents, scripts, styles, and SVG-as-document
  // navigations use the browser's normal network/HTTP cache handling so an
  // offline executable copy cannot outlive a deployed security fix.
  if (request.mode !== "navigate" && path.startsWith("assets/")
    && /\.(?:avif|gif|ico|jpe?g|png|svg|webp|mp4|webm|woff2?|ttf|otf)$/i.test(path)) {
    event.respondWith(staleWhileRevalidate(request, event));
  }
});
