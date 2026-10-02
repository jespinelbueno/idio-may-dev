import { initResponsiveNav } from "./features/responsive-nav.js";
import { initCustomCursor } from "./features/custom-cursor.js";
import { initPageHeroTakeover } from "./features/page-hero-takeover.js";

initResponsiveNav({ navSelector: ".services-nav", transitionSelector: ".about-story" });
initCustomCursor();
initPageHeroTakeover(".about-hero-takeover");
