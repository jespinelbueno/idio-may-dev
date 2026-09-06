# Homepage responsive implementation

Implemented September 6, 2026. Public entries and the build-free GitHub Pages workflow are unchanged. The homepage opts into shared responsive styles with `body.page-home`; Services keeps its existing rules.

## Final rules for reuse

| Rule | Implemented value / behavior |
| --- | --- |
| Page gutters | `clamp(1rem, 4vw, 3rem)` |
| Section spacing | `clamp(3rem, 7vw, 5rem)` |
| Responsive section headings | `clamp(2.25rem, 2.017rem + 1.98vw, 3.8rem)` |
| Responsive body text | `1rem`, generally 1.5 line-height |
| Supporting text | `0.875rem` minimum in the responsive layouts |
| Touch target | `2.75rem`; controls wrap or constrain their width when text is enlarged |
| Phone navigation | Disclosure menu through 640px; Escape returns focus, selection closes it, and focus/outside-pointer dismissal is supported |
| Intermediate layout | Through 1100px, replacing the proposed 900px boundary because the old desktop layout left tablet copy at approximately 8px |
| Case/team composition | Named `case-layout` container switches through `68.75rem`, also responding to enlarged root text on wide screens |
| Toolkit | Two columns, one below 350px; original image assets and circle shapes retained |
| Team carousel | 82% card width in containers through `40rem`; 44% in the intermediate arrangement; native horizontal scrolling and arrow buttons |
| Values | Persistent descriptions on touch devices and containers through `70rem`; one description column through `40rem` |
| Hero height | Native `100svh` on phones/tablets where supported; existing desktop viewport sizing retained |
| Pinned sections | Flow on intermediate layouts, short screens (720px high or less), reduced motion, or when measured case-study content will not fit |

Viewport queries handle the overall page composition. Container queries handle artwork or reading arrangements that must also react to font enlargement. Shared styles are explicitly scoped; another page should opt into the primitives after its own layout is reviewed.

## Artwork measurements

The responsive offer collage uses a `1 / 1.04` container ratio, capped at 38rem. Coordinates are percentages of that container:

| Image | Left | Top | Width | Frame ratio |
| --- | --- | --- | --- | --- |
| Main portrait | 25% | 0% | 44% | 580 / 621 |
| Disc artwork | 73% | 24% | 27% | 372 / 351 |
| Wristbands | 0% | 39% | 34% | 507 / 338 |
| Detail portrait | 29% | 58% | 24% | 334 / 474 |
| Event table | 57% | 61% | 39% | 273 / 161 |

The case-study artwork uses a `1 / 1.02` media container. Its card stack is 61% wide, offset 24% from the left and 7% from the top. Frame padding derives from the stack's width: 5% at the top and sides, 25% at the bottom. JavaScript uses the untransformed card width for movement so rotated cards do not distort subsequent measurements.

The values graphic retains its SVG geometry and existing smoothing configuration. Its responsive wrapper uses 70% of the content width, capped at 22rem, leaving room for expanded slices. Text descriptions use the existing configuration as their source.

## Behavior and maintenance

- Project selection is manual in flow layouts and no longer resets to the first project on ordinary scrolling. All four existing entries remain available.
- Case/team takeover spacing is cleared whenever pinning is unavailable. Hero/offer lag is likewise cleared for the responsive layout.
- Wheel slices support click, Enter, and Space; persistent descriptions highlight the selected value.
- Team biographies remain visible. Touch layouts do not enlarge portraits over nearby content.
- The loader's word order, timing constants, and browser-load gate are unchanged. Lockups remain within the available width under text enlargement.
- Existing newer legacy collage images were copied to their mapped canonical files to fix two pre-existing alias mismatches. The aliases and mappings remain valid.
- Homepage media queries now live with their owning sections/components. `responsive.css` retains shared reduced-motion rules and the existing Services rules; its legacy footer rules exclude `.page-home`.

## Verification record

`npm run check` passes: linked source references, JavaScript modules, and asset aliases verified. `git diff --check` also passes.

Chromium checks covered 320×568, 360×800, 390×844, 430×932, 640×900, 641×900, 768×1024, 844×390, 900×900, 901×900, 1024×768, 1100×900, 1101×900, and 1440×900. The checks found no unintended page overflow, out-of-bounds primary text/controls, or runtime errors in the final matrix. Project selection through all four entries, persistence after scrolling, mobile menu/Escape focus, and carousel advancement were exercised.

Separate reduced-motion and 200% root-text checks exercised phone, tablet, and desktop layouts, wheel keyboard activation and expanded bounds, and project selection. Section screenshots were reviewed for the collage, toolkit, case studies, team, values, and footer. The desktop reference retains the same overall page height and established composition; the desktop comparison includes the intentional canonical-image synchronization.

Services' computed CSS values were compared before and after at 390px and 1440px with no differences. Its source and interactions were not redesigned.

Still requiring a real-device pass: Safari/iOS rendering, mobile browser toolbar expansion/collapse, hardware swipe behavior, and physical safe-area insets. Chromium touch emulation and viewport samples do not establish those results. Browser zoom UI and a continuous live resize sweep were not separately exercised; enlarged-root-text and explicit breakpoint samples were used instead.
