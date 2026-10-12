import { initComingSoonArtwork } from "./features/coming-soon-artwork.js";
import { initResponsiveNav } from "./features/responsive-nav.js";
import { initCustomCursor } from "./features/custom-cursor.js";

initComingSoonArtwork();
initResponsiveNav({ navSelector: ".services-nav", transitionSelector: ".coming-soon__button" });
initCustomCursor();
