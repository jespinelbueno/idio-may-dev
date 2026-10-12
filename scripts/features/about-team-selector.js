import { getTeamScrollProgress, getTeamCardPose } from "./about-team-scroll-progress.js";
import { smoothAboutThreadProgress } from "./about-thread-progress.js";

const memberNames = {
  anna: "Anna Moore", jaden: "Jaden Anderson", raquel: "Raquel Bowles",
  naomi: "Naomi Moore", gretel: "Gretel Lam",
};

export const initAboutTeamSelector = async () => {
  const section = document.querySelector(".about-team");
  const list = section?.querySelector(".about-team__members");
  const stack = section?.querySelector(".about-team__stack");
  const template = stack?.querySelector(".about-team__polaroid--front");
  if (!section || !list || !stack || !template) return;
  const buttons = [...list.querySelectorAll("button[data-about-member]")];
  const members = buttons.map((button) => button.dataset.aboutMember);
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const status = document.createElement("p");
  status.className = "about-team__photo-status";
  status.setAttribute("role", "status");
  section.querySelector(".about-team__layout").append(status);

  try {
    await Promise.all(members.map(async (member) => {
      const image = new Image();
      image.src = `assets/media/team/${member}2.jpg`;
      await image.decode();
    }));
  } catch { return; }

  const cards = members.map((member) => {
    const card = template.cloneNode(true);
    card.removeAttribute("id");
    card.classList.remove("about-team__polaroid--front");
    const image = card.querySelector("img");
    image.src = `assets/media/team/${member}2.jpg`;
    image.alt = `${memberNames[member]} in a field.`;
    image.setAttribute("data-member-photo", "");
    image.loading = "eager";
    return card;
  });
  stack.replaceChildren(...cards);
  section.classList.add("is-card-stack");
  const prelude = section.querySelector(".about-team__intro-block").cloneNode(true);
  prelude.className = "about-team__mobile-intro";
  prelude.querySelectorAll("[id]").forEach((node) => node.removeAttribute("id"));
  section.prepend(prelude);
  let selected = 0;
  let displayed = null;
  let previousTimestamp = null;
  let frame = null;
  let step = 0;

  const render = (progress) => {
    const active = Math.min(members.length - 1, Math.floor(progress + 0.5));
    cards.forEach((card, index) => {
      const pose = getTeamCardPose(index, progress, cards.length);
      card.style.transform = `translate3d(${pose.x}px, ${pose.y}px, ${pose.z}px) rotateZ(${pose.rotate}deg) rotateY(${pose.turn}deg)`;
      card.style.opacity = String(pose.opacity);
      card.style.zIndex = String(cards.length - index);
      card.setAttribute("aria-hidden", String(index !== active));
    });
    buttons.forEach((button, index) => {
      button.setAttribute("aria-pressed", String(index === active));
      button.closest("dl > div").classList.toggle("is-featured", index === active);
    });
    if (selected !== active) status.textContent = `Showing ${memberNames[members[active]]}.`;
    selected = active;
  };

  const update = (timestamp) => {
    frame = null;
    const target = motion.matches ? selected : getTeamScrollProgress(section.getBoundingClientRect().top + prelude.offsetHeight, step, cards.length);
    const elapsed = previousTimestamp === null ? 1000 / 60 : Math.min(64, timestamp - previousTimestamp);
    displayed = motion.matches ? target : smoothAboutThreadProgress(displayed, target, elapsed, 80);
    render(displayed);
    if (displayed !== target) {
      previousTimestamp = timestamp;
      frame = window.requestAnimationFrame(update);
    } else previousTimestamp = null;
  };
  const schedule = () => {
    if (frame === null) frame = window.requestAnimationFrame(update);
  };
  const resize = () => {
    step = Math.max(340, window.innerHeight * 0.55);
    section.style.setProperty("--team-scroll-distance", `${cards.length * step}px`);
    section.classList.toggle("is-scroll-stack", !motion.matches);
    section.style.setProperty("--team-intro-height", `${prelude.offsetHeight}px`);
    displayed = null;
    schedule();
  };
  list.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-about-member]");
    const index = buttons.indexOf(button);
    if (index < 0) return;
    if (motion.matches) { displayed = index; render(index); }
    else {
      const top = window.scrollY + section.getBoundingClientRect().top + prelude.offsetHeight;
      window.scrollTo({ top: top + (index + 0.35) * step, behavior: "smooth" });
    }
  });
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", resize);
  motion.addEventListener("change", resize);
  new ResizeObserver(resize).observe(prelude);
  resize();
};
