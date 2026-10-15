import "./privacy-bootstrap.js";
import { initPrivacyPreferences } from "./features/privacy-preferences.js";
import { initImageSaveDeterrent } from "./features/image-save-deterrent.js";
import { initFooterLinkCircles } from "./features/footer-link-circles.js";
import { initCopyrightYear } from "./features/copyright-year.js";
import { initResponsiveNav } from "./features/responsive-nav.js";
import { initCustomCursor } from "./features/custom-cursor.js";

import { initCommunitySignup } from "./features/community-signup.js";
import { initEventsHeroVideo } from "./features/events-hero-video.js";

initImageSaveDeterrent();
initCommunitySignup();
initEventsHeroVideo();
initResponsiveNav({ navSelector: ".services-nav", transitionSelector: ".events-community" });
initCustomCursor();

initFooterLinkCircles();
initCopyrightYear();

initPrivacyPreferences();
