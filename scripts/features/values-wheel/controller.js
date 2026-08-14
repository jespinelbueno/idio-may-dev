import {
  valuesWheelCenterAngles,
  valuesWheelConfig,
  valuesWheelEndRotation,
  valuesWheelFrameStops,
  valuesWheelFrames,
  valuesWheelRenderOrder,
  radialOffset,
  valuesWheelScrollEnd,
  valuesWheelScrollStart,
  valuesWheelSmoothingFactor,
  valuesWheelStartRotation,
} from "./config.js";
import { buildSlicePath, clamp, easeSliceArrival, lerp, polarPoint } from "./geometry.js";

const SVG_NAMESPACE = "http://www.w3.org/2000/svg";

export const initValuesWheel = () => {
  const valuesSection = document.querySelector(".values-section");
  const valuesWheel = document.querySelector(".values-wheel");
  const valuesWheelGraphic = document.querySelector(".values-wheel-graphic");
  const valueTooltip = document.querySelector(".value-tooltip");
  const valueTooltipSwatch = document.querySelector(".value-tooltip-swatch");
  const valueTooltipTitle = document.querySelector(".value-tooltip-title");
  const valueTooltipCopy = document.querySelector(".value-tooltip-copy");
  const valuesCallouts = document.querySelector(".values-callouts");
  const valuesMobileList = document.querySelector(".values-mobile-list");

  if (!valuesWheel || !valuesWheelGraphic || !valueTooltip) {
    return;
  }

  const clearValueTooltip = () => {
    valuesWheel.classList.remove("has-active-tooltip");
    valuesWheel.classList.remove("has-hover-focus");
    valuesCallouts
      ?.querySelectorAll(".values-callout.is-active")
      .forEach((callout) => callout.classList.remove("is-active"));
    valuesCallouts
      ?.querySelectorAll(".values-wheel-arrow.is-active")
      .forEach((arrow) => arrow.classList.remove("is-active"));
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
    valuesCallouts
      ?.querySelectorAll(".values-callout")
      .forEach((callout) => {
        callout.classList.toggle(
          "is-active",
          callout.dataset.valueTitle === valueTitle
        );
      });
    valuesCallouts
      ?.querySelectorAll(".values-wheel-arrow")
      .forEach((arrow) => {
        arrow.classList.toggle(
          "is-active",
          arrow.dataset.valueTitle === valueTitle
        );
      });

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
    const rotor = document.createElementNS(SVG_NAMESPACE, "g");
    rotor.setAttribute("class", "values-wheel-rotor");
    rotor.style.setProperty("--wheel-rotate", "0deg");
    valuesWheelGraphic.appendChild(rotor);

    const slices = [];

    valuesWheelConfig.forEach((slice, index) => {
      const sliceCenterAngle =
        (slice.startAngle + slice.endAngle) / 2;
      const popPoint = polarPoint(0, 0, 24, sliceCenterAngle);

      const group = document.createElementNS(SVG_NAMESPACE, "g");
      group.setAttribute("class", "wheel-slice-group");
      group.setAttribute("role", "button");
      group.setAttribute("aria-label", `${slice.title}: ${slice.description}`);
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

      const hitPath = document.createElementNS(SVG_NAMESPACE, "path");
      hitPath.setAttribute("class", "wheel-slice-hitarea");

      const visual = document.createElementNS(SVG_NAMESPACE, "g");
      visual.setAttribute("class", "wheel-slice-visual");

      const path = document.createElementNS(SVG_NAMESPACE, "path");
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

  const { rotor: valuesWheelRotor, slices: wheelSlices } = buildValuesWheel();
  let targetWheelProgress = 0;
  let renderedWheelProgress = 0;
  let smoothnessFrame = null;
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

  const showSliceValue = (group, index, tooltipDelay = 0) => {
    setActiveSliceState(index);
    valuesWheel.classList.add("has-hover-focus");
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

    clearActiveSliceState();
    clearValueTooltip();
  };

  let hoverDebounceTimeout = null;
  let tooltipDelayTimeout = null;
  let hoverExitTimeout = null;
  let hoveredSliceIndex = null;

  const clearHoverTimers = () => {
    window.clearTimeout(hoverDebounceTimeout);
    window.clearTimeout(tooltipDelayTimeout);
    hoverDebounceTimeout = null;
    tooltipDelayTimeout = null;
  };

  const cancelHoverExit = () => {
    window.clearTimeout(hoverExitTimeout);
    hoverExitTimeout = null;
    valuesWheel.classList.remove("is-hover-exiting");
  };

  const activateSliceHover = (group, index, delay = 72) => {
    if (!valuesWheel.classList.contains("is-scroll-settled")) {
      return;
    }

    cancelHoverExit();
    clearHoverTimers();
    hoverDebounceTimeout = window.setTimeout(() => {
      showSliceValue(group, index, 240);
    }, delay);
  };

  const clearSliceHover = () => {
    clearHoverTimers();

    if (valuesWheel.classList.contains("is-scroll-settled")) {
      cancelHoverExit();
      valuesWheel.classList.add("is-hover-exiting");
      showDefaultValueTooltip();
      hoverExitTimeout = window.setTimeout(() => {
        valuesWheel.classList.remove("is-hover-exiting");
        hoverExitTimeout = null;
      }, 1200);
      return;
    }

    cancelHoverExit();
    clearActiveSliceState();
    clearValueTooltip();
  };

  const activateSliceFromPointer = (event) => {
    const group = event.target.closest?.(".wheel-slice-group");

    if (!group) {
      return;
    }

    const index = Number(group.dataset.sliceIndex);

    if (index === hoveredSliceIndex || Number.isNaN(index)) {
      return;
    }

    hoveredSliceIndex = index;
    activateSliceHover(group, index, 0);
  };

  const clearPointerSliceHover = () => {
    hoveredSliceIndex = null;
    clearSliceHover();
  };

  const clearPointerSliceOnExit = (event) => {
    const nextTarget = event.relatedTarget;

    if (nextTarget && valuesWheelGraphic.contains(nextTarget)) {
      return;
    }

    clearPointerSliceHover();
  };

  const clearPointerSliceOutsideWheel = (event) => {
    if (
      hoveredSliceIndex === null ||
      valuesWheelGraphic.contains(event.target)
    ) {
      return;
    }

    clearPointerSliceHover();
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

  if (valuesCallouts) {
    const arrows = valuesWheelConfig
      .map(
        ({ title, position }) => `
          <img
            class="values-wheel-arrow is-${position}"
            src="assets/arrows/wheelarrowsvg.svg"
            data-value-title="${title}"
            alt=""
            aria-hidden="true"
          >
        `
      )
      .join("");
    const callouts = valuesWheelConfig
      .map(
        ({ title, description, position, fill }) => `
          <article class="values-callout is-${position}" data-value-title="${title}" style="--value-color:${fill};">
            <div class="values-callout-content">
              <div class="values-callout-heading">
                <span class="values-callout-swatch"></span>
                <h3>${title}</h3>
              </div>
              <p>${description}</p>
            </div>
          </article>
        `
      )
      .join("");
    valuesCallouts.innerHTML = `${arrows}${callouts}`;
  }

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

    if (
      isSettled &&
      !valuesWheel.classList.contains("has-active-tooltip") &&
      !valuesWheel.classList.contains("has-hover-focus")
    ) {
      showDefaultValueTooltip();
    }
  };

  const queueSmoothValuesWheelMorph = () => {
    if (smoothnessFrame !== null) {
      return;
    }

    smoothnessFrame = window.requestAnimationFrame(() => {
      smoothnessFrame = null;

      if (valuesWheelSmoothingFactor >= 1) {
        renderedWheelProgress = targetWheelProgress;
      } else {
        renderedWheelProgress = lerp(
          renderedWheelProgress,
          targetWheelProgress,
          valuesWheelSmoothingFactor
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

    if (targetWheelProgress >= 1 || immediate || valuesWheelSmoothingFactor >= 1) {
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

  valuesWheelGraphic.addEventListener("pointerover", activateSliceFromPointer);
  valuesWheelGraphic.addEventListener("pointermove", activateSliceFromPointer);
  valuesWheelGraphic.addEventListener("pointerout", clearPointerSliceOnExit);
  valuesWheelGraphic.addEventListener("pointerleave", clearPointerSliceOnExit);
  document.addEventListener("pointermove", clearPointerSliceOutsideWheel, {
    passive: true,
  });

  wheelSlices.forEach(({ group }, index) => {
    group.addEventListener("focus", () => {
      hoveredSliceIndex = index;
      activateSliceHover(group, index, 0);
    });
    group.addEventListener("blur", () => {
      hoveredSliceIndex = null;
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
