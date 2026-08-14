export const initOfferParallax = () => {
  const offerSection = document.querySelector(".offer");
  
  if (!offerSection) return;
  const offerGradients = {
    top: offerSection?.querySelector(".offer__gradient--top"),
    right: offerSection?.querySelector(".offer__gradient--right"),
    bottom: offerSection?.querySelector(".offer__gradient--bottom"),
  };
  const offerParallaxMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  let offerParallaxFrame = 0;
  let offerParallaxCurrent = 0;
  let offerParallaxTarget = 0;

  const getOfferParallaxProgress = () => {
    const rect = offerSection.getBoundingClientRect();
    const travel = window.innerHeight + rect.height;
    return Math.max(0, Math.min(1, (window.innerHeight - rect.top) / travel));
  };
  
  const paintOfferParallax = (progress) => {
    const orbit = progress * Math.PI * 2;
    const travelProgress = progress - 0.5;
    const motionIntensity = offerParallaxMotionQuery.matches ? 0.35 : 1;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const sectionHeight = offerSection.offsetHeight || viewportHeight;
    const counterScroll =
      Math.min(sectionHeight * 0.34, viewportHeight * 1.45) * travelProgress * motionIntensity;
    const positions = {
      top: {
        x: Math.sin(orbit) * viewportWidth * 0.16 * motionIntensity,
        y: counterScroll * 0.78 + Math.cos(orbit) * viewportHeight * 0.12 * motionIntensity,
        scaleX: 1 + (0.06 + Math.sin(orbit + 0.6) * 0.09) * motionIntensity,
        scaleY: 1 + (0.03 + Math.cos(orbit * 1.35 + 0.4) * 0.11) * motionIntensity,
        rotation: Math.sin(orbit + 0.35) * 14 * motionIntensity,
      },
      right: {
        x: Math.sin(orbit + 2.15) * viewportWidth * 0.14 * motionIntensity,
        y: counterScroll + Math.cos(orbit + 2.15) * viewportHeight * 0.17 * motionIntensity,
        scaleX: 1 + (0.07 + Math.sin(orbit + 2.7) * 0.1) * motionIntensity,
        scaleY: 1 + (0.04 + Math.cos(orbit * 1.28 + 2.25) * 0.12) * motionIntensity,
        rotation: Math.sin(orbit + 2.5) * -18 * motionIntensity,
      },
      bottom: {
        x: Math.sin(orbit + 4.25) * viewportWidth * 0.18 * motionIntensity,
        y: counterScroll * 1.12 + Math.cos(orbit + 4.25) * viewportHeight * 0.2 * motionIntensity,
        scaleX: 1 + (0.08 + Math.sin(orbit + 4.8) * 0.11) * motionIntensity,
        scaleY: 1 + (0.04 + Math.cos(orbit * 1.42 + 4.2) * 0.13) * motionIntensity,
        rotation: Math.sin(orbit + 4.55) * 20 * motionIntensity,
      },
    };
  
    Object.entries(offerGradients).forEach(([key, gradient], index) => {
      if (!gradient) return;
      const liquidPhase = orbit * (1.18 + index * 0.13) + index * 2.05;
      const liquidCounterPhase = liquidPhase + 2.4;
  
      gradient.style.setProperty("--gradient-x", `${positions[key].x.toFixed(2)}px`);
      gradient.style.setProperty("--gradient-y", `${positions[key].y.toFixed(2)}px`);
      gradient.style.setProperty("--gradient-scale-x", positions[key].scaleX.toFixed(4));
      gradient.style.setProperty("--gradient-scale-y", positions[key].scaleY.toFixed(4));
      gradient.style.setProperty("--gradient-rotation", `${positions[key].rotation.toFixed(2)}deg`);
      gradient.style.setProperty(
        "--liquid-a-x",
        `${(Math.sin(liquidPhase) * viewportWidth * 0.045 * motionIntensity).toFixed(2)}px`,
      );
      gradient.style.setProperty(
        "--liquid-a-y",
        `${(Math.cos(liquidPhase * 1.22) * viewportHeight * 0.055 * motionIntensity).toFixed(2)}px`,
      );
      gradient.style.setProperty("--liquid-a-rotation", `${(Math.sin(liquidPhase) * 24).toFixed(2)}deg`);
      gradient.style.setProperty(
        "--liquid-a-scale-x",
        (1 + Math.sin(liquidPhase * 1.35) * 0.18 * motionIntensity).toFixed(4),
      );
      gradient.style.setProperty(
        "--liquid-a-scale-y",
        (1 + Math.cos(liquidPhase) * 0.2 * motionIntensity).toFixed(4),
      );
      gradient.style.setProperty(
        "--liquid-b-x",
        `${(Math.sin(liquidCounterPhase) * viewportWidth * 0.05 * motionIntensity).toFixed(2)}px`,
      );
      gradient.style.setProperty(
        "--liquid-b-y",
        `${(Math.cos(liquidCounterPhase * 1.16) * viewportHeight * 0.065 * motionIntensity).toFixed(2)}px`,
      );
      gradient.style.setProperty(
        "--liquid-b-rotation",
        `${(Math.cos(liquidCounterPhase) * -28).toFixed(2)}deg`,
      );
      gradient.style.setProperty(
        "--liquid-b-scale-x",
        (1 + Math.cos(liquidCounterPhase * 1.3) * 0.2 * motionIntensity).toFixed(4),
      );
      gradient.style.setProperty(
        "--liquid-b-scale-y",
        (1 + Math.sin(liquidCounterPhase) * 0.17 * motionIntensity).toFixed(4),
      );
    });
  };
  
  const updateOfferParallax = () => {
    offerParallaxFrame = 0;
  
    offerParallaxTarget = getOfferParallaxProgress();
    offerParallaxCurrent += (offerParallaxTarget - offerParallaxCurrent) * 0.2;
    paintOfferParallax(offerParallaxCurrent);
  
    if (Math.abs(offerParallaxTarget - offerParallaxCurrent) > 0.0005) {
      offerParallaxFrame = window.requestAnimationFrame(updateOfferParallax);
    }
  };
  
  const scheduleOfferParallax = () => {
    offerParallaxTarget = getOfferParallaxProgress();
    if (!offerParallaxFrame) offerParallaxFrame = window.requestAnimationFrame(updateOfferParallax);
  };
  
  offerParallaxCurrent = getOfferParallaxProgress();
  paintOfferParallax(offerParallaxCurrent);
  window.addEventListener("scroll", scheduleOfferParallax, { passive: true });
  window.addEventListener("resize", scheduleOfferParallax, { passive: true });
  offerParallaxMotionQuery.addEventListener("change", scheduleOfferParallax);
};
