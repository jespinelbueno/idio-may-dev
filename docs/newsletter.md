# Events email signup

## Current state: active

Restored October 16, 2026 at the owner's request. The Events form submits to the
existing public Brevo endpoint (`e0a2c1d4.sibforms.com`) using the request helper
with JavaScript, or a native POST without JavaScript. The email field, required
unchecked newsletter choice, submit button and signup calls to action are enabled.
The page CSP permits only this provider origin for signup connections/submissions.

The privacy notice reflects active collection. Restoring the form does not verify
or change provider settings, sender details, existing contacts or campaigns. The
owner identity/address and account-side checks remain recorded as open in
[privacy-launch-review.md](privacy-launch-review.md). No deployment or real signup
was made as part of the restoration.

## Integration protections

No secret API key belongs in this repository. The HTML action and request helper
use the same pinned HTTPS destination.

Protections retained:

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

## Unsubscribe button

`/privacy#unsubscribe` contains a compact link styled as a button, pointing directly
to the supplied Brevo-hosted unsubscribe form. The Events signup note links to this
privacy-page section. The hosted URL was opened in a browser and verified to show
Idio's unsubscribe form with an email field and Unsubscribe button.

The website collects no unsubscribe address, sends no unsubscribe request and shows
no unsubscribe success message. Brevo handles the form and response on its own
origin. The link works without JavaScript and opens in the same tab. It has no
email query parameter and uses `rel="noopener noreferrer"`. Privacy-page CSP is
back to same-origin connections and no form submissions. The superseded local
unsubscribe request/controller modules and their request-specific tests are removed.

Earlier live tests on October 16 used only the owner-authorized contact. The native
POST flow displayed a provider validation error despite owner-confirmed email
blocklisting in the CRM. Brevo's supplied embed and the intermediate local AJAX
version displayed success for that already-blocklisted contact. These are historical
test results, not a new test of every campaign or automation. The final hosted-form
link was verified without submitting another address. Contact details and screenshots
are not stored in this repository.

## Provider work and verification

[privacy-operations.md](privacy-operations.md) supplies the configuration,
retention, request-handling and provider-evidence procedures. Items are not marked
complete without execution and evidence from the authorized account operator.

`npm run check` verifies the active form, consent and request-helper protections
using mocks. It makes no real subscriptions. A future provider test needs an
owner-authorized address and must prove confirmation, permission records, no
unauthorized tracking and successful unsubscribe/suppression. Publish through the
existing Hostinger/Vercel setup; GitHub Actions performs static checks only.
