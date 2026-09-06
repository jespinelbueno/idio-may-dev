export const initResponsiveNav = ({ navSelector, transitionSelector }) => {
  const nav = document.querySelector(navSelector);
  const offer = document.querySelector(transitionSelector);
  const toggle = nav?.querySelector("button[aria-controls]");
  const links = document.getElementById(toggle?.getAttribute("aria-controls"));
  if (!nav || !offer || !toggle || !links) return;

  const compact = window.matchMedia("(max-width: 640px)");
  let animationFrame = null;
  const setMenuOpen = (open, returnFocus = false) => {
    nav.classList.toggle("is-menu-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.textContent = open ? "Close" : "Menu";
    if (returnFocus) toggle.focus();
  };
  const updateNav = () => {
    animationFrame = null;
    nav.classList.toggle("is-sticky", offer.getBoundingClientRect().top <= nav.offsetHeight);
    document.body.style.setProperty("--nav-height", `${nav.offsetHeight}px`);
  };
  const scheduleNavUpdate = () => {
    if (animationFrame !== null) return;
    animationFrame = window.requestAnimationFrame(updateNav);
  };
  toggle.addEventListener("click", () => setMenuOpen(toggle.getAttribute("aria-expanded") !== "true"));
  links.addEventListener("click", (event) => {
    if (event.target.closest("a")) setMenuOpen(false);
  });
  nav.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && nav.classList.contains("is-menu-open")) {
      event.preventDefault();
      setMenuOpen(false, true);
    }
  });
  nav.addEventListener("focusout", (event) => {
    if (!nav.contains(event.relatedTarget)) setMenuOpen(false);
  });
  document.addEventListener("pointerdown", (event) => {
    if (!nav.contains(event.target)) setMenuOpen(false);
  });
  compact.addEventListener("change", () => {
    const focusWasInLinks = links.contains(document.activeElement);
    setMenuOpen(false, compact.matches && focusWasInLinks);
    if (!compact.matches && document.activeElement === toggle) links.querySelector("a")?.focus();
    scheduleNavUpdate();
  });
  new ResizeObserver(scheduleNavUpdate).observe(nav);
  updateNav();
  window.addEventListener("scroll", scheduleNavUpdate, { passive: true });
  window.addEventListener("resize", scheduleNavUpdate, { passive: true });
};
