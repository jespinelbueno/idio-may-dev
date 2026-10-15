import { initPrivacyPreferences } from "./features/privacy-preferences.js";
import { initImageSaveDeterrent } from "./features/image-save-deterrent.js";
import { initFooterLinkCircles } from "./features/footer-link-circles.js";
import { initCopyrightYear } from "./features/copyright-year.js";
import { initResponsiveNav } from "./features/responsive-nav.js";
import { initCustomCursor } from "./features/custom-cursor.js";
import { initAboutTeamSelector } from "./features/about-team-selector.js";
import { initAboutThreadDraw } from "./features/about-thread-draw.js";

initImageSaveDeterrent();
initResponsiveNav({ navSelector: ".services-nav", transitionSelector: ".about-story" });
initCustomCursor();
initAboutThreadDraw();

initAboutTeamSelector();

initFooterLinkCircles();
initCopyrightYear();

initPrivacyPreferences();
