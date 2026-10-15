import { initFooterLinkCircles } from "./features/footer-link-circles.js";
import { initServicesProcess } from "./features/services-process.js";
import { initServicesCardStack } from "./features/services-card-stack.js";
import { initCustomCursor } from "./features/custom-cursor.js";
import { initServicesHeroReveal } from "./features/services-hero-reveal.js";
import { initServicesWorkCarousel } from "./features/services-work-carousel.js";

import { initResponsiveNav } from "./features/responsive-nav.js";

initResponsiveNav({ navSelector: ".services-nav", transitionSelector: ".services-offer" });
initCustomCursor();
initServicesHeroReveal();

initServicesCardStack();
initServicesWorkCarousel();

initServicesProcess();

initFooterLinkCircles();
