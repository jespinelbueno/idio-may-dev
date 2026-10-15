const clamp = (value, maximum = 1) => Math.max(0, Math.min(maximum, value));

export const getTeamScrollProgress = (top, step, count) => clamp(-top / step - 0.35, count - 1);

// Match the homepage's gently fanned stack, keeping deeper cards tucked in.
export const getTeamCardTransform = (depth, width, compact = false) => {
  const visualDepth = Math.min(depth, 2);
  const x = visualDepth * width * (compact ? -0.075 : -0.125);
  const y = visualDepth * width * (compact ? 0.07 : 0.02);
  return `translate3d(${x}px, ${y}px, ${-depth}px) rotate(${6.5 - visualDepth * 5.3}deg) scale(${1 - visualDepth * 0.038})`;
};

export const getTeamShuffleFrames = (width, backDepth, compact = false, availableTravel = Infinity) => {
  const travelX = Math.min(width * (compact ? 0.13 : 0.68), Math.max(0, availableTravel));
  const liftY = width * (compact ? -0.2 : -0.24);
  const visualDepth = Math.min(backDepth, 2);
  const offsetX = width * (compact ? -0.075 : -0.125);
  const offsetY = width * (compact ? 0.07 : 0.02);
  const outside = `translate3d(${travelX}px, -0.55rem, 18px) rotate(11deg) scale(1.012)`;
  return {
    outbound: [
      { offset: 0, transform: getTeamCardTransform(0, width, compact), filter: "brightness(1)", boxShadow: "0 0.85rem 1.7rem rgb(21 18 14 / 0.16)" },
      { offset: 0.42, transform: `translate3d(${travelX * 0.56}px, ${liftY}px, 32px) rotate(6deg) scale(1.028)`, filter: "brightness(1.04)", boxShadow: "0 1.2rem 2rem rgb(21 18 14 / 0.22)" },
      { offset: 1, transform: outside, filter: "brightness(1.03)", boxShadow: "0 1.05rem 1.75rem rgb(21 18 14 / 0.2)" },
    ],
    inbound: [
      { offset: 0, transform: outside },
      { offset: 0.45, transform: `translate3d(${travelX * 0.38}px, 2.2rem, -18px) rotate(4deg) scale(0.972)` },
      { offset: 0.78, transform: `translate3d(${visualDepth * offsetX - 8}px, ${visualDepth * offsetY + 4}px, ${-backDepth}px) rotate(${6.5 - visualDepth * 5.3 - 1.2}deg) scale(${1 - visualDepth * 0.038 - 0.008})` },
      { offset: 1, transform: getTeamCardTransform(backDepth, width, compact) },
    ],
  };
};
