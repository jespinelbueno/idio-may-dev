const LOADER_TEXT_SCREENS = [
  { text: "interesting", className: "loader--interesting" },
  { text: "creative", className: "loader--creative" },
  { text: "original", className: "loader--original" },
  { text: "striking", className: "loader--striking" },
  { text: "distinct", className: "loader--distinct" },
  { text: "unique", className: "loader--unique" },
  { text: "novel", className: "loader--novel" },
  { text: "yours", className: "loader--yours" },
];

const LOADER_FINAL_SCREEN = { logo: true, className: "loader--idio" };
const LOADER_SCREEN_MS = 650;
const LOADER_SWAP_MS = 120;
const LOADER_FINAL_HOLD_MS = 950;

export const initHomeLoader = () => {
  const loader = document.querySelector(".loader");
  const loaderWord = document.querySelector("[data-loader-word]");
  const loaderLogo = document.querySelector("[data-loader-logo]");
  const loaderPhrase = document.querySelector(".loader__phrase");
  const loaderFixed = document.querySelector(".loader__fixed");
  const loaderWordSlot = document.querySelector(".loader__words");
  const loaderScreens = [...LOADER_TEXT_SCREENS, LOADER_FINAL_SCREEN];
  const loaderScreenClasses = loaderScreens.map(({ className }) => className);

  let activeLoaderText = LOADER_TEXT_SCREENS[0].text;
  let loaderSequenceComplete = false;
  let loaderPageLoaded = document.readyState === "complete";
  let loaderMeasureFrame = null;

  const revealHomePage = () => {
    document.body.classList.remove("is-loading");
    document.body.classList.add("is-ready");
  };

  const maybeRevealHomePage = () => {
    if (loaderSequenceComplete && loaderPageLoaded) {
      revealHomePage();
    }
  };

  if (!loader || !loaderWord) {
    loaderSequenceComplete = true;
    maybeRevealHomePage();
    return;
  }

  const applyLoaderTheme = (className) => {
    loader.classList.remove(...loaderScreenClasses);
    loader.classList.add(className);
  };

  const measureLoaderWords = () => {
    const fixedRect = loaderFixed?.getBoundingClientRect();

    if (fixedRect) {
      loaderPhrase?.style.setProperty("--loader-phrase-height", `${fixedRect.height}px`);
    }

    loaderWordSlot?.style.setProperty("--loader-word-axis-offset", "0em");
  };

  const scheduleLoaderWordMeasure = () => {
    if (loaderMeasureFrame !== null) {
      window.cancelAnimationFrame(loaderMeasureFrame);
    }

    loaderMeasureFrame = window.requestAnimationFrame(() => {
      loaderMeasureFrame = null;
      measureLoaderWords();
    });
  };

  const showFinalLoaderState = () => {
    loaderWordSlot?.classList.add("is-logo-state");
    loaderPhrase?.classList.add("is-logo-state");

    if (!loaderLogo) return;

    loaderLogo.hidden = false;
    void loaderLogo.offsetWidth;
    loaderLogo.classList.add("is-visible");
  };

  const setLoaderScreen = (screen) => {
    applyLoaderTheme(screen.className);

    if (screen.logo) {
      showFinalLoaderState();
      return;
    }

    loaderLogo?.classList.remove("is-visible");
    if (loaderLogo) loaderLogo.hidden = true;
    loaderWordSlot?.classList.remove("is-logo-state");
    loaderPhrase?.classList.remove("is-logo-state");

    activeLoaderText = screen.text;
    loaderWord.textContent = activeLoaderText;
    loaderWord.dataset.word = activeLoaderText;
    loaderWord.className = "loader__word";
    measureLoaderWords();
  };

  const advanceLoaderScreen = (screenIndex) => {
    loaderWord.classList.add("is-changing");
    window.setTimeout(() => setLoaderScreen(loaderScreens[screenIndex]), LOADER_SWAP_MS);
  };

  setLoaderScreen(loaderScreens[0]);
  measureLoaderWords();
  document.fonts?.ready.then(measureLoaderWords);
  window.addEventListener("resize", scheduleLoaderWordMeasure, { passive: true });

  loaderScreens.slice(1).forEach((_, index) => {
    window.setTimeout(() => advanceLoaderScreen(index + 1), LOADER_SCREEN_MS * (index + 1));
  });

  window.setTimeout(() => {
    loaderSequenceComplete = true;
    maybeRevealHomePage();
  }, LOADER_SCREEN_MS * (loaderScreens.length - 1) + LOADER_FINAL_HOLD_MS);

  if (loaderPageLoaded) {
    maybeRevealHomePage();
  } else {
    window.addEventListener(
      "load",
      () => {
        loaderPageLoaded = true;
        maybeRevealHomePage();
      },
      { once: true },
    );
  }
};
