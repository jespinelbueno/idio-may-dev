import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("only the homepage includes a loader or loading gate", () => {
  for (const [page, entry, style] of [
    ["services", "services", "services"], ["about", "about", "about"],
    ["events", "events", "events"], ["contact", "contact", "contact-page"],
    ["coming-soon", "coming-soon", "coming-soon"], ["privacy", "privacy", "privacy"],
    ["404", "not-found", "not-found"],
  ]) {
    const html = read(`${page}.html`);
    assert.doesNotMatch(html, /page-loader-bootstrap|class="loader|data-loader-word|data-loader-logo|is-page-loading/);
    assert.doesNotMatch(html.match(/<body[^>]*>/)[0], /is-loading/);
    assert.doesNotMatch(read(`scripts/${entry}.js`), /page-loader\.js|initPageLoader/);
    assert.doesNotMatch(read(`styles/${style}.css`), /components\/loader\.css/);
  }
  assert.match(read("index.html"), /class="page-home is-loading"/);
  assert.match(read("index.html"), /class="loader"/);
  assert.match(read("styles/home.css"), /components\/loader\.css/);
});
