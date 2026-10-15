# Security review — October 14, 2026

## Scope and result

Reviewed the current static HTML/CSS/JavaScript site, local modules, newsletter
submission, service worker, tracked media, and GitHub Pages workflow. The package
has no npm dependencies and the site has no application server, database, login,
or upload endpoint. No exploitable user-input-to-script flow was identified in
the reviewed code. This is a scoped source review, not a guarantee against compromise.

The inferred Pages URL, https://jespinelbueno.github.io/idio-may-dev/, returned
GitHub's generic 404 during this review. The actual live URL, DNS/TLS configuration,
response headers, GitHub account settings, and Brevo settings remain unverified.
Changes are local; no deployment or account setting was changed.

## Changes implemented

| Finding | Change | Practical limit |
| --- | --- | --- |
| Seven of eight HTML entries lacked a Content Security Policy. | Every public page now has an early CSP and no-referrer policy. Local scripts are allowed; arbitrary inline scripts, event attributes, eval, external scripts, objects, frames, and unapproved connections/forms are blocked. | This is defense in depth; it does not protect against a compromised repository or hosting account. |
| Two necessary early scripts were inline. | Permit only their exact SHA-256 hashes, preserving the homepage prepaint loader check and the nested GitHub Pages 404 base correction. | Editing either script requires updating its CSP hash; regression tests enforce this. The 404 page allows a same-origin base; other pages prohibit base elements. |
| Deployment uploaded the repository root. This could publish docs, tools, tests, or future accidental sensitive files. | A fresh, explicit public-file package excludes repository internals, dotfiles, and unsupported file types; symlinks fail packaging. Existing public pages and legacy asset URLs remain available. | JavaScript, media, and anything deliberately shipped in public folders must still be treated as public. Public repository history is separate from hosting. |
| Deployment permissions were available to the validation job; action references used movable tags; CI used Node 20. | Validation runs with read-only repository access, checkout credentials are not persisted, and only the deployment job gets Pages/OIDC permissions. Deployment is restricted to main. All directly used actions are pinned to verified full commit SHAs; CI uses Node 24. Weekly Dependabot checks cover GitHub Actions. | Repository administrators must still protect main, review workflow changes, and apply updates. Node 20 is end of life; the locally installed Node 20 was not changed. |
| The service worker retained HTML, JavaScript, and CSS for offline fallback and cached responses regardless of privacy directives. | Version v5 removes earlier site caches and caches only public media. It skips navigation, query variants, authorization/range requests, no-store requests, private/no-store/no-cache responses, redirects, and non-basic responses. Registration bypasses HTTP cache for worker updates. | Offline page fallback is removed. Existing visitors receive the new behavior after the worker updates and activates. This is cache hardening, not evidence of prior cache poisoning. |
| A carousel image used interpolated HTML. Its current inputs were local/trusted. | Construct the image with DOM attributes rather than parsing an interpolated HTML string. | No externally controlled exploit was demonstrated; this reduces a future injection hazard. |

Inline **styles** remain permitted because existing SVG artwork and generated
wheel markup use them. Inline **scripts** and eval are not generally permitted.
The other HTML template strings use fixed local configuration; fetched SVGs are
repository-owned artwork. No scripts, event handlers, active embedded HTML, or
external references were found in tracked SVG files.

## Required follow-up outside the source checkout

1. **Newsletter abuse:** enable and verify Brevo double opt-in and provider-side
   bot/rate controls. Integrate CAPTCHA only after Brevo enables verification and
   supplies its regenerated embed. The current public endpoint can receive direct
   automated requests; browser validation, honeypots, and cooldowns do not stop
   those requests. See [newsletter.md](newsletter.md).
2. **Live HTTPS and headers:** verify the real site's HTTP-to-HTTPS redirect and
   Pages “Enforce HTTPS” setting. At a hosting/CDN layer that supports response
   headers, configure `Content-Security-Policy: frame-ancestors 'none'`,
   `X-Frame-Options: DENY`, and `X-Content-Type-Options: nosniff`; consider
   `Permissions-Policy: camera=(), microphone=(), geolocation=()` and HSTS once
   the production HTTPS setup is verified. `frame-src 'none'` blocks frames
   loaded by the site; it does not stop another site framing this one.
   Anti-framing headers cannot be implemented using an HTML meta tag, and no
   ineffective GitHub Pages `_headers` file was added.
3. **Repository and domain access:** verify account MFA/passkeys, main branch
   protection, deployment environment rules, collaborator access, GitHub secret
   scanning/push protection where available, and custom-domain ownership if used.
   These settings were not accessible or changed in this review.
4. **Publish and verify:** deploy the reviewed changes and repeat header, signup,
   cache-update, and browser checks against the real domain. Do not treat a local
   passing test as proof the production deployment has these protections.

## Verification

- `npm run check` passed, including all 23 tests: linked HTML/CSS/module references, JavaScript syntax including
  the service worker, canonical/legacy asset equality, and all regression tests.
- New tests verify CSP placement and exact inline hashes across all eight HTML
  pages; destination/form restrictions; deployment exclusions and symlink rejection;
  old cache removal; excluded requests; and private/redirect/error cache behavior.
- Common credential patterns were scanned in current tracked text and non-media
  Git history; no matches were found. No sensitive credential filenames were
  tracked. This pattern scan is not a complete secret-detection guarantee.
- Newsletter tests use mocks and never subscribe real email addresses.
- Workflow YAML parsed successfully. The actual production package contained
  398 public files, each byte-identical to its source, with repository internals
  excluded. GitHub's hosted deployment has not been executed from this checkout.

## References

- [MDN: Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP)
- [MDN: frame-ancestors is not supported in meta elements](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/frame-ancestors)
- [GitHub: secure use of Actions and immutable SHA pinning](https://docs.github.com/en/actions/reference/security/secure-use)
- [GitHub: securing Pages with HTTPS](https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https)
- [Node.js release support status](https://nodejs.org/en/about/previous-releases)
