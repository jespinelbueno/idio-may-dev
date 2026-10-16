import { initLoaderSequence } from "../shared/loader-sequence.js";

export const initHomeLoader = () => {
  if (!document.querySelector(".loader") || !document.querySelector("[data-loader-word]")) return;
  let sequenceComplete = false;
  let pageLoaded = document.readyState === "complete";
  let revealed = false;
  const maybeRevealHomePage = () => {
    if (!sequenceComplete || !pageLoaded || revealed) return;
    revealed = true;
    window.idioPrivacy?.rememberIntroSeen();
    document.body.classList.remove("is-loading");
    document.body.classList.add("is-ready");
  };

  initLoaderSequence({
    shortIntro: window.idioPrivacy?.hasSeenIntro() === true,
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
