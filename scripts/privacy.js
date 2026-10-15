import "./privacy-bootstrap.js";
import { initPageLoader } from "./features/shared/page-loader.js";
import { initPrivacyPreferences } from "./features/shared/privacy-preferences.js";
import { initResponsiveNav } from "./features/shared/responsive-nav.js";
import { initCustomCursor } from "./features/shared/custom-cursor.js";
import { initFooterLinkCircles } from "./features/shared/footer-link-circles.js";
import { initCopyrightYear } from "./features/shared/copyright-year.js";

initPageLoader();
initResponsiveNav({ navSelector: ".services-nav", transitionSelector: ".privacy-layout" });
initCustomCursor();
initFooterLinkCircles();
initCopyrightYear();
initPrivacyPreferences();
