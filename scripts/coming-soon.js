import "./privacy-bootstrap.js";
import { initPrivacyPreferences } from "./features/privacy-preferences.js";
import { initImageSaveDeterrent } from "./features/image-save-deterrent.js";
import { initComingSoonArtwork } from "./features/coming-soon-artwork.js";
import { initResponsiveNav } from "./features/responsive-nav.js";
import { initCustomCursor } from "./features/custom-cursor.js";

initImageSaveDeterrent();
initComingSoonArtwork();
initResponsiveNav({ navSelector: ".services-nav", transitionSelector: ".coming-soon__button" });
initCustomCursor();

initPrivacyPreferences();
