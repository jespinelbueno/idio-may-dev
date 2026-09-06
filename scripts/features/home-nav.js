import { initResponsiveNav } from "./responsive-nav.js";

export const initHomeNav = () => {
  initResponsiveNav({ navSelector: ".home-nav", transitionSelector: ".offer" });
};
