import "./privacy-bootstrap.js";
import { initPageLoader } from "./features/shared/page-loader.js";
import { initPrivacyPreferences } from "./features/shared/privacy-preferences.js";
import { initImageSaveDeterrent } from "./features/shared/image-save-deterrent.js";
import { initContactArtwork } from "./features/contact/contact-artwork.js";
import { initResponsiveNav } from "./features/shared/responsive-nav.js";
import { initCustomCursor } from "./features/shared/custom-cursor.js";

initPageLoader();
initImageSaveDeterrent();
initContactArtwork();
initResponsiveNav({ navSelector: ".services-nav", transitionSelector: ".contact-hero__socials" });
initCustomCursor();

initPrivacyPreferences();
