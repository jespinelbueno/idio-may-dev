import { initCaseStudyStack } from "./features/case-study-stack.js";
import { initHomeLoader } from "./features/home-loader.js";
import { initHomeNav } from "./features/home-nav.js";
import { initOfferParallax } from "./features/offer-parallax.js";
import { initToolkitCircles } from "./features/toolkit-circles.js";
import { initValuesWheel } from "./features/values-wheel/controller.js";
import { initViewportHeight } from "./features/viewport-height.js";

initViewportHeight();
initHomeNav();
initOfferParallax();
initToolkitCircles();
initHomeLoader();
initCaseStudyStack();
initValuesWheel();
