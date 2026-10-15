import { initLoaderSequence } from "../shared/loader-sequence.js";

export const initHomeLoader = () => {
  let sequenceComplete = false;
  let pageLoaded = document.readyState === "complete";
  const maybeRevealHomePage = () => {
    if (!sequenceComplete || !pageLoaded) return;
    document.body.classList.remove("is-loading");
    document.body.classList.add("is-ready");
  };

  initLoaderSequence({
    shortIntro: window.idioPrivacy?.allowsIntro() === true,
    onComplete: () => {
      sequenceComplete = true;
      maybeRevealHomePage();
    },
  });

  if (!pageLoaded) {
    window.addEventListener("load", () => {
      pageLoaded = true;
      maybeRevealHomePage();
    }, { once: true });
  }
};
