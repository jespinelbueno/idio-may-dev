const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
const CIRCLE_SOURCE = "assets/media/footer/decorations/link-circle.svg";

export const initFooterLinkCircles = async () => {
  const footer = document.querySelector(".site-footer");
  if (!footer) return;

  let original;
  try {
    const response = await fetch(CIRCLE_SOURCE);
    if (!response.ok) return;
    original = new DOMParser().parseFromString(await response.text(), "image/svg+xml").documentElement;
    if (original.localName !== "svg") return;
  } catch {
    return;
  }

  const node = (tag, attributes) => {
    const element = document.createElementNS(SVG_NAMESPACE, tag);
    Object.entries(attributes).forEach(([name, value]) => element.setAttribute(name, value));
    return element;
  };

  footer.querySelectorAll("a[href]").forEach((link, index) => {
    if (link.querySelector(".site-footer__hover-circle")) return;

    const circle = document.importNode(original, true);
    // Keep the exported ink intact; only a moving mask reveals it.
    circle.querySelectorAll("[id]").forEach(element => element.removeAttribute("id"));
    const [x, y, width, height] = circle.getAttribute("viewBox").split(/\s+/).map(Number);
    const bounds = { x: x - 4, y: y - 4, width: width + 8, height: height + 8 };
    circle.setAttribute("viewBox", `${bounds.x} ${bounds.y} ${bounds.width} ${bounds.height}`);
    circle.setAttribute("class", "site-footer__hover-circle");
    circle.setAttribute("aria-hidden", "true");
    circle.setAttribute("focusable", "false");

    const maskId = `footer-link-circle-${index}`;
    const artwork = node("g", { mask: `url(#${maskId})` });
    while (circle.firstChild) artwork.append(circle.firstChild);
    const mask = node("mask", { id: maskId, maskUnits: "userSpaceOnUse", ...bounds });
    [
      "M97 4C72 2 26 4 9 10C-7 17 5 27 30 30C57 34 95 32 109 23C124 12 105 4 73 5",
      "M98 2C107 4 117 9 112 18",
    ].forEach((d, part) => mask.append(node("path", {
      d, fill: "none", stroke: "white", "stroke-width": 6,
      "stroke-linecap": "round", "stroke-linejoin": "round", pathLength: 1,
      class: `site-footer__circle-stroke${part ? " site-footer__circle-stroke--finish" : ""}`,
    })));
    // Once the pen finishes, expose every textured edge of the original SVG.
    mask.append(node("rect", { ...bounds, fill: "white", class: "site-footer__circle-complete" }));
    const defs = node("defs", {});
    defs.append(mask);
    circle.append(defs, artwork);
    link.append(circle);
  });
};
