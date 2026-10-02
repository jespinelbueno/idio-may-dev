import { valuesWheelConfig } from "./values-wheel/config.js";

export const initMobileLanding = () => {
  const carousel = document.querySelector(".offer__mobile-carousel");
  const mobileWheel = document.querySelector(".values-wheel-mobile");
  if (!carousel && !mobileWheel) return;

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

  if (mobileWheel) {
    const list = document.querySelector(".values-mobile-list");
    const select = (title) => {
      list?.querySelectorAll(".values-mobile-item").forEach(item => {
        item.classList.toggle("is-active", item.dataset.valueTitle === title);
      });
      mobileWheel.querySelectorAll("button").forEach(button => {
        button.setAttribute("aria-pressed", String(button.dataset.valueTitle === title));
      });
    };
    valuesWheelConfig.forEach(({ title, label }) => {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.valueTitle = title;
      button.setAttribute("aria-label", label);
      button.addEventListener("click", () => select(title));
      mobileWheel.appendChild(button);
    });
    if (list) list.setAttribute("aria-live", "polite");
    const syncMobileValue = () => {
      if (mobileQuery.matches) select("creativity");
      else {
        list?.querySelectorAll(".values-mobile-item.is-active").forEach(item => item.classList.remove("is-active"));
      }
    };
    mobileQuery.addEventListener("change", syncMobileValue);
    if (mobileQuery.matches) select("creativity");
  }
};
