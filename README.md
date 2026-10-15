# Idio Creative static site

This is a static HTML/CSS/JavaScript site with no build step, deployed to Hostinger and Vercel. All public HTML source files stay at the root; `.htaccess` on Hostinger and `vercel.json` on Vercel serve them through clean URLs.

## Source map

```text
/
├── *.html                     Public pages: edit text, links, and markup here
├── styles.css                 Stable homepage stylesheet entry
├── styles/
│   ├── *.css                  Page entries: ordered stylesheet imports
│   ├── foundation/            Fonts, colors, shared sizing, and base rules
│   ├── components/            Buttons, navigation, footer, and shared UI
│   ├── pages/                 Page styles; home/ holds homepage sections
│   ├── animations/            Shared effects and 404 animation
│   └── responsive/            Shared and page-specific responsive rules
├── scripts/
│   ├── *.js                   Page initialization, privacy bootstrap, cache retirement
│   └── features/              Page folders, shared/, and values-wheel/
├── assets/
│   ├── media/                 Canonical images, artwork, and video
│   └── fonts/                 Local fonts and their licenses
├── docs/                      Implementation notes and reviews
├── tests/                     Existing automated behavior tests
├── tools/                     Static checks, asset aliases, and public-file packaging
└── loading-screens/
    └── icon-color-loader/     Retained backup loader
```

The complete original tree is recorded in [docs/project-tree-before.md](docs/project-tree-before.md). The current asset ownership map is in [docs/asset-organization.md](docs/asset-organization.md). All media lives in `assets/media/`; fonts and licenses live in `assets/fonts/`. Old URLs use host redirects rather than duplicate files.

## Owner editing guide

| Change | Edit here |
| --- | --- |
| Page text, links, image descriptions | The matching root HTML file: `index.html`, `services.html`, `about.html`, `events.html`, `contact.html`, `privacy.html`, `coming-soon.html`, or `404.html` |
| Brand colors, fonts, shared sizes | `styles/foundation/foundation.css` |
| Homepage section layout | The matching section in `styles/pages/home/` |
| Another page's layout | Its file in `styles/pages/`; `contact-hero.css` owns the Contact page |
| Shared navigation, buttons, footer | The matching file in `styles/components/`; `contact.css` owns the shared closing contact banner |
| Page interactions | The matching folder in `scripts/features/`; common interactions live in `shared/` |
| Values wheel text and configuration | `scripts/features/values-wheel/config.js` |

Each page's stylesheet entry in `styles/` lists its imports in cascade order. Homepage styling starts at `styles.css` → `styles/home.css`; Contact uses `styles/contact-page.css`, and 404 uses `styles/not-found.css`. Keep section-local mobile rules with their section; cross-page and dedicated page responsive files live in `styles/responsive/`.

Each page's script entry initializes its feature modules. Features keep their own DOM queries, state, and listeners. This organization pass moves files and updates paths; further code refactoring is deferred.

## Editing assets

Use `assets/media/` for active images, SVG artwork, and video:

| Folder | Contents |
| --- | --- |
| `home/` | Homepage media grouped into `hero/`, `offer/`, `toolkit/`, `case-study/`, `team/`, and `values/` |
| `about/`, `services/`, `events/`, `contact/`, `coming-soon/`, `not-found/` | Page media grouped by section; mobile variants live in the section's own `mobile/` folder |
| `team/home/`, `team/about/` | Portraits for each page, named after the team member |
| `brand/`, `footer/` | Brand `logos/`, `icons/`, `social/`, and footer `decorations/` |
| `shared/` | Backgrounds, textures, photos, and shapes reused across pages |

Update HTML, CSS, and JavaScript references when renaming media. The About portrait selector and homepage team arrows also construct filenames dynamically. Keep font files and licenses together under `assets/fonts/dm-sans/`, `teva/`, and `vollkorn/`.

Keep old public URLs in `tools/asset-aliases.json`, pointing directly to the final canonical file. Run `node tools/asset-routing.mjs` after editing that map; it updates the committed asset redirects in `.htaccess` and `vercel.json`. This is a maintenance command, not a build step. Do not recreate `services/assets/` or legacy folders under `assets/`.

## Development checks

The homepage's responsive rules and validation record are documented in [docs/responsive-implementation.md](docs/responsive-implementation.md). Use [docs/responsive-page-template.md](docs/responsive-page-template.md) to plan another page's adoption.

Run npm run check before committing. It resolves local HTML (including responsive images and video posters), CSS, and JavaScript references, checks dynamic asset families, parses every JavaScript module, and verifies asset placement and both hosts' compatibility redirects.

## Deployment

Hostinger deploys the site from GitHub. Deploy the public site files at the domain root (`public_html`), including the root `.htaccess` file beside `index.html`. Enable `.htaccess` support in hPanel if the hosting plan requires it. `.github/workflows/pages.yml` runs `npm run check` on pushes and pull requests; it does not deploy to GitHub Pages.

For Vercel, import the GitHub repository with the repository root as the project's Root Directory. The root `vercel.json` selects no framework or build command, serves the current directory, enables clean HTML URLs, and removes trailing slashes. Push the configuration and redeploy for it to take effect. Vercel uses this configuration rather than `.htaccess`; the existing root `404.html` supplies its custom missing-page response.

Routes are `/`, `/services`, `/about`, `/events`, `/contact`, `/privacy`, and `/coming-soon`. Old `.html` URLs and trailing-slash page URLs redirect permanently to their clean equivalents, preserving query strings. Unknown paths return the custom `404.html` page with HTTP status 404. Retained asset URLs, including the old `services/assets/` paths, redirect to canonical media through the host configuration. A plain static file server serves canonical media but does not implement those redirects.

For a public-files-only Hostinger deployment, `node tools/prepare-pages.mjs <fresh-output-directory>` packages the site, including `.htaccess`, without repository internals. The historical script name is retained. Clean routes require the relevant host configuration; a basic static development server will still serve the `.html` files but will not resolve the clean navigation URLs.

See [docs/security-audit.md](docs/security-audit.md) for the security review, implemented protections, and remaining hosting/provider settings.

## Image saving

The shared image-save-deterrent feature blocks image/SVG context menus and native dragging on public content pages. Shared styles suppress image long-press callouts where supported. Text selection, navigation, and carousel swipes remain available. This discourages casual saving; it cannot prevent direct image downloads, developer-tool access, or screenshots of public images.
