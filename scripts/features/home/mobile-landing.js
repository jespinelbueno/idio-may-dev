export const initMobileLanding = () => {
  const carousel = document.querySelector(".offer__mobile-carousel");
  if (!carousel) return;

  const mobileQuery = window.matchMedia("(max-width: 640px)");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const track = carousel.querySelector(".offer__mobile-track");
  const slides = [...(track?.querySelectorAll(".offer__mobile-slide") ?? [])];
  if (!track || !slides.length) return;

  let activeIndex = 0;
  let frame = null;
  let rotationTimer = null;
  let inView = false;
  let interacting = false;
  const scheduleRotation = () => {
    window.clearTimeout(rotationTimer);
    rotationTimer = null;
    if (!mobileQuery.matches || reducedMotion.matches || document.hidden || !inView || interacting || slides.length < 2) return;
    rotationTimer = window.setTimeout(() => {
      // Keep the first image in place until the homepage loader has finished.
      if (document.body.classList.contains("is-loading")) {
        scheduleRotation();
        return;
      }
      move(activeIndex + 1);
    }, 3500);
  };
  const highlight = () => slides.forEach((slide, index) => {
    slide.classList.toggle("is-active", index === activeIndex);
  });
  const move = (index, smooth = true) => {
    activeIndex = (index + slides.length) % slides.length;
    const slide = slides[activeIndex];
    track.scrollTo({
      left: slide.offsetLeft - (track.clientWidth - slide.offsetWidth) / 2,
      behavior: smooth && !reducedMotion.matches ? "smooth" : "instant",
    });
    highlight();
    scheduleRotation();
  };
  carousel.querySelector(".offer__mobile-prev").addEventListener("click", () => move(activeIndex - 1));
  carousel.querySelector(".offer__mobile-next").addEventListener("click", () => move(activeIndex + 1));
  track.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    move(activeIndex + (event.key === "ArrowRight" ? 1 : -1));
  });
  track.addEventListener("scroll", () => {
    if (frame !== null) return;
    frame = requestAnimationFrame(() => {
      frame = null;
      const center = track.scrollLeft + track.clientWidth / 2;
      activeIndex = slides.reduce((nearest, slide, index) =>
        Math.abs(slide.offsetLeft + slide.offsetWidth / 2 - center) <
        Math.abs(slides[nearest].offsetLeft + slides[nearest].offsetWidth / 2 - center) ? index : nearest, 0);
      highlight();
    });
    scheduleRotation();
  }, { passive: true });
  track.addEventListener("pointerdown", () => {
    interacting = true;
    scheduleRotation();
  }, { passive: true });
  const finishInteraction = () => {
    if (!interacting) return;
    interacting = false;
    scheduleRotation();
  };
  window.addEventListener("pointerup", finishInteraction, { passive: true });
  window.addEventListener("pointercancel", finishInteraction, { passive: true });
  const observer = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting && entry.intersectionRatio >= 0.5;
    scheduleRotation();
  }, { threshold: [0, 0.5] });
  observer.observe(carousel);
  document.addEventListener("visibilitychange", scheduleRotation);
  mobileQuery.addEventListener("change", scheduleRotation);
  reducedMotion.addEventListener("change", scheduleRotation);
  const align = () => { if (mobileQuery.matches) move(activeIndex, false); };
  window.addEventListener("resize", align, { passive: true });
  align();
};
