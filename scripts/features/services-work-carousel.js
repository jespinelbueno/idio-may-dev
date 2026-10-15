export function initServicesWorkCarousel() {
  const gallery = document.querySelector('.services-work__gallery');
  const track = gallery?.querySelector('.services-work__track');
  const previous = gallery?.querySelector('.services-work__previous');
  const next = gallery?.querySelector('.services-work__next');
  if (!track || !previous || !next) return;

  const slides = [...track.querySelectorAll('.services-work__item')];
  const mobile = window.matchMedia('(max-width: 640px)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let requestedIndex = 0;
  let updateFrame = 0;

  const update = () => {
    updateFrame = 0;
    const maximum = Math.max(0, track.scrollWidth - track.clientWidth);
    previous.disabled = track.scrollLeft <= 2;
    next.disabled = track.scrollLeft >= maximum - 2;
  };

  const requestUpdate = () => {
    if (!updateFrame) updateFrame = window.requestAnimationFrame(update);
  };

  const move = (direction) => {
    if (!mobile.matches) return;
    requestedIndex = Math.min(slides.length - 1, Math.max(0, requestedIndex + direction));
    const bounds = slides[requestedIndex].getBoundingClientRect();
    const trackBounds = track.getBoundingClientRect();
    track.scrollTo({
      left: track.scrollLeft + bounds.left - trackBounds.left,
      behavior: reducedMotion.matches ? 'auto' : 'smooth',
    });
  };

  previous.addEventListener('click', () => move(-1));
  next.addEventListener('click', () => move(1));
  track.addEventListener('keydown', (event) => {
    if (!mobile.matches || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    if (event.key === 'Home') requestedIndex = 1;
    if (event.key === 'End') requestedIndex = slides.length - 2;
    move(event.key === 'ArrowLeft' || event.key === 'Home' ? -1 : 1);
  });
  track.addEventListener('scroll', requestUpdate, { passive: true });
  track.addEventListener('scrollend', () => {
    if (!mobile.matches) return;
    const left = track.getBoundingClientRect().left;
    requestedIndex = slides.reduce((nearest, slide, index) =>
      Math.abs(slide.getBoundingClientRect().left - left) <
      Math.abs(slides[nearest].getBoundingClientRect().left - left) ? index : nearest, 0);
    update();
  });
  const syncLayout = () => {
    track.tabIndex = mobile.matches ? 0 : -1;
    requestedIndex = 0;
    track.scrollTo({ left: 0, behavior: 'auto' });
    requestUpdate();
  };
  mobile.addEventListener('change', syncLayout);
  if ('ResizeObserver' in window) new ResizeObserver(requestUpdate).observe(track);
  syncLayout();
}
