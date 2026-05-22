# Project Context

Static HTML/CSS/JS site. No build step.

## Main Files

- `index.html`: homepage markup.
- `styles.css`: all styling.
- `script.js`: viewport height handling and homepage loader behavior.
- `assets/img/photos/bgemestudios.jpg`: hero background image.
- `assets/img/photos/bgwhatweoffer.jpg`: What We Offer section background image.
- `assets/img/idiologomonochrome.svg`: idio wordmark used in the hero and loader final state.
- `assets/img/icon.svg`: icon asset used by the backup loader.
- `loading-screens/icon-color-loader/`: backup icon/color loader for non-home pages.

## Current Homepage Loader

Homepage loader sequence:

- `make it beautiful`
- `make it valuable`
- `make it trendy`
- final state: `make it` + idio wordmark logo

`script.js` includes a `DEBUG_LOADER` flag. Set `DEBUG_LOADER = true` to pause on the final `make it` + idio logo state for sizing/position troubleshooting. Default should normally be `false` so the homepage reveals after the final logo hold.

Loader selectors:

- `.loader__phrase`: main loader phrase flex container.
- `.loader__fixed`: wraps the fixed `make it` text.
- `.loader__words`: adjective slot.
- `.loader__word`: current adjective.
- `.loader__idio-logo`: final idio logo. This is a masked element using `currentColor`, not an `<img>`, so it matches the `make it` text color exactly.

Final loader logo constraints:

- It should visually match the hero `make it` + idio lockup relationship.
- Hero reference values live in `.hero__headline` and `.hero__logo`.
- Loader logo color should match `make it` green exactly.
- Hero logo should remain off-white.

## Current Page Sections

1. Hero section: background image with `make it` + idio wordmark over it.
2. Offer/collage section: heading, blurb, button, and five editorial image panels.
3. What We Offer section: full-bleed painted background with title, underline, and four circular service placeholders.
4. Case Study section: layered card/polaroid composition with copy and CTA.
5. Our Team section: warm yellow gradient section with four team image cards.

Offer section constraints:

- Do not add brush strokes/scribbles until explicitly asked.
- Image panels use `assets/img/photos/imgportrait.png`, `imglook.png`, `imgstilllive.png`, `imgdetail.png`, and `imgmotion.png`.

What We Offer section constraints:

- Background should use `assets/img/photos/bgwhatweoffer.jpg`.
- Circle content is placeholder-only until specific services/images/copy are requested.
- Keep the section visually airy and full-width; avoid crowding the four circles.

Case Study / Our Team constraints:

- These two sections share the `.case-team` wrapper gradient so the cream case-study area blends into the warm yellow team area.
- Image choices are placeholders; preserve section dimensions/spacing first when swapping real assets.

## Deployment

GitHub repo: `https://github.com/jespinelbueno/idio-may-dev`

GitHub Pages workflow exists at `.github/workflows/pages.yml`. GitHub Pages settings may still need to be enabled/set to GitHub Actions in the repo settings.

## Collaboration Notes

When making small visual tweaks, prefer editing only the relevant selector and avoid reworking unrelated sections. If the user specifies a selector or area, stay scoped to it.
