import { initResponsiveNav } from "./features/responsive-nav.js";
import { initCustomCursor } from "./features/custom-cursor.js";

import { initCommunitySignup } from "./features/community-signup.js";
import { initEventsHeroVideo } from "./features/events-hero-video.js";
import { initPageHeroTakeover } from "./features/page-hero-takeover.js";

initCommunitySignup();
initEventsHeroVideo();
initPageHeroTakeover(".events-hero-takeover");
initResponsiveNav({ navSelector: ".services-nav", transitionSelector: ".events-community" });
initCustomCursor();
