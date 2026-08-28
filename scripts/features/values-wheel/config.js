import { lerp } from "./geometry.js";

export const valuesWheelConfig = [
  {
    label: "Listening",
    title: "listening",
    description:
      "Collaboration cannot happen without a listening culture. We make an intentional effort to understand the heartbeat of a brand and add our expertise to fill in the gaps.",
    position: "top",
    fill: "#ADB363",
    textColor: "#16233D",
    circleStartAngle: 329.6,
    circleEndAngle: 390.4,
    startAngle: 332.5,
    endAngle: 387.5,
    circleOuterRadius: 266,
    outerRadius: 292,
    innerRadius: 0,
    circleApexRadius: 0,
    apexRadius: 15,
    popX: 0,
    popY: -22,
    circleLabelRadius: 156,
    labelRadius: 158,
    labelClass: "",
  },
  {
    label: "Excellence",
    title: "excellence",
    description:
      "Excellent results derive from an exceptional work ethic. Idio strives to cultivate a servant culture, delivering exemplary service to both clients and our team.",
    position: "upper-right",
    fill: "#D80411",
    textColor: "#F7F2E9",
    circleStartAngle: 29.6,
    circleEndAngle: 90.4,
    startAngle: 32.5,
    endAngle: 87.5,
    circleOuterRadius: 266,
    outerRadius: 338,
    innerRadius: 0,
    circleApexRadius: 0,
    apexRadius: 15,
    popX: 21,
    popY: -9,
    circleLabelRadius: 156,
    labelRadius: 176,
    labelClass: "",
  },
  {
    label: "Creativity",
    title: "creativity",
    description:
      "Creativity is the pillar of unforgettable art. Idio believes in artists, creators, and the power of imagination. Without creatives, the world could not function.",
    position: "lower-right",
    fill: "#99BBD3",
    textColor: "#16233D",
    circleStartAngle: 89.6,
    circleEndAngle: 150.4,
    startAngle: 92.5,
    endAngle: 147.5,
    circleOuterRadius: 266,
    outerRadius: 442,
    innerRadius: 0,
    circleApexRadius: 0,
    apexRadius: 15,
    popX: 22,
    popY: 14,
    circleLabelRadius: 156,
    labelRadius: 226,
    labelClass: "is-large",
  },
  {
    label: "Responsibility",
    title: "responsibility",
    description:
      "Here at Idio, we believe we have a responsibility to be thorough in service and ethical in behavior, from research all the way to client relationships.",
    calloutLines: [
      "Here at Idio, we believe we have a responsibility to be",
      "thorough in service and ethical in behavior, from research",
      "all the way to client relationships.",
    ],
    position: "bottom",
    fill: "#00470C",
    textColor: "#F7F2E9",
    circleStartAngle: 149.6,
    circleEndAngle: 210.4,
    startAngle: 152.5,
    endAngle: 207.5,
    circleOuterRadius: 266,
    outerRadius: 326,
    innerRadius: 0,
    circleApexRadius: 0,
    apexRadius: 15,
    popX: 0,
    popY: 24,
    circleLabelRadius: 156,
    labelRadius: 178,
    labelClass: "is-small",
  },
  {
    label: "Idiosyncrasy",
    title: "idiosyncrasy",
    description:
      "We believe good branding never sacrifices personality. The unique traits (idiosyncrasies) of a brand are what take it from great to legendary and unforgettable.",
    calloutLines: [
      "We believe good branding never sacrifices personality.",
      "The unique traits (idiosyncrasies) of a brand are what",
      "take it from great to legendary and unforgettable.",
    ],
    position: "lower-left",
    fill: "#16233D",
    textColor: "#F7F2E9",
    circleStartAngle: 209.6,
    circleEndAngle: 270.4,
    startAngle: 212.5,
    endAngle: 267.5,
    circleOuterRadius: 266,
    outerRadius: 318,
    innerRadius: 0,
    circleApexRadius: 0,
    apexRadius: 15,
    popX: -20,
    popY: 12,
    circleLabelRadius: 156,
    labelRadius: 174,
    labelClass: "is-small",
  },
  {
    label: "Collaboration",
    title: "collaboration",
    description:
      "Idio fosters open dialogue and teamwork, celebrating new ideas and creative directions that communicate who our clients are to the proper audience.",
    calloutLines: [
      "Idio fosters open dialogue and teamwork, celebrating",
      "new ideas and creative directions that communicate",
      "who our clients are to the proper audience.",
    ],
    position: "upper-left",
    fill: "#FFD569",
    textColor: "#00470C",
    circleStartAngle: 269.6,
    circleEndAngle: 330.4,
    startAngle: 272.5,
    endAngle: 327.5,
    circleOuterRadius: 266,
    outerRadius: 292,
    innerRadius: 0,
    circleApexRadius: 0,
    apexRadius: 15,
    popX: -20,
    popY: -10,
    circleLabelRadius: 156,
    labelRadius: 166,
    labelClass: "",
  },
];

export const valuesWheelCenterAngles = valuesWheelConfig.map((slice) => {
  const startAngle = slice.circleStartAngle ?? slice.startAngle;
  const endAngle = slice.circleEndAngle ?? slice.endAngle;
  return (startAngle + endAngle) / 2;
});

const valuesWheelCircleOuterRadii = valuesWheelConfig.map(
  (slice) => slice.circleOuterRadius ?? slice.outerRadius
);

const valuesWheelCircleLabelRadii = valuesWheelConfig.map(
  (slice) => slice.circleLabelRadius ?? slice.labelRadius
);

const resolveFrameValue = (value, index, fallback) => {
  if (Array.isArray(value)) {
    return value[index] ?? fallback;
  }

  return value ?? fallback;
};

const createArcState = ({
  centerAngle,
  width,
  outerRadius,
  labelRadius,
  innerRadius = 0,
  apexRadius = 0,
  opacity = 1,
  translateX = 0,
  translateY = 0,
  rotation = 0,
  scale = 1,
  lift = 0,
}) => {
  const startAngle = centerAngle - width / 2;
  let endAngle = centerAngle + width / 2;

  if (endAngle <= startAngle) {
    endAngle += 360;
  }

  return {
    startAngle,
    endAngle,
    outerRadius,
    labelRadius,
    innerRadius,
    apexRadius,
    opacity,
    translateX,
    translateY,
    rotation,
    scale,
    lift,
  };
};

const createFrameSlice = (index, overrides = {}) =>
  createArcState({
    centerAngle:
      overrides.centerAngle ??
      valuesWheelCenterAngles[index] + (overrides.angleShift ?? 0),
    width: overrides.width ?? 60,
    outerRadius: overrides.outerRadius ?? valuesWheelCircleOuterRadii[index],
    labelRadius: overrides.labelRadius ?? valuesWheelCircleLabelRadii[index],
    innerRadius: overrides.innerRadius ?? 0,
    apexRadius: overrides.apexRadius ?? 0,
    opacity: overrides.opacity ?? 1,
    translateX: overrides.translateX ?? 0,
    translateY: overrides.translateY ?? 0,
    rotation: overrides.rotation ?? 0,
    scale: overrides.scale ?? 1,
    lift: overrides.lift ?? 0,
  });

const createBlendedFrame = ({
  labelOpacity = 1,
  angleShift = 0,
  width = 60,
  outerBlend = 0,
  labelBlend = 0,
  apexRadius = 0,
  innerRadius = 0,
  opacity = 1,
  translateX = 0,
  translateY = 0,
  rotation = 0,
  scale = 1,
  lift = 0,
}) => ({
  labelOpacity,
  slices: valuesWheelConfig.map((slice, index) => {
    const radiusBlend = resolveFrameValue(outerBlend, index, 0);
    const radius = lerp(
      valuesWheelCircleOuterRadii[index],
      slice.outerRadius,
      radiusBlend
    );
    const labelRadius = lerp(
      valuesWheelCircleLabelRadii[index],
      slice.labelRadius,
      resolveFrameValue(labelBlend, index, 0)
    );

    return createFrameSlice(index, {
      angleShift,
      width: resolveFrameValue(width, index, 60),
      outerRadius: radius,
      labelRadius,
      apexRadius: resolveFrameValue(apexRadius, index, 0),
      innerRadius: resolveFrameValue(innerRadius, index, 0),
      opacity: resolveFrameValue(opacity, index, 1),
      translateX: resolveFrameValue(translateX, index, 0),
      translateY: resolveFrameValue(translateY, index, 0),
      rotation: resolveFrameValue(rotation, index, 0),
      scale: resolveFrameValue(scale, index, 1),
      lift: resolveFrameValue(lift, index, 0),
    });
  }),
});

export const radialOffset = (radius, angleDegrees) => {
  const angleRadians = ((angleDegrees - 90) * Math.PI) / 180;

  return {
    x: radius * Math.cos(angleRadians),
    y: radius * Math.sin(angleRadians),
  };
};

const createFinalFrame = () => ({
  labelOpacity: 1,
  slices: valuesWheelConfig.map((slice) => {
    const centerAngle = (slice.startAngle + slice.endAngle) / 2;
    const separationPoint = radialOffset(4, centerAngle);

    return {
      startAngle: slice.startAngle,
      endAngle: slice.endAngle,
      outerRadius: slice.outerRadius,
      labelRadius: slice.labelRadius,
      innerRadius: slice.innerRadius ?? 0,
      apexRadius: slice.apexRadius ?? 0,
      opacity: 1,
      translateX: separationPoint.x,
      translateY: separationPoint.y,
      rotation: 0,
      scale: 1,
      lift: 0.12,
    };
  }),
});

const createHiddenFrameSlice = (index, rotation = 0, scale = 1) =>
  createFrameSlice(index, {
    width: 0.01,
    outerRadius: 12,
    labelRadius: 0,
    apexRadius: 0,
    opacity: 0,
    rotation,
    scale,
    lift: 0,
  });

const createStoryboardFrame = ({ rotation = 0, scale = 1, slices }) => ({
  labelOpacity: 1,
  slices: valuesWheelConfig.map((_, index) => {
    const slice = slices[index];

    if (!slice) {
      return createHiddenFrameSlice(index, rotation, scale);
    }

    return createFrameSlice(index, {
      rotation,
      scale: slice.scale ?? scale,
      centerAngle: slice.centerAngle,
      width: slice.width,
      outerRadius: slice.outerRadius,
      labelRadius: slice.labelRadius ?? slice.outerRadius * 0.58,
      apexRadius: slice.apexRadius ?? 0,
      translateX: slice.translateX ?? 0,
      translateY: slice.translateY ?? 0,
      lift: slice.lift ?? 0,
    });
  }),
});

export const valuesWheelFrameStops = [0, 0.16, 0.32, 0.52, 0.76, 1];
export const valuesWheelStartRotation = -120;
export const valuesWheelEndRotation = 0;
export const valuesWheelRenderOrder = [5, 1, 0, 2, 4, 3];
export const valuesWheelScrollStart = 0.98;
export const valuesWheelScrollEnd = 0.7;
export const valuesWheelSmoothingFactor = 0.075;

// Six keyed poses following the sketch: two-color wheel, larger two-color
// wheel, four colors, five colors with two slices pushing out, six colors with
// three slices pushing out, then the final separated six-slice wheel.
export const valuesWheelFrames = [
  createStoryboardFrame({
    rotation: 0,
    scale: 0.62,
    slices: {
      3: { centerAngle: 90, width: 180, outerRadius: 238 },
      4: { centerAngle: 270, width: 180, outerRadius: 238 },
    },
  }),
  createStoryboardFrame({
    rotation: 0,
    scale: 0.76,
    slices: {
      3: { centerAngle: 90, width: 180, outerRadius: 280 },
      4: { centerAngle: 270, width: 180, outerRadius: 280 },
    },
  }),
  createStoryboardFrame({
    rotation: 0,
    scale: 0.9,
    slices: {
      1: { centerAngle: 45, width: 90, outerRadius: 292 },
      3: { centerAngle: 135, width: 90, outerRadius: 292 },
      4: { centerAngle: 225, width: 90, outerRadius: 292 },
      5: { centerAngle: 315, width: 90, outerRadius: 292 },
    },
  }),
  createStoryboardFrame({
    rotation: 0,
    scale: 1,
    slices: {
      0: { centerAngle: 360, width: 72, outerRadius: 290 },
      1: {
        centerAngle: 72,
        width: 72,
        outerRadius: 292,
        translateX: 30,
        translateY: -12,
        scale: 1.08,
        lift: 0.42,
      },
      3: { centerAngle: 144, width: 72, outerRadius: 292 },
      4: { centerAngle: 216, width: 72, outerRadius: 286 },
      5: {
        centerAngle: 288,
        width: 72,
        outerRadius: 292,
        translateX: -14,
        translateY: -8,
        scale: 1.02,
        lift: 0.18,
      },
    },
  }),
  createStoryboardFrame({
    rotation: 0,
    scale: 1.04,
    slices: {
      0: { centerAngle: 360, width: 60, outerRadius: 302, apexRadius: 6 },
      1: {
        centerAngle: 60,
        width: 60,
        outerRadius: 342,
        apexRadius: 8,
        translateX: 28,
        translateY: -15,
        scale: 1.06,
        lift: 0.42,
      },
      2: {
        centerAngle: 120,
        width: 60,
        outerRadius: 420,
        apexRadius: 8,
        translateX: 52,
        translateY: 58,
        scale: 1.12,
        lift: 0.68,
      },
      3: {
        centerAngle: 180,
        width: 60,
        outerRadius: 334,
        apexRadius: 8,
        translateX: 0,
        translateY: 42,
        scale: 1.06,
        lift: 0.46,
      },
      4: {
        centerAngle: 240,
        width: 60,
        outerRadius: 324,
        apexRadius: 7,
        translateX: -20,
        translateY: 10,
        scale: 1.04,
        lift: 0.28,
      },
      5: {
        centerAngle: 300,
        width: 60,
        outerRadius: 298,
        apexRadius: 7,
        translateX: -18,
        translateY: -8,
        scale: 1.03,
        lift: 0.22,
      },
    },
  }),
  createFinalFrame(),
];
