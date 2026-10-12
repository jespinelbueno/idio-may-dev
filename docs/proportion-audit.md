# Site proportion audit and standardization plan

Baseline reviewed October 8, 2026 against the working tree, including existing uncommitted work. The measurements and findings below record that baseline. The standardization was subsequently implemented; see the implementation record at the end.

## Recommendation

Use the homepage's visual language as the site standard: full-screen photographic heroes, centered titles, green editorial headings, generous paper-colored space, layered photographs, hand-drawn accents, and the shared footer. Establish consistent proportions for equivalent content roles while retaining each page's composition.

The pages already feel related, but their typography and responsive behavior are not consistently proportional. The largest problems are very small reading text, different scales for equivalent section headings, and the Events footer missing shared responsive styles. Improve the homepage's small-text exceptions before treating it as the reference for every detail.

## Review coverage

Inspected all five public pages: Home, Services, About, Events, and Contact. Reviewed HTML, stylesheet imports, owning CSS files, existing responsive documentation, and relevant interaction breakpoints. Used local browser screenshots and computed layout measurements at:

- Desktop: 1440 × 900.
- Tablets: 1024 × 768 and 768 × 1024.
- Phones: 390 × 844 and 320 × 568.

Screenshots covered heroes and representative content, artwork, cards, and footer views. Measurements covered headings, paragraphs, relevant media, navigation, footer sizes, and document widths. This was a proportion audit, not exhaustive interaction testing. The retained icon/color loader is a backup asset, not a public content page. “Projects” links to the homepage collaboration section rather than a separate page.

Browser measurements use default 16px root text. This browser reserves a 15px scrollbar on long pages: a 390px viewport has a 375px content area. Viewport units and container units therefore differ slightly. Rotated-image bounding boxes include rotation and must not be interpreted as the underlying image aspect ratio.

## Measured differences

Approximate computed font sizes in pixels:

| Role / page | 1440px desktop | 1024px tablet | 390px phone |
| --- | ---: | ---: | ---: |
| Hero title: Home / Services / About / Events | 69.1 | 51.2 | 28.1 |
| Home: intro heading | 48.0 | 52.5 | 40.0 |
| Home: collaboration / team heading | 60.5 | 52.5 | 40.0 |
| Services: “our services” | 75.0 | 53.3 | 42.9 |
| Services: portfolio heading | 48.0 | 34.1 | 25.6 |
| Services: process heading | 72.0 | 51.2 | 26.5 |
| About: story / team heading | 71.3 | 50.5 | 36.8 / 40.0 |
| Events: signup heading | 72.0 | 48.1 | 30.4 |
| Shared closing CTA heading | 69.1 | 49.2 | 32.0 |
| Contact: email heading | 75.0 | 53.3 | 21.8 |
| Home: “about you” paragraph | 12.0 | 16.0 | **8.2** |
| Home: team biographies | 10.4 | 14.0 | 16.0 |
| Services: process paragraphs | 12.0 | **10.4** | 16.0 |
| About: narrative paragraphs | 11.9 | **8.4** | 16.0 |
| Events: signup paragraphs | 14.0 | 14.0 | 14.0 |

The hero title token is already shared successfully. Contact's long email address is an intentional special case; matching the short hero titles literally would force unsuitable wrapping on phones.

### Home

- Preserve its art direction and the shared hero-title token.
- The phone “about you” paragraph is approximately 8.2px, with a roughly 10.8px line height, beneath a 31.8px heading. This is the clearest homepage proportion problem. Its owning rule is in `styles/offer.css`, in the final phone media query.
- Desktop narrative, collaboration descriptions, team biographies, and values descriptions are approximately 10–12.5px. Increasing readable copy requires additional room, not simply a larger font inside the existing geometry.
- Main desktop section headings currently span approximately 48–60.5px; the phone toolkit and values headings are about 30–32px while intro, collaboration, and team headings are about 40px. Define which are primary and which are secondary rather than allowing unrelated formulas to decide.
- Keep the loader sequence and timing, hero transition, carousel layouts, and values-wheel smoothing unchanged during proportion work.

### Services

- Hero scale matches Home. Service-card colors and artwork belong to the same visual family.
- The first section heading is about 24% larger than Home's collaboration/team headings. The process heading and closing CTA are also close to hero size, while the portfolio heading becomes much smaller on phones.
- At 768px, service lists are 12px and process copy is 10.4px. At 1024px, lists are 11.2px. These remain in compact desktop-style arrangements after Home has switched to readable flow layouts.
- The page uses 900px for service-card reflow and 640px for process/portfolio reflow. Align these modes with actual text-fit needs and the homepage's 1100px intermediate mode. Update the service-card JavaScript query along with CSS if its threshold changes.
- Portfolio pictures and the closing banner use cropping rather than an obvious general stretching problem. Keep the editorial mosaic; standardize its outer width and caption spacing.

### About

- Hero scale already matches Home. The timeline, collage, and large polaroid can remain distinctive.
- The desktop narrative scales text with a unit derived from a 1920px artwork reference. This makes paragraphs about 8.4px at 1024px. At 768px the reflow rules restore 16px text. The 900px transition therefore creates a sharp change in readability.
- Move narrative reflow earlier, provisionally to 1100px, and separate type sizing from artwork coordinates. Let paragraphs grow in normal flow; reconnect the decorative thread to its content anchors.
- Story/team headings are larger than Home's usual section headings on desktop and use separate formulas on phones/tablets.
- Existing detailed crop calculations often preserve the source image ratio. Replace them only when a focal-point comparison establishes a better result; `object-fit: fill` alone is not proof of distortion.

### Events

- Hero scale matches Home. Signup and “coming soon” desktop headings are larger than equivalent homepage headings and use uncapped `5vw` rules. Larger-screen growth is a source-based concern beyond the measured desktop viewport.
- Signup body copy stays at 14px while primary paragraphs elsewhere become 16px. The large calendar and generous spacing make that small copy more conspicuous.
- **Confirmed footer defect:** `styles/footer.css` scopes responsive rules to Home, Services, and About, omitting Events. At 390px, Events keeps a compressed 464px desktop-style footer while the other three use an approximately 743px flow layout. Text is crowded near the copyright line.
- At 320px, the footer wordmark extends to approximately x=333px and its email to x=369px, beyond the 305px scrollport. Both visibly clip. Include Events in the shared footer's responsive contract.
- Keep the calendar and photograph compositions, with decorations positioned relative to those objects rather than unrelated page-wide units.

### Contact

- The full-screen photographic composition fits the homepage's visual language. A compact contact-only page can remain a documented footer exception.
- The email needs its own fluid, available-width-aware scale. Maintain a readable single line where possible, and define an intentional wrap fallback for enlarged text.
- The intro uses container-scaled text above 800px and a different fluid rule below it. Unify its readable size and spacing so crossing that threshold does not radically change emphasis.
- Give desktop social links the same minimum hit area used on compact layouts, independently of icon size.
- The contact email differs from the shared footer email. Confirm the intended address during content cleanup; do not silently substitute one for the other.

## Proposed shared standards

These are target values for implementation and visual review, not claims about current behavior.

| Element | Proposed standard | Owner / adoption |
| --- | --- | --- |
| Hero titles | Retain `--landing-title-size`; 600 weight; centered within the hero, with a locally anchored underline | `foundation.css` and each hero owner |
| Primary section headings | Reuse `--heading-size: clamp(2.25rem, 2.017rem + 1.98vw, 3.8rem)`; 650–700 weight; 1.05–1.15 line height | `foundation.css`, explicit adoption by equivalent headings |
| Secondary headings / names | A capped 1.5–2rem scale, approximately 1.15–1.25 line height | Shared token; section owners |
| Reading paragraphs | 1rem minimum, 1.45–1.55 line height; target 45–65 characters per line where the layout allows | Shared body token; paragraph owners |
| Captions / supporting text | 0.875rem minimum; 1.35–1.45 line height | Shared small token |
| Expressive Teva labels | A distinct, capped role; preserve the handmade character without scaling below supporting-text minimums | Section owners |
| Navigation / button labels | Approximately 0.875rem; controls at least 2.75rem high; widths fit their labels | Navigation and button owners |
| Main content width | 80rem maximum; gutters `clamp(1rem, 4vw, 3rem)` | Existing shared foundation primitives |
| Normal section spacing | Existing `--section-space: clamp(3rem, 7vw, 5rem)` | Explicit section adoption |
| Large editorial transitions | An explicit larger spacing role, provisionally 1.5 × section space; separate scroll-animation hold distance | Foundation token plus section owner |
| Internal spacing | A small shared scale: 0.5, 1, 1.5, 2, and 3rem | Foundation; components consume named roles |
| Image frames | Preserve source ratio or use an intentional crop frame; `cover` plus a recorded focal point | Owning media component |
| Artwork / decorations | Coordinates within their own capped composition container; typography and controls retain readable minima | Section owners |
| Shared footer | Same layout, typography, spacing, and responsive behavior on Home, Services, About, and Events | `footer.css` |

Use one scale per role, not one size for every heading. A service-card title can stay subordinate to a section heading; the homepage lockup remains a display treatment. Record intentional exceptions such as the Contact email and large artwork numerals.

Do not force every picture into one aspect ratio. Use a few documented frame families for repeated components—portrait, landscape, polaroid, and panoramic banner—while preserving purposeful collage ratios. Let text remain readable as compositions shrink, then reflow when it no longer fits.

For ordinary two-column sections, start with an approximately equal image/text division and a consistent gap. Allow explicit deviations for the service-card stack and About timeline. Match visual weight across equivalent sections rather than their exact image dimensions.

## Implementation order

1. **Repair readability and clipping.** Fix Home phone copy; remove About's text dependence on artwork scaling; reflow Services' tablet copy; adopt the shared responsive footer on Events. Address the 320px scrollport issue: long pages retain `body`'s 320px minimum despite a 305px content area in this browser.
2. **Establish and adopt the type roles.** Keep the successful hero token; use the existing heading/body/small tokens consistently; add only missing secondary-heading, label, and spacing roles. Normalize About/Events/Services section headings, then the shared closing CTA.
3. **Align layout and artwork proportions.** Apply consistent outer containers and section spacing. Keep collage geometry in local containers, document image focal points and frame ratios, and move text into flow. Replace hard-coded heading breaks only where they harm wrapping. Re-anchor circles and underlines to the resized headings.
4. **Unify shared components and mode behavior.** Consolidate duplicated Home/interior navigation sizing in the existing navigation owner while preserving BEM classes. Align CSS and JavaScript layout thresholds. Apply footer and button rules to all consumers. Keep Contact's content-specific composition as an explicit exception.
5. **Verify each page and shared consumers.** Complete the matrix below and compare each page with the corrected homepage reference before merging or deploying.

Place rules in existing owning files: `foundation.css`, `navigation-base.css` / `navigation.css`, `buttons.css`, `footer.css`, and the relevant page/section/responsive files. Resolve superseded declarations in their original owners; do not introduce a late override stylesheet. Preserve ordered imports, static entry points, GitHub Pages compatibility, active asset paths, and existing feature behavior.

## Acceptance criteria and verification gaps

- Equivalent primary headings consume the same role token, with deliberate exceptions documented.
- Reading copy is at least 16px and supporting text at least 14px at default root size. Enlarged text can wrap and expand sections without clipping.
- Images retain natural proportions or intentional crops; faces, artwork, and logos stay within their intended frames.
- Ordinary sections share outer alignment, spacing roles, and consistent heading-to-copy gaps. Decorative bleeds do not clip essential content.
- Footer content remains legible and reachable on every consuming page. Navigation, carousel, social, and CTA controls retain their hit areas.
- Validate 320, 390, 640/641, 768, 800/801, 900/901, 1024, 1100/1101, 1440, and 1920px widths; inspect continuous resizing across changed thresholds.
- Validate short landscape screens, 200% text enlargement, reduced motion, keyboard/touch navigation, and animation end states. Recheck pinned sections after enlarging text so content never exceeds available height without a flow fallback.
- Review Chromium and Safari, including a real iPhone for toolbar and safe-area behavior.
- Run `npm run check` after implementation, with separate screenshot comparisons for all five pages.

The baseline passed `npm run check`: 65 linked source files, 28 JavaScript modules, asset aliases, and all 8 tests. That check does not establish visual consistency. No site source or media was changed for this audit. At the audit stage, Safari, real devices, enlarged text, continuous resizing, complete animation-state coverage, and widths beyond the listed measured samples remained verification gaps. The implementation record below updates that coverage.


## Implementation record

Implemented the approved plan across Home, Services, About, Events, and Contact. The homepage remains the art-direction reference. Changes live in existing owning stylesheets and feature modules; no new override stylesheet, build step, or media renaming was introduced.

- Equivalent primary section headings now share `--heading-size` and a 1.1 line height. Secondary headings and names use a capped 1.5–2rem role. Reading paragraphs use 1rem and a 1.5 line height; supporting text uses at least 0.875rem. Expressive labels have a separate capped role. About’s narrative chapter headings and Contact’s long email remain intentional exceptions.
- Shared gutters, content width, editorial spacing, button sizing, and navigation proportions now apply across pages. Home and interior navigation consume the same component owner. Events consumes every shared responsive footer rule.
- About’s narrative is a content-driven grid rather than text scaled to artwork coordinates. Photographs, polaroids, and decorative threads retain local frames and original intentional crops. Home’s mobile toolkit now follows an alternating grid so its enlarged labels cannot collide with circles. Services uses equal-height flow cards when the available space requires it, with portfolio and process layouts that reflow earlier.
- The full Services introduction reads in normal flow on narrow or short screens. Taller process content uses the existing early-opening animation path. Contact’s intro, email, and social links share a centered flow layout that can grow with enlarged text.
- Advanced the service-worker cache revision so returning browsers can refresh the standardized site.
- Existing hero title scale, loader words/timing/load gate, values smoothing, image assets, contact addresses, and GitHub Pages entry points remain intact.

### Completed verification

- Required `npm run check`: linked sources, JavaScript modules, asset aliases, and all 8 tests pass.
- In-app browser layout measurements on all five pages at 320, 390, 640/641, 768, 800/801, 900/901, 1024, 1100/1101, 1440, and 1920px widths: 70 samples. Essential measured headings, paragraphs, footer wordmarks, and footer emails fit the scrollport; no document horizontal overflow.
- Isolated validation copies with 200% root text and the real site modules at 320, 390, 768, 1024, and 1440px: 25 samples. The same measured content fits without horizontal overflow. These temporary copies and measurement JSON files are outside the public repository.
- Service-card content-fit checks at 1116, 1140, 1280, 1440, and 1920px. Increased desktop card height to keep the longest list inside its frame.
- Visual review of all five pages, including mobile content, desktop photographs/collages, tablet service cards, the Events footer, and the Services introduction at 844 × 390 landscape.
- Verified mobile menu opening and Escape dismissal; creative-work, collaboration, and team carousel advancement; mobile value selection; and desktop service-card selection. No browser console errors were recorded in these checks.
- Reduced-motion rules and module guards were retained and reviewed in source. Safari, a physical iPhone, and an actual system reduced-motion preference were not tested. Representative animation states were reviewed; this is not exhaustive animation-state coverage.

### Rollback

A persistent before/after snapshot, file hashes, forward/reverse patches, and a guarded restore helper are saved outside the repository at:

`/Users/juandiegoespinelbueno/.codex/visualizations/2026/10/09/01a11dfe-8af9-7e92-a67a-33786c4ba3c1/rollback/proportion-standardization/`

The baseline Git revision is `a0b17d9a4399c8731702a058b65256c386909d5e`. The snapshot also retains the audit document that existed before implementation. It captures only source/document files and does not alter repository history.

To check rollback readiness, run `python3 <snapshot-directory>/restore.py --check`. To restore, run the same command without `--check`, or ask Codex to roll back the standardization. The helper restores only changed files and refuses to overwrite later edits. If later edits exist, the saved before/after copies and reverse patch allow a selective rollback while preserving them. The helper is validated against an isolated temporary copy, including its later-edit refusal.
