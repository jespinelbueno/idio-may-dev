export const initCaseStudyStack = () => {
  const caseStudies = [
    {
      client: "Leisure Events",
      description:
        "Leisure Events is a rental company in Lynchburg VA that specializes in antique décor. They requested a full brand kit, and presented the unique challenge of communicating a high quality brand with luxurious décor while positioning themselves as a comparatively inexpensive rental option.",
      cardColor: "var(--paper)",
    },
    {
      client: "Leisure Events",
      description:
        "Leisure Events is a rental company in Lynchburg VA that specializes in antique décor. They requested a full brand kit, and presented the unique challenge of communicating a high quality brand with luxurious décor while positioning themselves as a comparatively inexpensive rental option.",
      cardColor: "var(--brand-green)",
    },
    {
      client: "Leisure Events",
      description:
        "Leisure Events is a rental company in Lynchburg VA that specializes in antique décor. They requested a full brand kit, and presented the unique challenge of communicating a high quality brand with luxurious décor while positioning themselves as a comparatively inexpensive rental option.",
      cardColor: "var(--brand-olive)",
    },
    {
      client: "Leisure Events",
      description:
        "Leisure Events is a rental company in Lynchburg VA that specializes in antique décor. They requested a full brand kit, and presented the unique challenge of communicating a high quality brand with luxurious décor while positioning themselves as a comparatively inexpensive rental option.",
      cardColor: "var(--brand-olive)",
    },
  ];
  
  const caseStudyMedia = document.querySelector(".case-study__media");
  const caseStudyStack = document.querySelector("[data-case-stack]");
  const caseStudyProject = document.querySelector("[data-case-project]");
  const caseStudyClient = caseStudyProject?.querySelector("h3");
  const caseStudyDescription = caseStudyProject?.querySelector(".case-study__description");
  const caseStudyDots = Array.from(document.querySelectorAll(".case-study__dot[data-case-index]"));
  const caseStudyScrollTrack = document.querySelector(".case-study__scroll-track");
  
  if (!caseStudyMedia || !caseStudyStack || !caseStudyProject || !caseStudyScrollTrack) return;
  let activeCaseStudyIndex = 0;
  let isCaseStudyCardAnimating = false;
  let pendingCaseStudyIndex = null;
  let caseStudyScrollFrame = 0;
  
  const CASE_STUDY_CARD_TRANSITION_MS = 260;
  const CASE_STUDY_CARD_OUTBOUND_MS = 170;
  const CASE_STUDY_CARD_INBOUND_MS = 220;
  
  caseStudyScrollTrack?.style.setProperty("--case-study-count", String(Math.max(caseStudies.length, 1)));
  
  const setActiveCaseStudyDot = (nextIndex) => {
    caseStudyDots.forEach((dot) => {
      const isActive = Number(dot.dataset.caseIndex) === nextIndex;
      dot.classList.toggle("is-active", isActive);
      dot.setAttribute("aria-pressed", String(isActive));
    });
  };
  
  const updateCaseStudyContent = (nextIndex) => {
    const nextCaseStudy = caseStudies[nextIndex];
  
    if (!nextCaseStudy || !caseStudyDescription) return;
  
    if (caseStudyClient) {
      caseStudyClient.textContent = nextCaseStudy.client;
      caseStudyClient.hidden = !nextCaseStudy.client;
    }
    caseStudyDescription.textContent = nextCaseStudy.description;
    caseStudyProject?.classList.remove("is-changing");
  };
  
  const getCaseStudyCards = () => Array.from(caseStudyStack?.querySelectorAll("[data-case-card]") ?? []);
  
  const getCaseStudyCardMetrics = () => {
    const firstCard = getCaseStudyCards()[0];
    const width = firstCard?.getBoundingClientRect().width || 360;
    const isCompact = window.matchMedia("(max-width: 700px)").matches;
  
    return {
      offsetX: width * (isCompact ? -0.075 : -0.125),
      offsetY: width * (isCompact ? 0.07 : 0.02),
      travelX: width * (isCompact ? 0.58 : 0.68),
      liftY: width * (isCompact ? -0.2 : -0.24),
    };
  };
  
  const getCaseStudyCardTransform = (index) => {
    const { offsetX, offsetY } = getCaseStudyCardMetrics();
    const visualIndex = Math.min(index, 2);
    const rotation = 6.5 - visualIndex * 5.3;
    const scale = 1 - visualIndex * 0.038;
  
    return `translate3d(${visualIndex * offsetX}px, ${visualIndex * offsetY}px, ${-index}px) rotate(${rotation}deg) scale(${scale})`;
  };
  
  const positionCaseStudyCards = ({ immediate = false } = {}) => {
    const cards = getCaseStudyCards();
  
    cards.forEach((card, index) => {
      const caseStudy = caseStudies[Number(card.dataset.caseCard)];
  
      card.style.zIndex = String(cards.length - index);
      card.style.setProperty("--case-card-color", caseStudy?.cardColor ?? "var(--paper)");
      card.style.transition = immediate ? "none" : `transform ${CASE_STUDY_CARD_TRANSITION_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`;
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
          duration: CASE_STUDY_CARD_TRANSITION_MS,
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
          duration: CASE_STUDY_CARD_OUTBOUND_MS,
          easing: "cubic-bezier(0.3, 0, 0.2, 1)",
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
          duration: CASE_STUDY_CARD_INBOUND_MS,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
          fill: "forwards",
        },
      );
  
      window.setTimeout(() => {
        frontCard.style.zIndex = "1";
      }, 85);
  
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
  
      if (pendingCaseStudyIndex !== null && pendingCaseStudyIndex !== activeCaseStudyIndex) {
        const nextIndex = pendingCaseStudyIndex;
        pendingCaseStudyIndex = null;
        selectCaseStudy(nextIndex);
      } else {
        pendingCaseStudyIndex = null;
      }
    }
  };
  
  const selectCaseStudy = (nextIndex) => {
    const nextCaseStudy = caseStudies[nextIndex];
  
    if (nextIndex === activeCaseStudyIndex || !nextCaseStudy) return false;
  
    if (isCaseStudyCardAnimating) {
      pendingCaseStudyIndex = nextIndex;
      return false;
    }
  
    activeCaseStudyIndex = nextIndex;
    setActiveCaseStudyDot(nextIndex);
    updateCaseStudyContent(nextIndex);
    moveCaseStudyFrontCardToBack(nextIndex);
    return true;
  };
  
  const getCaseStudyScrollMetrics = () => {
    if (!caseStudyScrollTrack) return null;
  
    const pinnedSection = caseStudyScrollTrack.querySelector(".case-study");
  
    if (!pinnedSection || window.getComputedStyle(pinnedSection).position !== "sticky") return null;
  
    const trackTop = window.scrollY + caseStudyScrollTrack.getBoundingClientRect().top;
    const scrollDistance = Math.max(caseStudyScrollTrack.offsetHeight - window.innerHeight, 1);
  
    return { trackTop, scrollDistance };
  };
  
  const getCaseStudyIndexFromScroll = () => {
    const metrics = getCaseStudyScrollMetrics();
  
    if (!metrics || caseStudies.length < 2) return 0;
  
    const progress = Math.max(0, Math.min(1, (window.scrollY - metrics.trackTop) / metrics.scrollDistance));
    return Math.min(caseStudies.length - 1, Math.floor(progress * caseStudies.length));
  };
  
  const syncCaseStudyToScroll = () => {
    caseStudyScrollFrame = 0;
    selectCaseStudy(getCaseStudyIndexFromScroll());
  };
  
  const scheduleCaseStudyScrollSync = () => {
    if (caseStudyScrollFrame) return;
    caseStudyScrollFrame = window.requestAnimationFrame(syncCaseStudyToScroll);
  };
  
  caseStudyDots.forEach((dot) => {
    dot.addEventListener("click", () => {
      const nextIndex = Number(dot.dataset.caseIndex);
      const metrics = getCaseStudyScrollMetrics();
  
      if (!metrics || caseStudies.length < 2) {
        selectCaseStudy(nextIndex);
        return;
      }
  
      const segmentCenter = (nextIndex + 0.5) / caseStudies.length;
      window.scrollTo({
        top: metrics.trackTop + metrics.scrollDistance * Math.min(segmentCenter, 1),
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      });
    });
  });
  
  window.addEventListener("resize", () => {
    if (!isCaseStudyCardAnimating) {
      positionCaseStudyCards({ immediate: true });
    }
    scheduleCaseStudyScrollSync();
  });
  
  positionCaseStudyCards({ immediate: true });
  window.addEventListener("scroll", scheduleCaseStudyScrollSync, { passive: true });
  syncCaseStudyToScroll();
};
