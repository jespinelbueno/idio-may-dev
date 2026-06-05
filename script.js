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
