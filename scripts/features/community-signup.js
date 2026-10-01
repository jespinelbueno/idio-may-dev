import { isValidSignupEmail, sendCommunitySignup } from './community-signup-request.js';

export const initCommunitySignup = ({ sendSignup = sendCommunitySignup } = {}) => {
  const form = document.querySelector('#community-signup');
  const email = form?.querySelector('input[type="email"]');
  const status = document.getElementById('community-signup-status');
  const dialog = document.getElementById('signup-confirmation');
  const button = form?.querySelector('button[type="submit"]');
  if (!form || !email || !status || !dialog || !button) return;
  const label = button.querySelector('.button-fill__label');
  const defaultLabel = label.textContent;
  let pending = false;
  let retryAfter = 0;

  document.querySelectorAll('[data-community-signup-link]').forEach((link) => {
    link.addEventListener('click', () => email.focus({ preventScroll: true }));
  });
  email.addEventListener('input', () => {
    email.setCustomValidity('');
    if (!pending) status.textContent = '';
  });
  dialog.addEventListener('close', () => button.focus({ preventScroll: true }));

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (pending) return;
    email.value = email.value.trim();
    email.setCustomValidity(isValidSignupEmail(email.value) ? '' : 'Please enter a valid email address, like you@example.com.');
    if (!form.reportValidity()) return;
    if (form.elements.namedItem('email_address_check')?.value) {
      status.textContent = 'Your signup could not be sent. Please reload the page and try again.';
      return;
    }
    if (Date.now() < retryAfter) {
      status.textContent = 'Please wait a moment before trying again.';
      return;
    }

    pending = true;
    button.disabled = true;
    email.readOnly = true;
    form.setAttribute('aria-busy', 'true');
    label.textContent = 'sending…';
    status.textContent = 'Sending your signup…';
    try {
      if (await sendSignup(email.value) !== true) throw new Error('Unexpected result');
      form.reset();
      status.textContent = 'Your signup request has been received.';
      dialog.showModal();
    } catch (error) {
      // Fixed text only: never render provider messages, HTML, or the address.
      const messages = {
        'rate-limit': 'Too many attempts. Please wait a minute before trying again.',
        timeout: 'We couldn’t confirm the result in time. Check your inbox before trying again.',
        network: 'We couldn’t confirm your signup. Check your connection and inbox before trying again.',
      };
      status.textContent = messages[error?.code] || 'Your signup could not be confirmed. Please try again shortly.';
      retryAfter = Date.now() + (error?.code === 'rate-limit' ? 60000 : 5000);
    } finally {
      pending = false;
      button.disabled = false;
      email.readOnly = false;
      form.removeAttribute('aria-busy');
      label.textContent = defaultLabel;
    }
  });
};
