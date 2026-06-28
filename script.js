const setViewportHeight = () => {
  document.documentElement.style.setProperty("--hero-vh", `${window.innerHeight}px`);
};

setViewportHeight();
window.addEventListener("resize", setViewportHeight, { passive: true });

const loaderDebugParams = new URLSearchParams(window.location.search);
const loaderDebugQuery = loaderDebugParams.get("loaderDebug");
const DEBUG_LOADER =
  false || (loaderDebugQuery !== null && !["0", "false", "off"].includes(loaderDebugQuery.toLowerCase()));
const DEBUG_LOADER_WORD = loaderDebugParams.get("loaderWord") || ""; // Set to "distinct", "novel", "yours", etc. to pause there.
const SHOW_LOADER_DEBUGGER = DEBUG_LOADER || Boolean(DEBUG_LOADER_WORD);
const LOADER_SCREEN_MS = 650;
const LOADER_SWAP_MS = 120;
const FINAL_HOLD_MS = 950;
const LOADER_DEBUG_STORAGE_KEY = "idio-loader-word-y-offsets";
const LOADER_WORD_Y_OFFSETS = {
  creative: "0.1em",
  interesting: "0.03em",
  original: "0.12em",
  striking: "0.12em",
  unique: "0.16em",
  distinct: "0.1em",
  novel: "0.2em",
  yours: "0.21em",
};

const loadSavedLoaderOffsets = () => {
  if (!SHOW_LOADER_DEBUGGER) return;

  try {
    const savedOffsets = JSON.parse(window.localStorage.getItem(LOADER_DEBUG_STORAGE_KEY) || "{}");

    Object.entries(savedOffsets).forEach(([text, offset]) => {
      if (text in LOADER_WORD_Y_OFFSETS && typeof offset === "string") {
        LOADER_WORD_Y_OFFSETS[text] = offset;
      }
    });
  } catch {
    window.localStorage?.removeItem(LOADER_DEBUG_STORAGE_KEY);
  }
};

const saveLoaderOffsets = () => {
  if (!SHOW_LOADER_DEBUGGER) return;

  window.localStorage?.setItem(LOADER_DEBUG_STORAGE_KEY, JSON.stringify(LOADER_WORD_Y_OFFSETS));
};

loadSavedLoaderOffsets();

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
let loaderDebugger;

const applyLoaderTheme = (className) => {
  if (!loader) return;

  loader.classList.remove(...loaderScreenClasses);
  loader.classList.add(className);
};

const parseLoaderOffset = (value) => Number.parseFloat(String(value).replace("em", "")) || 0;

const formatLoaderOffset = (value) => {
  const rounded = Math.round(value * 100) / 100;

  return `${Object.is(rounded, -0) ? 0 : rounded}em`;
};

const getLoaderTextRect = (element) => {
  if (!element) return undefined;

  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      return node.textContent.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    },
  });
  const textNode = walker.nextNode();

  if (!textNode) return element.getBoundingClientRect();

  const text = textNode.textContent;
  const firstVisibleCharacter = text.search(/\S/);
  const lastVisibleCharacter = text.length - (text.match(/\s*$/)?.[0].length ?? 0);
  const range = document.createRange();

  range.setStart(textNode, firstVisibleCharacter);
  range.setEnd(textNode, lastVisibleCharacter);

  const rect = range.getBoundingClientRect();
  range.detach?.();

  return rect.width || rect.height ? rect : element.getBoundingClientRect();
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
  updateLoaderDebugger();
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

const getLoaderDebugMeasurements = () => {
  if (!loaderFixed || !loaderWord) return undefined;

  const fixedRect = getLoaderTextRect(loaderFixed);
  const wordRect = getLoaderTextRect(loaderWord);

  if (!fixedRect || !wordRect) return undefined;

  const fixedCenter = fixedRect.top + fixedRect.height / 2;
  const wordCenter = wordRect.top + wordRect.height / 2;

  return {
    centerDelta: fixedCenter - wordCenter,
    bottomDelta: fixedRect.bottom - wordRect.bottom,
    fixedWidth: fixedRect.width,
    wordWidth: wordRect.width,
  };
};

const getLoaderOffsetsForCopy = () => {
  const rows = loaderTextScreens.map(({ text }) => `  ${text}: "${LOADER_WORD_Y_OFFSETS[text] ?? "0em"}",`);

  return `const LOADER_WORD_Y_OFFSETS = {\n${rows.join("\n")}\n};`;
};

const updateLoaderDebugger = () => {
  if (!loaderDebugger || !loaderWord) return;

  const offset = parseLoaderOffset(LOADER_WORD_Y_OFFSETS[activeLoaderText] ?? "0em");
  const measurements = getLoaderDebugMeasurements();

  loaderDebugger.word.value = activeLoaderText;
  loaderDebugger.range.value = String(offset);
  loaderDebugger.number.value = offset.toFixed(2);
  loaderDebugger.output.value = getLoaderOffsetsForCopy();

  if (measurements) {
    loaderDebugger.metrics.innerHTML = [
      `<span>center ${measurements.centerDelta.toFixed(1)}px</span>`,
      `<span>bottom ${measurements.bottomDelta.toFixed(1)}px</span>`,
      `<span>word ${measurements.wordWidth.toFixed(1)}px</span>`,
      `<span>fixed ${measurements.fixedWidth.toFixed(1)}px</span>`,
    ].join("");
  }
};

const setLoaderDebugOffset = (value) => {
  const offset = Math.max(-0.5, Math.min(0.5, Number.parseFloat(value) || 0));

  LOADER_WORD_Y_OFFSETS[activeLoaderText] = formatLoaderOffset(offset);
  saveLoaderOffsets();
  setLoaderWordFit(activeLoaderText);
};

const copyLoaderDebugOffsets = async () => {
  if (!loaderDebugger) return;

  const offsets = getLoaderOffsetsForCopy();
  loaderDebugger.output.hidden = false;
  loaderDebugger.output.value = offsets;
  loaderDebugger.output.select();

  try {
    await navigator.clipboard?.writeText(offsets);
    loaderDebugger.copy.textContent = "copied";
  } catch {
    document.execCommand?.("copy");
    loaderDebugger.copy.textContent = "selected";
  }

  window.setTimeout(() => {
    if (loaderDebugger) {
      loaderDebugger.copy.textContent = "copy offsets";
    }
  }, 1200);
};

const createLoaderDebugger = () => {
  if (!SHOW_LOADER_DEBUGGER || loaderDebugger || !loader) return;

  const panel = document.createElement("aside");
  panel.className = "loader-debugger";
  panel.innerHTML = `
    <div class="loader-debugger__header">
      <strong>loader debugger</strong>
      <span>?loaderDebug=1</span>
    </div>
    <label class="loader-debugger__field">
      word
      <select data-loader-debug-word></select>
    </label>
    <label class="loader-debugger__field">
      y offset em
      <input data-loader-debug-range type="range" min="-0.5" max="0.5" step="0.01">
    </label>
    <div class="loader-debugger__row">
      <button type="button" data-loader-debug-nudge="-0.01">up</button>
      <input data-loader-debug-number type="number" min="-0.5" max="0.5" step="0.01">
      <button type="button" data-loader-debug-nudge="0.01">down</button>
    </div>
    <div class="loader-debugger__metrics" data-loader-debug-metrics></div>
    <div class="loader-debugger__row">
      <button class="loader-debugger__copy" type="button" data-loader-debug-copy>copy offsets</button>
      <button type="button" data-loader-debug-reset>clear saved</button>
    </div>
    <textarea class="loader-debugger__output" data-loader-debug-output readonly hidden></textarea>
  `;

  const wordSelect = panel.querySelector("[data-loader-debug-word]");

  loaderTextScreens.forEach(({ text }) => {
    const option = document.createElement("option");
    option.value = text;
    option.textContent = text;
    wordSelect.appendChild(option);
  });

  loader.appendChild(panel);

  loaderDebugger = {
    panel,
    word: wordSelect,
    range: panel.querySelector("[data-loader-debug-range]"),
    number: panel.querySelector("[data-loader-debug-number]"),
    metrics: panel.querySelector("[data-loader-debug-metrics]"),
    copy: panel.querySelector("[data-loader-debug-copy]"),
    output: panel.querySelector("[data-loader-debug-output]"),
  };

  loaderDebugger.word.addEventListener("change", () => {
    const screen = loaderTextScreens.find(({ text }) => text === loaderDebugger.word.value);

    if (screen) {
      setLoaderScreen(screen);
    }
  });

  loaderDebugger.range.addEventListener("input", () => {
    setLoaderDebugOffset(loaderDebugger.range.value);
  });

  loaderDebugger.number.addEventListener("input", () => {
    setLoaderDebugOffset(loaderDebugger.number.value);
  });

  panel.querySelectorAll("[data-loader-debug-nudge]").forEach((button) => {
    button.addEventListener("click", () => {
      const nextOffset = parseLoaderOffset(LOADER_WORD_Y_OFFSETS[activeLoaderText]) + Number(button.dataset.loaderDebugNudge);
      setLoaderDebugOffset(nextOffset);
    });
  });

  loaderDebugger.copy.addEventListener("click", copyLoaderDebugOffsets);
  panel.querySelector("[data-loader-debug-reset]").addEventListener("click", () => {
    window.localStorage?.removeItem(LOADER_DEBUG_STORAGE_KEY);
    loaderDebugger.copy.textContent = "cleared";
    window.setTimeout(() => {
      if (loaderDebugger) {
        loaderDebugger.copy.textContent = "copy offsets";
      }
    }, 1200);
  });

  updateLoaderDebugger();
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
  createLoaderDebugger();

  if (DEBUG_LOADER) {
    const debugScreen =
      loaderTextScreens.find(({ text }) => text === DEBUG_LOADER_WORD) ?? loaderTextScreens[0];

    if (debugScreen) {
      setLoaderScreen(debugScreen);
    }

    return;
  }

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
