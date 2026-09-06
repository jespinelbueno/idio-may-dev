# Responsive page specification template

Copy this specification for each future page. The homepage is the first application; its implemented values and validation record are in [responsive-implementation.md](responsive-implementation.md). This document is a planning template, not an installed skill or an automatically applied stylesheet.

## Page and scope

- Page / public entry:
- Page scope marker:
- CSS entry and ordered layers:
- JavaScript entry and feature modules:
- Shared dependencies and pages requiring regression checks:
- Reference screenshots and viewport sizes:
- Existing user edits to preserve:
- Content and behavior that must remain unchanged:

## Responsive contract

Preserve recognizable compositions; reflow readable content. Use normal flow for text and controls, and a local coordinate system for artwork. Scale related artwork dimensions together; keep text and hit areas above their minimum sizes.

| Property | Compact reference | Intermediate reference | Wide reference | Constraint / token owner |
| --- | --- | --- | --- | --- |
| Viewport | | | | |
| Content width / gutters | | | | |
| Heading size / line-height | | | | |
| Body size / line-height | | | | |
| Caption size | | | | |
| Reading measure | | | | |
| Section padding / internal gaps | | | | |
| Control hit area | | | | |
| Header / anchor clearance | | | | |

Record each breakpoint and the content constraint that requires it. Record height-dependent and input-dependent behavior separately. CSS and JavaScript must agree on the selected mode.

## Section specification — repeat for each section

- Section / owning file:
- Reading and DOM order:
- Compact, intermediate, and wide arrangement:
- What scales proportionally:
- What wraps or changes columns:
- What stays above a minimum size:
- Artwork container width and aspect ratio:
- Artwork positions and sizes as normalized fractions:
- Image frame ratios and focal points:
- Decoration bounds, bleed, and intended overlaps:
- Heading line-break policy:
- Section height and minimum clearance:
- Touch, keyboard, and hover behavior:
- Reduced-motion behavior:
- Short-screen and enlarged-text fallback:
- Resize behavior, selected-state preservation, and cleanup of inactive effects:
- Acceptance screenshot / measurement:

## Implementation sequence

1. Capture and measure the current page before editing.
2. Establish scoped tokens and mode rules; document endpoint values for fluid sizes.
3. Build content flow, then add proportionally sized artwork.
4. Coordinate interaction modes with layout and available height.
5. Remove superseded rules from all higher-priority layers in the same change.
6. Verify the target page and shared consumers; record final measurements and exceptions.

## Completion record

- Static verification (`npm run check` for this repository):
- Narrow phone, standard phone, large phone, tablet, desktop:
- Landscape / short viewport:
- Breakpoint boundaries and continuous resize:
- Safari / Chromium:
- Actual mobile toolbar and safe-area behavior:
- Touch / keyboard / reduced motion:
- Enlarged text / zoom:
- Content bounds and absence of unintended page overflow:
- Artwork proportions and focal-point comparison:
- All content and controls reachable:
- State preserved when scrolling or changing modes:
- Desktop and shared-page regression comparison:
- Known gaps and checks not performed:
- Final token values and reusable patterns:
