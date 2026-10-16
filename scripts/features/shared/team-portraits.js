// Prepare every portrait, including offscreen cards and alternate photos,
// before someone reaches the team section or starts browsing its carousel.
export const initTeamPortraits = (container) => {
  if (!container) return;
  const prepare = () => {
    container.querySelectorAll("img").forEach((image) => {
      image.loading = "eager";
      image.decode?.().catch(() => {});
    });
  };
  if (!("IntersectionObserver" in window)) {
    prepare();
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    if (!entries.some((entry) => entry.isIntersecting)) return;
    observer.disconnect();
    prepare();
  }, { rootMargin: "1200px 0px" });
  observer.observe(container);
};
