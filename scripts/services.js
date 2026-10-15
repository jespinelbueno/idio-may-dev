import "./privacy-bootstrap.js";
import { initPageLoader } from "./features/shared/page-loader.js";
import { initPrivacyPreferences } from "./features/shared/privacy-preferences.js";
import { initImageSaveDeterrent } from "./features/shared/image-save-deterrent.js";
import { initFooterLinkCircles } from "./features/shared/footer-link-circles.js";
import { initCopyrightYear } from "./features/shared/copyright-year.js";
import { initServicesProcess } from "./features/services/services-process.js";
import { initServicesCardStack } from "./features/services/services-card-stack.js";
import { initCustomCursor } from "./features/shared/custom-cursor.js";
import { initServicesHeroReveal } from "./features/services/services-hero-reveal.js";
import { initServicesWorkCarousel } from "./features/services/services-work-carousel.js";

import { initResponsiveNav } from "./features/shared/responsive-nav.js";

initPageLoader();
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
