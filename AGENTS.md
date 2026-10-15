# Project context

This is a static HTML/CSS/JavaScript site with no build step, deployed to Hostinger and Vercel. Keep index.html and services.html as source entry points. Public links use clean root-relative routes, resolved by .htaccess on Hostinger and vercel.json on Vercel.

## Source organization

- styles.css is the stable homepage CSS entry; styles/home.css defines its ordered imports.
- styles/services.css is the services-page CSS entry. Put a rule in its owning foundation, component, section, animation, or responsive file—never add a late catch-all override file.
- Keep page CSS entries directly in styles/. Their imported rules live in styles/foundation/, styles/components/, styles/pages/ (homepage sections in home/), styles/animations/, and styles/responsive/. Preserve existing import and layer order.
- scripts/home.js is the only homepage script entry. Feature modules export an init function, self-guard when their markup is absent, and keep their own event listeners/state.
- Group feature modules by page under scripts/features/; common features belong in scripts/features/shared/. Keep page script entries directly in scripts/.
- scripts/features/values-wheel/ separates configuration, geometry helpers, and DOM interaction. Keep the default smoothing factor at 0.075 unless the requested wheel behavior changes.
- assets/media/ holds canonical active media; assets/fonts/ holds fonts and their licenses. These are the only asset roots. Use lowercase kebab-case folder names.
- Group media by page and then section (hero/, story/, cards/, process/, etc.). Keep mobile/ variants inside their owning section, not in a page-wide bucket. Put reused media in assets/media/shared/, portraits in assets/media/team/home/ or about/, and common logos/footer artwork in brand/ or footer/. See docs/asset-organization.md for the ownership map.
- tools/asset-aliases.json maps retained public URLs directly to canonical files. Compatibility uses host redirects, never duplicate files or legacy asset folders. After renaming media, update source references and the map, then run node tools/asset-routing.mjs to refresh the committed .htaccess and vercel.json rules. There is no deployment build step.

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

.github/workflows/pages.yml runs static checks only. Hostinger deploys from GitHub; deploy .htaccess beside index.html at the domain root. Do not add GitHub Pages deployment steps.

Vercel uses the root vercel.json to serve the repository root without a framework or build step. Keep cleanUrls enabled and trailingSlash disabled. Do not add a catch-all rewrite to index.html: each route serves its own HTML page, and missing routes must return 404.
