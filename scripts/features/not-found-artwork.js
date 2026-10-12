// Scale both complete Figma frames together; individual SVGs keep their native sizes.
export function initNotFoundArtwork() {
  const artwork = document.querySelector(".not-found__artwork");
  if (!artwork) return;

  const syncArtwork = () => {
    artwork.style.setProperty("--not-found-art-scale", artwork.clientWidth / 1344);
  };
  syncArtwork();
  new ResizeObserver(syncArtwork).observe(artwork);
}
