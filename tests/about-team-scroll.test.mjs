import test from "node:test";
import assert from "node:assert/strict";
import { getTeamScrollProgress, getTeamCardTransform, getTeamShuffleFrames } from "../scripts/features/about/about-team-scroll-progress.js";

test("all five people have a reading hold before the sticky section releases", () => {
  const step = 630;
  assert.equal(getTeamScrollProgress(0, step, 5), 0);
  for (let index = 0; index < 5; index++) {
    assert.ok(Math.abs(getTeamScrollProgress(-(index + 0.35) * step, step, 5) - index) < 1e-12);
  }
  assert.equal(getTeamScrollProgress(-5 * step, step, 5), 4);
});

test("portraits shuffle behind the stack without flipping or fading away", () => {
  for (const compact of [false, true]) {
    for (const width of [220, 320, 400]) {
      const { outbound, inbound } = getTeamShuffleFrames(width, 4, compact);
      assert.equal(outbound[0].transform, getTeamCardTransform(0, width, compact));
      assert.equal(outbound.at(-1).transform, inbound[0].transform);
      assert.equal(inbound.at(-1).transform, getTeamCardTransform(4, width, compact));
      for (const frame of [...outbound, ...inbound]) {
        assert.doesNotMatch(frame.transform, /rotate[XY]|NaN|Infinity/);
        assert.ok(frame.opacity === undefined || frame.opacity === 1);
      }
      const lift = outbound[1].transform.match(/translate3d\(([-.\d]+)px, ([-.\d]+)px/);
      assert.ok(Number(lift[1]) > 0, "The front card travels to the right");
      assert.ok(Number(lift[2]) < 0, "The front card lifts before returning");
    }
  }
});

test("deep cards stay tucked in the same small fan at every viewport size", () => {
  for (const width of [220, 320, 400]) {
    for (const compact of [false, true]) {
      // Only depth changes after the third card, so five portraits do not spread offscreen.
      const transform = (depth) => getTeamCardTransform(depth, width, compact).replace(/, -\d+px\)/, ", depth)");
      assert.equal(transform(2), transform(4));
    }
  }
});

test("the sideways shuffle stays within the available page edge", () => {
  const { outbound } = getTeamShuffleFrames(400, 4, false, 72);
  const travel = outbound.at(-1).transform.match(/translate3d\(([-.\d]+)px/);
  assert.ok(Number(travel[1]) <= 72);
  const constrained = getTeamShuffleFrames(400, 4, false, -10);
  assert.match(constrained.outbound.at(-1).transform, /translate3d\(0px/);
});
