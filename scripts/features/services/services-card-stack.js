export function initServicesCardStack() {
  const stack = document.querySelector('.services-cards');
  if (!stack) return;

  const cards = [...stack.querySelectorAll('.service-card')];
  if (!cards.length) return;

  const desktop = window.matchMedia('(min-width: 1101px)');
  const mobile = window.matchMedia('(max-width: 640px)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const transferred = new Set();
  let movingUntil = 0;
  let lastPointer = null;
  let mobileOrder = [cards[1], cards[3], cards[2], cards[0]].filter(Boolean);

  const renderMobileOrder = () => {
    mobileOrder.forEach((card, index) => {
      card.style.setProperty('--mobile-stack-position', String(index));
      if (mobile.matches) card.querySelector('.service-card__select')?.setAttribute('aria-pressed', String(index === mobileOrder.length - 1));
    });
  };

  const select = (card) => {
    const layout = window.getComputedStyle(stack).getPropertyValue('--services-stack-mode').trim();
    if (mobile.matches && layout === 'mobile-stack') {
      const selected = mobileOrder.at(-1) === card ? mobileOrder[0] : card;
      mobileOrder = mobileOrder.filter(item => item !== selected).concat(selected);
      renderMobileOrder();
      return;
    }
    if (!desktop.matches || layout === 'flow' || performance.now() < movingUntil) return;
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
    if (!desktop.matches || event.pointerType === 'touch') return;
    const changed = !lastPointer || event.clientX !== lastPointer.x || event.clientY !== lastPointer.y;
    lastPointer = { x: event.clientX, y: event.clientY };
    if (!changed || performance.now() < movingUntil) return;
    const card = event.target.closest('.service-card');
    if (card && stack.contains(card)) select(card);
  });
  stack.addEventListener('pointerleave', () => { lastPointer = null; });
  stack.classList.add('is-interactive');
  const syncLabels = () => {
    cards.forEach((card) => {
      const button = card.querySelector('.service-card__select');
      const name = card.querySelector('h3').innerText.replace(/\s+/g, ' ');
      button.setAttribute('aria-label', mobile.matches ? `Show ${name} service details; select the front card to view the next service` : `Move ${name} between stacks`);
      if (!mobile.matches) button.setAttribute('aria-pressed', String(transferred.has(card)));
    });
    renderMobileOrder();
  };
  mobile.addEventListener('change', syncLabels);
  syncLabels();
}
