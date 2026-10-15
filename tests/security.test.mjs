import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import { preparePages, publicPages } from "../tools/prepare-pages.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path) => readFileSync(join(root, path), "utf8");

test("every public HTML page restricts code, data destinations, frames, and forms before resources load", () => {
  for (const page of publicPages) {
    const html = read(page);
    const meta = html.match(/<meta http-equiv="Content-Security-Policy" content="([^"]+)">/);
    assert.ok(meta, page);
    assert.ok(meta.index < html.search(/<(?:script|link|base)\b/i), page);
    const policy = new Map(meta[1].split(";").filter(part => part.trim()).map(part => {
      const [key, ...values] = part.trim().split(/\s+/);
      return [key, values];
    }));
    for (const key of ["default-src", "object-src", "frame-src", "script-src-attr", "manifest-src"]) {
      assert.deepEqual(policy.get(key), ["'none'"], `${page}: ${key}`);
    }
    const scriptSources = policy.get("script-src");
    assert.ok(scriptSources.every(value => value === "'self'" || /^'sha256-[A-Za-z0-9+/]{43}='$/.test(value)), page);
    assert.ok(scriptSources.includes("'self'"));
    for (const [, attrs, body] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
      if (/\bsrc\s*=/.test(attrs)) continue;
      const hash = `'sha256-${createHash("sha256").update(body).digest("base64")}'`;
      assert.ok(scriptSources.includes(hash), `${page}: inline script needs its exact CSP hash`);
    }
    assert.deepEqual(policy.get("base-uri"), [page === "404.html" ? "'self'" : "'none'"]);
    assert.deepEqual(policy.get("connect-src"), page === "events.html"
      ? ["'self'", "https://e0a2c1d4.sibforms.com"] : ["'self'"]);
    assert.deepEqual(policy.get("form-action"), [page === "events.html" ? "https://e0a2c1d4.sibforms.com" : "'none'"]);
    assert.match(html, /<meta name="referrer" content="no-referrer">/);
    assert.doesNotMatch(html, /\son[a-z]+\s*=/i);
    assert.doesNotMatch(html, /\b(?:href|src|action)\s*=\s*["']\s*(?:javascript:|http:|\/\/)/i);
  }
});

test("Pages packaging excludes repository internals, unexpected files, and sensitive dotfiles", () => {
  const directory = mkdtempSync(join(tmpdir(), "idio-pages-test-"));
  try {
    const source = join(directory, "source");
    const output = join(directory, "public");
    const files = [...publicPages, "styles.css", "service-worker.js", ".nojekyll",
      "loading-screens/icon-color-loader/styles.css", "scripts/home.js", "styles/home.css",
      "assets/media/brand.svg", "services/assets/legacy.svg", "assets/.env", "assets/notes.md",
      ".env", "AGENTS.md", "package.json", "tools/check-site.mjs", "tests/example.test.mjs", ".git/config"];
    for (const file of files) {
      mkdirSync(dirname(join(source, file)), { recursive: true });
      writeFileSync(join(source, file), file);
    }
    preparePages(source, output);
    for (const file of ["index.html", "services.html", "scripts/home.js", "assets/media/brand.svg", "services/assets/legacy.svg", ".nojekyll"]) {
      assert.equal(readFileSync(join(output, file), "utf8"), file);
    }
    for (const file of [".env", "AGENTS.md", "package.json", "tools", "tests", ".git", "assets/.env", "assets/notes.md"]) {
      assert.equal(existsSync(join(output, file)), false, file);
    }
    assert.throws(() => preparePages(source, output), /EEXIST/);
    symlinkSync(join(source, ".env"), join(source, "assets/leak.svg"));
    assert.throws(() => preparePages(source, join(directory, "symlink-public")), /Symlink/);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

const workerFixture = (response = { ok: true, type: "basic", redirected: false, headers: new Headers() }) => {
  const listeners = {};
  const writes = [];
  const deleted = [];
  const cache = { match: async () => undefined, put: async (...args) => writes.push(args) };
  const context = {
    URL,
    self: { registration: { scope: "https://site.example/idio/" }, addEventListener: (name, handler) => listeners[name] = handler,
      skipWaiting() {}, clients: { claim: async () => {} } },
    caches: { open: async () => cache, keys: async () => ["idio-site-v4", "idio-site-v5", "another-site"], delete: async name => deleted.push(name) },
    fetch: async () => ({ ...response, clone: () => response }),
  };
  vm.runInNewContext(read("service-worker.js"), context);
  return {
    writes, deleted,
    async activate() {
      const pending = [];
      listeners.activate({ waitUntil: p => pending.push(p) });
      await Promise.all(pending);
    },
    async request(path, options = {}) {
      const pending = [];
      let intercepted = false;
      listeners.fetch({ request: { url: new URL(path, "https://site.example/idio/").href, method: "GET", mode: "cors", headers: new Headers(), ...options },
        waitUntil: p => pending.push(p), respondWith(p) { intercepted = true; pending.push(p); } });
      await Promise.all(pending);
      return intercepted;
    },
  };
};

test("service worker removes old executable caches and only intercepts unparameterized public media", async () => {
  const worker = workerFixture();
  await worker.activate();
  assert.deepEqual(worker.deleted, ["idio-site-v4"]);
  for (const [path, options] of [
    ["index.html", { mode: "navigate" }], ["scripts/home.js"], ["styles.css"],
    ["assets/picture.svg", { mode: "navigate" }], ["assets/picture.svg?variant=attacker"],
    ["assets/picture.svg", { cache: "no-store" }], ["assets/picture.svg", { method: "POST" }],
    ["assets/picture.svg", { headers: new Headers({ authorization: "Bearer example" }) }],
    ["assets/picture.svg", { headers: new Headers({ range: "bytes=0-10" }) }],
    ["../other/assets/picture.svg"], ["https://other.example/assets/picture.svg"],
  ]) assert.equal(await worker.request(path, options), false, path);
  assert.equal(await worker.request("assets/picture.svg"), true);
  assert.equal(worker.writes.length, 1);
});

test("service worker does not persist private, uncacheable, redirected, opaque, or failed responses", async () => {
  for (const options of [
    { headers: new Headers({ "cache-control": "private, max-age=0" }) },
    { headers: new Headers({ "cache-control": "no-store" }) },
    { headers: new Headers({ "cache-control": "no-cache" }) },
    { redirected: true }, { type: "opaque" }, { ok: false },
  ]) {
    const worker = workerFixture({ ok: true, type: "basic", redirected: false, headers: new Headers(), ...options });
    await worker.request("assets/picture.svg");
    assert.equal(worker.writes.length, 0);
  }
});
