import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import { publicPages } from "../tools/prepare-pages.mjs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const DAY = 24 * 60 * 60 * 1000;
const NOW = Date.UTC(2026, 9, 15);
const PREF = "idio-privacy-v1";
const INTRO = "idio-home-loader-v1";
const saved = (intro, time = NOW) => JSON.stringify({ version: 1, intro, savedAt: time, expiresAt: time + 180 * DAY });

const fixture = (entries = {}, { blocked = false, writeBlocked = false, unsupportedDialog = false } = {}) => {
  const data = new Map(Object.entries(entries));
  const reads = [];
  const writes = [];
  const handlers = {};
  const documentHandlers = {};
  let now = NOW;
  const context = {
    HTMLDialogElement: unsupportedDialog ? undefined : class { showModal() {} },
    Date: { now: () => now },
    CustomEvent: class { constructor(type) { this.type = type; } },
    localStorage: {
      getItem(key) { reads.push(key); if (blocked) throw new Error("blocked"); return data.get(key) ?? null; },
      setItem(key, value) { if (blocked || writeBlocked) throw new Error("quota"); data.set(key, value); writes.push(key); },
      removeItem(key) { if (blocked) throw new Error("blocked"); data.delete(key); },
    },
    document: {
      visibilityState: "visible",
      addEventListener: (type, fn) => documentHandlers[type] = fn,
    },
    window: {
      addEventListener: (type, fn) => handlers[type] = fn,
      dispatchEvent: () => {},
    },
  };
  vm.runInNewContext(read("scripts/privacy-bootstrap.js"), context);
  return { api: context.window.idioPrivacy, data, reads, writes,
    storage: key => handlers.storage({ key }), resume: () => documentHandlers.visibilitychange(),
    advance: days => { now += days * DAY; } };
};

test("first visit never reads or writes optional memory and removes legacy intro data", () => {
  const f = fixture({ [INTRO]: String(NOW - DAY) });
  assert.equal(f.api.allowsIntro(), false);
  assert.equal(f.api.getPreference(), null);
  assert.equal(f.data.has(INTRO), false);
  assert.equal(f.reads.includes(INTRO), false);
  assert.equal(f.writes.length, 0);
});

test("both rejection and acceptance persist without writing visit timestamps", () => {
  const f = fixture();
  assert.equal(f.api.save(false), true);
  assert.equal(f.data.has(INTRO), false);
  assert.equal(f.api.getPreference().intro, false);
  assert.equal(f.api.save(true), true);
  assert.equal(f.api.allowsIntro(), true);
  assert.equal(f.data.has(INTRO), false);
  assert.deepEqual(f.writes, [PREF, PREF]);
  assert.equal(f.api.getPreference().expiresAt, NOW + 180 * DAY);
  assert.equal(f.api.save(false), true);
  assert.equal(f.data.has(INTRO), false);
});

test("only explicit boolean true enables the shorter intro", () => {
  for (const value of [undefined, null, 1, "true", "1", {}, []]) {
    const f = fixture();
    f.api.save(value);
    assert.equal(f.api.allowsIntro(), false);
  }
});

test("a valid opt-in selects the shorter intro without a visit timestamp", () => {
  for (const entries of [{ [PREF]: saved(true) }, { [PREF]: saved(true, NOW - 20 * DAY), [INTRO]: String(NOW - DAY) }]) {
    const f = fixture(entries);
    assert.equal(f.api.allowsIntro(), true);
    assert.equal(f.data.has(INTRO), false);
    assert.equal(f.reads.includes(INTRO), false);
    assert.equal(f.writes.length, 0);
  }
  const rejected = fixture({ [PREF]: saved(false), [INTRO]: String(NOW - DAY) });
  assert.equal(rejected.api.allowsIntro(), false);
  assert.equal(rejected.data.has(INTRO), false);
});

test("expired, future, corrupted, and unrecognized permissions fail closed", () => {
  const invalid = ["not json", "null", "{}", saved(true, NOW - 180 * DAY), saved(true, NOW + DAY),
    saved(true).replace('"version":1', '"version":2'),
    saved(true).replace('"intro":true', '"intro":"true"'),
    saved(true).replace(String(NOW + 180 * DAY), String(NOW + 181 * DAY))];
  for (const value of invalid) {
    const f = fixture({ [PREF]: value, [INTRO]: String(NOW) });
    assert.equal(f.api.getPreference(), null, value);
    assert.equal(f.api.allowsIntro(), false, value);
    assert.equal(f.data.has(PREF), false);
    assert.equal(f.data.has(INTRO), false);
    assert.equal(f.reads.includes(INTRO), false);
  }
});

test("legacy visit timestamps are deleted and never influence intro selection", () => {
  for (const value of [String(NOW - 7 * DAY), String(NOW + DAY), "bad", "0"]) {
    const f = fixture({ [PREF]: saved(true), [INTRO]: value });
    assert.equal(f.api.allowsIntro(), true);
    assert.equal(f.data.has(INTRO), false);
    assert.equal(f.reads.includes(INTRO), false);
  }
});

test("permission expiry disables the shorter intro in a long-lived tab", () => {
  const f = fixture({ [PREF]: saved(true), [INTRO]: String(NOW) });
  f.advance(180);
  assert.equal(f.data.has(INTRO), false);
  assert.equal(f.api.allowsIntro(), false);
  f.resume();
  assert.equal(f.data.has(PREF), false);
});

test("withdrawal and cleared storage propagate to other open tabs", () => {
  const f = fixture({ [PREF]: saved(true), [INTRO]: String(NOW) });
  f.data.set(PREF, saved(false));
  f.storage(PREF);
  assert.equal(f.api.allowsIntro(), false);
  assert.equal(f.data.has(INTRO), false);
  f.data.set(PREF, saved(true));
  f.storage(PREF);
  assert.equal(f.api.allowsIntro(), true);
  f.data.clear();
  f.storage(null);
  assert.equal(f.api.allowsIntro(), false);
});

test("blocked storage and quota failure never enable the shorter intro", () => {
  for (const options of [{ blocked: true }, { writeBlocked: true }]) {
    const f = fixture({}, options);
    assert.equal(f.api.save(true), false);
    assert.equal(f.api.allowsIntro(), false);
    assert.equal(f.api.save(false), false);
    assert.equal(f.data.has(INTRO), false);
  }
  const f = fixture({ [PREF]: saved(true), [INTRO]: String(NOW) }, { writeBlocked: true });
  assert.equal(f.api.save(false), false);
  assert.equal(f.data.has(PREF), false, "remove old acceptance if replacement cannot be saved");
  assert.equal(f.data.has(INTRO), false);
});

test("browsers without an accessible settings dialog cannot enable the shorter intro", () => {
  const f = fixture({ [PREF]: saved(true), [INTRO]: String(NOW) }, { unsupportedDialog: true });
  assert.equal(f.api.allowsIntro(), false);
  assert.equal(f.data.has(INTRO), false);
  assert.equal(f.reads.includes(INTRO), false);
});

test("public pages load consent first and provide working non-JavaScript privacy links", () => {
  for (const page of publicPages.filter(page => !page.startsWith("loading-screens/"))) {
    const html = read(page);
    assert.match(html, /href="privacy.html"/);
    assert.match(html, /href="privacy.html#your-choices" data-privacy-settings/);
    const entry = html.match(/<script type="module" src="([^"]+)"/)[1];
    assert.ok(read(entry).startsWith('import "./privacy-bootstrap.js";'), page);
  }
  assert.doesNotMatch(read("index.html"), /localStorage/);
  assert.doesNotMatch(read("scripts/features/home-loader.js"), /localStorage/);
  assert.match(read("events.html"), /href="privacy.html#newsletter"/);
});

test("cache migration leaves new visitors and unrelated scopes alone", async () => {
  for (const kind of ["none", "other-scope", "other-worker", "idio"]) {
    const calls = [];
    const registration = {
      scope: kind === "other-scope" ? "https://site.example/another/" : "https://site.example/idio/",
      active: { scriptURL: kind === "other-worker" ? "https://site.example/idio/different.js" : "https://site.example/idio/service-worker.js" },
      update: async () => calls.push("update"),
    };
    let pending;
    vm.runInNewContext(read("scripts/register-cache.js"), {
      URL, location: { protocol: "https:" },
      document: { currentScript: { src: "https://site.example/idio/scripts/register-cache.js" } },
      navigator: { serviceWorker: {
        getRegistrations: () => ({ then(fn) { pending = fn(kind === "none" ? [] : [registration]); return { catch() {} }; } }),
        register: async (url, options) => { calls.push([url, options.scope]); return registration; },
      } },
    });
    await pending;
    if (kind === "idio") {
      assert.deepEqual(calls, [["https://site.example/idio/service-worker.js", "https://site.example/idio/"], "update"]);
    } else assert.equal(calls.length, 0, kind);
  }
});
