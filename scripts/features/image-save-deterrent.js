// A convenience deterrent only: public image URLs and screenshots remain available.
export const initImageSaveDeterrent = () => {
  const imageSelector = "img, picture, svg";
  if (!document.querySelector(imageSelector)) return;

  const preventImageSave = (event) => {
    if (event.target?.closest?.(imageSelector)) event.preventDefault();
  };

  // Delegation also covers carousel images and SVG artwork inserted after startup.
  document.addEventListener("contextmenu", preventImageSave, { capture: true });
  document.addEventListener("dragstart", preventImageSave, { capture: true });
};
