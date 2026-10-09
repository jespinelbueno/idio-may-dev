import { initResponsiveNav } from "./features/responsive-nav.js";
import { initCustomCursor } from "./features/custom-cursor.js";
import { initAboutThreadDraw } from "./features/about-thread-draw.js";

initResponsiveNav({ navSelector: ".services-nav", transitionSelector: ".about-story" });
initCustomCursor();
initAboutThreadDraw();
