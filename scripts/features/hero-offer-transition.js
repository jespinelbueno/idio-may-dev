const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export const initHeroOfferTransition = () => {
  const stage = document.querySelector(".hero-offer-transition");
  const hero = stage?.querySelector(".hero");
  const offer = stage?.querySelector(".offer");

  if (!stage || !hero || !offer) return;

  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  let animationFrame = 0;

  const paintTransition = () => {
    animationFrame = 0;

    if (motionQuery.matches) {
      stage.style.setProperty("--hero-offer-lag-space", "0px");
      offer.style.setProperty("--hero-offer-lag", "0px");
      return;
    }

    const stageTop = stage.getBoundingClientRect().top + window.scrollY;
    const takeoverDistance = hero.offsetHeight || window.innerHeight;
    const progress = clamp((window.scrollY - stageTop) / takeoverDistance, 0, 1);
    const easedProgress = progress * progress * (3 - 2 * progress);
    const maximumLag = Math.min(window.innerHeight * 0.2, 12 * 16);

    stage.style.setProperty("--hero-offer-lag-space", `${maximumLag.toFixed(2)}px`);
    offer.style.setProperty("--hero-offer-lag", `${(easedProgress * maximumLag).toFixed(2)}px`);
  };

  const scheduleTransition = () => {
    if (animationFrame) return;
    animationFrame = window.requestAnimationFrame(paintTransition);
  };

  paintTransition();
  window.addEventListener("scroll", scheduleTransition, { passive: true });
  window.addEventListener("resize", scheduleTransition, { passive: true });
  motionQuery.addEventListener("change", scheduleTransition);
};
