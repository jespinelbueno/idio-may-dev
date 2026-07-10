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
  },
  previous: {
    label: "Previous DM Sans Bold",
    cssValue: '"DM Sans", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    weight: "950",
  },
  dmSansMedium: {
    label: "DM Sans Medium",
    cssValue: '"DM Sans", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    weight: "650",
  },
  vollkorn: {
    label: "Vollkorn Editorial",
    cssValue: '"Vollkorn", Georgia, serif',
    weight: "850",
  },
};
const createLoaderPresetBanks = () => ({
  tevaNatural: {
    label: "1 Teva natural",
    savedAt: "",
    font: "teva",
    offsets: {
      creative: "0em",
      interesting: "0em",
      original: "0em",
      striking: "0em",
      unique: "0em",
      distinct: "0em",
      novel: "0em",
      yours: "0em",
    },
  },
  tevaLifted: {
    label: "2 Teva lifted",
    savedAt: "",
    font: "teva",
    offsets: {
      creative: "-0.03em",
      interesting: "-0.03em",
      original: "-0.02em",
      striking: "-0.03em",
      unique: "-0.02em",
      distinct: "-0.03em",
      novel: "-0.04em",
      yours: "-0.04em",
    },
  },
  dmSansHero: {
    label: "3 DM Sans hero",
    savedAt: "",
    font: "previous",
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
  dmSansTight: {
    label: "4 DM Sans tight",
    savedAt: "",
    font: "dmSansMedium",
    offsets: {
      creative: "0.02em",
      interesting: "0.03em",
      original: "0.02em",
      striking: "0.02em",
      unique: "-0.01em",
      distinct: "0.02em",
      novel: "-0.05em",
      yours: "-0.05em",
    },
  },
  vollkornEditorial: {
    label: "5 Vollkorn editorial",
    savedAt: "",
    font: "vollkorn",
    offsets: {
      creative: "-0.01em",
      interesting: "0em",
      original: "-0.01em",
      striking: "-0.01em",
      unique: "-0.03em",
      distinct: "-0.01em",
      novel: "-0.07em",
      yours: "-0.07em",
    },
  },
});
const LOADER_WORD_Y_OFFSETS = {};
const LOADER_DEFAULT_PRESET_BANK = "tevaNatural";
const LOADER_PRESET_BANKS = createLoaderPresetBanks();
const requestedLoaderBank = loaderDebugParams.get("loaderBank") ?? loaderDebugParams.get("loaderPreset");
const requestedLoaderFont = loaderDebugParams.get("loaderFont");
let activeLoaderBank = LOADER_PRESET_BANKS[requestedLoaderBank] ? requestedLoaderBank : LOADER_DEFAULT_PRESET_BANK;
let activeLoaderFont = LOADER_PRESET_BANKS[activeLoaderBank].font;

const cloneLoaderPresetBanks = (banks) =>
  Object.fromEntries(
    Object.entries(banks).map(([bankKey, bank]) => [
      bankKey,
      {
        ...bank,
        offsets: { ...bank.offsets },
      },
    ]),
  );

const resetLoaderPresetBanks = () => {
  const defaults = createLoaderPresetBanks();

  Object.keys(LOADER_PRESET_BANKS).forEach((bankKey) => {
    delete LOADER_PRESET_BANKS[bankKey];
  });
  Object.assign(LOADER_PRESET_BANKS, cloneLoaderPresetBanks(defaults));
};

const getActiveLoaderBank = () => LOADER_PRESET_BANKS[activeLoaderBank];

const syncActiveLoaderFontFromBank = () => {
  activeLoaderFont = getActiveLoaderBank().font;
};

const formatLoaderSavedAt = (savedAt) => {
  if (!savedAt) return "";

  const date = new Date(savedAt);

  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

const getLoaderBankOptionLabel = (bank) => {
  const savedLabel = formatLoaderSavedAt(bank.savedAt);

  return savedLabel ? `saved ${savedLabel}` : bank.label;
};

const updateLoaderBankOptionLabels = () => {
  if (!loaderDebugger?.bank) return;

  Array.from(loaderDebugger.bank.options).forEach((option) => {
    const bank = LOADER_PRESET_BANKS[option.value];

    if (bank) {
      option.textContent = getLoaderBankOptionLabel(bank);
    }
  });
};

const loadSavedLoaderOffsets = () => {
  try {
    const savedState = JSON.parse(window.localStorage.getItem(LOADER_DEBUG_STORAGE_KEY) || "{}");
    const savedBanks = savedState.banks;

    if (savedBanks && typeof savedBanks === "object") {
      Object.entries(savedBanks).forEach(([bankKey, savedBank]) => {
        const bank = LOADER_PRESET_BANKS[bankKey];

        if (!bank || !savedBank || typeof savedBank !== "object") return;

        if (LOADER_WORD_FONTS[savedBank.font]) {
          bank.font = savedBank.font;
        }

        if (typeof savedBank.savedAt === "string") {
          bank.savedAt = savedBank.savedAt;
        }

        Object.entries(savedBank.offsets ?? {}).forEach(([text, offset]) => {
          if (text in bank.offsets && typeof offset === "string") {
            bank.offsets[text] = offset;
          }
        });
      });
    } else {
      const savedOffsetsByFont = savedState.offsetsByFont ?? savedState;

      Object.entries(savedOffsetsByFont).forEach(([fontKey, savedOffsets]) => {
        const bankKey = {
          teva: "tevaNatural",
          previous: "dmSansHero",
          dmSansMedium: "dmSansTight",
          vollkorn: "vollkornEditorial",
        }[fontKey];
        const bank = LOADER_PRESET_BANKS[bankKey];

        if (!bank || !savedOffsets || typeof savedOffsets !== "object") return;

        Object.entries(savedOffsets).forEach(([text, offset]) => {
          if (text in bank.offsets && typeof offset === "string") {
            bank.offsets[text] = offset;
          }
        });
      });
    }

    if (LOADER_PRESET_BANKS[savedState.activeBank] && !requestedLoaderBank) {
      activeLoaderBank = savedState.activeBank;
    } else if (LOADER_WORD_FONTS[savedState.activeFont] && !requestedLoaderBank) {
      activeLoaderBank =
        {
          teva: "tevaNatural",
          previous: "dmSansHero",
          dmSansMedium: "dmSansTight",
          vollkorn: "vollkornEditorial",
        }[savedState.activeFont] ?? activeLoaderBank;
    }
  } catch {
    window.localStorage?.removeItem(LOADER_DEBUG_STORAGE_KEY);
  }
};

const getLoaderPresetBankData = () => cloneLoaderPresetBanks(LOADER_PRESET_BANKS);

const getActiveLoaderOffsets = () => getActiveLoaderBank().offsets;

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
    loaderDebugger.bank.value = activeLoaderBank;
    loaderDebugger.font.value = activeLoaderFont;
    loaderDebugger.toggleFont.textContent = activeLoaderFont === "teva" ? "try previous font" : "try Teva";
  }
};

const setLoaderPresetBank = (bankKey) => {
  if (!LOADER_PRESET_BANKS[bankKey]) return;

  activeLoaderBank = bankKey;
  syncActiveLoaderFontFromBank();
  applyLoaderWordFont();

  if (SHOW_LOADER_DEBUGGER) {
    saveLoaderOffsets();
  }

  measureLoaderWords();
};

const setLoaderWordFont = (fontKey) => {
  if (!LOADER_WORD_FONTS[fontKey]) return;

  getActiveLoaderBank().font = fontKey;
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
        activeBank: activeLoaderBank,
        banks: getLoaderPresetBankData(),
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
  const savedAt = new Date().toISOString();

  getActiveLoaderBank().savedAt = savedAt;
  updateLoaderBankOptionLabels();
  updateLoaderDebugger();
  showLoaderDebugStatus(saveLoaderOffsets() ? `saved ${formatLoaderSavedAt(savedAt)}` : "save failed");
};

loadSavedLoaderOffsets();
if (LOADER_WORD_FONTS[requestedLoaderFont]) {
  getActiveLoaderBank().font = requestedLoaderFont;
}
syncActiveLoaderFontFromBank();
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
  loaderWordSlot?.style.setProperty("--loader-word-axis-offset", LOADER_WORD_Y_OFFSETS[text] ?? "0em");
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
  const bankRows = Object.entries(LOADER_PRESET_BANKS).map(([bankKey, bank]) => {
    const offsetRows = loaderTextScreens.map(({ text }) => `      ${text}: "${bank.offsets[text] ?? "0em"}",`);

    return `  ${bankKey}: {\n    label: "${bank.label}",\n    savedAt: "${bank.savedAt ?? ""}",\n    font: "${bank.font}",\n    offsets: {\n${offsetRows.join("\n")}\n    }\n  },`;
  });

  return `const LOADER_PRESET_BANKS = {\n${bankRows.join("\n")}\n};`;
};

const updateLoaderDebugger = () => {
  if (!loaderDebugger || !loaderWord) return;

  const offset = parseLoaderOffset(LOADER_WORD_Y_OFFSETS[activeLoaderText] ?? "0em");
  const measurements = getLoaderDebugMeasurements();

  loaderDebugger.word.value = activeLoaderText;
  loaderDebugger.bank.value = activeLoaderBank;
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
      preset bank
      <select data-loader-debug-bank></select>
    </label>
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
  const bankSelect = panel.querySelector("[data-loader-debug-bank]");
  const fontSelect = panel.querySelector("[data-loader-debug-font]");

  Object.entries(LOADER_PRESET_BANKS).forEach(([bankKey, bank]) => {
    const option = document.createElement("option");
    option.value = bankKey;
    option.textContent = getLoaderBankOptionLabel(bank);
    bankSelect.appendChild(option);
  });

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
    bank: bankSelect,
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

  loaderDebugger.bank.addEventListener("change", () => {
    setLoaderPresetBank(loaderDebugger.bank.value);
  });

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
    resetLoaderPresetBanks();
    activeLoaderBank = LOADER_DEFAULT_PRESET_BANK;
    syncActiveLoaderFontFromBank();
    applyLoaderWordFont();
    measureLoaderWords();
    updateLoaderBankOptionLabels();
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
const caseStudyStack = document.querySelector("[data-case-stack]");
const caseStudyDetails = document.querySelector("[data-case-details]");
const caseStudyTitle = document.querySelector("#case-study-title");
const caseStudyDescription = caseStudyDetails?.querySelector("p");
const caseStudyDots = Array.from(document.querySelectorAll(".case-study__dot[data-case-index]"));
const caseStudyScrollArea = document.querySelector(".case-study");
let activeCaseStudyIndex = 0;
let caseStudyScrollLockTimer;
let caseStudyTouchStartX = 0;
let caseStudyTouchStartY = 0;
let isCaseStudyScrollLocked = false;
let isCaseStudyCardAnimating = false;
let caseStudyScrollAccumulator = 0;
let caseStudyLastWheelAt = 0;

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

const updateCaseStudyContent = (nextIndex) => {
  const nextCaseStudy = caseStudies[nextIndex];

  if (!nextCaseStudy || !caseStudyTitle || !caseStudyDescription) return;

  caseStudyTitle.textContent = nextCaseStudy.title;
  caseStudyDescription.textContent = nextCaseStudy.description;
  caseStudyDetails?.classList.remove("is-changing");
};

const getCaseStudyCards = () => Array.from(caseStudyStack?.querySelectorAll("[data-case-card]") ?? []);

const getCaseStudyCardMetrics = () => {
  const firstCard = getCaseStudyCards()[0];
  const width = firstCard?.getBoundingClientRect().width || 360;
  const isCompact = window.matchMedia("(max-width: 700px)").matches;

  return {
    offsetX: width * (isCompact ? -0.075 : -0.092),
    offsetY: width * (isCompact ? 0.07 : 0.062),
    travelX: width * (isCompact ? 0.58 : 0.68),
    liftY: width * (isCompact ? -0.2 : -0.24),
  };
};

const getCaseStudyCardTransform = (index) => {
  const { offsetX, offsetY } = getCaseStudyCardMetrics();
  const rotation = 6.5 - index * 5.3;
  const scale = 1 - index * 0.038;

  return `translate3d(${index * offsetX}px, ${index * offsetY}px, ${-index}px) rotate(${rotation}deg) scale(${scale})`;
};

const positionCaseStudyCards = ({ immediate = false } = {}) => {
  const cards = getCaseStudyCards();

  cards.forEach((card, index) => {
    const caseStudy = caseStudies[Number(card.dataset.caseCard)];

    card.style.zIndex = String(cards.length - index);
    card.style.setProperty("--case-card-color", caseStudy?.cards?.front ?? "var(--paper)");
    card.style.transition = immediate ? "none" : "transform 620ms cubic-bezier(0.22, 1, 0.36, 1)";
    card.style.transform = getCaseStudyCardTransform(index);
  });

  if (immediate) {
    void caseStudyStack?.offsetHeight;
    cards.forEach((card) => {
      card.style.transition = "";
    });
  }
};

const captureCaseStudyCardPositions = (cards) =>
  new Map(cards.map((card) => [card, card.getBoundingClientRect()]));

const animateReorderedCaseStudyCards = (previousPositions, excludedCard) =>
  getCaseStudyCards().map((card) => {
    if (card === excludedCard) return;

    const previous = previousPositions.get(card);
    const current = card.getBoundingClientRect();

    if (!previous) return;

    const deltaX = previous.left - current.left;
    const deltaY = previous.top - current.top;

    return card.animate(
      [
        { transform: `translate(${deltaX}px, ${deltaY}px) ${card.style.transform}` },
        { transform: card.style.transform },
      ],
      {
        duration: 620,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        fill: "both",
      },
    );
  }).filter(Boolean);

const reorderCaseStudyCards = (orderedCards) => {
  orderedCards.forEach((card) => {
    caseStudyStack?.appendChild(card);
  });
};

const moveCaseStudyFrontCardToBack = async (nextIndex) => {
  if (!caseStudyStack || isCaseStudyCardAnimating) return;

  let cards = getCaseStudyCards();
  let frontCard = cards[0];
  const targetCard = cards.find((card) => Number(card.dataset.caseCard) === nextIndex);

  if (!frontCard || !targetCard || frontCard === targetCard) return;

  isCaseStudyCardAnimating = true;
  caseStudyMedia?.classList.add("is-shuffling");
  const previousPositions = captureCaseStudyCardPositions(cards);
  const originalTransform = frontCard.style.transform || getCaseStudyCardTransform(0);
  const { travelX, liftY } = getCaseStudyCardMetrics();

  try {
    const finalOrder = [
      targetCard,
      ...cards.filter((card) => card !== targetCard && card !== frontCard),
      frontCard,
    ];

    if (!frontCard.animate) {
      reorderCaseStudyCards(finalOrder);
      return;
    }

    frontCard.style.zIndex = "100";

    const outboundAnimation = frontCard.animate(
      [
        {
          offset: 0,
          transform: originalTransform,
          filter: "brightness(1)",
          boxShadow: "0 0.85rem 1.7rem rgb(21 18 14 / 0.16)",
        },
        {
          offset: 0.42,
          transform: `translate3d(${travelX * 0.56}px, ${liftY}px, 32px) rotate(6deg) scale(1.028)`,
          filter: "brightness(1.04)",
          boxShadow: "0 1.2rem 2rem rgb(21 18 14 / 0.22)",
        },
        {
          offset: 1,
          transform: `translate3d(${travelX}px, -0.55rem, 18px) rotate(11deg) scale(1.012)`,
          filter: "brightness(1.03)",
          boxShadow: "0 1.05rem 1.75rem rgb(21 18 14 / 0.2)",
        },
      ],
      {
        duration: 430,
        easing: "cubic-bezier(0.4, 0, 0.2, 1)",
        fill: "forwards",
      },
    );

    await outboundAnimation.finished;

    reorderCaseStudyCards(finalOrder);
    positionCaseStudyCards({ immediate: true });
    const reorderAnimations = animateReorderedCaseStudyCards(previousPositions, frontCard);

    cards = getCaseStudyCards();
    const backIndex = cards.length - 1;
    const finalTransform = getCaseStudyCardTransform(backIndex);
    const { offsetX, offsetY } = getCaseStudyCardMetrics();

    const inboundAnimation = frontCard.animate(
      [
        {
          offset: 0,
          transform: `translate3d(${travelX}px, -0.55rem, 18px) rotate(11deg) scale(1.012)`,
          opacity: 1,
        },
        {
          offset: 0.45,
          transform: `translate3d(${travelX * 0.38}px, 2.2rem, -18px) rotate(4deg) scale(0.972)`,
          opacity: 0.98,
        },
        {
          offset: 0.78,
          transform: `translate3d(${backIndex * offsetX - 8}px, ${backIndex * offsetY + 4}px, -${backIndex}px) rotate(${6.5 - backIndex * 5.3 - 1.2}deg) scale(${1 - backIndex * 0.038 - 0.008})`,
          opacity: 1,
        },
        {
          offset: 1,
          transform: finalTransform,
          opacity: 1,
        },
      ],
      {
        duration: 560,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        fill: "forwards",
      },
    );

    window.setTimeout(() => {
      frontCard.style.zIndex = "1";
    }, 190);

    await Promise.all([
      inboundAnimation.finished,
      ...reorderAnimations.map((animation) => animation.finished.catch(() => {})),
    ]);
    outboundAnimation.cancel();
    inboundAnimation.cancel();
    reorderAnimations.forEach((animation) => {
      animation.cancel();
    });
  } finally {
    positionCaseStudyCards({ immediate: true });
    caseStudyMedia?.classList.remove("is-shuffling");
    isCaseStudyCardAnimating = false;
  }
};

const selectCaseStudy = (nextIndex) => {
  const nextCaseStudy = caseStudies[nextIndex];

  if (nextIndex === activeCaseStudyIndex || !nextCaseStudy || isCaseStudyCardAnimating) return false;

  activeCaseStudyIndex = nextIndex;
  setActiveCaseStudyDot(nextIndex);
  updateCaseStudyContent(nextIndex);
  moveCaseStudyFrontCardToBack(nextIndex);
  return true;
};

const scrollCaseStudy = (direction) => {
  const nextIndex = Math.max(0, Math.min(caseStudies.length - 1, activeCaseStudyIndex + direction));

  if (nextIndex === activeCaseStudyIndex) return false;

  return selectCaseStudy(nextIndex);
};

const unlockCaseStudyScroll = () => {
  window.clearTimeout(caseStudyScrollLockTimer);
  isCaseStudyScrollLocked = false;
  caseStudyScrollAccumulator = 0;
};

const lockCaseStudyScroll = () => {
  isCaseStudyScrollLocked = true;
  caseStudyScrollAccumulator = 0;
  window.clearTimeout(caseStudyScrollLockTimer);
  caseStudyScrollLockTimer = window.setTimeout(unlockCaseStudyScroll, 1040);
};

caseStudyDots.forEach((dot) => {
  dot.addEventListener("click", () => {
    selectCaseStudy(Number(dot.dataset.caseIndex));
  });
});

const normalizeCaseStudyWheelDelta = (event) => {
  if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) return event.deltaY * 16;
  if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) return event.deltaY * window.innerHeight;

  return event.deltaY;
};

const isCaseStudyScrollZoneActive = () => {
  if (!caseStudyScrollArea) return false;

  const rect = caseStudyScrollArea.getBoundingClientRect();
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  const focusTop = viewportHeight * 0.16;
  const focusBottom = viewportHeight * 0.82;

  return rect.top <= focusTop && rect.bottom >= focusBottom;
};

const getCaseStudyWheelThreshold = () => {
  const isCompact = window.matchMedia("(max-width: 700px)").matches;

  return isCompact ? 62 : 84;
};

caseStudyScrollArea?.addEventListener(
  "wheel",
  (event) => {
    if (caseStudies.length < 2) return;

    if (!isCaseStudyScrollZoneActive()) {
      caseStudyScrollAccumulator = 0;
      return;
    }

    const delta = normalizeCaseStudyWheelDelta(event);
    const direction = Math.sign(delta);

    if (!direction) return;

    if (Math.abs(event.deltaX) > Math.abs(event.deltaY) * 1.25) {
      return;
    }

    const canMove =
      (direction > 0 && activeCaseStudyIndex < caseStudies.length - 1) ||
      (direction < 0 && activeCaseStudyIndex > 0);

    if (!canMove) {
      caseStudyScrollAccumulator = 0;
      return;
    }

    event.preventDefault();

    if (isCaseStudyScrollLocked) return;

    const now = performance.now();

    if (now - caseStudyLastWheelAt > 180 || Math.sign(caseStudyScrollAccumulator) !== direction) {
      caseStudyScrollAccumulator = 0;
    }

    caseStudyLastWheelAt = now;
    caseStudyScrollAccumulator += delta;

    if (Math.abs(caseStudyScrollAccumulator) >= getCaseStudyWheelThreshold() && scrollCaseStudy(direction)) {
      lockCaseStudyScroll();
    }
  },
  { passive: false },
);

caseStudyScrollArea?.addEventListener(
  "touchstart",
  (event) => {
    const touch = event.touches[0];

    if (!touch) return;

    caseStudyTouchStartX = touch.clientX;
    caseStudyTouchStartY = touch.clientY;
  },
  { passive: true },
);

window.addEventListener("resize", () => {
  if (!isCaseStudyCardAnimating) {
    positionCaseStudyCards({ immediate: true });
  }
});

positionCaseStudyCards({ immediate: true });

caseStudyScrollArea?.addEventListener(
  "touchend",
  (event) => {
    const touch = event.changedTouches[0];

    if (!touch || isCaseStudyScrollLocked) return;

    const deltaX = caseStudyTouchStartX - touch.clientX;
    const deltaY = caseStudyTouchStartY - touch.clientY;
    const delta = Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : deltaY;

    if (!isCaseStudyScrollZoneActive()) return;

    if (Math.abs(delta) < 44) return;

    if (scrollCaseStudy(Math.sign(delta))) {
      lockCaseStudyScroll();
    }
  },
  { passive: true },
);
