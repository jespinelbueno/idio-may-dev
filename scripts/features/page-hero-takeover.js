const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export const initPageHeroTakeover = (stageSelector) => {
  const stage = document.querySelector(stageSelector);
  const hero = stage?.querySelector("[data-takeover-hero]");
  const nextSection = stage?.querySelector("[data-takeover-section]");
  if (!stage || !hero || !nextSection) return;

  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  let animationFrame = 0;

  const update = () => {
    animationFrame = 0;
    if (motionQuery.matches || window.getComputedStyle(hero).position !== "sticky") {
      stage.style.setProperty("--page-takeover-lag-space", "0px");
      stage.parentElement.style.setProperty("--page-takeover-lag", "0px");
      return;
    }

    const stageTop = stage.getBoundingClientRect().top + window.scrollY;
    const heroHeight = hero.offsetHeight || window.innerHeight;
    const progress = clamp((window.scrollY - stageTop) / heroHeight, 0, 1);
    const easedProgress = progress * progress * (3 - 2 * progress);
    const maximumLag = Math.min(window.innerHeight * 0.2, 12 * 16);

    stage.style.setProperty("--page-takeover-lag-space", `${maximumLag.toFixed(2)}px`);
    stage.parentElement.style.setProperty("--page-takeover-lag", `${(easedProgress * maximumLag).toFixed(2)}px`);
  };

  const scheduleUpdate = () => {
    if (!animationFrame) animationFrame = window.requestAnimationFrame(update);
  };

  update();
  window.addEventListener("scroll", scheduleUpdate, { passive: true });
  window.addEventListener("resize", scheduleUpdate, { passive: true });
  motionQuery.addEventListener("change", scheduleUpdate);
};
