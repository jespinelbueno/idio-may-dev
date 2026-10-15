// Retirement worker: remove the former custom media cache and unregister.
// Keep this URL available so older installations can migrate safely.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter((name) => name.startsWith("idio-site-"))
      .map((name) => caches.delete(name)));
    await self.clients.claim();
    await self.registration.unregister();
  })());
});
// No fetch interception, cache writes, tracking, or network requests.
