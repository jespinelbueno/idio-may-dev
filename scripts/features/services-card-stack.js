export function initServicesCardStack() {
  const stack = document.querySelector('.services-cards');
  if (!stack) return;

  const cards = [...stack.querySelectorAll('.service-card')];
  if (!cards.length) return;

  const desktop = window.matchMedia('(min-width: 901px)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const transferred = new Set();
  let movingUntil = 0;
  let lastPointer = null;

  const select = (card) => {
    if (!desktop.matches || performance.now() < movingUntil) return;
    const returning = transferred.has(card);
    if (returning) transferred.delete(card);
    else transferred.add(card);
    movingUntil = performance.now() + (reducedMotion.matches ? 0 : 700);
    card.classList.toggle('is-selected', !returning);
    card.querySelector('.service-card__select').setAttribute('aria-pressed', String(!returning));
    [...transferred].forEach((item, position) => {
      item.style.setProperty('--transferred-order', String(5 + position));
      item.style.setProperty('--transferred-x', `${position * 18}%`);
      item.style.setProperty('--transferred-angle', `${[0, -3, 2, -1][position % 4]}deg`);
    });
  };

  cards.forEach((card) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'service-card__select';
    button.setAttribute('aria-label', `Move ${card.querySelector('h3').innerText.replace(/\s+/g, ' ')} between stacks`);
    button.setAttribute('aria-pressed', 'false');
    button.addEventListener('click', () => select(card));
    card.append(button);
  });

  // Only physical pointer movement selects a card. A moving card exposing the
  // next card must not automatically deal the entire pile under a still cursor.
  stack.addEventListener('pointermove', (event) => {
    if (event.pointerType === 'touch') return;
    const changed = !lastPointer || event.clientX !== lastPointer.x || event.clientY !== lastPointer.y;
    lastPointer = { x: event.clientX, y: event.clientY };
    if (!changed || performance.now() < movingUntil) return;
    const card = event.target.closest('.service-card');
    if (card && stack.contains(card)) select(card);
  });
  stack.addEventListener('pointerleave', () => { lastPointer = null; });
  stack.classList.add('is-interactive');
}
