import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const source = readFileSync(new URL("../scripts/features/services/services-hero-reveal.js", import.meta.url), "utf8")
  .replace("export function", "function");

function createHero({ reduced = false, width = 390 } = {}) {
  const listeners = new Map();
  const frames = new Map();
  let frameId = 0;
  let reads = 0;
  let writes = 0;
  const motion = { matches: reduced, addEventListener: (event, callback) => listeners.set(`motion:${event}`, callback) };
  const window = {
    scrollY: 0, innerWidth: width, innerHeight: 800,
    matchMedia: () => motion,
    addEventListener: (event, callback) => listeners.set(event, callback),
    requestAnimationFrame: (callback) => { frames.set(++frameId, callback); return frameId; },
  };
  const element = (height, bounds = {}) => ({
    values: new Map(),
    get offsetHeight() { reads++; return height; },
    getBoundingClientRect() {
      reads++;
      const rect = { top: 0, left: 0, width: 390, height, ...bounds };
      return { ...rect, right: rect.left + rect.width, bottom: rect.top + rect.height };
    },
    querySelector(selector) { return elements.get(selector); },
    get style() {
      return {
        setProperty: (name, value) => { writes++; this.values.set(name, value); },
        removeProperty: (name) => { writes++; this.values.delete(name); },
      };
    },
  });
  const elements = new Map([
    [".services-hero-offer-transition", element(2800)],
    [".services-hero", element(800)],
    [".services-hero-scroll-space", element(976)],
    [".services-offer", element(1000)],
    [".services-hero__dot", element(48, { top: 512, left: 171, width: 48 })],
    [".services-hero__title", element(80, { top: 352, left: 35, width: 320 })],
    [".services-hero__reveal-copy", element(350)],
    [".services-hero__reveal", element(800)],
    [".services-nav", element(68)],
  ]);
  vm.runInNewContext(`${source}\ninitServicesHeroReveal();`, {
    window, document: { querySelector: (selector) => elements.get(selector) },
  });
  const flush = () => {
    const pending = [...frames.values()];
    frames.clear();
    pending.forEach(callback => callback());
  };
  return {
    window, elements, motion, flush,
    emit: (event) => listeners.get(event)?.(),
    scroll(y) { window.scrollY = y; listeners.get("scroll")(); flush(); },
    get reads() { return reads; }, get writes() { return writes; },
    get pendingFrames() { return frames.size; },
  };
}

test("scrolling animates from cached geometry without layout reads", () => {
  const hero = createHero();
  const initialReads = hero.reads;
  hero.scroll(400);
  const scale = Number.parseFloat(hero.elements.get(".services-hero__reveal").values.get("--services-reveal-scale"));
  assert.ok(scale > 0 && scale < 1);
  hero.scroll(800);
  assert.equal(hero.reads, initialReads);
  assert.equal(hero.elements.get(".services-hero__reveal-copy").values.get("--services-copy-opacity"), "1.000");
});

test("completed transitions stop scheduling frames and resume when scrolling back", () => {
  const hero = createHero();
  const initialScale = hero.elements.get(".services-hero__reveal").values.get("--services-reveal-scale");
  hero.scroll(2000);
  const writes = hero.writes;
  hero.window.scrollY = 2500;
  hero.emit("scroll");
  assert.equal(hero.pendingFrames, 0);
  assert.equal(hero.writes, writes);
  hero.scroll(0);
  assert.equal(hero.elements.get(".services-hero__reveal").values.get("--services-reveal-scale"), initialScale);
  assert.equal(hero.elements.get(".services-offer").values.get("--services-hero-offer-lag"), "0.00px");
});

test("resizing refreshes geometry and restores mobile alignment after desktop", () => {
  const hero = createHero();
  const title = hero.elements.get(".services-hero");
  const alignment = title.values.get("--services-title-y");
  const reads = hero.reads;
  hero.window.innerWidth = 1400;
  hero.emit("resize"); hero.flush();
  assert.ok(hero.reads > reads);
  assert.equal(title.values.has("--services-title-y"), false);
  hero.window.innerWidth = 390;
  hero.emit("resize"); hero.flush();
  assert.equal(title.values.get("--services-title-y"), alignment);
});

test("reduced motion removes takeover lag and keeps the discrete reveal", () => {
  const hero = createHero({ reduced: true });
  const initialScale = hero.elements.get(".services-hero__reveal").values.get("--services-reveal-scale");
  hero.scroll(100);
  assert.equal(hero.elements.get(".services-hero__reveal").values.get("--services-reveal-scale"), initialScale);
  hero.scroll(800);
  assert.equal(hero.elements.get(".services-hero__reveal-copy").values.get("--services-copy-opacity"), "1.000");
  assert.equal(hero.elements.get(".services-offer").values.get("--services-hero-offer-lag"), "0.00px");
});


test("mobile takeover keeps sections stationary and toolbar resize cannot move the reveal", () => {
  const hero = createHero();
  hero.scroll(1200);
  const stage = hero.elements.get(".services-hero-offer-transition");
  const reveal = hero.elements.get(".services-hero__reveal");
  assert.equal(stage.values.get("--services-hero-offer-lag-space"), "0.00px");
  assert.equal(hero.elements.get(".services-offer").values.get("--services-hero-offer-lag"), "0.00px");
  assert.equal(reveal.values.get("--services-reveal-scale"), "1.000000");
  assert.equal(reveal.values.has("--services-reveal-radius"), false);
  const writes = hero.writes;
  hero.window.innerHeight = 890;
  hero.emit("resize");
  assert.equal(hero.pendingFrames, 0);
  assert.equal(hero.writes, writes);
  hero.scroll(1500);
  assert.equal(hero.writes, writes);
});

test("desktop retains its circle clipping and delayed takeover", () => {
  const hero = createHero({ width: 1440 });
  const reveal = hero.elements.get(".services-hero__reveal");
  assert.equal(reveal.values.get("--services-reveal-radius"), "24.00px");
  assert.equal(reveal.values.has("--services-reveal-scale"), false);
  hero.scroll(1200);
  assert.ok(Number.parseFloat(hero.elements.get(".services-offer").values.get("--services-hero-offer-lag")) > 0);
});
