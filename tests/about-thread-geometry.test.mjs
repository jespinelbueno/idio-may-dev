import test from "node:test";
import assert from "node:assert/strict";
import { getAboutThreadTransform } from "../scripts/features/about/about-thread-geometry.js";

test("the artwork endpoints stay on their circles across alternating and stacked layouts", () => {
  const guides = [
    [{ x: 700, y: 5 }, { x: 4, y: 901 }, 1272.79],
    [{ x: 5, y: 4 }, { x: 1054, y: 563 }, 1214.78],
  ];
  for (const width of [1920, 1440, 1024, 768, 390]) {
    const dots = width > 760
      ? [{ x: width * 0.57, y: 400 }, { x: width * 0.17, y: 1000 }, { x: width * 0.78, y: 1800 }]
      : [{ x: 50, y: 400 }, { x: 50, y: 1700 }, { x: width / 2, y: 3400 }];
    for (const [index, [start, end, artworkWidth]] of guides.entries()) {
      const [a, b, c, d, e, f] = getAboutThreadTransform(dots[index], dots[index + 1], start, end, artworkWidth, width);
      assert.ok(a > 0 && d > 0, "the loops retain positive area when markers share an x coordinate");
      for (const [point, target] of [[start, dots[index]], [end, dots[index + 1]]]) {
        assert.ok(Math.abs(a * point.x + c * point.y + e - target.x) < 1e-8);
        assert.ok(Math.abs(b * point.x + d * point.y + f - target.y) < 1e-8);
      }
    }
  }
});
