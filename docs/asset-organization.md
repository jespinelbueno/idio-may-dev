# Asset ownership

`assets/` has two roots: `media/` for images, SVG artwork, and video, and `fonts/` for fonts and their bundled licenses. Each media file has one canonical location. Folder names use lowercase kebab-case.

Choose the page, then the section where the asset is used. Desktop and mobile artwork stay together: a section's `mobile/` folder contains only its mobile variants. Shared components and reused files have their own owners.

```text
assets/
├── fonts/
│   ├── dm-sans/                 Variable font, OFL, upstream README
│   ├── teva/                    OpenType and TrueType regular fonts
│   └── vollkorn/                Variable font, OFL, upstream README
└── media/
    ├── home/
    │   ├── hero/                Hero photograph
    │   ├── offer/               Collage photographs and title artwork
    │   │   ├── decorations/     Intro and collage scribbles
    │   │   └── mobile/          Offer underline, arrow, collage logos
    │   ├── values/
    │   │   ├── arrows/          Six wheel arrows
    │   │   └── mobile/          Values glows and underlines
    │   ├── toolkit/
    │   │   └── mobile/          Mobile title artwork
    │   ├── case-study/          Portfolio photographs and wireframes
    │   └── team/
    │       └── arrows/          Team selector arrows
    ├── services/
    │   ├── hero/                Hero photograph and underline
    │   ├── cards/
    │   │   └── mobile/          Mobile card artwork
    │   ├── work/                Portfolio photographs and scribbles
    │   │   └── mobile/          Work circle and scribbles
    │   ├── process/
    │   │   └── mobile/          Process circle, underline, and strokes
    │   └── contact/
    │       └── mobile/          Closing banner scribbles
    ├── about/
    │   ├── hero/                Team photograph and underline
    │   ├── story/               Founder, early days, thread, and collage
    │   ├── next/                Studio photograph and second thread
    │   ├── team/                Team section curve
    │   ├── contact/             Closing banner photograph
    │   └── backgrounds/         Glows spanning multiple sections
    ├── events/
    │   ├── hero/                Background video, poster, and underline
    │   ├── community/           Newsletter heading and signup artwork
    │   ├── calendar/            Calendar strokes
    │   ├── coming/              Coming events photograph and artwork
    │   ├── contact/             Closing banner scribbles
    │   └── backgrounds/         Glows reused within the page
    ├── contact/
    │   ├── hero/                Hero accents
    │   └── social/              Contact-specific social artwork
    ├── coming-soon/hero/        Fullscreen photograph and title artwork
    ├── not-found/digits/        Both animation frames of the 404 digits
    ├── team/
    │   ├── home/                Homepage portraits
    │   └── about/               About portraits; dynamically selected
    ├── brand/
    │   ├── logos/               Primary and footer wordmarks
    │   ├── icons/               Idio icon and favicon
    │   └── social/              Shared social icons
    ├── footer/decorations/      Footer scribbles and link circle
    └── shared/
        ├── backgrounds/        Footer wireframe and home/About team pattern
        ├── photos/             Shared closing banner photograph
        ├── shapes/             Shared hero curve
        └── textures/           Shared paper grain
```

The two sets of team portraits are intentional page-specific variants. Similar photographs and artwork with different file contents remain separate; reorganization does not recompress or alter media.

## Compatibility and maintenance

The organization pass moved 106 canonical files and removed 50 byte-identical legacy copies. The 152 retained public media/font URLs are recorded in `tools/asset-aliases.json`. There is no top-level `services/` folder or duplicate legacy asset tree.

1. Move or add media under its owner, then update HTML, CSS, and JavaScript references. Keep font licenses beside the relevant font family.
2. When moving an existing public file, add its old URL to the alias map. Retarget earlier aliases to the final file so redirects never form chains.
3. Run `node tools/asset-routing.mjs` to regenerate the committed Hostinger and Vercel redirects. Commit both host files alongside the map and media changes.
4. Run `npm run check`. It checks references, responsive images, video posters, dynamic asset families, canonical locations, redirect configuration, JavaScript syntax, and behavior tests.

Hostinger reads `.htaccess`; Vercel reads `vercel.json`. Deploy the corresponding configuration with the files. No build or runtime JavaScript is needed for compatibility. Unknown paths still return 404; there is no page catch-all. Old folder names containing `?` are requested using `%3F` in the URL path.

The backup icon/color loader remains in `loading-screens/icon-color-loader/` and references the same canonical brand assets.
