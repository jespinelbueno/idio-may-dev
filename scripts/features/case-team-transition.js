const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export const initCaseTeamTransition = () => {
  const stage = document.querySelector(".case-team");
  const scrollTrack = stage?.querySelector(".case-study__scroll-track");
  const pinnedCaseStudy = scrollTrack?.querySelector(".case-study");
  const teamStage = stage?.querySelector(".team-stage");

  if (!stage || !scrollTrack || !pinnedCaseStudy || !teamStage) return;

  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  let animationFrame = 0;

  const paintTransition = () => {
    animationFrame = 0;

    const canPin = window.getComputedStyle(pinnedCaseStudy).position === "sticky";

    if (!canPin) {
      stage.style.setProperty("--team-takeover-distance", "0px");
      stage.style.setProperty("--team-takeover-lag-space", "0px");
      teamStage.style.setProperty("--team-takeover-lag", "0px");
      return;
    }

    const viewportHeight = window.innerHeight;
    const maximumLag = motionQuery.matches ? 0 : Math.min(viewportHeight * 0.2, 12 * 16);
    const takeoverDistance = viewportHeight + maximumLag;

    stage.style.setProperty("--team-takeover-distance", `${takeoverDistance.toFixed(2)}px`);
    stage.style.setProperty("--team-takeover-lag-space", `${maximumLag.toFixed(2)}px`);

    const trackTop = scrollTrack.getBoundingClientRect().top + window.scrollY;
    const takeoverStart =
      trackTop + scrollTrack.offsetHeight - takeoverDistance - viewportHeight;
    const progress = clamp((window.scrollY - takeoverStart) / viewportHeight, 0, 1);
    const easedProgress = progress * progress * (3 - 2 * progress);

    teamStage.style.setProperty(
      "--team-takeover-lag",
      `${(easedProgress * maximumLag).toFixed(2)}px`,
    );
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
