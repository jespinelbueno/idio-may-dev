export const lerp = (start, end, amount) => start + (end - start) * amount;
export const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
export const easeSliceArrival = (value) => 1 - Math.pow(1 - value, 3);
export const polarPoint = (centerX, centerY, radius, angleDegrees) => {
  const angleRadians = ((angleDegrees - 90) * Math.PI) / 180;
  return {
    x: centerX + radius * Math.cos(angleRadians),
    y: centerY + radius * Math.sin(angleRadians),
  };
};

export const buildSlicePath = ({
  centerX,
  centerY,
  innerRadius,
  apexRadius = 0,
  outerRadius,
  startAngle,
  endAngle,
}) => {
  const outerStart = polarPoint(centerX, centerY, outerRadius, startAngle);
  const outerEnd = polarPoint(centerX, centerY, outerRadius, endAngle);
  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

  if (innerRadius <= 0) {
    const apexPoint =
      apexRadius > 0
        ? polarPoint(
            centerX,
            centerY,
            apexRadius,
            (startAngle + endAngle) / 2
          )
        : { x: centerX, y: centerY };

    return [
      `M ${apexPoint.x} ${apexPoint.y}`,
      `L ${outerStart.x} ${outerStart.y}`,
      `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${outerEnd.x} ${outerEnd.y}`,
      "Z",
    ].join(" ");
  }

  const innerEnd = polarPoint(centerX, centerY, innerRadius, endAngle);
  const innerStart = polarPoint(centerX, centerY, innerRadius, startAngle);

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerStart.x} ${innerStart.y}`,
    "Z",
  ].join(" ");
};
