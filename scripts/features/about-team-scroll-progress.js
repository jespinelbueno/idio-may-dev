const clamp = (value, maximum = 1) => Math.max(0, Math.min(maximum, value));

export const getTeamScrollProgress = (top, step, count) => clamp(-top / step - 0.35, count - 1);

export const getTeamCardPose = (index, progress, count) => {
  const current = Math.min(Math.floor(progress), count - 1);
  const fraction = progress - current;
  const turn = clamp((fraction - 0.35) / 0.65);
  const eased = turn * turn * turn * (turn * (turn * 6 - 15) + 10);
  if (index < current) return { x: -52, y: -20, z: 20, rotate: 1.5, turn: -78, opacity: 0 };
  if (index === current) return {
    x: -52 * eased, y: -20 * eased, z: 20 * eased,
    rotate: 7.59 - 6 * eased, turn: -100 * eased,
    opacity: 1 - clamp((eased - 0.9) / 0.1),
  };
  if (index === current + 1) return {
    x: 5 * (1 - eased), y: 5 * (1 - eased), z: -14 * (1 - eased),
    rotate: -3 + 10.59 * eased, turn: 6 * (1 - eased), opacity: 1,
  };
  const depth = index - current;
  // Settle every remaining card during the turn so the next segment starts
  // at the same pose, without a small jump in the back of the stack.
  const nextDepth = depth - 1;
  const nextOffset = nextDepth === 1 ? 5 : nextDepth * 4;
  const nextRotate = nextDepth === 1 ? -3 : -3 - nextDepth;
  return {
    x: depth * 4 + (nextOffset - depth * 4) * eased,
    y: depth * 4 + (nextOffset - depth * 4) * eased,
    z: -14 * (depth - eased),
    rotate: -3 - depth + (nextRotate + 3 + depth) * eased,
    turn: nextDepth === 1 ? 6 * eased : 0, opacity: 1,
  };
};
