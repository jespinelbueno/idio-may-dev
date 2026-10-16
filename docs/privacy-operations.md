# Privacy operations procedure

Prepared October 15, 2026. Ready for operator adoption and execution. This file
contains no customer records and does not show that account tasks have been done.
The public notice states retention criteria; provider-side enforcement remains
unverified until an authorized operator completes the launch evidence table.

## Responsibilities and private records

Assign a primary owner and backup for idiocreative@outlook.com for handling
newsletter subscriptions and privacy requests. Check requests each business day. Keep the request
register, consent evidence, deletion records, contracts and incident evidence in
restricted business storage with appropriate MFA and access controls. Never put
email addresses, subscriber exports, request contents, credentials, identification
or private account screenshots in this repository or a public issue.

For each request, record a case reference, receipt date, requested action, relevant
jurisdiction, verification needed, legal deadline, assigned owner, actions taken,
response date and any appeal. Record only what is needed to handle the case.

## Access, correction, deletion, objection and appeal

1. Acknowledge within two business days as an internal service target, not a legal
   deadline or a condition for starting the clock. Flag marketing withdrawal for
   immediate action and determine the applicable deadline at intake. Some
   jurisdictions require an immediate response or a response within 15 days;
   never assume a universal 30- or 45-day period. If jurisdiction is unknown,
   start work promptly and obtain advice without delaying the request.
2. Verify proportionately using the existing correspondence/subscription address
   where possible. Do not routinely request identity documents. Do not reveal
   whether an unrelated person subscribes. Confirm any representative's authority
   without requesting more data than necessary.
3. Search only relevant systems: Outlook correspondence, Brevo contact/consent
   and suppression records, and applicable host logs. Browser preferences are
   local; explain site-data controls rather than claiming remote access to them.
4. For marketing withdrawal, apply provider suppression across campaigns and
   automations immediately. Preserve only the minimum suppression/evidence
   needed. Removing a contact from one list is not proof it cannot be mailed.
   Do not send a new marketing or re-consent message to bypass an objection.
5. Correct or delete active records where required. Notify relevant processors;
   track confirmation. Check queues, exports, integrations, backups and legal
   holds. Do not promise immediate erasure of provider-controlled backup copies;
   document expiry and prevent restored data being reintroduced to marketing.
6. Reply with the outcome, scope, relevant exceptions and reasons, and the
   applicable complaint/appeal route. Send personal-data exports only through a
   suitable verified, access-controlled channel. Record the response privately.
7. Assign an appeal to another authorized reviewer where possible. Preserve the
   original request date and independently determine the appeal deadline. Do not
   reset a statutory clock by asking the person to submit a new request.

Acknowledgment template (adapt before sending):

> We received your privacy request on [date] about [brief scope]. We are reviewing
> it and will respond within the applicable deadline. [If necessary: To protect
> your information, please confirm your request from the address you used with
> us.] Please do not send passwords or identity documents.

Completion template:

> We have [action] in [systems/scope]. [Any justified exception, reason and
> remaining retention criterion.] You can request a review by replying with
> “Privacy appeal”. You may also complain to [applicable authority/contact].

These are drafts, not messages sent to anyone.

## Retention review and disposal

Perform an initial inventory of newsletter records, then a monthly review.
The monthly cadence is an internal review target; withdrawal and mandatory
legal deadlines must be handled sooner. First determine what already exists;
the form was restored on October 16, 2026; this does not verify existing records.

| Record | Review trigger and action |
| --- | --- |
| Browser preference | Automatically expires after 180 days; invalid/expired records are removed at the next site check. No central user inventory is created. |
| Unconfirmed newsletter signup | Exclude from marketing. Set and document an appropriate short confirmation-expiry period in the provider; remove unconfirmed records when it expires unless a specific justified exception applies. Confirm the actual provider capability before publishing a numeric promise. |
| Active newsletter contact | Keep only while permission and purpose remain valid. At review, confirm consent evidence and subscription status. Lack of permission means no further marketing pending resolution. Do not use open/click tracking as an inactivity measure unless separately authorized. |
| Withdrawn contact | Suppress immediately. Remove unnecessary profile/enrichment data; retain only suppression, necessary consent evidence, unresolved request or legally required records. Record the specific reason for each exception. |
| Inquiry | Review when the conversation/proposal closes. Delete or anonymize unless an active contract, unresolved complaint/claim or identified legal obligation requires a specific record. Record that reason and next review trigger; do not retain a whole mailbox indefinitely by default. |
| Client/legal records | Determine the applicable contract, tax or limitation requirement with the business's adviser; segregate necessary records from marketing and delete irrelevant attachments. Do not invent one universal retention period. |
| Request and consent evidence | Keep only what is needed to demonstrate permission/request handling or resolve a relevant claim/obligation. Document the applicable period or event and review it when that need ends. |
| Host logs/backups | Obtain actual settings and provider schedules, restrict access, choose the shortest supported period appropriate for delivery/security, and document deletion and restore handling. Do not copy a vendor's account-log duration onto visitor logs without evidence. |

For each retained exception record the data category, purpose, legal reason,
retention end event/period, owner and next review. Dispose of unnecessary exports
and local copies too. Verify completion in the service and record only the case
reference and outcome in the private register. Permanent deletion must be done
by the authorized operator using the service's normal approval process.

## Provider and international-transfer inventory

For each Hostinger, Vercel, Brevo and Microsoft account record privately:

- Domain/service and precise role: delivery, security, correspondence or newsletter.
- Contracting entity, current agreement/DPA version and evidence of applicability.
- Data categories, purposes, controller/processor roles, access and subprocessors.
- Primary and onward processing countries, including support/log/backup access.
- Applicable transfer mechanism, any required assessment/supplementary safeguards,
  and how an individual can obtain relevant safeguards without others' private data.
- Log/backup retention, deletion instructions, security contacts and incident route.

Public vendor DPAs identify available contractual provisions, not the account's
actual data location or completion of an assessment. Use the documented result
to replace general transfer wording in the notice. Cookie acceptance is unrelated.
If the required arrangement cannot be established for an intended activity, keep
that activity paused rather than asserting it is protected.

## Brevo configuration and proof

Use the current official instructions linked in privacy-launch-review.md.

1. Set the confirmed sender identity, public mailing address and reply contact in
   consent requests and all relevant email templates. Require an unchecked
   newsletter checkbox and Double confirmation. Never infer consent from an
   imported contact or the site's shorter-intro preference.
2. Keep individual engagement tracking off for this site's audience unless a
   separate reviewed mechanism is introduced. Where supported, activate
   per-contact tracking consent and set unknown contacts not to be tracked.
   Check campaigns, automations, SMTP/transactional and confirmation templates.
   Verify actual outgoing HTML has no unauthorized pixel or tracked redirects;
   anonymization is not equivalent to no tracking. If unsupported, do not send
   through a flow that cannot meet the selected behavior.
3. Verify consent evidence includes the exact notice/checkbox text and version,
   source form, submission/confirmation timestamps and withdrawal. Keep only
   necessary evidence, with restricted access and the retention criteria above.
4. With an owner-authorized test address, demonstrate unconfirmed exclusion,
   confirmation, delivered sender/address details, working unsubscribe, suppression
   across all sends and no unauthorized tracking. No campaign is needed.
5. Review existing forms/campaigns as well as the local website. Disable obsolete
   hosted forms and stop noncompliant sends in Brevo; website CSP cannot control
   direct requests to an existing public form URL.

## Market and incident review

The owner must identify active markets, rather than claiming compliance in most
countries. For each market record applicable law/thresholds, language needs,
representative/DPO requirements if any, direct-marketing rules, rights/deadlines,
transfers and breach reporting. EU/UK, Canadian federal/provincial, Brazilian and
US state requirements are separate reviews; an English notice and consent banner
are not substitutes for them. Obtain local review for other targeted countries.

For a suspected incident, record discovery time, contain access using provider
controls, preserve necessary evidence, contact the provider, and promptly assess
notification duties under applicable law. Do not assume a single notification
period applies everywhere. Keep incident details out of the public repository.
