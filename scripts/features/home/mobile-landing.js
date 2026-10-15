export const initMobileLanding = () => {
  const carousel = document.querySelector(".offer__mobile-carousel");
  if (!carousel) return;

  const mobileQuery = window.matchMedia("(max-width: 640px)");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (carousel) {
    const track = carousel.querySelector(".offer__mobile-track");
    const slides = [...track.querySelectorAll(".offer__mobile-slide")];
    let activeIndex = 1;
    let frame = null;
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
    }, { passive: true });
    const align = () => { if (mobileQuery.matches) move(activeIndex, false); };
    window.addEventListener("resize", align, { passive: true });
    align();
  }

};
