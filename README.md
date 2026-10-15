# Idio Creative static site

This is a static HTML/CSS/JavaScript site with no build step. Serve the repository with any static web server. All public HTML pages stay at the root for GitHub Pages.

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
├── tools/                     Static checks, asset aliases, and Pages packaging
└── loading-screens/
    └── icon-color-loader/     Retained backup loader
```

The complete original tree is recorded in [docs/project-tree-before.md](docs/project-tree-before.md). Other asset folders, including `services/assets/`, contain legacy public URLs recorded in `tools/asset-aliases.json`; edit the canonical files under `assets/media/` and update any mapped copies together.

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

## Development checks

The homepage's responsive rules and validation record are documented in [docs/responsive-implementation.md](docs/responsive-implementation.md). Use [docs/responsive-page-template.md](docs/responsive-page-template.md) to plan another page's adoption.

Run npm run check before committing. It resolves local HTML, CSS, and JavaScript references, parses every JavaScript module, and verifies that each legacy asset alias matches its canonical media file.

## Deployment

Pushes to main run the GitHub Pages workflow. Set the repository Pages source to GitHub Actions if it is not already enabled. The workflow checks the source, packages only public site files with tools/prepare-pages.mjs, and deploys the unchanged HTML, CSS, JavaScript, and media. Pull requests run checks without deployment permissions.

See [docs/security-audit.md](docs/security-audit.md) for the security review, implemented protections, and remaining hosting/provider settings.

## Image saving

The shared image-save-deterrent feature blocks image/SVG context menus and native dragging on public content pages. Shared styles suppress image long-press callouts where supported. Text selection, navigation, and carousel swipes remain available. This discourages casual saving; it cannot prevent direct image downloads, developer-tool access, or screenshots of public images.
