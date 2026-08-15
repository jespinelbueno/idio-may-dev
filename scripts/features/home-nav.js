export const initHomeNav = () => {
  const nav = document.querySelector(".home-nav");
  const offer = document.querySelector(".offer");

  if (!nav || !offer) return;

  let animationFrame = null;

  const updateNav = () => {
    animationFrame = null;
    nav.classList.toggle("is-sticky", offer.getBoundingClientRect().top <= 0);
  };

  const scheduleNavUpdate = () => {
    if (animationFrame !== null) return;

    animationFrame = window.requestAnimationFrame(updateNav);
  };

  updateNav();
  window.addEventListener("scroll", scheduleNavUpdate, { passive: true });
  window.addEventListener("resize", scheduleNavUpdate, { passive: true });
};
