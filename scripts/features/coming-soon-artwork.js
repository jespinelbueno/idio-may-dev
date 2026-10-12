// Anchor the unchanged Figma SVGs to their words, including after fonts load.
export function initComingSoonArtwork() {
  const title = document.querySelector(".coming-soon__title");
  const content = title?.closest(".coming-soon__content");
  const word = title?.querySelector(".coming-soon__word");
  const phrase = title?.querySelector(".coming-soon__phrase");
  if (!title || !content || !word || !phrase) return;

  const syncArtwork = () => {
    title.style.setProperty("--soon-underline-scale", word.clientWidth / 189.567);
    title.style.setProperty("--soon-circle-scale", phrase.clientWidth * 1.2 / 701.02);
    content.style.setProperty("--soon-copy-offset", `${(content.clientHeight - title.clientHeight) / 2}px`);
  };

  syncArtwork();
  const observer = new ResizeObserver(syncArtwork);
  observer.observe(word);
  observer.observe(phrase);
  observer.observe(content);
}
