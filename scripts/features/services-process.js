export function initServicesProcess() {
  const diagram = document.querySelector(".services-process__diagram");
  const rotor = diagram?.querySelector(".services-process__rotor");
  const steps = diagram?.querySelectorAll(".services-process__step");
  if (!diagram || !rotor || !steps.length) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const phoneLayout = window.matchMedia("(max-width: 640px)");
  const clamp = (value) => Math.min(Math.max(value, 0), 1);
  const phase = (progress, start, end) => clamp((progress - start) / (end - start));
  const ease = (value) => value * value * (3 - 2 * value);
  let animationFrame = 0;
  let progress = null;
  let targetProgress = 0;
  let travel = 0;
  let lastFrameTime = 0;

  const render = (timestamp) => {
    animationFrame = 0;
    // Time-based damping keeps wheel steps soft at any display refresh rate.
    const elapsed = Math.min(timestamp - lastFrameTime, 64);
    lastFrameTime = timestamp;
    progress += (targetProgress - progress) * (1 - Math.exp(-elapsed / 120));
    const settled = Math.abs(targetProgress - progress) < 0.0001;
    if (settled) progress = targetProgress;
    const turn = ease(phase(progress, 0, 0.4));
    const fill = ease(phase(progress, 0.34, 0.52));
    const opening = ease(phase(progress, 0.46, 0.94));

    diagram.style.setProperty("--process-turn", `${turn * 180}deg`);
    diagram.style.setProperty("--process-top-fill", String(fill));
    diagram.style.setProperty("--process-rotor-opacity", String(1 - fill));
    diagram.style.setProperty("--process-offset", `${travel * (1 - opening)}px`);
    steps.forEach((step, index) => {
      const start = 0.6 + (index / steps.length) * 0.16;
      const reveal = ease(phase(progress, start, start + 0.28));
      step.style.setProperty("--process-step-opacity", String(reveal));
      step.style.setProperty("--process-step-offset", `${12 * (1 - reveal)}px`);
    });
    if (!settled) animationFrame = window.requestAnimationFrame(render);
  };

  const requestUpdate = () => {
    const animate = !reducedMotion.matches && !phoneLayout.matches;
    diagram.classList.toggle("is-scroll-driven", animate);
    if (!animate) {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = 0;
      progress = null;
      return;
    }

    // Measure only on scroll/layout changes, not during the settling frames.
    const bounds = diagram.getBoundingClientRect();
    const viewport = window.innerHeight;
    const center = bounds.top + bounds.height / 2;
    const distance = Math.max(viewport * 0.35, viewport * 0.75 - bounds.height / 2);
    targetProgress = clamp((viewport * 0.85 - center) / distance);
    travel = Math.max((bounds.height - rotor.offsetWidth) / 2, 0);
    if (progress === null) progress = targetProgress;
    if (!animationFrame) {
      lastFrameTime = performance.now();
      render(lastFrameTime);
    }
  };

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
  window.addEventListener("pageshow", requestUpdate);
  reducedMotion.addEventListener("change", requestUpdate);
  if ("ResizeObserver" in window) new ResizeObserver(requestUpdate).observe(diagram);
  requestUpdate();
}
