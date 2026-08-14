# Idio Creative static site

This repository is a build-free GitHub Pages site. Its public pages are index.html and services.html; both can be opened by any static web server.

## Source map

- styles.css is the stable homepage stylesheet entry. Its imports live in styles/; styles/services.css is the services-page entry.
- scripts/home.js initializes isolated homepage features. Each feature owns its DOM queries, state, and listeners.
- assets/media/ is the canonical source of active visual media. Existing asset paths remain byte-identical compatibility aliases and are listed in tools/asset-aliases.json.
- loading-screens/icon-color-loader/ is the retained fallback loader for future non-home pages.

## Development checks

Run npm run check before committing. It resolves local HTML, CSS, and JavaScript references, parses every JavaScript module, and verifies that each legacy asset alias matches its canonical media file.

## Deployment

Pushes to main run the GitHub Pages workflow. Set the repository Pages source to GitHub Actions if it is not already enabled.
