const clamp = (value) => Math.max(0, Math.min(1, value));

// One moving pen advances through ordered scroll ranges. Overlapping artwork
// cannot start another stroke before the preceding stroke reaches its end.
export const getAboutThreadProgress = (segments, viewportHeight) => {
  const pen = viewportHeight * 0.8;
  let previousEnd = -Infinity;

  return segments.map(({ top, bottom, startViewport = 0.8, finishViewport = 0.45 }) => {
    const start = Math.max(top + viewportHeight * (0.8 - startViewport), previousEnd);
    const end = Math.max(start + 1, bottom + viewportHeight * (0.8 - finishViewport));
    previousEnd = end;
    return clamp((pen - start) / (end - start));
  });
};

// Time-based damping feels the same at different display refresh rates.
export const smoothAboutThreadProgress = (current, target, elapsedMs, dampingMs = 100) => {
  if (current === null || Math.abs(target - current) < 0.0001) return target;
  const blend = 1 - Math.exp(-Math.max(0, elapsedMs) / dampingMs);
  const next = current + (target - current) * blend;
  return Math.abs(target - next) < 0.0001 ? target : next;
};
