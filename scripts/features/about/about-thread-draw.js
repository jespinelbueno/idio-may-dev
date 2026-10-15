import { getAboutThreadProgress, smoothAboutThreadProgress } from "./about-thread-progress.js";
import { getAboutThreadTransform } from "./about-thread-geometry.js";

const SVG_NAMESPACE = "http://www.w3.org/2000/svg";

// Centerline guides uncover the original textured artwork, like the arrow masks.
const threads = [
  {
    selector: ".about-story__thread",
    startSelector: ".about-chapter--start .about-chapter__dot",
    endSelector: ".about-chapter--journey .about-chapter__dot",
    guideStart: { x: 700, y: 5 },
    guideEnd: { x: 4, y: 901 },
    startViewport: 0.8,
    finishViewport: 0.65,
    strokeWidth: 28,
    guide: "M700 5 C850 8 1080 10 1190 72 C1260 115 1268 150 1268 217 C1266 240 1230 287 1200 326 C1140 364 1110 377 1020 408 C880 448 700 474 600 485 C470 505 365 523 276 534 C242 544 220 564 211 583 C191 615 196 628 197 655 C204 678 289 706 335 679 C350 666 333 653 314 646 C297 640 274 647 260 649 C243 653 233 674 221 694 C182 764 162 851 92 883 C65 897 36 902 4 901",
  },
  {
    selector: ".about-next__thread",
    startSelector: ".about-chapter--journey .about-chapter__dot",
    endSelector: ".about-chapter--next .about-chapter__dot",
    guideStart: { x: 5, y: 4 },
    guideEnd: { x: 1054, y: 563 },
    // Hold at the yellow marker while its chapter moves through reading view.
    startViewport: 0.25,
    finishViewport: 0.65,
    strokeWidth: 24,
    guide: "M5 4 L14 25 L30 60 L60 107 L90 149 L130 183 L170 217 L220 249 L280 271 L340 292 L400 303 L480 315 L580 326 L680 333 L800 339 L920 341 L1000 337 L1080 324 L1140 303 L1180 286 L1205 271 L1210 262 L1195 258 L1175 260 L1155 272 L1140 288 L1120 312 L1100 346 L1080 398 L1063 464 L1055 516 L1053 549 L1054 563",
  },
];

const createNode = (tag, attributes) => {
  const element = document.createElementNS(SVG_NAMESPACE, tag);
  Object.entries(attributes).forEach(([name, value]) => element.setAttribute(name, value));
  return element;
};

export const initAboutThreadDraw = () => {
  const mobile = window.matchMedia("(max-width: 760px), (max-width: 1024px) and (max-height: 500px) and (pointer: coarse)");
  if (mobile.matches) {
    mobile.addEventListener("change", () => initAboutThreadDraw(), { once: true });
    return;
  }
  const images = threads.map((thread) => ({ ...thread, image: document.querySelector(thread.selector) }))
    .filter(({ image }) => image);
  if (!images.length) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const activeThreads = [];
  let frame = null;
  let displayedProgress = null;
  let previousTimestamp = null;

  const update = (timestamp) => {
    frame = null;
    if (mobile.matches) { previousTimestamp = null; return; }
    const viewportHeight = window.innerHeight;
    const progressByThread = getAboutThreadProgress(activeThreads.map(({ startMarker, endMarker, startViewport, finishViewport }) => {
      const start = startMarker.getBoundingClientRect();
      const end = endMarker.getBoundingClientRect();
      return { top: start.top + start.height / 2, bottom: end.top + end.height / 2, startViewport, finishViewport };
    }), viewportHeight);
    // Ease one shared pen, rather than easing the two masks independently.
    const target = progressByThread.reduce((total, progress) => total + progress, 0);
    const elapsed = previousTimestamp === null ? 1000 / 60 : Math.min(64, timestamp - previousTimestamp);
    displayedProgress = reducedMotion.matches ? activeThreads.length
      : smoothAboutThreadProgress(displayedProgress, target, elapsed);
    activeThreads.forEach(({ artwork, stroke, maskId }, index) => {
      const progress = Math.max(0, Math.min(1, displayedProgress - index));
      stroke.style.strokeDashoffset = String(1 - progress);
      artwork.style.opacity = progress > 0 ? "1" : "0";
      artwork.setAttribute("mask", progress === 1 ? "none" : `url(#${maskId})`);
    });
    if (!reducedMotion.matches && displayedProgress !== target) {
      previousTimestamp = timestamp;
      frame = window.requestAnimationFrame(update);
    } else {
      previousTimestamp = null;
    }
  };

  const scheduleUpdate = () => {
    if (mobile.matches) return;
    if (frame === null) frame = window.requestAnimationFrame(update);
  };

  const layoutThreads = () => {
    if (mobile.matches) return;
    const layoutWidth = document.querySelector(".about-shell").clientWidth;
    activeThreads.forEach(({ svg, startMarker, endMarker, guideStart, guideEnd, width, index }) => {
      const parent = svg.offsetParent || svg.parentElement;
      const origin = parent.getBoundingClientRect();
      const center = (marker) => {
        const bounds = marker.getBoundingClientRect();
        return { x: bounds.left + bounds.width / 2 - origin.left, y: bounds.top + bounds.height / 2 - origin.top };
      };
      const start = center(startMarker);
      const chapter = startMarker.parentElement.getBoundingClientRect();
      const markerSize = startMarker.getBoundingClientRect().width;
      // In the wireframe the second stroke resumes below the yellow chapter's
      // copy. Keep that reading gap while its scroll timing holds at the circle.
      if (index === 1) {
        start.x += markerSize * 0.6;
        start.y = chapter.bottom - origin.top + markerSize * 0.75;
      }
      const matrix = getAboutThreadTransform(start, center(endMarker), guideStart, guideEnd, width, layoutWidth);
      svg.style.transform = `matrix(${matrix.join(",")})`;
    });
    scheduleUpdate();
  };
  const layoutObserver = new ResizeObserver(layoutThreads);
  document.querySelectorAll(".about-story__layout, .about-next__layout").forEach((element) => layoutObserver.observe(element));

  // Install in drawing order even when the SVG assets load at different speeds.
  const loadThreads = async () => {
    for (const [index, thread] of images.entries()) {
      const { image, guide, strokeWidth, startSelector, endSelector, guideStart, guideEnd, startViewport, finishViewport } = thread;
      const startMarker = document.querySelector(startSelector);
      const endMarker = document.querySelector(endSelector);
      if (!startMarker || !endMarker) continue;
      try {
        const response = await fetch(image.getAttribute("src"));
        if (!response.ok) continue;
        const original = new DOMParser().parseFromString(await response.text(), "image/svg+xml").documentElement;
        if (original.localName !== "svg") continue;
        const svg = document.importNode(original, true);
        const [x, y, width, height] = svg.getAttribute("viewBox").split(/\s+/).map(Number);
        const maskId = `about-thread-draw-${index}`;
        const artwork = createNode("g", { class: "about-thread-draw__artwork", mask: `url(#${maskId})` });
        while (svg.firstChild) artwork.appendChild(svg.firstChild);
        const stroke = createNode("path", {
          d: guide, fill: "none", stroke: "white", "stroke-width": strokeWidth,
          "stroke-linecap": "round", "stroke-linejoin": "round", pathLength: 1,
          class: "about-thread-draw__stroke",
        });
        const mask = createNode("mask", { id: maskId, maskUnits: "userSpaceOnUse", x, y, width, height });
        mask.appendChild(stroke);
        const defs = createNode("defs", {});
        defs.appendChild(mask);
        svg.append(defs, artwork);
        svg.setAttribute("class", `${image.className} about-thread-draw`);
        svg.setAttribute("aria-hidden", "true");
        svg.setAttribute("focusable", "false");
        // The root asset has an inline display declaration, so initialize before insertion.
        artwork.style.opacity = "0";
        image.replaceWith(svg);
        activeThreads.push({ svg, artwork, stroke, maskId, startMarker, endMarker, guideStart, guideEnd, startViewport, finishViewport, width, index });
        displayedProgress = null;
        layoutThreads();
      } catch {
        // Chapter markers remain readable if the decorative artwork is unavailable.
      }
    }
  };
  loadThreads();

  window.addEventListener("scroll", scheduleUpdate, { passive: true });
  window.addEventListener("resize", layoutThreads, { passive: true });
  document.fonts.ready.then(layoutThreads);
  window.addEventListener("load", layoutThreads, { once: true });
  reducedMotion.addEventListener("change", scheduleUpdate);
};
