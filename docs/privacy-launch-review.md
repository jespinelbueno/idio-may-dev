# Privacy implementation and launch review

Implementation updated October 16, 2026. This is an implementation record, not a worldwide
compliance certification. The owner has not yet supplied the full legal operator
identity, public mailing address, or countries actively served.

## Current result

- The notice describes browser storage, inquiries, existing newsletter records,
  and hosting configured for Hostinger and Vercel. GitHub Pages is not identified
  as the current host. Hosting request logs/statistics are distinguished from
  visitor analytics scripts.
- The notice now explains purpose-specific legal bases, voluntary inquiry data,
  retention criteria, objections, appeals, regulator contacts, and how to request
  transfer-safeguard information. Links to provider DPAs describe published terms,
  not evidence that Idio's account arrangements have been verified.
- The owner explicitly requested restoration of the Brevo form on October 16.
  New Events newsletter submissions are enabled again with the existing endpoint,
  unchecked required opt-in, request protections and native POST fallback. CSP
  permits signup connections on Events. The notice and signup copy match this state.
- `/privacy#unsubscribe` now contains only a compact button linking directly to
  Brevo's hosted unsubscribe form, as requested by the owner. The hosted URL was
  browser-verified to show the email field and Unsubscribe button. No local email
  collection, unsubscribe handler, request or success UI remains. Privacy-page CSP
  permits only same-origin connections and no form submissions. The Events note
  links to the button's section.
- Earlier live tests confirmed email blocklisting through an owner-supplied CRM
  screenshot. The native POST path showed misleading feedback; Brevo's embed and
  the intermediate local AJAX version showed success. Those local modules were
  removed when the owner requested a direct hosted-form link. No further contact
  was submitted while verifying that link. All-campaign suppression remains untested.
- Restoration is a local source change and does not establish that the outstanding
  account/business checks below have been completed. No pause flag remains in the
  form or initializer; pending operational review is not a code gate.
- Live unsubscribe tests used only the owner-authorized contact, including
  retries after its confirmed blocklisting. The contact was not resubscribed. No
  account settings, campaigns, signup or deployment were changed during testing.

## Browser controls already implemented

`idio-privacy-v1` stores only a version, intro boolean, saved time, and expiry.
Both acceptance and rejection last 180 days. No visitor ID or remote consent log
is created. Optional intro use defaults to off until a valid affirmative choice;
invalid, expired, future-dated, unsupported, or unavailable storage fails closed.
The choice selects only the shorter homepage intro. It never enables newsletter
marketing, email measurement, analytics, or a new data-processing purpose.

Legacy `idio-home-loader-v1` timestamps are removed without being used. Withdrawal
applies to future homepage visits and other tabs after storage events. An intro
already playing finishes its selected sequence. Initial dialog dismissal rejects;
closing reopened settings keeps the saved choice. Accept and reject have equal
availability. The privacy page stays readable without an automatic popup.

No analytics scripts, advertising pixels, profiling, or social embeds are installed.
The custom service-worker cache is retired; migration deletes only `idio-site-*`
caches and unregisters the old worker when the browser receives the update.
Ordinary HTTP caching remains. Without JavaScript, privacy links work and the
newsletter form submits directly to Brevo.

## Outstanding operational evidence

Store account evidence in restricted business storage, not this repository. Each
item needs its verifier, date, and evidence reference. An unchecked item is open;
writing a policy or finding a vendor help article does not close it.

| Item | Required evidence | Status |
| --- | --- | --- |
| Operator identity | Full legal operator/trading-name relationship and a public mailing address; add to notice where required, signup consent request, and email templates. | Waiting for owner |
| Market scope | Countries actively targeted, services offered, applicable thresholds/exemptions, language needs, and any required representative or privacy officer. | Waiting for owner / jurisdiction review |
| Email permission | Brevo form uses Double confirmation; an unconfirmed address cannot enter marketing sends or automations. Preserve exact consent text/version, source, submission and confirmation dates, and withdrawal history. | Account access needed |
| Tracking | Disable individual open/click tracking across campaigns, automation, transactional and confirmation messages. If supported, enable per-contact consent with unknown contacts excluded; test the actual message HTML and links. Anonymization alone is not proof that no tracking occurs. | Account access needed |
| Unsubscribe | Clear sender identity, valid mailing address, working no-login unsubscribe, and suppression from all marketing paths. | Tested contact email-blocklisted, confirmed by owner screenshot October 16; hosted form link verified; sender details and all-send suppression checks remain open |
| Existing records | Inventory existing contacts and campaigns; verify permission, suppression and retention before future sends. Restoring the website does not verify them. | Account access needed |
| Retention | Run the inventory and review procedure in privacy-operations.md, apply deletion/restriction rules in Brevo and email, and document backup expiry and justified exceptions. | Operator action needed |
| Providers/transfers | Record actual host/domain mapping, contracting entities, processing countries, subprocessors, applicable DPA and transfer mechanism, and any necessary transfer assessment. Include Brevo and Microsoft. | Account access / jurisdiction review needed |
| Request handling | Assign a monitored mailbox owner and backup, verify access, and run a mock request through the procedure without collecting extra personal data. | Owner assignment needed |
| Security | Verify provider MFA/access, HTTPS, response cookies/headers, log retention and incident contacts on the real domains. | Production details / access needed |

## Follow-up verification

1. Complete the evidence table and align the notice with verified business and
   provider practices. The form restoration does not mark pending items complete.
2. In Brevo, verify Double confirmation, consent records, suppression and actual
   tracking behavior. Retire obsolete hosted forms where appropriate. Browser
   validation is bypassable; CAPTCHA requires provider-side verification and an
   updated embed before integration.
3. Use an owner-authorized address for any future controlled provider test. Check
   confirmation, recorded permission, outgoing content, unsubscribe and suppression.
   Do not import subscribers or send a campaign as a test.
4. Publish through the existing Hostinger/Vercel setup and verify the real domain,
   with and without JavaScript. CI performs checks only and does not deploy GitHub
   Pages. Confirm existing browser profiles receive the retired-worker update.

## Verification

`npm run check` covers linked source files, asset aliases, JavaScript syntax,
privacy preference behavior, active form configuration, request helper
protections, CSP and cache migration. These checks do not inspect provider
accounts, deployed response headers, consent evidence, or legal applicability.

## Official sources

Sources checked October 15, 2026. Operational details and vendor interfaces can
change; follow current official guidance at implementation time.

- [ICO: information a privacy notice should provide](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/individual-rights/the-right-to-be-informed/what-privacy-information-should-we-provide/)
- [European Commission: transparency and other obligations](https://commission.europa.eu/law/law-topic/data-protection/information-business-and-organisations/obligations_en)
- [Canada: meaningful consent](https://www.priv.gc.ca/en/privacy-topics/privacy-for-businesses/appropriate-handling-of-personal-information/collecting-personal-information-and-consent/consent/gl_omc_201805/)
- [Canada: sender and consent-request identification](https://crtc.gc.ca/eng/archive/2012/2012-548.htm)
- [US: CAN-SPAM requirements](https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business)
- [California: CCPA applicability](https://oag.ca.gov/privacy/ccpa)
- [Brazil: ANPD cookie guidance](https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia_orientativo_cookies_e_protecao_de_dados_pessoais)
- [Hostinger DPA](https://www.hostinger.com/legal/dpa)
- [Vercel DPA](https://vercel.com/legal/dpa)
- [Brevo: form Double confirmation](https://help.brevo.com/hc/en-us/articles/208771869-Create-a-sign-up-form-in-Brevo)
- [Brevo: per-contact tracking consent](https://help.brevo.com/hc/en-us/articles/37114679474706-About-email-tracking-pixels-and-the-CNIL-recommendation-in-Brevo)
