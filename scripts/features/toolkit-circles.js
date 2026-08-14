export const initToolkitCircles = () => {
  const toolkitCircles = document.querySelectorAll(".what-offer__circle");
  
  if (!toolkitCircles.length) return;
  const toolkitMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const TOOLKIT_HOVER_MS = 2200;
  const TOOLKIT_RETURN_MS = 420;
  
  const getToolkitCircleState = (shape) => {
    const styles = window.getComputedStyle(shape);
  
    return {
      transform: styles.transform === "none" ? "rotate(0deg) scale(1)" : styles.transform,
      "--toolkit-sweep": styles.getPropertyValue("--toolkit-sweep").trim() || "302deg",
    };
  };
  
  const stopToolkitCircle = (shape) => {
    shape.getAnimations().forEach((animation) => animation.cancel());
  };
  
  const animateToolkitCircle = (circle) => {
    if (toolkitMotionQuery.matches || circle.classList.contains("is-toolkit-animating")) return;
  
    const shape = circle.querySelector(".what-offer__circle-shape");
    if (!shape) return;
  
    const currentState = getToolkitCircleState(shape);
    stopToolkitCircle(shape);
    circle.classList.add("is-toolkit-animating");
  
    shape.animate(
      [
        { ...currentState, offset: 0 },
        { transform: "rotate(48deg)", "--toolkit-sweep": "34deg", offset: 0.12 },
        { transform: "rotate(124deg)", "--toolkit-sweep": "192deg", offset: 0.24 },
        { transform: "rotate(214deg)", "--toolkit-sweep": "18deg", offset: 0.36 },
        { transform: "rotate(308deg)", "--toolkit-sweep": "218deg", offset: 0.49 },
        { transform: "rotate(398deg)", "--toolkit-sweep": "326deg", offset: 0.62 },
        { transform: "rotate(492deg)", "--toolkit-sweep": "266deg", offset: 0.75 },
        { transform: "rotate(584deg)", "--toolkit-sweep": "48deg", offset: 0.87 },
        { transform: "rotate(700deg)", "--toolkit-sweep": "302deg", offset: 1 },
      ],
      {
        duration: TOOLKIT_HOVER_MS,
        easing: "cubic-bezier(0.45, 0, 0.18, 1)",
        fill: "forwards",
      },
    );
  };
  
  const returnToolkitCircle = (circle) => {
    if (toolkitMotionQuery.matches) return;
  
    const shape = circle.querySelector(".what-offer__circle-shape");
    if (!shape) return;
  
    const currentState = getToolkitCircleState(shape);
    const restingRotation = window
      .getComputedStyle(shape)
      .getPropertyValue("--toolkit-resting-rotation")
      .trim();
    stopToolkitCircle(shape);
    circle.classList.remove("is-toolkit-animating");
  
    const returnAnimation = shape.animate(
      [
        currentState,
        {
          transform: `rotate(${restingRotation || "0deg"}) scale(1)`,
          "--toolkit-sweep": "302deg",
        },
      ],
      {
        duration: TOOLKIT_RETURN_MS,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        fill: "forwards",
      },
    );
  
    returnAnimation.finished.then(() => returnAnimation.cancel()).catch(() => {});
  };
  
  toolkitCircles.forEach((circle) => {
    circle.addEventListener("pointerenter", () => animateToolkitCircle(circle));
    circle.addEventListener("pointerleave", () => returnToolkitCircle(circle));
  });
};
