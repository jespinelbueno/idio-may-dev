import "./privacy-bootstrap.js";
import { initPrivacyPreferences } from "./features/shared/privacy-preferences.js";
import { initImageSaveDeterrent } from "./features/shared/image-save-deterrent.js";
import { initComingSoonArtwork } from "./features/coming-soon/coming-soon-artwork.js";
import { initResponsiveNav } from "./features/shared/responsive-nav.js";
import { initCustomCursor } from "./features/shared/custom-cursor.js";

initImageSaveDeterrent();
initComingSoonArtwork();
initResponsiveNav({ navSelector: ".services-nav", transitionSelector: ".coming-soon__button" });
initCustomCursor();

initPrivacyPreferences();
