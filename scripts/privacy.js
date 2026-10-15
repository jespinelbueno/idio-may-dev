import { initPrivacyPreferences } from "./features/privacy-preferences.js";
import { initResponsiveNav } from "./features/responsive-nav.js";
import { initCustomCursor } from "./features/custom-cursor.js";
import { initFooterLinkCircles } from "./features/footer-link-circles.js";
import { initCopyrightYear } from "./features/copyright-year.js";

initResponsiveNav({ navSelector: ".services-nav", transitionSelector: ".privacy-layout" });
initCustomCursor();
initFooterLinkCircles();
initCopyrightYear();
initPrivacyPreferences();
