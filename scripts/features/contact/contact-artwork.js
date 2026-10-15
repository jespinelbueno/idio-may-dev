// Scale the native-size Figma SVGs together without changing their proportions.
export function initContactArtwork() {
  const hero = document.querySelector(".contact-hero");
  const artwork = hero?.querySelector(".contact-hero__accents");
  if (!hero || !artwork) return;

  const syncScale = () => {
    hero.style.setProperty("--contact-art-scale", artwork.clientWidth / 1920);
  };

  syncScale();
  const observer = new ResizeObserver(syncScale);
  observer.observe(artwork);
}
