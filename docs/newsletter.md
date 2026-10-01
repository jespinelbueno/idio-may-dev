# Events email signup

The Events form posts to the public Brevo form endpoint from the supplied embed.
With JavaScript, it uses Brevo's `?isAjax=1` contract. Without JavaScript, it retains
native POST submission to Brevo. No secret API key belongs in this repository.

The confirmation dialog only opens for an HTTP-success JSON response containing
boolean `success: true`. This confirms receipt of a request, not email ownership
or membership: a live invalid-value probe returned that acknowledgment too.
Confirmation-email and list settings are controlled in Brevo.

## Protections implemented

- Required email format and length validation, plus the Brevo honeypot.
- Fixed HTTPS submission destination, no cookies, no referrer, no redirects.
- Page CSP limits scripts to local files and connections/forms to this Brevo host.
- Provider HTML, messages, and redirect URLs are never rendered or followed.
- A 15-second timeout and no automatic retries for uncertain results.
- Pending submissions cannot overlap; failures keep the input for correction.
- A brief retry cooldown (60 seconds for HTTP 429). This is a UI safeguard,
  not server-enforced rate limiting.
- Emails are not written to browser storage or logs.
- Native modal dialog with focus management, Escape dismissal, and labeled copy.

## Provider-side work still required

Enable and verify double opt-in in the Brevo form. Enable a Brevo-supported CAPTCHA
(Turnstile or reCAPTCHA), then supply the regenerated embed so its public site key,
required token field, and allowed script/frame hosts can be integrated. Do not add
CAPTCHA markup without enabling its verification in Brevo. Restrict allowed
CAPTCHA hostnames to the real site and intended test hosts.

Client-side validation, the honeypot, and cooldowns can be bypassed. They do not
secure the public endpoint against direct automated requests. Do not describe
this implementation as fully spam-proof or claim CAPTCHA is already active.

## Verification

`npm run check` runs static checks and the signup regression tests. Tests use
mocked responses and do not subscribe addresses. Desktop and mobile modal QA uses
an isolated temporary fixture, never a production query parameter or bypass.
For a live end-to-end test, use an address you control, confirm the email if
required, and verify membership in the intended Brevo list. This does not deploy
the local website; the repository's existing Pages workflow remains responsible.
