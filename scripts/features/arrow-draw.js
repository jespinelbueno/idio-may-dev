const SVG_NAMESPACE = "http://www.w3.org/2000/svg";

// Tail-to-tip guides reveal the original filled artwork through a stroked mask.
// The separate head guide finishes each arrow after its curved shaft is drawn.
const guides = {
  green1: ["M137 27 C90 -16 68 6 4 51", "M8 25 L4 51 L36 41", 12],
  green2: ["M52 240 C66 205 65 140 52 122 C24 90 -18 114 12 151 C30 176 71 168 76 130 C79 96 45 29 21 3", "M27 33 L21 3 L48 18", 9],
  green3: ["M34 359 C38 260 31 75 18 24 L9 3", "M4 44 L9 3 L37 24", 14],
  green4: ["M25 3 C22 36 25 104 27 134", "M2 100 Q12 120 27 134 Q38 126 48 107", 10],
  green5: ["M4 107 C35 111 66 65 63 24 L57 4", "M45 32 L57 4 L75 28", 10],
  green6: ["M64 322 C-20 249 -6 139 33 85 C56 50 89 25 148 7", "M103 2 L148 7 L133 38", 10],
  yellow1: ["M75 187 C56 166 17 130 30 100 C40 69 72 75 83 88 C113 126 -20 164 7 100 C28 55 62 26 128 22", "M96 4 L132 12 L112 40", 12],
  yellow2: ["M8 158 C38 144 77 97 57 77 C39 59 14 63 17 89 C18 116 68 124 86 92 C98 69 103 34 95 5", "M84 23 L95 4 L106 23", 10],
  yellow3: ["M52 149 C12 141 -6 103 11 68 C24 39 45 19 77 4", "M49 5 L79 3 L60 26", 10],
  yellow4: ["M4 107 C35 111 66 65 63 24 L57 4", "M45 32 L57 4 L75 28", 10],
  yellow5: ["M17 103 C21 83 19 50 24 15 L24 4", "M3 27 L24 4 L40 26", 8],
};

export const initArrowDraw = () => {
  const wheelArrows = [...document.querySelectorAll(".values-wheel-arrow")];
  const teamMembers = [...document.querySelectorAll(".team__member")];
  if (!wheelArrows.length && !teamMembers.length) return;

  const createArrow = async (source, key, id) => {
    const response = await fetch(source);
    if (!response.ok) throw new Error(`Arrow asset unavailable: ${source}`);
    const parsed = new DOMParser().parseFromString(await response.text(), "image/svg+xml");
    const original = parsed.documentElement;
    if (original.localName !== "svg") throw new Error(`Invalid arrow SVG: ${source}`);
    const svg = document.importNode(original, true);
    const [shaft, head, width] = guides[key];
    const node = (tag, attributes = {}) => {
      const element = document.createElementNS(SVG_NAMESPACE, tag);
      Object.entries(attributes).forEach(([name, value]) => element.setAttribute(name, value));
      return element;
    };
    const artwork = node("g", { mask: `url(#${id})` });
    while (svg.firstChild) artwork.appendChild(svg.firstChild);
    const [x, y, w, h] = svg.getAttribute("viewBox").split(/\s+/).map(Number);
    const mask = node("mask", { id, maskUnits: "userSpaceOnUse", x, y, width: w, height: h });
    [shaft, head].forEach((d, index) => {
      mask.appendChild(node("path", {
        d, fill: "none", stroke: "white", "stroke-width": width,
        "stroke-linecap": "round", "stroke-linejoin": "round", pathLength: 1,
        class: `arrow-draw__stroke arrow-draw__stroke--${index ? "head" : "shaft"}`,
      }));
    });
    // Uncover every textured edge once the pen reaches the tip.
    mask.appendChild(node("rect", {
      x, y, width: w, height: h, fill: "white", class: "arrow-draw__complete",
    }));
    const defs = node("defs");
    defs.appendChild(mask);
    svg.append(defs, artwork);
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    return svg;
  };

  wheelArrows.forEach(async (image, index) => {
    const key = image.getAttribute("src").split("/").pop().replace(".svg", "");
    if (!guides[key]) return;
    try {
      const svg = await createArrow(image.getAttribute("src"), key, `wheel-arrow-draw-${index}`);
      // Read current state after loading so a hover during the fetch is preserved.
      svg.setAttribute("class", `${image.className} arrow-draw`);
      svg.dataset.valueTitle = image.dataset.valueTitle;
      image.replaceWith(svg);
    } catch {
      // Keep the existing image if an asset cannot be loaded.
    }
  });

  teamMembers.forEach(async (member, index) => {
    const key = `yellow${index + 1}`;
    if (!guides[key]) return;
    try {
      const svg = await createArrow(`assets/media/decorations/arrows/our-team/${key}.svg`, key, `team-arrow-draw-${index}`);
      svg.setAttribute("class", "team__arrow arrow-draw");
      member.appendChild(svg);
      member.classList.add("has-drawn-arrow");
    } catch {
      // The CSS background remains available as a fallback.
    }
  });
};
