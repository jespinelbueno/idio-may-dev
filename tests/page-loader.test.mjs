import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const bootstrap = read("scripts/page-loader-bootstrap.js");
const sequence = read("scripts/features/shared/loader-sequence.js")
  .replace("export const initLoaderSequence", "const initLoaderSequence");
const feature = read("scripts/features/shared/page-loader.js")
  .replace(/^import .*;\n/, "")
  .replace("export const initPageLoader", "const initPageLoader");
const deferred = () => {
  let resolve;
  let reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
};
const flush = async () => { for (let index = 0; index < 20; index++) await Promise.resolve(); };
const classList = () => {
  const values = new Set();
  return { add: (...names) => names.forEach(value => values.add(value)),
    remove: (...names) => names.forEach(value => values.delete(value)), contains: value => values.has(value) };
};

const fixture = ({ loaded = false, images = [], fonts = Promise.resolve(), markup = true, initialize = true, optIn } = {}) => {
  let now = 0;
  let nextTimer = 0;
  const listeners = new Map();
  const timers = new Map();
  const frames = [];
  const content = [{ inert: false }, { inert: true }];
  const element = () => ({ classList: classList(), dataset: {}, style: { setProperty() {} },
    getBoundingClientRect: () => ({ height: 80 }), offsetWidth: 100 });
  const loader = element();
  const word = element();
  const logo = element();
  logo.hidden = true;
  const elements = new Map([
    [".loader", loader], [".loader--page", loader], ["[data-loader-word]", word],
    ["[data-loader-logo]", logo], [".loader__phrase", element()],
    [".loader__fixed", element()], [".loader__words", element()],
  ]);
  const document = {
    documentElement: { classList: classList() }, body: { classList: classList() },
    readyState: loaded ? "complete" : "interactive", fonts: { ready: fonts }, images,
    querySelector: selector => markup ? elements.get(selector) ?? null : null,
    querySelectorAll: () => content,
  };
  const window = {
    idioPrivacy: { allowsIntro: () => optIn },
    innerWidth: 1200, innerHeight: 800,
    setTimeout: (callback, delay) => { timers.set(++nextTimer, { callback, due: now + delay }); return nextTimer; },
    clearTimeout: id => timers.delete(id),
    requestAnimationFrame: callback => frames.push(callback),
    cancelAnimationFrame() {},
    addEventListener: (type, callback, options) => {
      if (!listeners.has(type)) listeners.set(type, []);
      listeners.get(type).push({ callback, once: options?.once });
    },
    removeEventListener: (type, callback) => {
      listeners.set(type, (listeners.get(type) ?? []).filter(listener => listener.callback !== callback));
    },
    dispatchEvent: event => {
      const active = listeners.get(event.type) ?? [];
      listeners.set(event.type, active.filter(listener => !listener.once));
      active.forEach(({ callback }) => callback(event));
    },
  };
  const context = vm.createContext({ window, document, CustomEvent: class { constructor(type) { this.type = type; } } });
  vm.runInContext(bootstrap, context);
  vm.runInContext(sequence, context);
  vm.runInContext(feature, context);
  if (initialize) vm.runInContext("initPageLoader();", context);
  return {
    window, document, content, frames, timers, word, logo, loader,
    pending: () => document.documentElement.classList.contains("is-page-loading"),
    initialize: () => vm.runInContext("initPageLoader();", context),
    load: () => window.dispatchEvent({ type: "load" }),
    frame: () => frames.splice(0).forEach(callback => callback()),
    advanceTo(target) {
      while (timers.size) {
        const [id, timer] = [...timers].sort((a, b) => a[1].due - b[1].due || a[0] - b[0])[0];
        if (timer.due > target) break;
        now = timer.due;
        timers.delete(id);
        timer.callback();
      }
      now = target;
    },
  };
};

test("the loader waits for resources, fonts, visible image decoding, and two rendering frames", async () => {
  const fonts = deferred();
  const decoding = deferred();
  let decodes = 0;
  const f = fixture({ fonts: fonts.promise, images: [{
    getBoundingClientRect: () => ({ top: 0, left: 0, bottom: 400, right: 600, width: 600, height: 400 }),
    decode: () => { decodes++; return decoding.promise; },
  }] });
  assert.equal(f.pending(), true);
  assert.equal(f.document.body.classList.contains("is-loading"), true);
  assert.deepEqual(f.content.map(element => element.inert), [true, true]);
  await flush();
  assert.equal(decodes, 0);
  f.load();
  await flush();
  assert.equal(decodes, 0, "fonts must settle before measuring image bounds");
  fonts.resolve();
  await flush();
  assert.equal(decodes, 1);
  assert.equal(f.frames.length, 0);
  decoding.resolve();
  await flush();
  f.frame();
  await flush();
  f.advanceTo(1720);
  await flush();
  assert.equal(f.pending(), true);
  f.frame();
  await flush();
  assert.equal(f.pending(), false);
  assert.equal(f.document.body.classList.contains("is-loading"), false);
  assert.deepEqual(f.content.map(element => element.inert), [false, true]);
  assert.equal(f.timers.size, 0);
});

test("every secondary page plays the full short intro regardless of the privacy preference", async () => {
  for (const optIn of [undefined, false, true]) {
    const f = fixture({ loaded: true, optIn });
    await flush();
    f.frame();
    f.frame();
    await flush();
    assert.equal(f.word.textContent, "yours");
    assert.equal(f.loader.classList.contains("loader--yours"), true);
    f.advanceTo(769);
    assert.equal(f.logo.hidden, true);
    f.advanceTo(770);
    assert.equal(f.logo.hidden, false);
    assert.equal(f.loader.classList.contains("loader--idio"), true);
    f.advanceTo(1719);
    await flush();
    assert.equal(f.pending(), true, "cached pages must preserve the complete final hold");
    f.advanceTo(1720);
    await flush();
    assert.equal(f.pending(), false);
    assert.equal(f.timers.size, 0);
  }
});

test("finishing the short intro does not reveal a page whose resources are still loading", async () => {
  const f = fixture();
  f.advanceTo(3000);
  await flush();
  assert.equal(f.logo.hidden, false);
  assert.equal(f.pending(), true);
  f.load();
  await flush();
  f.frame();
  f.frame();
  await flush();
  assert.equal(f.pending(), false);
});

test("failed visible images release the loader and offscreen images never gate decoding", async () => {
  let offscreenDecodes = 0;
  const f = fixture({ loaded: true, images: [
    { getBoundingClientRect: () => ({ top: 20, bottom: 80, left: 0, right: 100, width: 100, height: 60 }),
      decode: () => Promise.reject(new Error("broken image")) },
    { getBoundingClientRect: () => ({ top: 1600, bottom: 2000, left: 0, right: 100, width: 100, height: 400 }),
      decode: () => { offscreenDecodes++; return new Promise(() => {}); } },
  ] });
  await flush();
  f.frame();
  f.frame();
  f.advanceTo(1720);
  await flush();
  assert.equal(f.pending(), false);
  assert.equal(offscreenDecodes, 0);
});

test("a stalled resource or failed page module cannot trap the visitor", () => {
  for (const initialize of [false, true]) {
    const f = fixture({ initialize });
    f.advanceTo(12000);
    assert.equal(f.pending(), false);
    assert.equal(f.document.body.classList.contains("is-loading"), false);
    assert.deepEqual(f.content.map(element => element.inert), [false, true]);
    f.initialize();
    assert.equal(f.document.body.classList.contains("is-loading"), false, "late modules must not lock a revealed page");
  }
});

test("restoring a loading page from browser history reveals it immediately", () => {
  const f = fixture();
  f.window.dispatchEvent({ type: "pageshow", persisted: false });
  assert.equal(f.pending(), true);
  f.window.dispatchEvent({ type: "pageshow", persisted: true });
  assert.equal(f.pending(), false);
  assert.equal(f.timers.size, 0);
  assert.deepEqual(f.content.map(element => element.inert), [false, true]);
});

test("the initializer self-guards when loader markup is absent", () => {
  const f = fixture({ markup: false });
  assert.equal(f.document.body.classList.contains("is-loading"), false);
  assert.deepEqual(f.content.map(element => element.inert), [false, true]);
});

test("all secondary pages wire the shared loader with a non-JavaScript fallback", () => {
  const pages = { services: "services", about: "about", events: "events", contact: "contact-page",
    privacy: "privacy", "coming-soon": "coming-soon", "404": "not-found" };
  for (const [page, style] of Object.entries(pages)) {
    const html = read(`${page}.html`);
    const prefix = page === "404" ? "/" : "";
    assert.ok(html.includes(`<script src="${prefix}scripts/page-loader-bootstrap.js"></script>`), page);
    assert.ok(html.indexOf("page-loader-bootstrap.js") < html.indexOf('rel="stylesheet"'), page);
    assert.match(html, /class="loader loader--page"/);
    assert.match(html, /data-loader-word>yours<\/span>/);
    assert.match(html, /data-loader-logo hidden/);
    assert.doesNotMatch(html.match(/<body[^>]*>/)[0], /is-loading/);
    assert.match(read(`styles/${style}.css`), /components\/loader\.css/);
    const script = read(`scripts/${page === "404" ? "not-found" : page}.js`);
    assert.match(script, /features\/shared\/page-loader\.js/);
    assert.ok(script.indexOf("initPageLoader();") < script.indexOf("initPrivacyPreferences();"), page);
  }
  assert.match(read("styles/components/loader.css"), /\.loader--page\s*\{\s*display: none;/);
  assert.doesNotMatch(read("index.html"), /page-loader-bootstrap|loader--page/);
});
