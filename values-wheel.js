const svgNamespace = "http://www.w3.org/2000/svg";

const valuesWheelConfig = [
  {
    label: "Listening",
    title: "listening",
    description:
      "Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor.",
    position: "upper-right",
    fill: "#ADB363",
    textColor: "#F7F2E9",
    circleStartAngle: 329.6,
    circleEndAngle: 390.4,
    startAngle: 332.5,
    endAngle: 387.5,
    circleOuterRadius: 266,
    outerRadius: 245,
    innerRadius: 0,
    circleApexRadius: 0,
    apexRadius: 15,
    popX: 0,
    popY: -22,
    circleLabelRadius: 156,
    labelRadius: 146,
    labelClass: "",
  },
  {
    label: "Excellence",
    title: "excellence",
    description:
      "Lorem ipsum dolor sit amet consectetur ut labore et dolore magna aliqua.",
    position: "upper-right",
    fill: "#D80411",
    textColor: "#F7F2E9",
    circleStartAngle: 29.6,
    circleEndAngle: 90.4,
    startAngle: 32.5,
    endAngle: 87.5,
    circleOuterRadius: 266,
    outerRadius: 272,
    innerRadius: 0,
    circleApexRadius: 0,
    apexRadius: 15,
    popX: 21,
    popY: -9,
    circleLabelRadius: 156,
    labelRadius: 158,
    labelClass: "",
  },
  {
    label: "Creativity",
    title: "creativity",
    description:
      "Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt.",
    position: "right",
    fill: "#99BBD3",
    textColor: "#F7F2E9",
    circleStartAngle: 89.6,
    circleEndAngle: 150.4,
    startAngle: 92.5,
    endAngle: 147.5,
    circleOuterRadius: 266,
    outerRadius: 342,
    innerRadius: 0,
    circleApexRadius: 0,
    apexRadius: 15,
    popX: 22,
    popY: 14,
    circleLabelRadius: 156,
    labelRadius: 180,
    labelClass: "is-large",
  },
  {
    label: "Idiosyncrasy",
    title: "idiosyncrasy",
    description:
      "Lorem ipsum dolor sit amet consectetur praesent commodo cursus magna.",
    position: "lower-left",
    fill: "#00470C",
    textColor: "#F7F2E9",
    circleStartAngle: 149.6,
    circleEndAngle: 210.4,
    startAngle: 152.5,
    endAngle: 207.5,
    circleOuterRadius: 266,
    outerRadius: 290,
    innerRadius: 0,
    circleApexRadius: 0,
    apexRadius: 15,
    popX: 0,
    popY: 24,
    circleLabelRadius: 156,
    labelRadius: 160,
    labelClass: "is-small",
  },
  {
    label: "Responsibility",
    title: "responsibility",
    description:
      "Lorem ipsum dolor sit amet consectetur nulla fringilla vulputate venenatis.",
    position: "lower-left",
    fill: "#16233D",
    textColor: "#F7F2E9",
    circleStartAngle: 209.6,
    circleEndAngle: 270.4,
    startAngle: 212.5,
    endAngle: 267.5,
    circleOuterRadius: 266,
    outerRadius: 238,
    innerRadius: 0,
    circleApexRadius: 0,
    apexRadius: 15,
    popX: -20,
    popY: 12,
    circleLabelRadius: 156,
    labelRadius: 150,
    labelClass: "is-small",
  },
  {
    label: "Collaboration",
    title: "collaboration",
    description:
      "Lorem ipsum dolor sit amet consectetur pellentesque mauris suspendisse enim.",
    position: "upper-left",
    fill: "#FFD569",
    textColor: "#F7F2E9",
    circleStartAngle: 269.6,
    circleEndAngle: 330.4,
    startAngle: 272.5,
    endAngle: 327.5,
    circleOuterRadius: 266,
    outerRadius: 225,
    innerRadius: 0,
    circleApexRadius: 0,
    apexRadius: 15,
    popX: -20,
    popY: -10,
    circleLabelRadius: 156,
    labelRadius: 148,
    labelClass: "",
  },
];

const lerp = (start, end, amount) => start + (end - start) * amount;
const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const easeSliceArrival = (value) => 1 - Math.pow(1 - value, 3);

const valuesWheelCenterAngles = valuesWheelConfig.map((slice) => {
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

const radialOffset = (radius, angleDegrees) => {
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

const valuesWheelFrameStops = [0, 0.16, 0.32, 0.52, 0.76, 1];
const valuesWheelFrameLabels = [
  "Start",
  "Grow",
  "Add colors",
  "Push out",
  "Full wheel",
  "Final",
];
const valuesWheelStartRotation = -120;
const valuesWheelEndRotation = 0;
const valuesWheelRenderOrder = [5, 1, 0, 2, 4, 3];
const valuesWheelScrollStart = 0.98;
const valuesWheelScrollEnd = 0.82;
const valuesWheelSmoothnessOptions = [
  {
    id: "crisp",
    label: "Crisp",
    description: "Direct scroll response",
    catchup: 1,
  },
  {
    id: "smooth",
    label: "Smooth",
    description: "Balanced easing",
    catchup: 0.18,
  },
  {
    id: "silky",
    label: "Silky",
    description: "Softest client preview",
    catchup: 0.075,
  },
];

// Six keyed poses following the sketch: two-color wheel, larger two-color
// wheel, four colors, five colors with two slices pushing out, six colors with
// three slices pushing out, then the final separated six-slice wheel.
const valuesWheelFrames = [
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
        outerRadius: 304,
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
      0: { centerAngle: 360, width: 60, outerRadius: 286, apexRadius: 6 },
      1: {
        centerAngle: 60,
        width: 60,
        outerRadius: 326,
        apexRadius: 8,
        translateX: 36,
        translateY: -15,
        scale: 1.08,
        lift: 0.44,
      },
      2: {
        centerAngle: 120,
        width: 60,
        outerRadius: 348,
        apexRadius: 8,
        translateX: 56,
        translateY: 28,
        scale: 1.12,
        lift: 0.62,
      },
      3: {
        centerAngle: 180,
        width: 60,
        outerRadius: 318,
        apexRadius: 8,
        translateX: 0,
        translateY: 50,
        scale: 1.08,
        lift: 0.5,
      },
      4: { centerAngle: 240, width: 60, outerRadius: 282, apexRadius: 6 },
      5: { centerAngle: 300, width: 60, outerRadius: 284, apexRadius: 6 },
    },
  }),
  createFinalFrame(),
];

const polarPoint = (centerX, centerY, radius, angleDegrees) => {
  const angleRadians = ((angleDegrees - 90) * Math.PI) / 180;
  return {
    x: centerX + radius * Math.cos(angleRadians),
    y: centerY + radius * Math.sin(angleRadians),
  };
};

const buildSlicePath = ({
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

const initValuesWheel = () => {
  const valuesSection = document.querySelector(".values-section");
  const valuesHeading = document.querySelector(".values-intro h2");
  const valuesWheel = document.querySelector(".values-wheel");
  const valuesWheelGraphic = document.querySelector(".values-wheel-graphic");
  const valueTooltip = document.querySelector(".value-tooltip");
  const valueTooltipSwatch = document.querySelector(".value-tooltip-swatch");
  const valueTooltipTitle = document.querySelector(".value-tooltip-title");
  const valueTooltipCopy = document.querySelector(".value-tooltip-copy");
  const valuesMobileList = document.querySelector(".values-mobile-list");

  if (!valuesWheel || !valuesWheelGraphic || !valueTooltip) {
    return;
  }

  const clearValueTooltip = () => {
    valuesWheel.classList.remove("has-active-tooltip");
    valuesWheel.classList.remove("has-hover-focus");
    valueTooltip.classList.remove(
      "is-left",
      "is-right",
      "is-top",
      "is-bottom",
      "is-upper-left",
      "is-upper-right",
      "is-lower-left",
      "is-lower-right"
    );
  };

  const setValueTooltip = (slice) => {
    if (!valueTooltipTitle || !valueTooltipCopy) {
      return;
    }

    const { valueTitle, valueDescription, valuePosition, valueColor } = slice.dataset;
    valueTooltipTitle.textContent = valueTitle || "";
    valueTooltipCopy.textContent = valueDescription || "";
    valueTooltipSwatch?.style.setProperty("background", valueColor || "");

    valueTooltip.classList.remove(
      "is-left",
      "is-right",
      "is-top",
      "is-bottom",
      "is-upper-left",
      "is-upper-right",
      "is-lower-left",
      "is-lower-right"
    );
    valueTooltip.classList.add(`is-${valuePosition || "right"}`);
    valuesWheel.classList.add("has-active-tooltip");
    valuesWheel.classList.add("has-hover-focus");
  };

  const buildValuesWheel = () => {
    valuesWheelGraphic.innerHTML = "";
    const rotor = document.createElementNS(svgNamespace, "g");
    rotor.setAttribute("class", "values-wheel-rotor");
    rotor.style.setProperty("--wheel-rotate", "0deg");
    valuesWheelGraphic.appendChild(rotor);

    const slices = [];

    valuesWheelConfig.forEach((slice, index) => {
      const sliceCenterAngle =
        (slice.startAngle + slice.endAngle) / 2;
      const popPoint = polarPoint(0, 0, 24, sliceCenterAngle);

      const group = document.createElementNS(svgNamespace, "g");
      group.setAttribute("class", "wheel-slice-group");
      group.setAttribute("tabindex", "0");
      group.dataset.valueTitle = slice.title;
      group.dataset.valueDescription = slice.description;
      group.dataset.valuePosition = slice.position;
      group.dataset.valueColor = slice.fill;
      group.dataset.sliceIndex = String(index);
      group.style.setProperty("--pop-x", `${popPoint.x}px`);
      group.style.setProperty("--pop-y", `${popPoint.y}px`);
      group.style.setProperty("--pop-scale", String(slice.popScale || 1.024));
      group.style.setProperty("--label-pop-x", `${popPoint.x * 0.45}px`);
      group.style.setProperty("--label-pop-y", `${popPoint.y * 0.45}px`);
      group.style.setProperty("--label-frame-x", "0px");
      group.style.setProperty("--label-frame-y", "0px");
      group.style.setProperty("--frame-x", "0px");
      group.style.setProperty("--frame-y", "0px");
      group.style.setProperty("--frame-scale", "1");

      const hitPath = document.createElementNS(svgNamespace, "path");
      hitPath.setAttribute("class", "wheel-slice-hitarea");

      const visual = document.createElementNS(svgNamespace, "g");
      visual.setAttribute("class", "wheel-slice-visual");

      const path = document.createElementNS(svgNamespace, "path");
      path.setAttribute("class", "wheel-slice-shape");
      path.setAttribute("fill", slice.fill);
      path.setAttribute("stroke", slice.fill);
      path.setAttribute("stroke-width", "1.5");
      path.setAttribute("stroke-linejoin", "round");

      visual.appendChild(path);
      group.appendChild(hitPath);
      group.appendChild(visual);
      rotor.appendChild(group);
      slices.push({ group, path, hitPath, config: slice });
    });

    return { rotor, slices };
  };

  const prepareValuesHeading = () => {
    if (!valuesHeading) {
      return;
    }

    const words = valuesHeading.textContent.trim().split(/\s+/);
    valuesHeading.textContent = "";

    words.forEach((word, index) => {
      const wordElement = document.createElement("span");
      wordElement.className = "values-heading-word";
      wordElement.textContent = word;
      wordElement.style.setProperty("--word-index", String(index));
      valuesHeading.appendChild(wordElement);

      if (index < words.length - 1) {
        valuesHeading.appendChild(document.createTextNode(" "));
      }
    });
  };

  prepareValuesHeading();

  const { rotor: valuesWheelRotor, slices: wheelSlices } = buildValuesWheel();
  let activeSmoothness = valuesWheelSmoothnessOptions[1];
  let targetWheelProgress = 0;
  let renderedWheelProgress = 0;
  let smoothnessFrame = null;
  const smoothnessButtons = new Map();

  const setSmoothnessButtonState = () => {
    smoothnessButtons.forEach((button, id) => {
      const isActive = id === activeSmoothness.id;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
  };

  const applyValuesWheelRenderOrder = () => {
    valuesWheelRenderOrder.forEach((index) => {
      valuesWheelRotor.appendChild(wheelSlices[index].group);
    });
  };
  applyValuesWheelRenderOrder();

  const clearActiveSliceState = () => {
    wheelSlices.forEach(({ group }) => {
      group.classList.remove(
        "is-active",
        "is-adjacent-active",
        "is-opposite-active"
      );
    });
  };

  const setActiveSliceState = (activeIndex) => {
    clearActiveSliceState();

    wheelSlices.forEach(({ group }, index) => {
      const clockwiseDistance =
        (index - activeIndex + wheelSlices.length) % wheelSlices.length;
      const counterClockwiseDistance =
        (activeIndex - index + wheelSlices.length) % wheelSlices.length;
      const distance = Math.min(clockwiseDistance, counterClockwiseDistance);

      if (distance === 0) {
        group.classList.add("is-active");
      } else if (distance === 1) {
        const direction =
          (index - activeIndex + wheelSlices.length) % wheelSlices.length === 1
            ? 1
            : -1;
        const nudgePoint = radialOffset(3, valuesWheelCenterAngles[index] + direction * 10);

        group.style.setProperty("--adjacent-nudge-x", `${nudgePoint.x}px`);
        group.style.setProperty("--adjacent-nudge-y", `${nudgePoint.y}px`);
        group.classList.add("is-adjacent-active");
      } else if (distance >= 3) {
        group.classList.add("is-opposite-active");
      }
    });
  };

  const defaultActiveSliceIndex = valuesWheelConfig.findIndex(
    ({ title }) => title === "creativity"
  );

  const showSliceValue = (group, index, tooltipDelay = 0) => {
    setActiveSliceState(index);
    valuesWheelRotor.appendChild(group);

    const showTooltip = () => {
      setValueTooltip(group);
    };

    if (tooltipDelay > 0) {
      tooltipDelayTimeout = window.setTimeout(showTooltip, tooltipDelay);
    } else {
      showTooltip();
    }
  };

  const showDefaultValueTooltip = () => {
    if (!valuesWheel.classList.contains("is-scroll-settled")) {
      return;
    }

    const fallbackIndex = defaultActiveSliceIndex >= 0 ? defaultActiveSliceIndex : 0;
    const fallbackSlice = wheelSlices[fallbackIndex];

    if (fallbackSlice) {
      showSliceValue(fallbackSlice.group, fallbackIndex);
    }
  };

  let hoverDebounceTimeout = null;
  let tooltipDelayTimeout = null;

  const clearHoverTimers = () => {
    window.clearTimeout(hoverDebounceTimeout);
    window.clearTimeout(tooltipDelayTimeout);
    hoverDebounceTimeout = null;
    tooltipDelayTimeout = null;
  };

  const activateSliceHover = (group, index, delay = 28) => {
    if (!valuesWheel.classList.contains("is-scroll-settled")) {
      return;
    }

    clearHoverTimers();
    hoverDebounceTimeout = window.setTimeout(() => {
      showSliceValue(group, index, 130);
    }, delay);
  };

  const clearSliceHover = () => {
    clearHoverTimers();

    if (valuesWheel.classList.contains("is-scroll-settled")) {
      showDefaultValueTooltip();
      return;
    }

    clearActiveSliceState();
    clearValueTooltip();
  };

  const scrollValuesWheelToProgress = (progress) => {
    const rect = valuesWheel.getBoundingClientRect();
    const viewportHeight =
      window.innerHeight || document.documentElement.clientHeight;
    const wheelCenterDocument =
      window.scrollY + rect.top + rect.height * 0.5;
    const start = viewportHeight * valuesWheelScrollStart;
    const end = viewportHeight * valuesWheelScrollEnd;
    const targetWheelCenter = start - clamp(progress) * (start - end);
    const targetScrollY = wheelCenterDocument - targetWheelCenter;

    window.scrollTo({
      top: Math.max(0, targetScrollY),
      behavior: "smooth",
    });
  };

  const buildValuesWheelSmoothnessControls = () => {
    const controls = document.createElement("div");
    controls.className = "values-smoothness-controls";
    controls.setAttribute("aria-label", "Wheel animation smoothness");

    const label = document.createElement("span");
    label.className = "values-smoothness-label";
    label.textContent = "Animation smoothness";
    controls.appendChild(label);

    valuesWheelSmoothnessOptions.forEach((option) => {
      const button = document.createElement("button");
      button.className = "values-smoothness-control";
      button.type = "button";
      button.innerHTML = `
        <span class="values-smoothness-control-title">${option.label}</span>
        <span class="values-smoothness-control-copy">${option.description}</span>
      `;
      button.setAttribute(
        "aria-label",
        `${option.label} animation smoothness: ${option.description}`
      );
      button.setAttribute("aria-pressed", "false");
      button.addEventListener("click", () => {
        activeSmoothness = option;
        setSmoothnessButtonState();
      });
      smoothnessButtons.set(option.id, button);
      controls.appendChild(button);
    });

    valuesWheel.insertAdjacentElement("afterend", controls);
    setSmoothnessButtonState();
  };

  const buildValuesWheelFrameControls = () => {
    const controls = document.createElement("div");
    controls.className = "values-frame-controls";
    controls.setAttribute("aria-label", "Wheel animation frames");

    const label = document.createElement("span");
    label.className = "values-frame-controls-label";
    label.textContent = "Animation stages";
    controls.appendChild(label);

    valuesWheelFrameStops.forEach((progress, index) => {
      const button = document.createElement("button");
      button.className = "values-frame-control";
      button.type = "button";
      button.innerHTML = `
        <span class="values-frame-control-number">${index + 1}</span>
        <span class="values-frame-control-label">${valuesWheelFrameLabels[index]}</span>
      `;
      button.setAttribute(
        "aria-label",
        `Animation stage ${index + 1}: ${valuesWheelFrameLabels[index]}`
      );
      button.addEventListener("click", () => {
        scrollValuesWheelToProgress(progress);
      });
      controls.appendChild(button);
    });

    valuesWheel.appendChild(controls);
  };

  if (valuesMobileList) {
    valuesMobileList.innerHTML = valuesWheelConfig
      .map(
        ({ title, description, fill }) => `
          <article class="values-mobile-item">
            <div class="values-mobile-swatch" style="background:${fill};" aria-hidden="true"></div>
            <div class="values-mobile-copy">
              <h3>${title}</h3>
              <p>${description}</p>
            </div>
          </article>
        `
      )
      .join("");
  }

  const updateValuesHeading = (scrollProgress = 0) => {
    if (!valuesHeading) {
      return;
    }

    const headingProgress = easeSliceArrival(clamp(scrollProgress / 0.34));
    valuesHeading.style.setProperty(
      "--values-heading-progress",
      headingProgress.toFixed(3)
    );
  };

  const updateValuesWheelShape = (scrollProgress = 0) => {
    const clampedProgress = clamp(scrollProgress);
    let lowerFrameIndex = valuesWheelFrames.length - 2;
    let upperFrameIndex = valuesWheelFrames.length - 1;
    let sliceMix = 1;

    for (let index = 0; index < valuesWheelFrameStops.length - 1; index += 1) {
      const segmentStart = valuesWheelFrameStops[index];
      const segmentEnd = valuesWheelFrameStops[index + 1];

      if (clampedProgress <= segmentEnd || index === valuesWheelFrameStops.length - 2) {
        lowerFrameIndex = index;
        upperFrameIndex = index + 1;
        const segmentProgress =
          segmentEnd === segmentStart
            ? 1
            : clamp(
                (clampedProgress - segmentStart) / (segmentEnd - segmentStart)
              );
        sliceMix = easeSliceArrival(segmentProgress);
        break;
      }
    }

    const lowerFrame = valuesWheelFrames[lowerFrameIndex];
    const upperFrame = valuesWheelFrames[upperFrameIndex];
    const isSettled = clampedProgress >= 0.999;

    updateValuesHeading(clampedProgress);
    valuesWheel.classList.toggle("is-scroll-settled", isSettled);
    if (!isSettled) {
      clearHoverTimers();
      clearActiveSliceState();
      clearValueTooltip();
      applyValuesWheelRenderOrder();
    }

    wheelSlices.forEach(({ group, path, hitPath }, index) => {
      const from = lowerFrame.slices[index];
      const to = upperFrame.slices[index];
      const startAngle = lerp(from.startAngle, to.startAngle, sliceMix);
      const endAngle = lerp(from.endAngle, to.endAngle, sliceMix);
      const outerRadius = lerp(from.outerRadius, to.outerRadius, sliceMix);
      const innerRadius = lerp(from.innerRadius, to.innerRadius, sliceMix);
      const apexRadius = lerp(from.apexRadius, to.apexRadius, sliceMix);
      const translateX = lerp(from.translateX ?? 0, to.translateX ?? 0, sliceMix);
      const translateY = lerp(from.translateY ?? 0, to.translateY ?? 0, sliceMix);
      const lift = lerp(from.lift ?? 0, to.lift ?? 0, sliceMix);
      const rotation = lerp(
        valuesWheelStartRotation,
        valuesWheelEndRotation,
        clampedProgress
      );
      const scale = lerp(from.scale ?? 1, to.scale ?? 1, sliceMix);
      const sliceOpacity = lerp(from.opacity ?? 1, to.opacity ?? 1, sliceMix);
      const labelOpacity = lerp(
        lowerFrame.labelOpacity ?? 0,
        upperFrame.labelOpacity ?? 0,
        sliceMix
      );
      const slicePath = buildSlicePath({
        centerX: 350,
        centerY: 350,
        innerRadius,
        apexRadius,
        outerRadius,
        startAngle,
        endAngle,
      });

      group.style.setProperty("--frame-x", `${translateX}px`);
      group.style.setProperty("--frame-y", `${translateY}px`);
      group.style.setProperty("--frame-scale", String(scale));
      group.style.setProperty("--slice-lift", lift.toFixed(3));
      group.style.setProperty("--label-frame-x", `${translateX * 0.24}px`);
      group.style.setProperty("--label-frame-y", `${translateY * 0.24}px`);
      group.style.opacity = String(sliceOpacity);
      valuesWheelRotor.style.setProperty("--wheel-rotate", `${rotation}deg`);

      path.setAttribute("d", slicePath);
      hitPath.setAttribute("d", slicePath);

    });

    if (isSettled && !valuesWheel.classList.contains("has-active-tooltip")) {
      showDefaultValueTooltip();
    }
  };

  const queueSmoothValuesWheelMorph = () => {
    if (smoothnessFrame !== null) {
      return;
    }

    smoothnessFrame = window.requestAnimationFrame(() => {
      smoothnessFrame = null;

      if (activeSmoothness.catchup >= 1) {
        renderedWheelProgress = targetWheelProgress;
      } else {
        renderedWheelProgress = lerp(
          renderedWheelProgress,
          targetWheelProgress,
          activeSmoothness.catchup
        );

        if (Math.abs(targetWheelProgress - renderedWheelProgress) < 0.001) {
          renderedWheelProgress = targetWheelProgress;
        }
      }

      updateValuesWheelShape(renderedWheelProgress);

      if (renderedWheelProgress !== targetWheelProgress) {
        queueSmoothValuesWheelMorph();
      }
    });
  };

  const setValuesWheelTargetProgress = (progress, immediate = false) => {
    targetWheelProgress = clamp(progress);

    if (immediate || activeSmoothness.catchup >= 1) {
      renderedWheelProgress = targetWheelProgress;
      updateValuesWheelShape(renderedWheelProgress);
      return;
    }

    queueSmoothValuesWheelMorph();
  };

  const updateValuesWheelScrollMorph = () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValuesWheelTargetProgress(1, true);
      return;
    }

    if (!valuesSection) {
      setValuesWheelTargetProgress(1, true);
      return;
    }

    const rect = valuesWheel.getBoundingClientRect();
    const viewportHeight =
      window.innerHeight || document.documentElement.clientHeight;
    const wheelCenter = rect.top + rect.height * 0.5;
    const start = viewportHeight * valuesWheelScrollStart;
    const end = viewportHeight * valuesWheelScrollEnd;
    const rawProgress = (start - wheelCenter) / (start - end);

    setValuesWheelTargetProgress(rawProgress);
  };

  wheelSlices.forEach(({ group }, index) => {
    group.addEventListener("mouseenter", () => {
      activateSliceHover(group, index);
    });
    group.addEventListener("focus", () => {
      activateSliceHover(group, index, 0);
    });
    group.addEventListener("mouseleave", () => {
      clearSliceHover();
    });
    group.addEventListener("blur", () => {
      clearSliceHover();
    });
  });

  let valuesWheelFrame = null;

  const queueValuesWheelMorph = () => {
    if (valuesWheelFrame !== null) {
      return;
    }

    valuesWheelFrame = window.requestAnimationFrame(() => {
      valuesWheelFrame = null;
      updateValuesWheelScrollMorph();
    });
  };

  window.addEventListener("scroll", queueValuesWheelMorph, { passive: true });
  window.addEventListener("resize", queueValuesWheelMorph);
  updateValuesWheelScrollMorph();
};

initValuesWheel();
