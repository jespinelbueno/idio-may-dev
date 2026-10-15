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
  const mobile = window.matchMedia("(max-width: 760px), (max-width: 1024px) and (max-height: 500px) and (pointer: coarse)");
  const roles = buttons.map((button) => button.closest("dl > div").querySelector("dd").textContent);
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
  const caption = document.createElement("div");
  caption.className = "about-team__caption";
  caption.setAttribute("role", "status");
  caption.setAttribute("aria-atomic", "true");
  const name = document.createElement("h3");
  const role = document.createElement("p");
  caption.append(name, role);
  const controls = document.createElement("div");
  controls.className = "about-team__controls";
  const makeControl = (label, arrow) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "team__carousel-button";
    button.setAttribute("aria-label", label);
    button.setAttribute("aria-controls", stack.id);
    const icon = document.createElement("span");
    icon.className = "button-fill__label";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = arrow;
    button.append(icon);
    return button;
  };
  const previous = makeControl("Previous team member", "←");
  const next = makeControl("Next team member", "→");
  const count = document.createElement("span");
  count.className = "about-team__count";
  controls.append(previous, count, next);
  section.querySelector(".about-team__layout").append(caption, controls);
  stack.setAttribute("role", "group");
  let selected = 0;
  let displayed = null;
  let previousTimestamp = null;
  let frame = null;
  let step = 0;

  const render = (progress) => {
    const active = Math.min(members.length - 1, Math.floor(progress + 0.5));
    cards.forEach((card, index) => {
      const pose = getTeamCardPose(index, progress, cards.length);
      if (mobile.matches) {
        pose.x = pose.y = pose.z = pose.rotate = pose.turn = 0;
        pose.opacity = index === active ? 1 : 0;
      }
      card.style.transform = `translate3d(${pose.x}px, ${pose.y}px, ${pose.z}px) rotateZ(${pose.rotate}deg) rotateY(${pose.turn}deg)`;
      card.style.opacity = String(pose.opacity);
      card.style.zIndex = String(cards.length - index);
      card.setAttribute("aria-hidden", String(index !== active));
    });
    buttons.forEach((button, index) => {
      button.setAttribute("aria-pressed", String(index === active));
      button.closest("dl > div").classList.toggle("is-featured", index === active);
    });
    name.textContent = buttons[active].textContent;
    role.textContent = roles[active];
    count.textContent = `${active + 1} / ${members.length}`;
    previous.disabled = active === 0;
    next.disabled = active === members.length - 1;
    if (!mobile.matches && selected !== active) status.textContent = `Showing ${memberNames[members[active]]}.`;
    selected = active;
  };

  const update = (timestamp) => {
    frame = null;
    const target = mobile.matches || motion.matches ? selected : getTeamScrollProgress(section.getBoundingClientRect().top + prelude.offsetHeight, step, cards.length);
    const elapsed = previousTimestamp === null ? 1000 / 60 : Math.min(64, timestamp - previousTimestamp);
    displayed = mobile.matches || motion.matches ? target : smoothAboutThreadProgress(displayed, target, elapsed, 80);
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
    section.classList.toggle("is-scroll-stack", !motion.matches && !mobile.matches);
    section.classList.toggle("is-mobile-carousel", mobile.matches);
    stack.tabIndex = mobile.matches ? 0 : -1;
    stack.setAttribute("aria-label", mobile.matches ? "Team portraits. Swipe or use the arrow keys and buttons to meet everyone." : "Team portraits");
    section.style.setProperty("--team-intro-height", `${prelude.offsetHeight}px`);
    displayed = null;
    schedule();
  };
  list.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-about-member]");
    const index = buttons.indexOf(button);
    if (index < 0) return;
    if (mobile.matches || motion.matches) { displayed = index; render(index); }
    else {
      const top = window.scrollY + section.getBoundingClientRect().top + prelude.offsetHeight;
      window.scrollTo({ top: top + (index + 0.35) * step, behavior: "smooth" });
    }
  });
  const select = (index) => {
    if (!mobile.matches) return;
    displayed = Math.max(0, Math.min(members.length - 1, index));
    render(displayed);
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
