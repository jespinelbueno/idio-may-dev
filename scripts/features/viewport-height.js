export const initViewportHeight = () => {
  const updateViewportHeight = () => {
    document.documentElement.style.setProperty("--hero-vh", `${window.innerHeight}px`);
  };

  updateViewportHeight();
  window.addEventListener("resize", updateViewportHeight, { passive: true });
};
