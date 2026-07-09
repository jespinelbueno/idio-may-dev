const setViewportHeight = () => {
  document.documentElement.style.setProperty("--hero-vh", `${window.innerHeight}px`);
};

setViewportHeight();
window.addEventListener("resize", setViewportHeight, { passive: true });

const loaderDebugParams = new URLSearchParams(window.location.search);
const loaderDebugQuery = loaderDebugParams.get("loaderDebug") ?? loaderDebugParams.get("debug");
const DEBUG_LOADER =
  false || (loaderDebugQuery !== null && !["0", "false", "off"].includes(loaderDebugQuery.toLowerCase()));
const DEBUG_LOADER_WORD = loaderDebugParams.get("loaderWord") || ""; // Set to "distinct", "novel", "yours", etc. to pause there.
const SHOW_LOADER_DEBUGGER = DEBUG_LOADER || Boolean(DEBUG_LOADER_WORD);
const LOADER_SCREEN_MS = 650;
const LOADER_SWAP_MS = 120;
const FINAL_HOLD_MS = 950;
const LOADER_DEBUG_STORAGE_KEY = "idio-loader-word-y-offsets";
const LOADER_WORD_FONTS = {
  teva: {
    label: "Teva",
    cssValue: '"Teva", "DM Sans", system-ui, sans-serif',
    weight: "400",
    offsets: {},
  },
  previous: {
    label: "Previous DM Sans Bold",
    cssValue: '"DM Sans", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    weight: "950",
    offsets: {
      creative: "0.04em",
      interesting: "0.05em",
      original: "0.04em",
      striking: "0.04em",
      unique: "0em",
      distinct: "0.04em",
      novel: "-0.09em",
      yours: "-0.09em",
    },
  },
};
const LOADER_WORD_Y_OFFSETS = {};
let activeLoaderFont = LOADER_WORD_FONTS[loaderDebugParams.get("loaderFont")] ? loaderDebugParams.get("loaderFont") : "teva";

const loadSavedLoaderOffsets = () => {
  try {
    const savedState = JSON.parse(window.localStorage.getItem(LOADER_DEBUG_STORAGE_KEY) || "{}");
    const savedOffsetsByFont = savedState.offsetsByFont ?? savedState;

    Object.entries(savedOffsetsByFont).forEach(([fontKey, savedOffsets]) => {
      const font = LOADER_WORD_FONTS[fontKey];

      if (fontKey === "teva" || !font || !savedOffsets || typeof savedOffsets !== "object") return;

      Object.entries(savedOffsets).forEach(([text, offset]) => {
        if (text in font.offsets && typeof offset === "string") {
          font.offsets[text] = offset;
        }
      });
    });

    if (LOADER_WORD_FONTS[savedState.activeFont] && !loaderDebugParams.get("loaderFont")) {
      activeLoaderFont = savedState.activeFont;
    }
  } catch {
    window.localStorage?.removeItem(LOADER_DEBUG_STORAGE_KEY);
  }
};

const getLoaderOffsetsByFont = () =>
  Object.fromEntries(
    Object.entries(LOADER_WORD_FONTS).map(([fontKey, font]) => [
      fontKey,
      { ...font.offsets },
    ]),
  );

const getActiveLoaderOffsets = () => LOADER_WORD_FONTS[activeLoaderFont].offsets;

const syncLegacyLoaderOffsets = () => {
  Object.keys(LOADER_WORD_Y_OFFSETS).forEach((text) => {
    delete LOADER_WORD_Y_OFFSETS[text];
  });

  Object.assign(LOADER_WORD_Y_OFFSETS, getActiveLoaderOffsets());
};

const applyLoaderWordFont = () => {
  syncLegacyLoaderOffsets();

  const font = LOADER_WORD_FONTS[activeLoaderFont];

  loaderPhrase?.style.setProperty("--loader-word-font-family", font.cssValue);
  loaderPhrase?.style.setProperty("--loader-word-font-weight", font.weight);

  if (loaderDebugger?.font) {
    loaderDebugger.font.value = activeLoaderFont;
    loaderDebugger.toggleFont.textContent = activeLoaderFont === "teva" ? "try previous font" : "try Teva";
  }
};

const setLoaderWordFont = (fontKey) => {
  if (!LOADER_WORD_FONTS[fontKey]) return;

  activeLoaderFont = fontKey;
  applyLoaderWordFont();

  if (SHOW_LOADER_DEBUGGER) {
    saveLoaderOffsets();
  }

  measureLoaderWords();
};

const saveLoaderOffsets = () => {
  try {
    if (!window.localStorage) return false;

    window.localStorage.setItem(
      LOADER_DEBUG_STORAGE_KEY,
      JSON.stringify({
        activeFont: activeLoaderFont,
        offsetsByFont: getLoaderOffsetsByFont(),
      }),
    );

    return true;
  } catch {
    return false;
  }
};

const showLoaderDebugStatus = (message) => {
  if (!loaderDebugger?.status) return;

  loaderDebugger.status.textContent = message;
};

const saveLoaderDebugState = () => {
  showLoaderDebugStatus(saveLoaderOffsets() ? "saved locally" : "save failed");
};

loadSavedLoaderOffsets();
syncLegacyLoaderOffsets();

const loader = document.querySelector(".loader");
const loaderWord = document.querySelector("[data-loader-word]");
const loaderLogo = document.querySelector("[data-loader-logo]");
const loaderPhrase = document.querySelector(".loader__phrase");
const loaderFixed = document.querySelector(".loader__fixed");
const loaderWordSlot = document.querySelector(".loader__words");
const loaderScreens = [
  { text: "interesting", className: "loader--creative" },
  { text: "creative", className: "loader--interesting" },
  { text: "original", className: "loader--original" },
  { text: "striking", className: "loader--striking" },
  { text: "distinct", className: "loader--unique" },
  { text: "unique", className: "loader--distinct" },
  { text: "novel", className: "loader--novel" },
  { text: "yours", className: "loader--yours" },
  { logo: true, className: "loader--idio" },
];
const loaderScreenClasses = loaderScreens.map(({ className }) => className);
const loaderTextScreens = loaderScreens.filter(({ text }) => text);
let loaderSequenceComplete = false;
let loaderPageLoaded = document.readyState === "complete";
let activeLoaderText = loaderTextScreens[0]?.text ?? "";
let loaderMeasureFrame;
let loaderDebugger;

applyLoaderWordFont();

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
  if (!loaderWord) return;

  loaderWord.style.fontSize = "";
  loaderWordSlot?.style.setProperty("--loader-word-axis-offset", "0em");
  updateLoaderDebugger();
};

const measureLoaderWords = () => {
  if (!loaderPhrase) return;

  const fixedRect = loaderFixed?.getBoundingClientRect();

  if (fixedRect) {
    loaderPhrase.style.setProperty("--loader-phrase-height", `${fixedRect.height}px`);
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
  const fontRows = Object.entries(LOADER_WORD_FONTS).map(([fontKey, font]) => {
    const offsetRows = loaderTextScreens.map(({ text }) => `    ${text}: "${font.offsets[text] ?? "0em"}",`);

    return `  ${fontKey}: {\n${offsetRows.join("\n")}\n  },`;
  });

  return `const LOADER_WORD_Y_OFFSETS_BY_FONT = {\n${fontRows.join("\n")}\n};`;
};

const updateLoaderDebugger = () => {
  if (!loaderDebugger || !loaderWord) return;

  const offset = parseLoaderOffset(LOADER_WORD_Y_OFFSETS[activeLoaderText] ?? "0em");
  const measurements = getLoaderDebugMeasurements();

  loaderDebugger.word.value = activeLoaderText;
  loaderDebugger.font.value = activeLoaderFont;
  loaderDebugger.toggleFont.textContent = activeLoaderFont === "teva" ? "try previous font" : "try Teva";
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
  if (activeLoaderFont === "teva") return;

  const offset = Math.max(-0.5, Math.min(0.5, Number.parseFloat(value) || 0));

  getActiveLoaderOffsets()[activeLoaderText] = formatLoaderOffset(offset);
  syncLegacyLoaderOffsets();
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
      <span>/loader-debug/</span>
    </div>
    <label class="loader-debugger__field">
      word
      <select data-loader-debug-word></select>
    </label>
    <label class="loader-debugger__field">
      font
      <select data-loader-debug-font></select>
    </label>
    <button type="button" data-loader-debug-toggle-font>try previous font</button>
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
      <button type="button" data-loader-debug-save>save</button>
      <span data-loader-debug-status></span>
    </div>
    <div class="loader-debugger__row">
      <button class="loader-debugger__copy" type="button" data-loader-debug-copy>copy offsets</button>
      <button type="button" data-loader-debug-reset>clear saved</button>
    </div>
    <textarea class="loader-debugger__output" data-loader-debug-output readonly hidden></textarea>
  `;

  const wordSelect = panel.querySelector("[data-loader-debug-word]");
  const fontSelect = panel.querySelector("[data-loader-debug-font]");

  loaderTextScreens.forEach(({ text }) => {
    const option = document.createElement("option");
    option.value = text;
    option.textContent = text;
    wordSelect.appendChild(option);
  });

  Object.entries(LOADER_WORD_FONTS).forEach(([fontKey, font]) => {
    const option = document.createElement("option");
    option.value = fontKey;
    option.textContent = font.label;
    fontSelect.appendChild(option);
  });

  loader.appendChild(panel);

  loaderDebugger = {
    panel,
    word: wordSelect,
    font: fontSelect,
    toggleFont: panel.querySelector("[data-loader-debug-toggle-font]"),
    range: panel.querySelector("[data-loader-debug-range]"),
    number: panel.querySelector("[data-loader-debug-number]"),
    metrics: panel.querySelector("[data-loader-debug-metrics]"),
    save: panel.querySelector("[data-loader-debug-save]"),
    status: panel.querySelector("[data-loader-debug-status]"),
    copy: panel.querySelector("[data-loader-debug-copy]"),
    output: panel.querySelector("[data-loader-debug-output]"),
  };

  loaderDebugger.word.addEventListener("change", () => {
    const screen = loaderTextScreens.find(({ text }) => text === loaderDebugger.word.value);

    if (screen) {
      setLoaderScreen(screen);
    }
  });

  loaderDebugger.font.addEventListener("change", () => {
    setLoaderWordFont(loaderDebugger.font.value);
  });

  loaderDebugger.toggleFont.addEventListener("click", () => {
    setLoaderWordFont(activeLoaderFont === "teva" ? "previous" : "teva");
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

  loaderDebugger.save.addEventListener("click", saveLoaderDebugState);
  loaderDebugger.copy.addEventListener("click", copyLoaderDebugOffsets);
  panel.querySelector("[data-loader-debug-reset]").addEventListener("click", () => {
    window.localStorage?.removeItem(LOADER_DEBUG_STORAGE_KEY);
    showLoaderDebugStatus("cleared");
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
