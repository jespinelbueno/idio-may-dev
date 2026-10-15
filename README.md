# Idio Creative static site

This repository is a build-free GitHub Pages site. Its public pages are index.html and services.html; both can be opened by any static web server.

## Source map

- styles.css is the stable homepage stylesheet entry. Its imports live in styles/; styles/services.css is the services-page entry.
- scripts/home.js initializes isolated homepage features. Each feature owns its DOM queries, state, and listeners.
- assets/media/ is the canonical source of active visual media. Existing asset paths remain byte-identical compatibility aliases and are listed in tools/asset-aliases.json.
- loading-screens/icon-color-loader/ is the retained fallback loader for future non-home pages.

## Development checks

The homepage's responsive rules and validation record are documented in [docs/responsive-implementation.md](docs/responsive-implementation.md). Use [docs/responsive-page-template.md](docs/responsive-page-template.md) to plan another page's adoption.

Run npm run check before committing. It resolves local HTML, CSS, and JavaScript references, parses every JavaScript module, and verifies that each legacy asset alias matches its canonical media file.

## Deployment

Pushes to main run the GitHub Pages workflow. Set the repository Pages source to GitHub Actions if it is not already enabled. The workflow checks the source, packages only public site files with tools/prepare-pages.mjs, and deploys the unchanged HTML, CSS, JavaScript, and media. Pull requests run checks without deployment permissions.

See [docs/security-audit.md](docs/security-audit.md) for the security review, implemented protections, and remaining hosting/provider settings.

## Image saving

The shared image-save-deterrent feature blocks image/SVG context menus and native dragging on public content pages. Shared styles suppress image long-press callouts where supported. Text selection, navigation, and carousel swipes remain available. This discourages casual saving; it cannot prevent direct image downloads, developer-tool access, or screenshots of public images.
