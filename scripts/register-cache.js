if ("serviceWorker" in navigator && location.protocol !== "file:") {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch(() => {
      // Browsers without service worker access still use their normal HTTP cache.
    });
  }, { once: true });
}
