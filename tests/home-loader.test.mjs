import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const sequence = readFileSync(new URL("../scripts/features/shared/loader-sequence.js", import.meta.url), "utf8")
  .replace("export const initLoaderSequence", "const initLoaderSequence");
const source = sequence + "\n" + readFileSync(new URL("../scripts/features/home/home-loader.js", import.meta.url), "utf8")
  .replace(/^import .*;\n/, "")
  .replace("export const initHomeLoader", "const initHomeLoader");

const createLoader = ({ optIn, loaded = true, missingMarkup = false } = {}) => {
  let now = 0;
  let nextTimer = 0;
  const timers = new Map();
  const listeners = new Map();
  const screens = [];
  const classList = (...initial) => {
    const values = new Set(initial);
    return {
      add: (...names) => names.forEach(name => values.add(name)),
      remove: (...names) => names.forEach(name => values.delete(name)),
      contains: name => values.has(name),
    };
  };
  const element = () => ({ classList: classList(), dataset: {}, style: { setProperty() {} },
    getBoundingClientRect: () => ({ height: 80 }), offsetWidth: 100 });
  const loader = element();
  const word = element();
  let text = "interesting";
  Object.defineProperty(word, "textContent", {
    get: () => text,
    set: value => { text = value; screens.push({ value, time: now }); },
  });
  const logo = element();
  let hidden = true;
  Object.defineProperty(logo, "hidden", {
    get: () => hidden,
    set: value => { hidden = value; if (!value) screens.push({ value: "idio", time: now }); },
  });
  const body = { classList: classList("is-loading") };
  const elements = new Map([
    [".loader", missingMarkup ? null : loader], ["[data-loader-word]", missingMarkup ? null : word],
    ["[data-loader-logo]", logo], [".loader__phrase", element()],
    [".loader__fixed", element()], [".loader__words", element()],
  ]);
  const window = {
    idioPrivacy: optIn === undefined ? undefined : { allowsIntro: () => optIn },
    addEventListener: (type, callback) => listeners.set(type, callback),
    setTimeout: (callback, delay) => { timers.set(++nextTimer, { callback, due: now + delay }); return nextTimer; },
    requestAnimationFrame: () => 1,
    cancelAnimationFrame() {},
  };
  vm.runInNewContext(`${source}\ninitHomeLoader();`, {
    window,
    document: { readyState: loaded ? "complete" : "loading", body, querySelector: selector => elements.get(selector) ?? null },
  });
  return {
    screens, loader, logo, word,
    isReady: () => body.classList.contains("is-ready"),
    load: () => listeners.get("load")?.(),
    pendingTimers: () => timers.size,
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

test("without opt-in the loader plays all eight words and the final Idio lockup", () => {
  const loader = createLoader();
  loader.advanceTo(6270);
  assert.deepEqual(loader.screens.map(screen => screen.value), [
    "interesting", "creative", "original", "striking", "distinct", "unique", "novel", "yours", "idio",
  ]);
  assert.equal(loader.isReady(), true);
  assert.equal(loader.pendingTimers(), 0);
});

test("affirmative opt-in plays only yours and Idio, with the normal colors and final hold", () => {
  const loader = createLoader({ optIn: true });
  assert.deepEqual(loader.screens, [{ value: "yours", time: 0 }]);
  assert.equal(loader.loader.classList.contains("loader--yours"), true);
  loader.advanceTo(769);
  assert.equal(loader.logo.hidden, true);
  loader.advanceTo(770);
  assert.equal(loader.logo.hidden, false);
  assert.equal(loader.loader.classList.contains("loader--idio"), true);
  assert.deepEqual(loader.screens, [{ value: "yours", time: 0 }, { value: "idio", time: 770 }]);
  loader.advanceTo(1719);
  assert.equal(loader.isReady(), false, "final lockup must remain for its full 950 ms");
  loader.advanceTo(1720);
  assert.equal(loader.isReady(), true);
});

test("rejection and non-boolean permission values keep the full intro", () => {
  for (const optIn of [false, null, 1, "true"]) {
    const loader = createLoader({ optIn });
    assert.equal(loader.screens[0].value, "interesting");
    loader.advanceTo(6270);
    assert.equal(loader.screens.length, 9);
  }
});

test("both full and short sequences wait for the browser load event", () => {
  for (const optIn of [false, true]) {
    const loader = createLoader({ optIn, loaded: false });
    loader.advanceTo(10000);
    assert.equal(loader.isReady(), false);
    assert.equal(loader.logo.hidden, false);
    loader.load();
    assert.equal(loader.isReady(), true);
  }
});

test("an early browser load does not cut either animation short", () => {
  for (const [optIn, finish] of [[false, 6270], [true, 1720]]) {
    const loader = createLoader({ optIn, loaded: false });
    loader.advanceTo(300);
    loader.load();
    loader.advanceTo(finish - 1);
    assert.equal(loader.isReady(), false);
    loader.advanceTo(finish);
    assert.equal(loader.isReady(), true);
  }
});

test("absent loader markup does not schedule an animation", () => {
  const loader = createLoader({ missingMarkup: true });
  assert.equal(loader.pendingTimers(), 0);
  assert.deepEqual(loader.screens, []);
});
