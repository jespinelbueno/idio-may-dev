import test from "node:test";
import assert from "node:assert/strict";
import { getAboutThreadProgress, smoothAboutThreadProgress } from "../scripts/features/about-thread-progress.js";

const atScroll = (scroll) => getAboutThreadProgress([
  { top: 500 - scroll, bottom: 1100 - scroll },
  { top: 900 - scroll, bottom: 1600 - scroll, finishViewport: 0.8 },
], 1000);

test("the lower path waits for the first stroke even when their bounds overlap", () => {
  assert.deepEqual(atScroll(-500), [0, 0]);
  for (let scroll = -500; scroll <= 1500; scroll += 10) {
    const [first, second] = atScroll(scroll);
    assert.ok(second === 0 || first === 1);
  }
  assert.deepEqual(atScroll(650), [1, 0]);
  assert.deepEqual(atScroll(800), [1, 1]);
});

test("scrolling backwards retracts the lower stroke before the upper stroke", () => {
  const forward = atScroll(700);
  assert.equal(forward[0], 1);
  assert.ok(forward[1] > 0 && forward[1] < 1);
  const backward = atScroll(600);
  assert.equal(backward[1], 0);
  assert.ok(backward[0] > 0 && backward[0] < 1);
});

test("separated mobile sections stay ordered and the final tip finishes in view", () => {
  assert.deepEqual(getAboutThreadProgress([
    { top: -1000, bottom: -600 },
    { top: 400, bottom: 640, finishViewport: 0.8 },
  ], 800), [1, 1]);
});


test("the shared pen eases scroll jumps without overshooting or drawing both segments", () => {
  let pen = 0.6;
  for (let frame = 0; frame < 120; frame++) {
    const next = smoothAboutThreadProgress(pen, 1.8, 1000 / 60);
    assert.ok(next >= pen && next <= 1.8);
    const first = Math.max(0, Math.min(1, next));
    const second = Math.max(0, Math.min(1, next - 1));
    assert.ok(second === 0 || first === 1);
    pen = next;
  }
  assert.equal(pen, 1.8);
  const reverse = smoothAboutThreadProgress(pen, 0.2, 1000 / 60);
  assert.ok(reverse < pen && reverse > 0.2);
});

test("damping follows elapsed time across different refresh rates", () => {
  let at30 = 0;
  let at60 = 0;
  for (let frame = 0; frame < 15; frame++) at30 = smoothAboutThreadProgress(at30, 1, 1000 / 30);
  for (let frame = 0; frame < 30; frame++) at60 = smoothAboutThreadProgress(at60, 1, 1000 / 60);
  assert.ok(Math.abs(at30 - at60) < 1e-12);
  assert.equal(smoothAboutThreadProgress(null, 1.5, 0), 1.5);
});
