import { initResponsiveNav } from "../shared/responsive-nav.js";

export const initHomeNav = () => {
  initResponsiveNav({ navSelector: ".home-nav", transitionSelector: ".offer" });
};
