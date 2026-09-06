import { initCustomCursor } from "./features/custom-cursor.js";
import { initServicesHeroReveal } from "./features/services-hero-reveal.js";

import { initResponsiveNav } from "./features/responsive-nav.js";

initResponsiveNav({ navSelector: ".services-nav", transitionSelector: ".services-offer" });
initCustomCursor();
initServicesHeroReveal();
