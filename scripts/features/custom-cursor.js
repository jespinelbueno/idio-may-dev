const INTERACTIVE_SELECTOR = [
  "a[href]",
  "button:not(:disabled)",
  "input:not(:disabled)",
  "select:not(:disabled)",
  "textarea:not(:disabled)",
  "summary",
  "[role='button']:not([aria-disabled='true'])",
  "[role='link']:not([aria-disabled='true'])",
  "[tabindex]:not([tabindex='-1']):not([aria-disabled='true'])",
].join(",");

export function initCustomCursor() {
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const cursor = document.createElement("div");
  const label = document.createElement("span");

  cursor.className = "custom-cursor";
  cursor.setAttribute("aria-hidden", "true");
  label.className = "custom-cursor__label";
  label.textContent = "click me";
  cursor.append(label);
  document.body.append(cursor);

  const setEnabled = () => {
    document.documentElement.classList.toggle("has-custom-cursor", finePointer.matches);

    if (!finePointer.matches) {
      cursor.classList.remove("is-visible", "is-interactive", "is-pressed");
    }
  };

  const syncInteractiveState = (target) => {
    const element = target instanceof Element ? target : null;
    cursor.classList.toggle("is-interactive", Boolean(element?.closest(INTERACTIVE_SELECTOR)));
  };

  document.addEventListener("pointermove", (event) => {
    if (!finePointer.matches || event.pointerType === "touch") {
      return;
    }

    cursor.style.left = `${event.clientX}px`;
    cursor.style.top = `${event.clientY}px`;
    cursor.classList.add("is-visible");
    syncInteractiveState(event.target);
  });

  document.addEventListener("pointerdown", (event) => {
    if (finePointer.matches && event.pointerType !== "touch") {
      cursor.classList.add("is-pressed");
    }
  });

  document.addEventListener("pointerup", () => cursor.classList.remove("is-pressed"));
  document.addEventListener("pointercancel", () => cursor.classList.remove("is-pressed"));
  document.documentElement.addEventListener("pointerleave", () => {
    cursor.classList.remove("is-visible", "is-interactive", "is-pressed");
  });
  window.addEventListener("blur", () => cursor.classList.remove("is-visible", "is-pressed"));
  finePointer.addEventListener("change", setEnabled);

  setEnabled();
}
