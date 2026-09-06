# Homepage responsive plan

Status: implemented, September 6, 2026. See `responsive-implementation.md` for final values, validation results, and remaining device checks. The sections below retain the original proposal for rationale.

Direction confirmed: preserve compositions, reflow text. Scope is `index.html`; the homepage's creative toolkit section is included, but `services.html` is not being redesigned.

## 1. Design objective

Keep the homepage's editorial character—collages, circles, image stacks, curves, scribbles, and wordmarks—recognizable on phones. Scale the parts of each visual composition together. Let paragraphs, navigation, controls, and section heights respond to available space.

Precision means documented ratios and predictable behavior between screen sizes. It does not mean shrinking the entire desktop page by one factor: a desktop paragraph or button scaled to phone width becomes too small. Artwork has geometric constraints; readable content has minimum sizes and wrapping rules.

## 2. Findings from the current code

These are source-level findings, not a completed browser visual audit. The current working tree contains existing edits; use it as the starting point and preserve that work. No separate earlier mobile plan was found among the repository files searched.

| Area | Current behavior | Planned correction |
| --- | --- | --- |
| Cascade | `styles/responsive.css` has repeated 900px and 640px rules; `case-study.css` and `team.css` also redefine earlier rules. The responsive layer outranks section styles. | Consolidate each property's rules into one deliberate behavior per mode, removing superseded declarations during the same change. |
| Offer | Mobile stacks five full-width images, changes their aspect ratios, and hides every scribble. The section retains its desktop 112%-wide curved wrapper and negative margin. | Separate the full-bleed background from a contained content area. Preserve a compact collage with explicit geometry and selected decorations. |
| Hero | Mobile imposes a 43rem minimum. JavaScript replaces `100svh` with `innerHeight` on every resize. | Establish one viewport-height policy and remove accidental oversized minimums on phones. |
| Toolkit | All four items become one column below 900px, while the heading retains `white-space: nowrap`. | Use a deliberate compact arrangement with wrapping typography and artwork sized from its own cells. |
| Case studies | Cards get narrower, but frame padding retains desktop minimums, including a 5.4rem bottom border. Mobile also combines large headings with a fixed `100svh` section. | Scale the complete frame from card width; let copy and controls determine section height. |
| Case-study fallback | A short-screen query disables pinning, but later rules restore sticky positioning; responsive-layer rules also replace height values. JavaScript uses a separate 700px compact threshold. | Make layout and behavior modes agree, and remove pinning/extra scroll distance together. |
| Case-study selection | When pinning is absent, scroll synchronization resolves to index 0, which can undo a manually selected project on the next scroll. | In manual mode, skip scroll-driven selection and preserve the selected project. |
| Team | The final biography font rule can fall to 0.58rem. Photo enlargement and carousel clearance still use desktop behavior. | Keep biographies readable and in flow; constrain touch interactions and anchor controls to the visible carousel. |
| Values | Mobile overrides leave the intro's `translateY(-5rem)` and graphic's vertical shift active. Tablet descriptions depend on tooltip interaction. | Establish flow-based spacing and make every description available on touch devices. |
| Footer | Mobile changes navigation to flow but adds a 9.5rem top margin; small shared text sizing remains. | Use the common spacing and text scale with deliberate wrapping. |
| Shared files | Homepage and Services both import foundation, footer, animations, and responsive styles. | Scope new shared-file behavior to the homepage until another page explicitly adopts it. |

## 3. Proportion system

Use 390 × 844 CSS pixels as the first phone reference and 1440 × 900 as the desktop comparison. These are planning references, not fixed canvases for the page. Capture the current desktop before implementation, then compare sections at both sizes.

### Layout and typography

Proposed starting tokens, to be tuned against the reference layouts:

| Token / rule | Starting value | Purpose |
| --- | --- | --- |
| Content gutter | `clamp(1rem, 4vw, 3rem)` | One alignment system; 16px at 390px, 48px at 1440px. |
| Main content maximum | `80rem` | Reuse the existing broad desktop measure; narrower sections opt into a smaller measure. |
| Phone reading width | Available container width, capped around `36ch` | Prevent uncontrolled paragraph lengths. |
| Body copy | `1rem`, line-height 1.45–1.55 | Readable text that does not shrink with artwork. |
| Small supporting copy | At least `0.875rem` | Names, captions, and secondary text. |
| Section heading | Start near `2.5rem` at 390px and `3.8rem` at 1440px | Common hierarchy, with explicit exceptions for editorial headlines. |
| Spacing steps | 0.5, 0.75, 1, 1.5, 2, 3, 4, 6rem | Select named spacing roles instead of unrelated offsets. |
| Phone section padding | Typically 3–4rem vertically | Consistent rhythm; taller artwork contributes its own height. |
| Interactive hit area | At least 44 × 44 CSS pixels as a project target | Visible icons/dots may remain smaller inside it. |

Use bounded fluid interpolation between reference values. For a property going from `a` at width `w1` to `b` at `w2`, calculate `m = (b-a)/(w2-w1)` and `c = a-m*w1`; the fluid value is `c + m*viewportWidth`, clamped to the two endpoints. Express text bounds in rem so user text sizing remains effective. Do not introduce isolated `vw` sizes without minimum and maximum limits.

### Artwork geometry

Give each collage or stack one local coordinate system with a defined width and aspect ratio. Record positions and dimensions as fractions of that container: `x/W`, `y/H`, `width/W`, and `height/H`. All attached borders, shadows, scribbles, and motion distances follow the same local scale. Normal-flow copy sits outside that coordinate system.

For example, a 358px-wide composition at the 390px reference becomes 328px wide at 360px with 16px gutters: its geometric scale factor is `328/358`, approximately 0.916. Scale its artwork by that factor, while body text stays at its readable size. Prefer percentages and container-relative sizing; do not apply a page-wide `transform: scale()`.

Keep image frame ratios stable within each composition mode. Record focal points separately using `object-position`: a proportional frame does not guarantee a good portrait crop. Allow a mobile art arrangement where the desktop geometry would make a key image illegible.

### Responsive modes

- Compact: through 640px. Flow-based copy and section heights; compact artwork arrangements.
- Intermediate: above 640px through 900px. More breathing room and two-column arrangements where their content fits.
- Wide: above 900px. Preserve the established desktop compositions, adjusting only where the baseline proves they fail.

Retain these existing boundaries initially to reduce churn. Validate 640/641 and 900/901 explicitly. Move a boundary if content fails before it, documenting the reason. Do not add a third undocumented threshold in JavaScript. Decide hover behavior from input capability; decide pinning from actual available height as well as width.

## 4. Section implementation specification

| Section | Compact layout and proportions | Behavior |
| --- | --- | --- |
| Loader + hero | Preserve the text/wordmark ratio and optical alignment as one lockup. Fit the longest loader phrase within the content width. Start with a stable small-viewport hero height and a deliberate mobile image focal point. | Preserve the exact loader sequence, 650ms word interval, 120ms swap, 950ms final hold, and browser-load gate. Verify toolbar expansion and orientation changes. |
| Navigation | Replace the current narrow vertical link stack with a compact brand + Menu button on phones; use an accessible panel for all four existing links. Keep wider navigation when it fits. | Support keyboard focus, Escape, expanded state, close-on-selection, and return focus. Offset anchor targets by the actual header height. |
| “hi, we're idio” + offer | Keep intro, CTA, and editorial copy in flow with explicit gaps. Follow with a compact five-image collage; retain the image hierarchy and selected scribbles. Fit the collage within its own measured bounds, including decorative bleed. | On compact screens, use a normal-flow curved section transition initially. Remove associated lag transforms and reserved lag space together. |
| Creative toolkit | Start with a two-by-two arrangement of the existing circles, with consistent circle-to-copy relationships and a wrapping title. If the narrowest width cannot support readable labels, switch to one column there. Retain all four offerings. | Labels must work without hover. Current circles are decorative divs despite the “CLICK ME” hover hint: remove the misleading hint or use real links to verified existing service destinations if that interaction is retained. |
| Previous collaborations | Place the proportionally scaled card stack above copy and selection controls. Derive all frame padding and decorative placement from card width. Keep section height content-driven. | Use manual project selection on compact screens; preserve all four projects. Disable the scroll track, pinning, and team takeover as one mode. Keep desktop scroll behavior where the whole section fits. |
| Team | Keep the horizontal carousel with approximately one card and a preview of the next. Use available carousel width rather than viewport width for card sizing. Preserve portrait ratios; biographies stay readable and in normal flow. | Native swipe and visible buttons both work. Apply enlargement only where hover is available and it fits. Never depend on hover to read biographies. |
| Values | Keep the SVG wheel square and scale its visual bounds, including morph expansion. Replace translated spacing with layout spacing. Keep the descriptions below it on touch layouts, using the existing content source. | Wheel animation remains decorative enhancement; values are readable without hovering. If slices remain buttons, implement touch and keyboard activation; otherwise remove misleading button semantics. |
| Footer | Preserve the wordmark ratio and chosen line break. Arrange contact, socials, and navigation in flow using the shared spacing scale. Retain decorative scribbles where they fit. | Email and links remain readable, reachable, and clear of safe-area insets. |

For reduced motion, use settled artwork and remove nonessential parallax/takeover movement without hiding content. Avoid enlarging the responsive task into a motion redesign. The project instructions specify wheel smoothing 0.075, while the current edited config contains 0.06; record this discrepancy and preserve the user's existing edit during this layout work rather than silently retuning it.

## 5. File ownership and isolation

Add an explicit homepage body marker such as `page-home` when implementation starts, preserving existing loading/ready classes. Scope changed shared tokens, footer rules, and effects through that marker. New tokens can live in `foundation.css` without affecting Services until used there.

- Keep `styles.css` → `styles/home.css` and `scripts/home.js` as public homepage entries.
- Put geometry and section-local media queries in their owning files: `hero.css`, `offer.css`, `toolkit.css`, `case-study.css`, `team.css`, and `values.css`.
- Put shared component behavior in `loader.css`, `buttons.css`, and `footer.css`, scoped when it would otherwise affect Services.
- Consolidate homepage rules in `responsive.css` as those owning files take responsibility. Remove conflicting higher-layer rules in the same edit; moving a declaration alone will not change its effective priority. Retain Services rules as they are.
- Update viewport, navigation, transitions, case-stack, carousel, and wheel modules only for their relevant layout/input behavior. Each module retains its state, listeners, and absent-markup guard.
- Add no late catch-all override file, framework, build requirement, or replacement naming system. Preserve canonical assets and active aliases.

The companion `responsive-page-template.md` is the reusable specification. Future pages opt into the proven rules individually rather than inheriting homepage artwork coordinates.

## 6. Work order and completion gates

1. **Baseline and measurements.** Capture desktop and phone section screenshots plus current interaction states. Record actual font sizes, content bounds, artwork ratios, crop focal points, and shared dependencies. Resolve the mobile collage geometry and heading wraps from these measurements.
2. **Foundation, loader, navigation, hero.** Establish tokens, homepage scope, viewport policy, and header behavior. Gate: readable first screen, longest loader phrase fits, final lockup aligns, navigation works at 320px.
3. **Offer and toolkit.** Implement the compact art arrangements and content flow. Gate: no five-image full-width tower, no title clipping, all offerings readable, consistent vertical gaps.
4. **Case studies and team.** Fix card ratios and implement coordinated manual/pinned modes. Gate: every project can be selected and stays selected when scrolling; no team overlap; all biographies and carousel controls fit.
5. **Values and footer.** Resolve transformed spacing, touch content access, and footer rhythm. Gate: all values and footer links reachable without hover or clipped content.
6. **Consolidation and verification.** Remove superseded homepage declarations, run the required static check, and complete responsive visual and interaction checks. Fill the reusable template with the final values rather than leaving proposed numbers as undocumented defaults.

## 7. Verification for implementation

Run `npm run check` after source, asset, or module changes. Documentation-only planning does not establish code or visual correctness.

Visual samples: 320×568, 360×800, 390×844, 430×932, 768×1024, 1024×768, and 1440×900 CSS pixels. Also inspect phone landscape at 844×390, widths around 640px and 900px, and continuously resize between samples. Test browser toolbar expansion/collapse on a real phone when available; emulation alone is not proof of that behavior. Include Safari and Chromium, touch and keyboard, reduced motion, and 200% text enlargement/zoom.

Acceptance criteria:

- No unintended document-level horizontal scrolling or clipped essential content. Intentional scrolling is contained inside the team carousel. Inspect bounds as well as the scrollbar, because existing `overflow-x: clip` can hide errors.
- Artwork ratios match the recorded reference within normal pixel rounding; images are not stretched and chosen focal points remain visible.
- Body copy follows the readable-size target, wraps without collisions, and grows without being cut off by fixed heights.
- Headers, controls, and copy do not overlap artwork; intentional artwork overlaps are recorded in the section specification.
- No large empty scroll tracks, fixed-height content traps, or inaccessible content in landscape/short screens.
- Navigation anchors, all project selectors, carousel buttons/swipe, value content, and footer links work across responsive mode changes.
- Desktop composition remains consistent with the captured baseline. Services receives a regression comparison solely to verify shared-style isolation.
- Loader timing and load gating remain intact; all visual checks wait for the actual production loader rather than adding debug bypasses.

Unvalidated items must be recorded explicitly—for example, real-device Safari not available—rather than reported as passing.
