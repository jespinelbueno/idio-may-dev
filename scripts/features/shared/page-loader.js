import { initLoaderSequence } from "./loader-sequence.js";

export const initPageLoader = () => {
  const loader = document.querySelector(".loader--page");
  const controller = window.idioPageLoader;
  if (!loader || !controller || !document.documentElement.classList.contains("is-page-loading")) return;

  document.body.classList.add("is-loading");
  // Keep keyboard focus and screen readers on the loading status until reveal.
  const content = [...document.querySelectorAll("body > header, body > main, body > footer, body > a")];
  const previousInert = content.map((element) => element.inert);
  content.forEach((element) => { element.inert = true; });
  let stopSequence;
  window.addEventListener("idio:page-ready", () => {
    stopSequence?.();
    content.forEach((element, index) => { element.inert = previousInert[index]; });
  }, { once: true });

  const sequenceComplete = new Promise((resolve) => {
    stopSequence = initLoaderSequence({ shortIntro: true, onComplete: resolve });
  });

  const loaded = document.readyState === "complete" ? Promise.resolve() : new Promise((resolve) => {
    window.addEventListener("load", resolve, { once: true });
  });

  const preparePage = async () => {
    await loaded;
    await document.fonts?.ready;
    // Decode the images in view, including lazy images reached by a deep link.
    // Offscreen images and continuous video playback do not gate the reveal.
    const visibleImages = [...document.images].filter((image) => {
      const rect = image.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.right > 0
        && rect.top < window.innerHeight && rect.left < window.innerWidth;
    });
    await Promise.allSettled(visibleImages.map((image) => image.decode?.()));
    // Allow font/image layout updates and page modules a rendering opportunity.
    await new Promise((resolve) => window.requestAnimationFrame(() => window.requestAnimationFrame(resolve)));
  };

  // Resource failures still preserve the full short intro before revealing.
  Promise.all([sequenceComplete, preparePage().catch(() => {})]).then(controller.finish);
};
