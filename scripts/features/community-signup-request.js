export const COMMUNITY_SIGNUP_ENDPOINT = 'https://21c6bf62.sibforms.com/serve/MUIFAFF4JjBjXfyEU5JyC2DzCP5Bv5QHJ9DLnZckuLcnrtsktw58e6bCDKEYAV7Om3TgRcMcrBkGVrzh2RFIHm1JqZEmxPMoZBZhIBZzfQb2BD-P3hCidqGeqD_W7oQuO3vYfEO_40fD5ewGex7ckpJGms2C6_SxYJHVr3CQNEjAbU62KBedoVnYOdJpsxi2vNS0MgeoX8IoX7aV2g==';
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

export const sendCommunitySignup = async (email, { fetchImpl = fetch, timeoutMs = 15000 } = {}) => {
  if (!isValidSignupEmail(email)) throw new SignupError('invalid');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const body = new FormData();
  body.set('EMAIL', email);
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
