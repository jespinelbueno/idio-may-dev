import { initNotFoundArtwork } from "./features/not-found-artwork.js";
import { initResponsiveNav } from "./features/responsive-nav.js";
import { initCustomCursor } from "./features/custom-cursor.js";

initNotFoundArtwork();
initResponsiveNav({ navSelector: ".services-nav", transitionSelector: ".not-found__button" });
initCustomCursor();
