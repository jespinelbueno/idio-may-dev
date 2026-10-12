import { getAboutThreadProgress, smoothAboutThreadProgress } from "./about-thread-progress.js";

const SVG_NAMESPACE = "http://www.w3.org/2000/svg";

// Centerline guides uncover the original textured artwork, like the arrow masks.
const threads = [
  {
    selector: ".about-story__thread",
    strokeWidth: 44,
    guide: "M700 4 C800 4 960 6 1030 7 C1125 5 1237 84 1237 155 C1238 179 1233 218 1218 236 C1160 281 1128 289 1050 311 L972 331 L160 390 C123 400 90 443 75 475 C63 491 75 516 98 524 C145 545 245 556 296 530 C310 519 310 496 286 500 C266 495 247 520 233 548 C210 620 226 699 211 739 C190 807 147 845 40 895 L3 905",
  },
  {
    selector: ".about-next__thread",
    finishViewport: 0.8,
    // A close trace keeps the loop's crossing from exposing its tail prematurely.
    strokeWidth: 20,
    guide: "M4 0 L7 20 L39 79 L102 164 L195 261 L287 339 L385 408 L531 496 L643 550 L746 589 L906 633 L1079 667 L1194 673 L1325 668 L1433 639 L1511 597 L1553 558 L1570 535 L1573 508 L1570 495 L1547 464 L1513 443 L1494 443 L1468 450 L1412 492 L1350 570 L1316 618 L1263 709 L1248 742",
  },
];

const createNode = (tag, attributes) => {
  const element = document.createElementNS(SVG_NAMESPACE, tag);
  Object.entries(attributes).forEach(([name, value]) => element.setAttribute(name, value));
  return element;
};

export const initAboutThreadDraw = () => {
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
    const viewportHeight = window.innerHeight;
    const progressByThread = getAboutThreadProgress(activeThreads.map(({ svg, finishViewport }) => {
      const { top, bottom } = svg.getBoundingClientRect();
      return { top, bottom, finishViewport };
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
    if (frame === null) frame = window.requestAnimationFrame(update);
  };

  // Install in drawing order even when the SVG assets load at different speeds.
  const loadThreads = async () => {
    for (const [index, { image, guide, strokeWidth, finishViewport = 0.45 }] of images.entries()) {
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
        activeThreads.push({ svg, artwork, stroke, maskId, finishViewport });
        displayedProgress = null;
        new ResizeObserver(scheduleUpdate).observe(svg);
        scheduleUpdate();
      } catch {
        // Preserve the static image when fetching or parsing is unavailable.
      }
    }
  };
  loadThreads();

  window.addEventListener("scroll", scheduleUpdate, { passive: true });
  window.addEventListener("resize", scheduleUpdate, { passive: true });
  reducedMotion.addEventListener("change", scheduleUpdate);
};
