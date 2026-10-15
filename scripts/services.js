import "./privacy-bootstrap.js";
import { initPrivacyPreferences } from "./features/privacy-preferences.js";
import { initImageSaveDeterrent } from "./features/image-save-deterrent.js";
import { initFooterLinkCircles } from "./features/footer-link-circles.js";
import { initCopyrightYear } from "./features/copyright-year.js";
import { initServicesProcess } from "./features/services-process.js";
import { initServicesCardStack } from "./features/services-card-stack.js";
import { initCustomCursor } from "./features/custom-cursor.js";
import { initServicesHeroReveal } from "./features/services-hero-reveal.js";
import { initServicesWorkCarousel } from "./features/services-work-carousel.js";

import { initResponsiveNav } from "./features/responsive-nav.js";

initImageSaveDeterrent();
initResponsiveNav({ navSelector: ".services-nav", transitionSelector: ".services-offer" });
initCustomCursor();
initServicesHeroReveal();

initServicesCardStack();
initServicesWorkCarousel();

initServicesProcess();

initFooterLinkCircles();
initCopyrightYear();

initPrivacyPreferences();
