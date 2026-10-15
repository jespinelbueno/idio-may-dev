// Run before the stylesheet so unfinished pages never flash through the loader.
(() => {
  const root = document.documentElement;
  root.classList.add("is-page-loading");
  let pending = true;
  let fallback;

  const finish = () => {
    if (!pending) return;
    pending = false;
    window.clearTimeout(fallback);
    root.classList.remove("is-page-loading");
    root.classList.add("is-page-ready");
    window.dispatchEvent(new CustomEvent("idio:page-ready"));
    document.body?.classList.remove("is-loading");
  };

  window.idioPageLoader = Object.freeze({ finish });
  // A stalled request or a failed page module must not block the site forever.
  fallback = window.setTimeout(finish, 12000);
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) finish();
  });
})();
