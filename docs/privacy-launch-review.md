# Privacy implementation and launch review

## Confirmed owner details

Idio Creative, Virginia, United States. The owner requested the site's
existing contact email: idiocreative@outlook.com. The public notice uses that
address. No street address, entity suffix, or company registration is invented.
The owner does not yet have the public mailing address and will ask for it.
Add the confirmed address to the newsletter consent request and email templates
before relying on the form for Canada-facing express consent or sending marketing.

## Implemented behavior

- `privacy.html` is a static public entry point, included in validation and Pages
  packaging. Its notice describes the current website, not hypothetical products.
- Every main public page has persistent privacy and cookie-settings links. The
  preserved backup loader is a development reference, not a new public experience.
- `privacy-bootstrap.js` is imported first by the existing page script entries
  and executes before optional intro storage. Nothing optional
  is read for its feature or written before a valid affirmative choice.
- The preference record `idio-privacy-v1` stores version, a boolean for intro
  memory, saved time, and expiry. Both acceptance and rejection last 180 days.
  No visitor ID, IP address, email, location, or remote consent log is created.
- Invalid, future-dated, unknown-version, and expired preferences default to off.
  Missing permission removes legacy intro timestamps without using them.
- The intro timestamp is used for seven days, with expiry enforced on the next
  check, rather than a claim that localStorage expires itself. Withdrawal removes
  it immediately in the current tab and propagates via browser storage events.
- Blocked storage and quota failure leave optional memory off. The popup explains
  persistence failure and allows continuing without a saved choice. Fully blocked
  storage can require browser settings to remove an old record.
- Closing the first dialog rejects optional storage. Closing reopened settings
  leaves the saved choice intact. Equal accept/reject buttons, an unchecked
  optional checkbox, and a separate save action avoid implied consent.
- Modal keyboard behavior, scrolling, focus return, and native pointer visibility
  are supported. The privacy page is readable without an automatic modal.
- Without JavaScript, optional memory does not run, privacy links still work,
  and the homepage loader has a CSS fallback so it cannot cover those links.
- No website analytics, advertising pixels, profiling, or social embeds are
  installed. GPC/DNT do not enable any tracking; sale/sharing for behavioral ads
  is absent regardless of the signals. Consent is not a future tracking license.
- Custom service-worker caching is retired. Existing same-scope installations
  update to a worker that deletes only `idio-site-*` caches, claims clients, and
  unregisters. New visitors do not register a worker. Normal HTTP caching remains.
- Existing installations may use the old worker until their browser successfully
  fetches and activates its replacement. A static deployment cannot retroactively
  stop a browser that has not retrieved the update. Do not claim otherwise.
- Newsletter consent stays separate, with no real submissions during tests.
  The signup note now links to Idio's notice as well as Brevo's notice.

## Required operational review before public launch or marketing

This code and notice cannot guarantee immunity from legal claims or compliance in
every country in the Americas. A privacy lawyer should review applicability,
regional disclosures, transfer safeguards, and actual business operations.

1. Confirm Idio Creative is the complete controller/operator identity. Supply any
   mailing address, representative, or other contact information required by the
   laws that apply. The public notice currently uses the confirmed name, state,
   country, and existing email only.
2. Confirm that this mailbox is monitored for access, correction, deletion,
   objection, authorized-agent, and appeal requests. Assign an owner and a process
   to verify requests proportionately and meet applicable response deadlines.
3. Set documented retention periods for newsletter contacts, inactive subscribers,
   inquiries, consent evidence, suppression records, backups, and client records.
   The notice does not invent periods for provider-side records we cannot inspect.
   Implement the retention rules in Brevo/email systems and align the notice.
4. Verify double opt-in, consent evidence, sender identity/contact details,
   unsubscribe links, and suppression behavior in Brevo. An acknowledgment from
   the public form endpoint is not proof of ownership or successful membership.
   Canada-facing commercial emails need special attention under CASL; US messages
   need the applicable CAN-SPAM identification, mailing-address, and unsubscribe
   requirements. Do not claim the checkbox alone completes these requirements.
   The existing development signup has not been disabled by this privacy-page
   task; its missing mailing address remains an explicit pre-launch gap.
5. Review Brevo open/click tracking and disable it unless a reviewed disclosure,
   legal basis, and withdrawal process cover it. The notice currently discloses
   that email measurement depends on campaign settings and is separate from site
   storage settings; it does not falsely claim it is disabled in the account.
6. Review provider agreements, subprocessors, account locations, required transfer
   safeguards, access controls/MFA, and breach-response obligations. A privacy
   policy link or cookie acceptance does not replace these arrangements.
7. Verify the deployed domain over HTTPS in a clean browser and an existing
   browser profile, including response cookies, request destinations, worker
   retirement, cache cleanup, and native no-JavaScript Brevo submission behavior.
   Source inspection cannot establish every header emitted by hosting/providers.
8. Review applicable US state laws and thresholds, Canadian federal/provincial
   rules (including Quebec where relevant), Brazil's LGPD, and other countries
   actually targeted. Check language/accessibility requirements. This English
   notice is not presented as a legal localization for every country.
9. Before adding analytics, CAPTCHA, embedded video, advertising, payments,
   accounts, geolocation, or other data collection: review the integration,
   update CSP, inventory and public notice, and implement purpose-specific gating
   before it loads. Version the consent record and obtain a fresh choice for new
   optional purposes. Do not reuse intro-memory acceptance for another purpose.

## Sources reviewed

- [California: CalOPPA privacy disclosures](https://oag.ca.gov/sites/all/files/agweb/pdfs/cybersecurity/making_your_privacy_practices_public.pdf)
- [Canada: meaningful consent](https://www.priv.gc.ca/en/privacy-topics/privacy-for-businesses/appropriate-handling-of-personal-information/collecting-personal-information-and-consent/consent/gl_omc_201805/)
- [Canada: business privacy principles](https://www.priv.gc.ca/en/privacy-topics/information-and-advice-for-individuals/your-privacy-rights/businesses-and-your-personal-information/)
- [Canada: CASL](https://crtc.gc.ca/eng/com500/faq500.htm)
- [United States: CAN-SPAM](https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business)
- [Brazil: ANPD cookies guidance](https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia_orientativo_cookies_e_protecao_de_dados_pessoais)
- [GitHub Pages: IP logging](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)

## Verification

Run `npm run check`. Privacy regression tests cover default denial, acceptance,
rejection, expiry, malformed data, timestamp lifetime, withdrawal across tabs,
blocked/quota-limited storage, public links, and scoped worker migration. Browser
QA covers the actual dialog and page layout separately. No live email signup,
deployment, or provider-account change is performed by these checks.
