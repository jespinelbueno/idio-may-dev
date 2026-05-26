const setViewportHeight = () => {
  document.documentElement.style.setProperty("--hero-vh", `${window.innerHeight}px`);
};

setViewportHeight();
window.addEventListener("resize", setViewportHeight, { passive: true });

const DEBUG_LOADER = false;
const WORD_INTERVAL_MS = 900;
const WORD_SWAP_MS = 220;
const FINAL_HOLD_MS = 1000;

const loaderWord = document.querySelector("[data-loader-word]");
const loaderLogo = document.querySelector("[data-loader-logo]");
const loaderPhrase = document.querySelector(".loader__phrase");
const loaderWordSlot = document.querySelector(".loader__words");
const loaderWords = [
  { text: "word1", className: "loader__word--one" },
  { text: "word2", className: "loader__word--two" },
  { text: "word3", className: "loader__word--three" },
  { text: "word4", className: "loader__word--four" },
  { logo: true },
];
const FINAL_STATE_AT_MS = WORD_INTERVAL_MS * (loaderWords.length - 1) + WORD_SWAP_MS;
let loaderWordIndex = 0;
let loaderWordTimer;

const cycleLoaderWord = () => {
  if (!loaderWord) return;

  loaderWord.classList.add("is-changing");

  window.setTimeout(() => {
    loaderWordIndex = (loaderWordIndex + 1) % loaderWords.length;
    const nextWord = loaderWords[loaderWordIndex];

    if (nextWord.logo && loaderLogo) {
      showFinalLoaderState();
      return;
    }

    loaderWord.textContent = nextWord.text;
    loaderWord.className = `loader__word ${nextWord.className}`;
  }, WORD_SWAP_MS);
};

if (loaderWord) {
  loaderWordTimer = window.setInterval(cycleLoaderWord, WORD_INTERVAL_MS);
}

const showFinalLoaderState = () => {
  if (!loaderLogo) return;

  if (loaderWordTimer) {
    window.clearInterval(loaderWordTimer);
  }

  if (loaderWordSlot) {
    loaderWordSlot.classList.add("is-logo-state");
  }

  loaderLogo.hidden = false;
  loaderPhrase?.classList.add("is-logo-state");

  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      loaderLogo.classList.add("is-visible");
    });
  });
};

const revealHomePage = () => {
  document.body.classList.remove("is-loading");
  document.body.classList.add("is-ready");
};

const finishLoading = () => {
  window.setTimeout(() => {
    showFinalLoaderState();

    if (!DEBUG_LOADER) {
      window.setTimeout(revealHomePage, FINAL_HOLD_MS);
    }
  }, FINAL_STATE_AT_MS);
};

if (document.readyState === "complete") {
  finishLoading();
} else {
  window.addEventListener("load", finishLoading, { once: true });
}
