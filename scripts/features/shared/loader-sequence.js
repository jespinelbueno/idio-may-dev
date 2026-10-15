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

export const initLoaderSequence = ({ shortIntro = false, onComplete = () => {} } = {}) => {
  const loader = document.querySelector(".loader");
  const loaderWord = document.querySelector("[data-loader-word]");
  const loaderLogo = document.querySelector("[data-loader-logo]");
  const loaderPhrase = document.querySelector(".loader__phrase");
  const loaderFixed = document.querySelector(".loader__fixed");
  const loaderWordSlot = document.querySelector(".loader__words");
  const textScreens = shortIntro ? LOADER_TEXT_SCREENS.slice(-1) : LOADER_TEXT_SCREENS;
  const loaderScreens = [...textScreens, LOADER_FINAL_SCREEN];
  const loaderScreenClasses = [...LOADER_TEXT_SCREENS, LOADER_FINAL_SCREEN].map(({ className }) => className);

  let activeLoaderText = textScreens[0].text;
  let loaderMeasureFrame = null;

  if (!loader || !loaderWord) {
    onComplete();
    return () => {};
  }

  let active = true;
  const timers = new Set();
  const schedule = (callback, delay) => {
    const timer = window.setTimeout(() => {
      timers.delete(timer);
      if (active) callback();
    }, delay);
    timers.add(timer);
  };

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
    schedule(() => setLoaderScreen(loaderScreens[screenIndex]), LOADER_SWAP_MS);
  };

  setLoaderScreen(loaderScreens[0]);
  loader.classList.add("is-initialized");
  measureLoaderWords();
  document.fonts?.ready.then(() => { if (active) measureLoaderWords(); }, () => {});
  window.addEventListener("resize", scheduleLoaderWordMeasure, { passive: true });

  loaderScreens.slice(1).forEach((_, index) => {
    schedule(() => advanceLoaderScreen(index + 1), LOADER_SCREEN_MS * (index + 1));
  });

  schedule(onComplete, LOADER_SCREEN_MS * (loaderScreens.length - 1) + LOADER_SWAP_MS + LOADER_FINAL_HOLD_MS);

  return () => {
    active = false;
    timers.forEach((timer) => window.clearTimeout(timer));
    timers.clear();
    window.removeEventListener("resize", scheduleLoaderWordMeasure);
    if (loaderMeasureFrame !== null) window.cancelAnimationFrame(loaderMeasureFrame);
  };
};
