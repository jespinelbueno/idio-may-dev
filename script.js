const setViewportHeight = () => {
  document.documentElement.style.setProperty("--hero-vh", `${window.innerHeight}px`);
};

setViewportHeight();
window.addEventListener("resize", setViewportHeight, { passive: true });

const DEBUG_LOADER = false;
const DEBUG_LOADER_WORD = ""; // Set to "distinct", "novel", "yours", etc. to pause there.
const LOADER_SCREEN_MS = 650;
const LOADER_SWAP_MS = 120;
const FINAL_HOLD_MS = 950;
const LOADER_WORD_Y_OFFSETS = {
  creative: "0.04em",
  interesting: "0.05em",
  original: "0.04em",
  striking: "0.04em",
  unique: "0em",
  distinct: "0.04em",
  novel: "-0.09em",
  yours: "-0.09em",
};

const loader = document.querySelector(".loader");
const loaderWord = document.querySelector("[data-loader-word]");
const loaderLogo = document.querySelector("[data-loader-logo]");
const loaderPhrase = document.querySelector(".loader__phrase");
const loaderFixed = document.querySelector(".loader__fixed");
const loaderWordSlot = document.querySelector(".loader__words");
const heroHeadline = document.querySelector(".hero__headline");
const heroLogo = document.querySelector(".hero__logo");
const loaderScreens = [
  { text: "creative", className: "loader--creative" },
  { text: "interesting", className: "loader--interesting" },
  { text: "original", className: "loader--original" },
  { text: "striking", className: "loader--striking" },
  { text: "unique", className: "loader--unique" },
  { text: "distinct", className: "loader--distinct" },
  { text: "novel", className: "loader--novel" },
  { text: "yours", className: "loader--yours" },
  { logo: true, className: "loader--idio" },
];
const loaderScreenClasses = loaderScreens.map(({ className }) => className);
const loaderTextScreens = loaderScreens.filter(({ text }) => text);
const loaderWordWidths = new Map();
let loaderSequenceComplete = false;
let loaderPageLoaded = document.readyState === "complete";
let activeLoaderText = loaderTextScreens[0]?.text ?? "";
let loaderWordTargetWidth = 0;
let loaderMeasureFrame;

const applyLoaderTheme = (className) => {
  if (!loader) return;

  loader.classList.remove(...loaderScreenClasses);
  loader.classList.add(className);
};

const showFinalLoaderState = () => {
  if (!loaderLogo) return;

  if (loaderWordSlot) {
    loaderWordSlot.classList.add("is-logo-state");
  }

  loaderLogo.hidden = false;
  loaderPhrase?.classList.add("is-logo-state");

  void loaderLogo.offsetWidth;
  loaderLogo.classList.add("is-visible");
};

const setLoaderWordFit = (text) => {
  if (!loaderWord || !loaderWordTargetWidth) return;

  const wordWidth = loaderWordWidths.get(text);
  const scale = wordWidth ? loaderWordTargetWidth / wordWidth : 1;
  loaderWord.style.fontSize = `${scale.toFixed(4)}em`;
  loaderWordSlot?.style.setProperty("--loader-word-axis-offset", LOADER_WORD_Y_OFFSETS[text] ?? "0em");
};

const measureLoaderWords = () => {
  if (!loaderPhrase || !loaderTextScreens.length) return;

  loaderWordWidths.clear();
  loaderWordTargetWidth = 0;

  loaderTextScreens.forEach(({ text }) => {
    const measureWord = document.createElement("span");
    measureWord.className = "loader__word loader__word--measure";
    measureWord.textContent = text;
    loaderPhrase.appendChild(measureWord);

    const wordWidth = measureWord.getBoundingClientRect().width;
    loaderWordWidths.set(text, wordWidth);
    loaderWordTargetWidth = Math.max(loaderWordTargetWidth, wordWidth);

    measureWord.remove();
  });

  const fixedRect = loaderFixed?.getBoundingClientRect();
  const fixedWidth = fixedRect?.width ?? 0;
  const heroPhraseRect = heroHeadline?.getBoundingClientRect();
  const heroLogoRect = heroLogo?.getBoundingClientRect();

  if (fixedRect) {
    loaderPhrase.style.setProperty("--loader-phrase-height", `${fixedRect.height}px`);
  }

  if (heroPhraseRect && heroLogoRect) {
    const logoOffset = heroLogoRect.left - heroPhraseRect.left;
    const contentGap = logoOffset - fixedWidth;

    loaderWordTargetWidth = heroPhraseRect.right - heroLogoRect.left;
    loaderPhrase.style.setProperty("--loader-phrase-width", `${heroPhraseRect.width}px`);
    loaderPhrase.style.setProperty("--loader-content-gap", `${contentGap}px`);
    loaderPhrase.style.setProperty("--loader-logo-offset", `${logoOffset}px`);
  } else {
    const phraseStyles = window.getComputedStyle(loaderPhrase);
    const phraseGap = Number.parseFloat(phraseStyles.columnGap || phraseStyles.gap) || 0;
    const phraseFontSize = Number.parseFloat(phraseStyles.fontSize) || 0;
    const logoSlotWidth = phraseStyles.getPropertyValue("--loader-logo-slot-width").trim();
    const logoSlotWidthEm = Number.parseFloat(logoSlotWidth) || 0;

    loaderWordTargetWidth = logoSlotWidthEm * phraseFontSize;
    loaderPhrase.style.setProperty(
      "--loader-phrase-width",
      `${fixedWidth + phraseGap + loaderWordTargetWidth}px`,
    );
    loaderPhrase.style.removeProperty("--loader-content-gap");
    loaderPhrase.style.removeProperty("--loader-logo-offset");
  }

  setLoaderWordFit(activeLoaderText);
};

const scheduleLoaderWordMeasure = () => {
  if (loaderMeasureFrame) {
    window.cancelAnimationFrame(loaderMeasureFrame);
  }

  loaderMeasureFrame = window.requestAnimationFrame(() => {
    loaderMeasureFrame = undefined;
    measureLoaderWords();
  });
};

const setLoaderScreen = (screen) => {
  applyLoaderTheme(screen.className);

  if (screen.logo) {
    showFinalLoaderState();
    return;
  }

  if (loaderLogo) {
    loaderLogo.classList.remove("is-visible");
    loaderLogo.hidden = true;
  }

  if (loaderWordSlot) {
    loaderWordSlot.classList.remove("is-logo-state");
  }

  loaderPhrase?.classList.remove("is-logo-state");

  if (loaderWord) {
    activeLoaderText = screen.text;
    loaderWord.textContent = screen.text;
    loaderWord.dataset.word = screen.text;
    loaderWord.className = "loader__word";
    setLoaderWordFit(screen.text);
  }
};

const revealHomePage = () => {
  document.body.classList.remove("is-loading");
  document.body.classList.add("is-ready");
};

const maybeRevealHomePage = () => {
  if (!DEBUG_LOADER && loaderSequenceComplete && loaderPageLoaded) {
    revealHomePage();
  }
};

const advanceLoaderScreen = (screenIndex) => {
  if (!loaderWord) return;

  loaderWord.classList.add("is-changing");

  window.setTimeout(() => {
    setLoaderScreen(loaderScreens[screenIndex]);
  }, LOADER_SWAP_MS);
};

const runLoaderSequence = () => {
  if (!loader || !loaderWord) {
    loaderSequenceComplete = true;
    maybeRevealHomePage();
    return;
  }

  setLoaderScreen(loaderScreens[0]);

  if (DEBUG_LOADER_WORD) {
    const debugScreen = loaderTextScreens.find(({ text }) => text === DEBUG_LOADER_WORD);

    if (debugScreen) {
      setLoaderScreen(debugScreen);
    }

    return;
  }

  loaderScreens.slice(1).forEach((_, index) => {
    window.setTimeout(() => {
      advanceLoaderScreen(index + 1);
    }, LOADER_SCREEN_MS * (index + 1));
  });

  window.setTimeout(() => {
    loaderSequenceComplete = true;
    maybeRevealHomePage();
  }, LOADER_SCREEN_MS * (loaderScreens.length - 1) + FINAL_HOLD_MS);
};

measureLoaderWords();
document.fonts?.ready.then(measureLoaderWords);
window.addEventListener("resize", scheduleLoaderWordMeasure, { passive: true });

runLoaderSequence();

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

const caseStudies = [
  {
    title: "case study 1",
    description:
      "Lorem ipsum dolor sit amet consectetur. Nulla fringilla vulputate venenatis nam suspendisse enim egestas pellentesque mauris.",
    image: "assets/img/photos/casestudymain_cropped.jpg",
    cards: {
      front: "var(--paper)",
      middle: "var(--brand-green)",
      back: "var(--brand-olive)",
      backWindow: "#dfe8e4",
      middleWindow: "#dfe8e4",
    },
  },
  {
    title: "case study 2",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer vitae nibh at arcu pretium gravida sed a sem.",
    image: "assets/img/photos/imgportrait.png",
    cards: {
      front: "var(--brand-green)",
      middle: "var(--brand-olive)",
      back: "var(--brand-blue)",
      backWindow: "#dce9f1",
      middleWindow: "#edf1d5",
    },
  },
  {
    title: "case study 3",
    description:
      "Lorem ipsum dolor sit amet, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua vivamus.",
    image: "assets/img/photos/imgstilllive.png",
    cards: {
      front: "var(--brand-olive)",
      middle: "var(--brand-blue)",
      back: "var(--brand-tan)",
      backWindow: "#f4e7cb",
      middleWindow: "#dfeaf1",
    },
  },
  {
    title: "case study 4",
    description:
      "Lorem ipsum dolor sit amet consectetur. Praesent commodo cursus magna, vel scelerisque nisl consectetur et.",
    image: "assets/img/photos/imgmotion.png",
    cards: {
      front: "var(--brand-blue)",
      middle: "var(--brand-tan)",
      back: "var(--brand-green)",
      backWindow: "#eaf0dc",
      middleWindow: "#f2e4c4",
    },
  },
];

const caseStudyMedia = document.querySelector(".case-study__media");
const caseStudyPolaroid = document.querySelector(".case-study__polaroid");
let caseStudyImage = caseStudyPolaroid?.querySelector("img");
const caseStudyDetails = document.querySelector("[data-case-details]");
const caseStudyTitle = document.querySelector("#case-study-title");
const caseStudyDescription = caseStudyDetails?.querySelector("p");
const caseStudyDots = Array.from(document.querySelectorAll(".case-study__dot[data-case-index]"));
let activeCaseStudyIndex = 0;
let caseStudyShuffleTimer;
let caseStudyContentTimer;
let caseStudyImageTimer;
let caseStudyImageRequest = 0;

caseStudies.forEach(({ image }) => {
  const preload = new Image();
  preload.src = image;
});

const setActiveCaseStudyDot = (nextIndex) => {
  caseStudyDots.forEach((dot) => {
    const isActive = Number(dot.dataset.caseIndex) === nextIndex;
    dot.classList.toggle("is-active", isActive);
    dot.setAttribute("aria-pressed", String(isActive));
  });
};

const setCaseStudyCardColors = (nextCaseStudy) => {
  if (!caseStudyMedia || !nextCaseStudy?.cards) return;

  caseStudyMedia.style.setProperty("--case-front-color", nextCaseStudy.cards.front);
  caseStudyMedia.style.setProperty("--case-back-color", nextCaseStudy.cards.back);
  caseStudyMedia.style.setProperty("--case-middle-color", nextCaseStudy.cards.middle);
  caseStudyMedia.style.setProperty("--case-back-window-color", nextCaseStudy.cards.backWindow);
  caseStudyMedia.style.setProperty("--case-middle-window-color", nextCaseStudy.cards.middleWindow);
};

const runCaseStudyShuffle = () => {
  if (!caseStudyMedia) return;

  window.clearTimeout(caseStudyShuffleTimer);
  caseStudyMedia.classList.remove("is-shuffling");
  void caseStudyMedia.offsetWidth;
  caseStudyMedia.classList.add("is-shuffling");

  caseStudyShuffleTimer = window.setTimeout(() => {
    caseStudyMedia.classList.remove("is-shuffling");
  }, 900);
};

const transitionCaseStudyImage = (nextImage) => {
  if (!caseStudyPolaroid || !caseStudyImage || caseStudyImage.getAttribute("src") === nextImage) return;

  const requestId = ++caseStudyImageRequest;
  const previousImage = caseStudyImage;
  const incomingImage = new Image();

  window.clearTimeout(caseStudyImageTimer);
  caseStudyPolaroid.querySelectorAll("img:not(.is-active)").forEach((image) => {
    image.remove();
  });

  incomingImage.className = "case-study__image";
  incomingImage.alt = previousImage.alt;
  incomingImage.style.opacity = "0";
  incomingImage.style.transform = "scale(1.018)";
  incomingImage.src = nextImage;
  caseStudyPolaroid.append(incomingImage);

  const revealIncomingImage = () => {
    if (requestId !== caseStudyImageRequest) {
      incomingImage.remove();
      return;
    }

    void caseStudyPolaroid.offsetWidth;
    incomingImage.classList.add("is-active");
    previousImage.classList.remove("is-active");
    previousImage.classList.add("is-exiting");
    incomingImage.style.opacity = "1";
    incomingImage.style.transform = "scale(1)";
    previousImage.style.opacity = "0";
    previousImage.style.transform = "scale(0.996)";

    caseStudyImage = incomingImage;
    const removePreviousImage = () => {
      incomingImage.removeEventListener("transitionend", handleImageTransitionEnd);
      incomingImage.style.opacity = "1";
      incomingImage.style.transform = "scale(1)";
      previousImage.remove();
    };
    const handleImageTransitionEnd = (event) => {
      if (event.target === incomingImage && event.propertyName === "opacity") {
        removePreviousImage();
      }
    };

    incomingImage.addEventListener("transitionend", handleImageTransitionEnd);
    caseStudyImageTimer = window.setTimeout(removePreviousImage, 1600);
  };

  if (incomingImage.decode) {
    incomingImage.decode().then(revealIncomingImage).catch(revealIncomingImage);
    return;
  }

  if (incomingImage.complete) {
    revealIncomingImage();
    return;
  }

  incomingImage.addEventListener("load", revealIncomingImage, { once: true });
  incomingImage.addEventListener("error", revealIncomingImage, { once: true });
};

const updateCaseStudyContent = (nextIndex) => {
  const nextCaseStudy = caseStudies[nextIndex];

  if (!nextCaseStudy || !caseStudyTitle || !caseStudyDescription || !caseStudyImage) return;

  window.clearTimeout(caseStudyContentTimer);
  caseStudyDetails?.classList.add("is-changing");

  caseStudyContentTimer = window.setTimeout(() => {
    caseStudyTitle.textContent = nextCaseStudy.title;
    caseStudyDescription.textContent = nextCaseStudy.description;
    transitionCaseStudyImage(nextCaseStudy.image);
    caseStudyDetails?.classList.remove("is-changing");
  }, 160);
};

const selectCaseStudy = (nextIndex) => {
  const nextCaseStudy = caseStudies[nextIndex];

  if (nextIndex === activeCaseStudyIndex || !nextCaseStudy) return;

  activeCaseStudyIndex = nextIndex;
  setActiveCaseStudyDot(nextIndex);
  setCaseStudyCardColors(nextCaseStudy);
  runCaseStudyShuffle();
  updateCaseStudyContent(nextIndex);
};

caseStudyDots.forEach((dot) => {
  dot.addEventListener("click", () => {
    selectCaseStudy(Number(dot.dataset.caseIndex));
  });
});
