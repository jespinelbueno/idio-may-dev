// Fit the original artwork to the chapter markers. A shear retains the loops
// on stacked layouts, where the two markers can share the same horizontal axis.
export const getAboutThreadTransform = (start, end, guideStart, guideEnd, artworkWidth, layoutWidth) => {
  const dx = guideEnd.x - guideStart.x;
  const dy = guideEnd.y - guideStart.y;
  const a = Math.max((end.x - start.x) / dx, layoutWidth * 0.65 / artworkWidth);
  const c = (end.x - start.x - a * dx) / dy;
  const d = (end.y - start.y) / dy;
  const e = start.x - a * guideStart.x - c * guideStart.y;
  const f = start.y - d * guideStart.y;
  return [a, 0, c, d, e, f];
};
