import { getTeamScrollProgress, getTeamCardTransform, getTeamShuffleFrames } from "./about-team-scroll-progress.js";
import { initTeamPortraits } from "../shared/team-portraits.js";

const memberNames = {
  anna: "Anna Moore", jaden: "Jaden Anderson", raquel: "Raquel Bowles",
  naomi: "Naomi Moore", gretel: "Gretel Lam",
};

export const initAboutTeamSelector = () => {
  const section = document.querySelector(".about-team");
  const list = section?.querySelector(".about-team__members");
  const stack = section?.querySelector(".about-team__stack");
  const cards = [...(stack?.querySelectorAll("[data-about-card]") ?? [])];
  const caption = section?.querySelector(".about-team__caption");
  const controls = section?.querySelector(".about-team__controls");
  const status = section?.querySelector(".about-team__photo-status");
  const name = caption?.querySelector("h3");
  const role = caption?.querySelector("p");
  const previous = controls?.querySelector("[data-about-previous]");
  const next = controls?.querySelector("[data-about-next]");
  if (!section || !list || !stack || !cards.length || !name || !role || !status || !previous || !next) return;
  const buttons = [...list.querySelectorAll("button[data-about-member]")];
  const members = buttons.map((button) => button.dataset.aboutMember);
  if (members.length !== cards.length || cards.some((card, index) => card.dataset.aboutCard !== members[index])) return;
  initTeamPortraits(stack);
  const mobile = window.matchMedia("(max-width: 760px), (max-width: 1024px) and (max-height: 500px) and (pointer: coarse)");
  const roles = buttons.map((button) => button.closest("dl > div").querySelector("dd").textContent);
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const prelude = section.querySelector(".about-team__intro-block").cloneNode(true);
  prelude.className = "about-team__mobile-intro";
  prelude.querySelectorAll("[id]").forEach((node) => node.removeAttribute("id"));
  section.prepend(prelude);
  let selected = 0;
  let order = [...cards];
  let initialized = false;
  let frame = null;
  let step = 0;
  let pendingIndex = null;
  let shuffleVersion = 0;
  let isShuffling = false;
  const animations = new Set();
  const compact = () => section.clientWidth <= 1100;

  const positionCards = () => {
    order.forEach((card, depth) => {
      const index = cards.indexOf(card);
      card.style.transform = mobile.matches ? "none" : getTeamCardTransform(depth, stack.offsetWidth, compact());
      card.style.opacity = mobile.matches && index !== selected ? "0" : "1";
      card.style.zIndex = String(cards.length - depth);
      card.setAttribute("aria-hidden", String(index !== selected));
    });
  };

  const renderLabels = (active) => {
    buttons.forEach((button, index) => {
      button.setAttribute("aria-pressed", String(index === active));
      button.closest("dl > div").classList.toggle("is-featured", index === active);
    });
    name.textContent = buttons[active].textContent;
    role.textContent = roles[active];
    previous.disabled = active === 0;
    next.disabled = active === members.length - 1;
    if (!mobile.matches && selected !== active) status.textContent = `Showing ${memberNames[members[active]]}.`;
    selected = active;
  };

  const animate = (card, keyframes, duration, easing, fill = "both") => {
    const animation = card.animate(keyframes, { duration, easing, fill });
    animations.add(animation);
    return animation;
  };
  const resetShuffle = () => {
    shuffleVersion++;
    animations.forEach((animation) => animation.cancel());
    animations.clear();
    pendingIndex = null;
    isShuffling = false;
  };
  const selectMember = async (index, immediate = false) => {
    if (isShuffling) { pendingIndex = index; return; }
    if (initialized && selected === index) return;
    const front = order[0];
    const target = cards[index];
    const finalOrder = [target, ...order.filter((card) => card !== target && card !== front)];
    if (front !== target) finalOrder.push(front);
    renderLabels(index);
    if (!initialized || immediate || mobile.matches || motion.matches || !front.animate) {
      initialized = true;
      order = finalOrder;
      positionCards();
      return;
    }

    isShuffling = true;
    const version = ++shuffleVersion;
    const previousTransforms = new Map(order.map((card) => [card, card.style.transform]));
    const width = stack.offsetWidth;
    // Reserve room for the tilted corners inside the page's clipped artwork.
    const availableTravel = section.getBoundingClientRect().right - stack.getBoundingClientRect().right - width * 0.18;
    const { outbound, inbound } = getTeamShuffleFrames(width, cards.length - 1, compact(), availableTravel);
    try {
      front.style.zIndex = "100";
      const leaving = animate(front, outbound, 170, "cubic-bezier(0.3, 0, 0.2, 1)", "forwards");
      await leaving.finished;
      order = finalOrder;
      positionCards();
      front.style.zIndex = "100";
      const settling = order.filter((card) => card !== front).map((card) => animate(card, [
        { transform: previousTransforms.get(card) },
        { transform: card.style.transform },
      ], 260, "cubic-bezier(0.22, 1, 0.36, 1)"));
      leaving.cancel();
      const returning = animate(front, inbound, 220, "cubic-bezier(0.22, 1, 0.36, 1)", "forwards");
      // Keep the card above the stack until it has cleared the right edge.
      const lowerCard = window.setTimeout(() => {
        if (version === shuffleVersion) front.style.zIndex = "1";
      }, 85);
      try {
        await Promise.all([returning, ...settling].map((animation) => animation.finished));
      } finally { window.clearTimeout(lowerCard); }
    } catch (error) {
      if (error.name !== "AbortError") throw error;
    } finally {
      if (version === shuffleVersion) {
        animations.forEach((animation) => animation.cancel());
        animations.clear();
        positionCards();
        isShuffling = false;
        const nextIndex = pendingIndex;
        pendingIndex = null;
        if (nextIndex !== null) selectMember(nextIndex);
      }
    }
  };

  const update = () => {
    frame = null;
    if (mobile.matches || motion.matches) return;
    const progress = getTeamScrollProgress(section.getBoundingClientRect().top + prelude.offsetHeight, step, cards.length);
    selectMember(Math.min(cards.length - 1, Math.floor(progress + 0.5)));
  };
  const schedule = () => {
    if (frame === null) frame = window.requestAnimationFrame(update);
  };
  const resize = () => {
    step = Math.max(340, window.innerHeight * 0.55);
    section.style.setProperty("--team-scroll-distance", `${cards.length * step}px`);
    section.classList.toggle("is-scroll-stack", !motion.matches && !mobile.matches);
    section.classList.toggle("is-mobile-carousel", mobile.matches);
    stack.tabIndex = mobile.matches ? 0 : -1;
    stack.setAttribute("aria-label", mobile.matches ? "Team portraits. Swipe or use the arrow keys and buttons to meet everyone." : "Team portraits");
    section.style.setProperty("--team-intro-height", `${prelude.offsetHeight}px`);
    resetShuffle();
    if (!initialized) selectMember(selected, true);
    // A resize can interrupt a shuffle before its cards have been reordered.
    order = [cards[selected], ...order.filter((card) => card !== cards[selected])];
    positionCards();
    schedule();
  };
  list.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-about-member]");
    const index = buttons.indexOf(button);
    if (index < 0) return;
    if (mobile.matches || motion.matches) selectMember(index);
    else {
      const top = window.scrollY + section.getBoundingClientRect().top + prelude.offsetHeight;
      window.scrollTo({ top: top + (index + 0.35) * step, behavior: "smooth" });
    }
  });
  const select = (index) => {
    if (!mobile.matches) return;
    selectMember(Math.max(0, Math.min(members.length - 1, index)));
  };
  previous.addEventListener("click", () => select(selected - 1));
  next.addEventListener("click", () => select(selected + 1));
  stack.addEventListener("keydown", (event) => {
    if (!mobile.matches || !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    if (event.key === "Home") select(0);
    else if (event.key === "End") select(members.length - 1);
    else select(selected + (event.key === "ArrowRight" ? 1 : -1));
  });
  let pointerStart = null;
  stack.addEventListener("pointerdown", (event) => {
    if (!mobile.matches || event.pointerType === "mouse") return;
    pointerStart = { x: event.clientX, y: event.clientY };
  });
  stack.addEventListener("pointerup", (event) => {
    if (!pointerStart) return;
    const dx = event.clientX - pointerStart.x;
    const dy = event.clientY - pointerStart.y;
    pointerStart = null;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.25) select(selected + (dx < 0 ? 1 : -1));
  });
  stack.addEventListener("pointercancel", () => { pointerStart = null; });
  window.addEventListener("scroll", () => {
    if (!mobile.matches && !motion.matches) schedule();
  }, { passive: true });
  window.addEventListener("resize", resize);
  motion.addEventListener("change", resize);
  mobile.addEventListener("change", resize);
  new ResizeObserver(resize).observe(prelude);
  resize();
};
