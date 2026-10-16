import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const members = ["anna", "jaden", "raquel", "naomi", "gretel"];

test("both team carousels ship all five portraits in order, with Anna ready first", () => {
  const home = read("index.html").split('class="team-stage"')[1].split('class="values-section"')[0];
  const about = read("about.html").split('class="about-team is-card-stack"')[1];
  assert.deepEqual([...home.matchAll(/<article class="team__member team__member--([a-z]+)"/g)].map((match) => match[1]), members);
  assert.deepEqual([...about.matchAll(/data-about-card="([a-z]+)"/g)].map((match) => match[1]), members);
  const cards = [...about.matchAll(/<figure[^>]*data-about-card="([a-z]+)"[^>]*>(.*?)<\/figure>/g)];
  cards.forEach(([markup, member, content], index) => {
    assert.ok(content.includes(`src="assets/media/team/about/${member}.webp"`));
    assert.ok(markup.includes(`aria-hidden="${index !== 0}"`));
    assert.match(content, /width="2560" height="1707"/);
    assert.match(content, /srcset="[^"]+800w/);
    assert.doesNotMatch(content, /sizes="100vw"/);
  });
  assert.match(cards[0][0], /loading="eager"/);
  assert.match(home, /alt="Anna"[^>]+loading="eager"/);
  assert.match(about, /data-about-member="anna" aria-pressed="true"/);
  assert.equal([...about.matchAll(/aria-pressed="true"/g)].length, 1);
  assert.match(about, /<h3>anna moore<\/h3>/);
  assert.match(about, /data-about-previous disabled/);
  assert.match(about, /data-about-next/);
});

test("portrait preparation waits until the section approaches, then fetches and decodes every image once", async () => {
  let callback;
  let observed;
  let disconnected = false;
  let options;
  const images = Array.from({ length: 10 }, (_, index) => ({
    loading: "lazy", decoded: false,
    decode() {
      assert.equal(this.loading, "eager");
      this.decoded = true;
      return index === 0 ? Promise.reject(new Error("Image unavailable")) : Promise.resolve();
    },
  }));
  const container = { querySelectorAll: () => images };
  class Observer {
    constructor(handler, settings) { callback = handler; options = settings; }
    observe(element) { observed = element; }
    disconnect() { disconnected = true; }
  }
  const context = vm.createContext({ window: { IntersectionObserver: Observer }, IntersectionObserver: Observer });
  vm.runInContext(read("scripts/features/shared/team-portraits.js").replace("export const initTeamPortraits =", "globalThis.initTeamPortraits ="), context);
  context.initTeamPortraits(container);
  assert.equal(observed, container);
  assert.equal(options.rootMargin, "1200px 0px");
  callback([{ isIntersecting: false }]);
  assert.ok(images.every((image) => image.loading === "lazy" && !image.decoded));
  callback([{ isIntersecting: true }]);
  assert.equal(disconnected, true);
  assert.ok(images.every((image) => image.loading === "eager" && image.decoded));
  await Promise.resolve(); // A failed portrait must not create an unhandled rejection.
});

test("the homepage starts at Anna and resets a restored carousel without breaking its arrows", () => {
  const controls = () => ({ disabled: false, addEventListener(type, callback) { this[type] = callback; } });
  const previous = controls();
  const next = controls();
  const cards = [0, 1].map((offsetLeft) => ({ offsetLeft: offsetLeft * 320, addEventListener() {} }));
  const grid = { querySelectorAll: () => cards };
  const carousel = {
    scrollLeft: 640, scrollWidth: 1600, clientWidth: 300,
    querySelector: () => grid, addEventListener() {},
    scrollTo({ left }) { this.scrollLeft = left; },
    scrollBy({ left }) { this.scrollLeft += left; },
  };
  const handlers = {};
  const elements = { "[data-team-carousel]": carousel, "[data-team-carousel-previous]": previous, "[data-team-carousel-next]": next };
  const context = vm.createContext({
    initTeamPortraits() {},
    document: { querySelector: (selector) => elements[selector] },
    window: { matchMedia: () => ({ matches: false }), addEventListener: (type, callback) => { handlers[type] = callback; } },
  });
  vm.runInContext(read("scripts/features/home/team-carousel.js").replace(/^import .*;\n/m, "").replace("export const initTeamCarousel =", "globalThis.initTeamCarousel ="), context);
  context.initTeamCarousel();
  assert.equal(carousel.scrollLeft, 0);
  assert.equal(previous.disabled, true);
  next.click();
  assert.equal(carousel.scrollLeft, 320);
  previous.click();
  assert.equal(carousel.scrollLeft, 0);
  carousel.scrollLeft = 960;
  handlers.pageshow();
  assert.equal(carousel.scrollLeft, 0);
});
