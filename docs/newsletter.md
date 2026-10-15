# Events email signup

## Current state: paused

As of October 15, 2026, the owner has not yet supplied the full legal operator
identity, public mailing address or target markets. New website submissions are
paused pending those details and verification of provider-side controls.

`events.html` has `data-signup-paused`, disabled signup controls, no provider action,
and CSP with `connect-src 'self'` and `form-action 'none'`. Its initializer cancels
synthetic submissions before initializing request logic. Without JavaScript the
native controls and CSP still prevent submission. The displayed note and public
privacy notice explain the pause.

This is a source change, effective on a deployed copy after publication/loading.
It does not disable the Brevo-hosted endpoint or an older deployment, stop an
existing campaign, or remove existing subscriptions. Those require account access.

## Retained integration

The dormant request helper retains the last supplied public Brevo form endpoint
(`e0a2c1d4.sibforms.com`). No secret API key belongs in this repository. Reopening
must confirm that this is still the intended form and coordinate its HTML action,
CSP, controls, notice and tests; follow [privacy-launch-review.md](privacy-launch-review.md).

Protections retained for that future integration:

- Email format/length validation and Brevo's empty honeypot.
- Explicit boolean opt-in before a request; `OPT_IN=1` only for affirmative consent.
- Pinned HTTPS destination, no cookies/referrer/redirects or response HTML injection.
- HTTP-success JSON with boolean `success: true` required for an acknowledgment.
- 15-second timeout, no automatic retry, pending-request exclusion and cooldown.
- No email address storage or logging; accessible confirmation dialog.

An acknowledgment proves neither ownership of an address nor confirmed membership.
Double confirmation, consent evidence, tracking and unsubscribe controls live in
Brevo. Client validation, a honeypot and cooldown do not secure the public endpoint
against direct requests. CAPTCHA must be enabled and verified by Brevo before its
regenerated embed is integrated; do not add a cosmetic client-only CAPTCHA.

## Provider work and verification

[privacy-operations.md](privacy-operations.md) supplies the configuration,
retention, request-handling and provider-evidence procedures. Items are not marked
complete without execution and evidence from the authorized account operator.

`npm run check` verifies the current pause, consent and request-helper protections
using mocks. It makes no real subscriptions. A future provider test needs an
owner-authorized address and must prove confirmation, permission records, no
unauthorized tracking and successful unsubscribe/suppression. Publish through the
existing Hostinger/Vercel setup; GitHub Actions performs static checks only.
