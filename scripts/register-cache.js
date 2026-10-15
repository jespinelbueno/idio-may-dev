// Only existing installations need a worker update. New visitors get no worker.
if ("serviceWorker" in navigator && location.protocol !== "file:") {
  const workerURL = new URL("../service-worker.js", document.currentScript.src);
  const scopeURL = new URL("./", workerURL).href;
  navigator.serviceWorker.getRegistrations().then(async (registrations) => {
    const registration = registrations.find((item) => item.scope === scopeURL
      && [item.active, item.waiting, item.installing].some((worker) => worker?.scriptURL === workerURL.href));
    if (registration) {
      await navigator.serviceWorker.register(workerURL.href, { scope: scopeURL, updateViaCache: "none" });
      await registration.update();
    }
  }).catch(() => {
    // Private browsers may deny worker access. Optional intro storage stays separate.
  });
}
