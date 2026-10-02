import { initResponsiveNav } from "./features/responsive-nav.js";
import { initCustomCursor } from "./features/custom-cursor.js";

initResponsiveNav({ navSelector: ".services-nav", transitionSelector: ".about-story" });
initCustomCursor();
