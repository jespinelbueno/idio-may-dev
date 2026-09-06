export const initViewportHeight = () => {
  if (!document.querySelector(".hero")) return;
  const compact = window.matchMedia("(max-width: 1100px)");
  const updateViewportHeight = () => {
    if (compact.matches && CSS.supports("height", "100svh")) {
      document.documentElement.style.removeProperty("--hero-vh");
      return;
    }
    document.documentElement.style.setProperty("--hero-vh", `${window.innerHeight}px`);
  };

  updateViewportHeight();
  window.addEventListener("resize", updateViewportHeight, { passive: true });
};
