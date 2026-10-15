import "./privacy-bootstrap.js";
import { initPageLoader } from "./features/shared/page-loader.js";
import { initPrivacyPreferences } from "./features/shared/privacy-preferences.js";
import { initImageSaveDeterrent } from "./features/shared/image-save-deterrent.js";
import { initNotFoundArtwork } from "./features/not-found/not-found-artwork.js";
import { initResponsiveNav } from "./features/shared/responsive-nav.js";
import { initCustomCursor } from "./features/shared/custom-cursor.js";

initPageLoader();
initImageSaveDeterrent();
initNotFoundArtwork();
initResponsiveNav({ navSelector: ".services-nav", transitionSelector: ".not-found__button" });
initCustomCursor();

initPrivacyPreferences();
