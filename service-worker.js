// Bump this version when changing the cache strategy or needing a clean asset cache.
const CACHE_NAME = "idio-site-v1";

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
  if (response.ok) {
    event.waitUntil(cache.put(request, response.clone()).catch(() => {
      // Storage can be unavailable or full; the network response remains usable.
    }));
  }
  return response;
};

const networkFirst = async (request, event) => {
  const cache = await caches.open(CACHE_NAME);

  try {
    const response = await fetch(request, { cache: "no-cache" });
    return saveResponse(cache, request, response, event);
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) return cached;
    throw error;
  }
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
  if (request.method !== "GET" || request.headers.has("range")) return;

  const url = new URL(request.url);
  const scope = new URL(self.registration.scope);
  if (url.origin !== scope.origin || !url.pathname.startsWith(scope.pathname)) return;

  const path = url.pathname.slice(scope.pathname.length);
  if (path.startsWith("assets/")) {
    event.respondWith(staleWhileRevalidate(request, event));
  } else if (request.mode === "navigate" || /\.(?:css|js)$/.test(path)) {
    event.respondWith(networkFirst(request, event));
  }
});
