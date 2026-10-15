export const initResponsiveNav = ({ navSelector, transitionSelector }) => {
  const nav = document.querySelector(navSelector);
  const offer = document.querySelector(transitionSelector);
  const toggle = nav?.querySelector("button[aria-controls]");
  const links = document.getElementById(toggle?.getAttribute("aria-controls"));
  if (!nav || !offer || !toggle || !links) return;

  const compact = window.matchMedia("(max-width: 640px)");
  const circle = document.createElement("span");
  circle.className = "nav-circle";
  circle.setAttribute("aria-hidden", "true");
  const rotor = document.createElement("span");
  rotor.className = "nav-circle__rotor";
  circle.appendChild(rotor);
  toggle.before(circle);
  let animationFrame = null;
  let previousNavHeight = null;
  let previousLinksHeight = null;
  const setMenuOpen = (open, returnFocus = false) => {
    nav.classList.toggle("is-menu-open", open);
    document.documentElement.classList.toggle(
      "has-open-mobile-menu",
      open && compact.matches
    );
    toggle.setAttribute("aria-expanded", String(open));
    toggle.textContent = open ? "close" : "menu";
    if (returnFocus) toggle.focus();
    links.inert = compact.matches && !open;
    scheduleNavUpdate();
  };
  const updateNav = () => {
    animationFrame = null;
    // Read before changing classes/styles; scrolling rarely changes these sizes.
    const offerTop = offer.getBoundingClientRect().top;
    const navHeight = nav.offsetHeight;
    const linksHeight = links.offsetHeight;
    nav.classList.toggle("is-sticky", offerTop <= navHeight);
    if (navHeight !== previousNavHeight) {
      document.body.style.setProperty("--nav-height", `${navHeight}px`);
      previousNavHeight = navHeight;
    }
    if (linksHeight !== previousLinksHeight) {
      nav.style.setProperty("--menu-links-height", `${linksHeight}px`);
      previousLinksHeight = linksHeight;
    }
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
    if (event.relatedTarget && !nav.contains(event.relatedTarget)) {
      setMenuOpen(false);
    }
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
  new ResizeObserver(scheduleNavUpdate).observe(links);
  links.inert = compact.matches;
  updateNav();
  window.addEventListener("scroll", scheduleNavUpdate, { passive: true });
  window.addEventListener("resize", scheduleNavUpdate, { passive: true });
};
