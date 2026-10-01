import { initResponsiveNav } from "./features/responsive-nav.js";
import { initCustomCursor } from "./features/custom-cursor.js";

import { initCommunitySignup } from "./features/community-signup.js";

initCommunitySignup();
initResponsiveNav({ navSelector: ".services-nav", transitionSelector: ".events-community" });
initCustomCursor();
