# Project context

This is a static HTML/CSS/JavaScript site with no build step. Keep index.html and services.html as public entry points and preserve GitHub Pages compatibility.

## Source organization

- styles.css is the stable homepage CSS entry; styles/home.css defines its ordered imports.
- styles/services.css is the services-page CSS entry. Put a rule in its owning foundation, component, section, animation, or responsive file—never add a late catch-all override file.
- scripts/home.js is the only homepage script entry. Feature modules export an init function, self-guard when their markup is absent, and keep their own event listeners/state.
- scripts/features/values-wheel/ separates configuration, geometry helpers, and DOM interaction. Keep the default smoothing factor at 0.075 unless the requested wheel behavior changes.
- assets/media/ holds canonical active media. tools/asset-aliases.json maps public legacy paths to canonical copies. Update both the map and the source references whenever active media is renamed.

## Homepage behavior

The production loader sequence is:

1. interesting
2. creative
3. original
4. striking
5. distinct
6. unique
7. novel
8. yours
9. final make it + idio wordmark

The loader runs each word for 650 ms, swaps after 120 ms, holds the final lockup for 950 ms, and only reveals the page after the browser load event. Loader debug pages, query parameters, and localStorage tuning are intentionally absent.

## Maintenance rules

- Preserve existing BEM class names unless a requested behavior change requires a coordinated rename.
- Keep the backup icon/color loader under loading-screens/icon-color-loader/.
- Preserve old asset URLs only for active aliases recorded in tools/asset-aliases.json; remove proven-unreferenced assets rather than archiving them.
- Run npm run check after source, asset, or module changes. It is the required code-level verification; visual QA is separate and only needed when requested.

## Deployment

.github/workflows/pages.yml publishes the repository root to GitHub Pages after the static check succeeds.
