import { initContactArtwork } from "./features/contact-artwork.js";
import { initResponsiveNav } from "./features/responsive-nav.js";
import { initCustomCursor } from "./features/custom-cursor.js";

initContactArtwork();
initResponsiveNav({ navSelector: ".services-nav", transitionSelector: ".contact-hero__socials" });
initCustomCursor();
