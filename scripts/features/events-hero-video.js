export function initEventsHeroVideo() {
  const video = document.querySelector(".events-hero__video");
  if (!video) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const syncPlayback = () => {
    if (reducedMotion.matches) {
      video.pause();
      return;
    }

    video.play().catch(() => {});
  };

  reducedMotion.addEventListener("change", syncPlayback);
  syncPlayback();
}
