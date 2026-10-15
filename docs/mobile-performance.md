# Mobile performance pass — 2026-10-15

Implemented WebP raster assets, responsive image candidates, matching hero preloads, image dimensions, asynchronous decoding, lazy offscreen photographs, and one-day media caching for Hostinger and Vercel. The About team selector no longer eagerly downloads/decodes all portraits; generated case-study images retain responsive candidates and lazy loading. Existing public image URLs redirect directly to the new canonical files.

## Local download comparison

Measured in fresh headless Chromium contexts at 390 × 844 CSS pixels, DPR 2, touch/mobile emulation. Each sample records Resource Timing transfer bytes at browser `load` + 700 ms without scrolling, against the prior Git HEAD and the changed working tree. Local Python HTTP servers do not apply the deployment cache/compression rules. Values use decimal MB and include resource response overhead, excluding the HTML navigation itself.

| Page | Before | After | Reduction |
| --- | ---: | ---: | ---: |
| Home | 34.43 MB | 3.31 MB | 90.4% |
| About | 10.95 MB | 1.94 MB | 82.3% |
| Services | 5.64 MB | 1.99 MB | 64.7% |

The homepage hero source dropped from 1,215,616 bytes to a 199,770-byte mobile variant (83.6% smaller). The 41 original raster files totaled 47,416,120 bytes; their full-size WebP replacements total 15,732,658 bytes (66.8% smaller), before adding the smaller responsive variants.

These are local transfer measurements, not Lighthouse scores, real-device timings, or deployed Core Web Vitals. Image decoding, network conditions, device performance, and scroll position affect actual results.

## Preserved timing

The first-visit homepage intro intentionally takes 6,270 ms for eight words and the final lockup, plus any remaining browser load time. Its sequence, privacy preference behavior, and reveal gate are unchanged. Reducing this fixed delay would require a separate change to the project’s loader requirements.

## Verification

`npm run check` verifies source references (including responsive preload candidates), aliases, JavaScript syntax, and 55 behavior tests. Every generated WebP file was decoded/verified with Pillow. The initial mobile comparisons reported no JavaScript exceptions or HTTP errors on Home, About, and Services.

Browser smoke checks also passed on all eight public pages at 390px and 1440px widths, scrolling through lazy content: no failed HTTP responses, JavaScript exceptions, or broken decoded images. The mobile About controls successfully advanced through all five portraits.
