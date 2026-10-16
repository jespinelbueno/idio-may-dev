export function initServicesWorkCarousel() {
  const gallery = document.querySelector('.services-work__gallery');
  const track = gallery?.querySelector('.services-work__track');
  const previous = gallery?.querySelector('.services-work__previous');
  const next = gallery?.querySelector('.services-work__next');
  if (!track || !previous || !next) return;

  const slides = [...track.querySelectorAll('.services-work__item')];
  if (!slides.length) return;
  const mobile = window.matchMedia('(max-width: 640px)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let requestedIndex = 0;
  let updateFrame = 0;
  let rotationTimer = null;
  let inView = false;
  let interacting = false;

  const scheduleRotation = () => {
    window.clearTimeout(rotationTimer);
    rotationTimer = null;
    if (!mobile.matches || reducedMotion.matches || document.hidden || !inView || interacting || slides.length < 2) return;
    rotationTimer = window.setTimeout(() => {
      if (document.body.classList.contains('is-loading')) {
        scheduleRotation();
        return;
      }
      syncIndex();
      move(1);
    }, 3500);
  };

  const update = () => {
    updateFrame = 0;
    const maximum = Math.max(0, track.scrollWidth - track.clientWidth);
    previous.disabled = slides.length < 2 || (!mobile.matches && track.scrollLeft <= 2);
    next.disabled = slides.length < 2 || (!mobile.matches && track.scrollLeft >= maximum - 2);
  };

  const requestUpdate = () => {
    if (!updateFrame) updateFrame = window.requestAnimationFrame(update);
  };

  const move = (direction) => {
    if (!mobile.matches) return;
    requestedIndex = (requestedIndex + direction + slides.length) % slides.length;
    const bounds = slides[requestedIndex].getBoundingClientRect();
    const trackBounds = track.getBoundingClientRect();
    track.scrollTo({
      left: track.scrollLeft + bounds.left - trackBounds.left,
      behavior: reducedMotion.matches ? 'auto' : 'smooth',
    });
    scheduleRotation();
  };

  const syncIndex = () => {
    if (!mobile.matches) return;
    const left = track.getBoundingClientRect().left;
    requestedIndex = slides.reduce((nearest, slide, index) =>
      Math.abs(slide.getBoundingClientRect().left - left) <
      Math.abs(slides[nearest].getBoundingClientRect().left - left) ? index : nearest, 0);
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
  track.addEventListener('scroll', () => {
    requestUpdate();
    scheduleRotation();
  }, { passive: true });
  track.addEventListener('scrollend', () => {
    syncIndex();
    update();
    scheduleRotation();
  });
  track.addEventListener('pointerdown', () => {
    interacting = true;
    scheduleRotation();
  }, { passive: true });
  const finishInteraction = () => {
    if (!interacting) return;
    interacting = false;
    scheduleRotation();
  };
  window.addEventListener('pointerup', finishInteraction, { passive: true });
  window.addEventListener('pointercancel', finishInteraction, { passive: true });
  const observer = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting && entry.intersectionRatio >= 0.5;
    scheduleRotation();
  }, { threshold: [0, 0.5] });
  observer.observe(track);
  document.addEventListener('visibilitychange', scheduleRotation);
  reducedMotion.addEventListener('change', scheduleRotation);
  const syncLayout = () => {
    track.tabIndex = mobile.matches ? 0 : -1;
    requestedIndex = 0;
    track.scrollTo({ left: 0, behavior: 'auto' });
    requestUpdate();
    scheduleRotation();
  };
  mobile.addEventListener('change', syncLayout);
  if ('ResizeObserver' in window) new ResizeObserver(requestUpdate).observe(track);
  syncLayout();
}
