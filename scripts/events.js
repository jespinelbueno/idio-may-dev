import "./privacy-bootstrap.js";
import { initPrivacyPreferences } from "./features/shared/privacy-preferences.js";
import { initImageSaveDeterrent } from "./features/shared/image-save-deterrent.js";
import { initFooterLinkCircles } from "./features/shared/footer-link-circles.js";
import { initCopyrightYear } from "./features/shared/copyright-year.js";
import { initResponsiveNav } from "./features/shared/responsive-nav.js";
import { initCustomCursor } from "./features/shared/custom-cursor.js";

import { initCommunitySignup } from "./features/events/community-signup.js";
import { initEventsHeroVideo } from "./features/events/events-hero-video.js";

initImageSaveDeterrent();
initCommunitySignup();
initEventsHeroVideo();
initResponsiveNav({ navSelector: ".services-nav", transitionSelector: ".events-community" });
initCustomCursor();

initFooterLinkCircles();
initCopyrightYear();

initPrivacyPreferences();
