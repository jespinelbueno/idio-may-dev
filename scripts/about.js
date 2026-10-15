import "./privacy-bootstrap.js";
import { initPageLoader } from "./features/shared/page-loader.js";
import { initPrivacyPreferences } from "./features/shared/privacy-preferences.js";
import { initImageSaveDeterrent } from "./features/shared/image-save-deterrent.js";
import { initFooterLinkCircles } from "./features/shared/footer-link-circles.js";
import { initCopyrightYear } from "./features/shared/copyright-year.js";
import { initResponsiveNav } from "./features/shared/responsive-nav.js";
import { initCustomCursor } from "./features/shared/custom-cursor.js";
import { initAboutTeamSelector } from "./features/about/about-team-selector.js";
import { initAboutThreadDraw } from "./features/about/about-thread-draw.js";

initPageLoader();
initImageSaveDeterrent();
initResponsiveNav({ navSelector: ".services-nav", transitionSelector: ".about-story" });
initCustomCursor();
initAboutThreadDraw();

initAboutTeamSelector();

initFooterLinkCircles();
initCopyrightYear();

initPrivacyPreferences();
