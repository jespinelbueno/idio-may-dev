import test from "node:test";
import assert from "node:assert/strict";
import { getTeamScrollProgress, getTeamCardPose } from "../scripts/features/about-team-scroll-progress.js";

test("all five people have a reading hold before the sticky section releases", () => {
  const step = 630;
  assert.equal(getTeamScrollProgress(0, step, 5), 0);
  for (let index = 0; index < 5; index++) {
    assert.ok(Math.abs(getTeamScrollProgress(-(index + 0.35) * step, step, 5) - index) < 1e-12);
    const pose = getTeamCardPose(index, index, 5);
    assert.equal(pose.opacity, 1);
    assert.ok(Math.abs(pose.turn) < 1e-12);
  }
  assert.equal(getTeamScrollProgress(-5 * step, step, 5), 4);
});

test("card flips return to the same pose when scrolling back, without showing past cards", () => {
  for (let progress = 0; progress <= 4; progress += 0.1) {
    for (let index = 0; index < 5; index++) {
      const pose = getTeamCardPose(index, progress, 5);
      assert.ok(pose.opacity >= 0 && pose.opacity <= 1);
      if (index < Math.floor(progress)) assert.equal(pose.opacity, 0);
    }
  }
  assert.ok(getTeamCardPose(2, 2.8, 5).turn < getTeamCardPose(2, 2.5, 5).turn);
});


test("visible cards settle continuously across each flip boundary", () => {
  for (let boundary = 1; boundary < 4; boundary++) {
    for (let index = boundary; index < 5; index++) {
      const before = getTeamCardPose(index, boundary - 0.000001, 5);
      const after = getTeamCardPose(index, boundary, 5);
      for (const property of Object.keys(before)) {
        assert.ok(Math.abs(before[property] - after[property]) < 0.0001,
          `Card ${index} jumps in ${property} at flip ${boundary}`);
      }
    }
  }
});
