export function initServicesHeroReveal() {
  const stage = document.querySelector(".services-hero-offer-transition");
  const hero = stage?.querySelector(".services-hero");
  const scrollSpace = stage?.querySelector(".services-hero-scroll-space");
  const offer = stage?.querySelector(".services-offer");
  const dotMarker = hero?.querySelector(".services-hero__dot");
  const whiteTitle = hero?.querySelector(".services-hero__title");
  const revealCopy = hero?.querySelector(".services-hero__reveal-copy");
  const reveal = hero?.querySelector(".services-hero__reveal");

  if (!stage || !hero || !scrollSpace || !offer || !dotMarker || !whiteTitle || !revealCopy || !reveal) {
    return;
  }

  const nav = document.querySelector(".services-nav");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let animationFrame = 0;
  let geometry = null;
  let needsMeasurement = true;
  let lastRenderedScroll = null;
  const renderedStyles = new WeakMap();
  const clamp = (value) => Math.min(Math.max(value, 0), 1);
  const ease = (value) => value * value * (3 - 2 * value);
  const setStyle = (element, name, value) => {
    let values = renderedStyles.get(element);
    if (!values) {
      values = new Map();
      renderedStyles.set(element, values);
    }
    if (values.get(name) === value) return;
    values.set(name, value);
    element.style.setProperty(name, value);
  };

  // Geometry changes on layout updates, not on scroll. Keep the unavoidable
  // alignment write/read here, outside the animation's scrolling frames.
  const measure = () => {
    needsMeasurement = false;
    const stageTop = stage.getBoundingClientRect().top + window.scrollY;
    const heroHeight = hero.offsetHeight || window.innerHeight;
    const titleHeight = whiteTitle.offsetHeight;
    const copyHeight = revealCopy.offsetHeight;
    const navHeight = nav?.offsetHeight || 68;
    const holdDistance = Math.max(scrollSpace.offsetHeight - heroHeight, 0);
    const mobile = window.innerWidth <= 640;
    const staticLayout = window.innerHeight <= 520;
    // Mobile browser chrome changes innerHeight during a swipe. Never turn
    // those changes into moving section boundaries or extra page height.
    const maximumLag = reducedMotion.matches || mobile || staticLayout
      ? 0 : Math.min(heroHeight * 0.2, 12 * 16);
    setStyle(hero, "--services-title-height", `${titleHeight}px`);
    if (window.innerWidth <= 640 || window.innerHeight <= 720) {
      // Keep both titles aligned while leaving room for the paragraph in the reveal.
      const titleCenter = Math.max(
        navHeight + titleHeight / 2 + 24,
        Math.min(heroHeight * 0.49, heroHeight - copyHeight + titleHeight / 2 - 48),
      );
      setStyle(hero, "--services-title-y", `${titleCenter}px`);
    } else {
      hero.style.removeProperty("--services-title-y");
      renderedStyles.get(hero)?.delete("--services-title-y");
    }
    setStyle(stage, "--services-hero-offer-lag-space", `${maximumLag.toFixed(2)}px`);
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
    if (mobile && !staticLayout) {
      setStyle(reveal, "--services-reveal-diameter", `${(endingRadius * 2).toFixed(2)}px`);
    }
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
    geometry = {
      stageTop, heroHeight, holdDistance, startingRadius, endingRadius,
      titleIntersectionRadius,
      copyFadeDistance: Math.max(titleCoverageRadius - titleIntersectionRadius, 1),
      maximumLag,
      mobile,
      viewportWidth: window.innerWidth,
      end: stageTop + heroHeight * 2 + holdDistance,
      staticLayout,
    };
  };

  const update = () => {
    animationFrame = 0;
    if (needsMeasurement) measure();
    const { stageTop, heroHeight, holdDistance, startingRadius, endingRadius,
      titleIntersectionRadius, copyFadeDistance, maximumLag } = geometry;
    const scroll = window.scrollY;
    const transitionProgress = clamp((clamp((scroll - stageTop) / heroHeight) - 0.05) / 0.95);
    const revealProgress = reducedMotion.matches
      ? Number(transitionProgress >= 0.5) : ease(transitionProgress);
    const revealRadius = startingRadius + (endingRadius - startingRadius) * revealProgress;
    const copyOpacity = ease(clamp((revealRadius - titleIntersectionRadius) / copyFadeDistance));
    const takeoverProgress = clamp((scroll - stageTop - heroHeight - holdDistance) / heroHeight);

    // Scope frequently changing variables to their consumers, rather than
    // invalidating inherited styles throughout the entire hero subtree.
    if (geometry.mobile && !geometry.staticLayout) {
      setStyle(reveal, "--services-reveal-scale", (revealRadius / endingRadius).toFixed(6));
    } else {
      setStyle(reveal, "--services-reveal-radius", `${revealRadius.toFixed(2)}px`);
    }
    setStyle(revealCopy, "--services-copy-opacity", copyOpacity.toFixed(3));
    setStyle(offer, "--services-hero-offer-lag", `${(ease(takeoverProgress) * maximumLag).toFixed(2)}px`);
    lastRenderedScroll = scroll;
  };

  const requestUpdate = () => {
    if (!needsMeasurement && geometry && lastRenderedScroll !== null) {
      const scroll = window.scrollY;
      if (geometry.staticLayout ||
        (scroll >= geometry.end && lastRenderedScroll >= geometry.end) ||
        (scroll <= geometry.stageTop && lastRenderedScroll <= geometry.stageTop)) return;
    }
    if (!animationFrame) animationFrame = window.requestAnimationFrame(update);
  };
  const invalidateGeometry = () => {
    needsMeasurement = true;
    requestUpdate();
  };
  const onResize = () => {
    // The stable CSS hero size is unchanged when Safari hides its toolbar.
    // ResizeObserver still handles real hero, copy, or navigation changes.
    if (geometry?.mobile && window.innerWidth === geometry.viewportWidth &&
      hero.offsetHeight === geometry.heroHeight &&
      (window.innerHeight <= 520) === geometry.staticLayout) return;
    invalidateGeometry();
  };

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", onResize);
  window.addEventListener("load", invalidateGeometry);
  window.addEventListener("pageshow", invalidateGeometry);
  reducedMotion.addEventListener("change", invalidateGeometry);
  if ("ResizeObserver" in window) {
    const observer = new ResizeObserver(invalidateGeometry);
    observer.observe(revealCopy);
    observer.observe(hero);
    if (nav) observer.observe(nav);
  }
  document.fonts?.ready.then(invalidateGeometry);
  update();
}
