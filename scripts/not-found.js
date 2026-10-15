import "./privacy-bootstrap.js";
import { initPrivacyPreferences } from "./features/privacy-preferences.js";
import { initImageSaveDeterrent } from "./features/image-save-deterrent.js";
import { initNotFoundArtwork } from "./features/not-found-artwork.js";
import { initResponsiveNav } from "./features/responsive-nav.js";
import { initCustomCursor } from "./features/custom-cursor.js";

initImageSaveDeterrent();
initNotFoundArtwork();
initResponsiveNav({ navSelector: ".services-nav", transitionSelector: ".not-found__button" });
initCustomCursor();

initPrivacyPreferences();
