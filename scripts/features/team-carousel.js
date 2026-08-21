export const initTeamCarousel = () => {
  const carousel = document.querySelector("[data-team-carousel]");
  const previousButton = document.querySelector("[data-team-carousel-previous]");
  const nextButton = document.querySelector("[data-team-carousel-next]");
  const grid = carousel?.querySelector(".team__grid");

  if (!carousel || !previousButton || !nextButton || !grid) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let updateFrame = 0;

  const getScrollStep = () => {
    const members = grid.querySelectorAll(".team__member");

    if (members.length > 1) {
      return members[1].offsetLeft - members[0].offsetLeft;
    }

    return members[0]?.offsetWidth || carousel.clientWidth;
  };

  const updateButtons = () => {
    updateFrame = 0;

    const maximumScroll = Math.max(0, carousel.scrollWidth - carousel.clientWidth);
    const edgeTolerance = 2;

    previousButton.disabled = carousel.scrollLeft <= edgeTolerance;
    nextButton.disabled = carousel.scrollLeft >= maximumScroll - edgeTolerance;
  };

  const requestButtonUpdate = () => {
    if (updateFrame) return;
    updateFrame = window.requestAnimationFrame(updateButtons);
  };

  const scrollByCard = (direction) => {
    carousel.scrollBy({
      left: getScrollStep() * direction,
      behavior: reducedMotion.matches ? "auto" : "smooth",
    });
  };

  previousButton.addEventListener("click", () => scrollByCard(-1));
  nextButton.addEventListener("click", () => scrollByCard(1));
  carousel.addEventListener("scroll", requestButtonUpdate, { passive: true });
  window.addEventListener("resize", requestButtonUpdate);

  updateButtons();
};
