const setViewportHeight = () => {
  document.documentElement.style.setProperty("--hero-vh", `${window.innerHeight}px`);
};

setViewportHeight();
window.addEventListener("resize", setViewportHeight, { passive: true });

const finishLoading = () => {
  window.setTimeout(() => {
    document.body.classList.remove("is-loading");
    document.body.classList.add("is-ready");
  }, 2800);
};

if (document.readyState === "complete") {
  finishLoading();
} else {
  window.addEventListener("load", finishLoading, { once: true });
}
