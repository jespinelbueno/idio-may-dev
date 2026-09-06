export function initServicesHeroReveal() {
  const stage = document.querySelector(".services-hero-offer-transition");
  const hero = stage?.querySelector(".services-hero");
  const scrollSpace = stage?.querySelector(".services-hero-scroll-space");
  const offer = stage?.querySelector(".services-offer");
  const dotMarker = hero?.querySelector(".services-hero__dot");
  const whiteTitle = hero?.querySelector(".services-hero__title");

  if (!stage || !hero || !scrollSpace || !offer || !dotMarker || !whiteTitle) {
    return;
  }

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let animationFrame = 0;

  const update = () => {
    animationFrame = 0;

    const stageTop = stage.getBoundingClientRect().top + window.scrollY;
    const heroHeight = hero.offsetHeight || window.innerHeight;
    const holdDistance = Math.max(scrollSpace.offsetHeight - heroHeight, 0);
    const rawProgress = Math.min(Math.max((window.scrollY - stageTop) / heroHeight, 0), 1);
    const transitionProgress = Math.min(Math.max((rawProgress - 0.05) / 0.95, 0), 1);
    const revealProgress = reducedMotion.matches
      ? Number(transitionProgress >= 0.5)
      : transitionProgress * transitionProgress * (3 - (2 * transitionProgress));
    const heroBounds = hero.getBoundingClientRect();
    const dotBounds = dotMarker.getBoundingClientRect();
    const titleBounds = whiteTitle.getBoundingClientRect();
    const originX = dotBounds.left - heroBounds.left + (dotBounds.width / 2);
    const originY = dotBounds.top - heroBounds.top + (dotBounds.height / 2);
    const startingRadius = dotBounds.width / 2;
    const endingRadius = Math.max(
      Math.hypot(originX, originY),
      Math.hypot(heroBounds.width - originX, originY),
      Math.hypot(originX, heroBounds.height - originY),
      Math.hypot(heroBounds.width - originX, heroBounds.height - originY),
    ) + 2;
    const revealRadius = startingRadius + ((endingRadius - startingRadius) * revealProgress);
    const titleLeft = titleBounds.left - heroBounds.left;
    const titleRight = titleBounds.right - heroBounds.left;
    const titleTop = titleBounds.top - heroBounds.top;
    const titleBottom = titleBounds.bottom - heroBounds.top;
    const nearestTitleX = Math.min(Math.max(originX, titleLeft), titleRight);
    const nearestTitleY = Math.min(Math.max(originY, titleTop), titleBottom);
    const titleIntersectionRadius = Math.hypot(originX - nearestTitleX, originY - nearestTitleY);
    const titleCoverageRadius = Math.max(
      Math.hypot(originX - titleLeft, originY - titleTop),
      Math.hypot(originX - titleRight, originY - titleTop),
      Math.hypot(originX - titleLeft, originY - titleBottom),
      Math.hypot(originX - titleRight, originY - titleBottom),
    );
    const copyFadeDistance = Math.max(titleCoverageRadius - titleIntersectionRadius, 1);
    const copyTransition = Math.min(
      Math.max((revealRadius - titleIntersectionRadius) / copyFadeDistance, 0),
      1,
    );
    const copyOpacity = copyTransition * copyTransition * (3 - (2 * copyTransition));

    hero.style.setProperty("--services-reveal-radius", `${revealRadius.toFixed(2)}px`);
    hero.style.setProperty("--services-copy-opacity", copyOpacity.toFixed(3));

    if (reducedMotion.matches) {
      stage.style.setProperty("--services-hero-offer-lag-space", "0px");
      offer.style.setProperty("--services-hero-offer-lag", "0px");
      return;
    }

    const takeoverProgress = Math.min(
      Math.max((window.scrollY - stageTop - heroHeight - holdDistance) / heroHeight, 0),
      1,
    );
    const easedTakeover = takeoverProgress * takeoverProgress * (3 - (2 * takeoverProgress));
    const maximumLag = Math.min(window.innerHeight * 0.2, 12 * 16);

    stage.style.setProperty("--services-hero-offer-lag-space", `${maximumLag.toFixed(2)}px`);
    offer.style.setProperty(
      "--services-hero-offer-lag",
      `${(easedTakeover * maximumLag).toFixed(2)}px`,
    );
  };

  const requestUpdate = () => {
    if (!animationFrame) {
      animationFrame = window.requestAnimationFrame(update);
    }
  };

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
  reducedMotion.addEventListener("change", requestUpdate);
  update();
}
