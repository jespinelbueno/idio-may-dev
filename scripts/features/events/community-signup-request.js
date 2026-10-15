export const COMMUNITY_SIGNUP_ENDPOINT = 'https://e0a2c1d4.sibforms.com/serve/MUIFAADTJr0_nfd4Tqr0DMKfye3XCZunKihJV6WPT_2txzxiwNYykBwzvENOAu66YxsgeeS6ZDOyPWYKM-mhq-NuQHcpxdxR21c5dQyN_sIIHNHKiCR62JF6b3JvmYyKODvbsRALrRgLbRkt5f5MJAOGPJSpHF_lXcJJk7cWVXzUuYlnTz650s7KgacZXaxOy0FIGCnzd7piOfYgDw==';
const MAX_EMAIL_LENGTH = 254;

export const isValidSignupEmail = (email) => {
  if (typeof email !== 'string' || email.length > MAX_EMAIL_LENGTH) return false;
  // Keep browser and request validation aligned; reject whitespace and controls.
  return /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email)
    && !/[\u0000-\u001f\u007f]/.test(email);
};

export class SignupError extends Error {
  constructor(code) {
    super(code);
    this.code = code;
  }
}

export const sendCommunitySignup = async (email, { optIn = false, fetchImpl = fetch, timeoutMs = 15000 } = {}) => {
  if (!isValidSignupEmail(email)) throw new SignupError('invalid');
  if (optIn !== true) throw new SignupError('consent');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const body = new FormData();
  body.set('EMAIL', email);
  body.set('OPT_IN', '1');
  body.set('locale', 'en');
  body.set('email_address_check', '');

  try {
    // Pin the destination; never read it from the URL, storage, or server response.
    const response = await fetchImpl(`${COMMUNITY_SIGNUP_ENDPOINT}?isAjax=1`, {
      method: 'POST', body, signal: controller.signal,
      mode: 'cors', credentials: 'omit', redirect: 'error',
      referrerPolicy: 'no-referrer', cache: 'no-store',
    });
    if (response.status === 429) throw new SignupError('rate-limit');
    if (!response.ok) throw new SignupError('server');
    if (!response.headers.get('content-type')?.includes('application/json')) {
      throw new SignupError('unexpected');
    }
    const result = await response.json();
    // Never inject provider HTML, execute scripts, or follow response redirects.
    if (!result || result.success !== true) throw new SignupError('rejected');
    return true;
  } catch (error) {
    if (error instanceof SignupError) throw error;
    throw new SignupError(controller.signal.aborted ? 'timeout' : 'network');
  } finally {
    clearTimeout(timeout);
  }
};
