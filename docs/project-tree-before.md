# Project tree before organization

Captured on October 15, 2026, before moving files. Includes tracked and non-ignored working files, including existing uncommitted edits. Excludes Git internals and ignored local files. This is a historical path inventory; use the root README for the current editing guide.

```text
idio-may-dev/
├── .github/
│   ├── workflows/
│   │   └── pages.yml
│   └── dependabot.yml
├── assets/
│   ├── arrows/
│   │   ├── ourteamarrows/
│   │   │   ├── yellow1.svg
│   │   │   ├── yellow2.svg
│   │   │   ├── yellow3.svg
│   │   │   ├── yellow4.svg
│   │   │   └── yellow5.svg
│   │   ├── wheel/
│   │   │   ├── green1.svg
│   │   │   ├── green2.svg
│   │   │   ├── green3.svg
│   │   │   ├── green4.svg
│   │   │   ├── green5.svg
│   │   │   └── green6.svg
│   │   └── wheelarrow.png
│   ├── backgrounds/
│   │   ├── landingbg.jpg
│   │   ├── ourcreativetoolkitbg.png
│   │   └── servicesbg.png
│   ├── fonts/
│   │   ├── DM_Sans/
│   │   │   ├── DMSans-VariableFont_opsz,wght.ttf
│   │   │   ├── OFL.txt
│   │   │   └── README.txt
│   │   ├── Teva/
│   │   │   ├── Teva-Regular.otf
│   │   │   └── Teva-Regular.ttf
│   │   └── Vollkorn/
│   │       ├── OFL.txt
│   │       ├── README.txt
│   │       └── Vollkorn-VariableFont_wght.ttf
│   ├── footerassets/
│   │   ├── bgfooter.jpg
│   │   ├── bgfooter.png
│   │   ├── facebooklogo.svg
│   │   ├── instalogo.svg
│   │   ├── pinterestlogo.svg
│   │   └── youtubelogo.svg
│   ├── gradients/
│   │   └── trisection/
│   │       ├── cream.jpg
│   │       └── yellow.jpg
│   ├── img/
│   │   ├── hiidio/
│   │   │   ├── dekker1.jpg
│   │   │   ├── fruitspirit1.jpg
│   │   │   ├── leisureevents1.jpg
│   │   │   ├── leisureevents2.jpg
│   │   │   └── painting1.jpg
│   │   ├── ourteamphotos/
│   │   │   ├── anna.png
│   │   │   ├── jaden.png
│   │   │   ├── naomi.png
│   │   │   └── raquel.png
│   │   ├── photos/
│   │   │   ├── casestudymain_cropped.jpg
│   │   │   ├── imgdetail.png
│   │   │   ├── imglook.png
│   │   │   ├── imgmotion.png
│   │   │   ├── imgportrait.png
│   │   │   └── imgstilllive.png
│   │   ├── scribbles/
│   │   │   ├── scribble1.svg
│   │   │   └── scribble2.svg
│   │   ├── services photos/
│   │   │   └── table.png
│   │   ├── icon.svg
│   │   ├── idiologomonochrome.svg
│   │   └── values-arrow.svg
│   ├── media/
│   │   ├── about/
│   │   │   ├── anna-founder.jpg
│   │   │   ├── blue-dot.svg
│   │   │   ├── collage-scribble.svg
│   │   │   ├── early-days.jpg
│   │   │   ├── friends.jpg
│   │   │   ├── green-dot.svg
│   │   │   ├── hero-curve.svg
│   │   │   ├── hero-underline.svg
│   │   │   ├── lower-cream-glow.svg
│   │   │   ├── lower-yellow-glow.svg
│   │   │   ├── next-thread.svg
│   │   │   ├── olive-curve.svg
│   │   │   ├── story-thread.svg
│   │   │   ├── story-yellow-glow.svg
│   │   │   ├── studio-bottom-scribble.svg
│   │   │   ├── studio-group.jpg
│   │   │   ├── studio-left-scribble.svg
│   │   │   ├── team-field.jpg
│   │   │   ├── team-portrait-source.jpg
│   │   │   ├── title-circle.svg
│   │   │   └── yellow-dot.svg
│   │   ├── brand/
│   │   │   ├── favicon.svg
│   │   │   ├── footer-instagram.svg
│   │   │   ├── footer-pinterest.svg
│   │   │   ├── footer-wordmark.svg
│   │   │   ├── idio-icon.svg
│   │   │   ├── idio-wordmark.svg
│   │   │   ├── social-facebook.svg
│   │   │   ├── social-instagram.svg
│   │   │   ├── social-pinterest.svg
│   │   │   └── social-youtube.svg
│   │   ├── case-study/
│   │   │   ├── christian-dekker.jpg
│   │   │   └── leisure-events.jpg
│   │   ├── circles/
│   │   │   ├── Ellipse 100.png
│   │   │   ├── Ellipse 34.png
│   │   │   └── Ellipse 98.png
│   │   ├── coming-soon/
│   │   │   ├── team-field.jpg
│   │   │   ├── title-circle.svg
│   │   │   └── title-underline.svg
│   │   ├── contact/
│   │   │   ├── accent-left.svg
│   │   │   ├── accent-right.svg
│   │   │   ├── accent-upper-right.svg
│   │   │   ├── creative-background.jpg
│   │   │   ├── social-instagram.svg
│   │   │   └── social-pinterest.svg
│   │   ├── decorations/
│   │   │   ├── arrows/
│   │   │   │   ├── our-team/
│   │   │   │   │   ├── yellow1.svg
│   │   │   │   │   ├── yellow2.svg
│   │   │   │   │   ├── yellow3.svg
│   │   │   │   │   ├── yellow4.svg
│   │   │   │   │   └── yellow5.svg
│   │   │   │   ├── services-intro.svg
│   │   │   │   ├── team.svg
│   │   │   │   └── values-wheel-arrow.png
│   │   │   └── scribbles/
│   │   │       ├── case-study/
│   │   │       │   ├── green-wireframe.svg
│   │   │       │   ├── green.png
│   │   │       │   ├── pink-wireframe.svg
│   │   │       │   ├── yellow-wireframe.svg
│   │   │       │   └── yellow.png
│   │   │       ├── footer/
│   │   │       │   ├── home-left.svg
│   │   │       │   ├── home-lower-right.svg
│   │   │       │   ├── home-upper.svg
│   │   │       │   ├── link-circle.svg
│   │   │       │   ├── new-big-white-right.svg
│   │   │       │   ├── new-small-white-right.jpg
│   │   │       │   ├── new-white-left.svg
│   │   │       │   ├── white-center-left.svg
│   │   │       │   ├── white-lower-right.svg
│   │   │       │   └── white-upper-right.svg
│   │   │       ├── hiidio/
│   │   │       │   ├── butenough/
│   │   │       │   │   ├── blueright.svg
│   │   │       │   │   ├── greenright1.svg
│   │   │       │   │   ├── greenright2.svg
│   │   │       │   │   ├── redright.svg
│   │   │       │   │   └── yellowleft.svg
│   │   │       │   ├── greenscribbleright.svg
│   │   │       │   ├── redscribbleleft1.svg
│   │   │       │   ├── redscribbleleft2.svg
│   │   │       │   └── yellowscribbleright.svg
│   │   │       ├── loader/
│   │   │       │   └── line.svg
│   │   │       ├── offer/
│   │   │       │   ├── blue.svg
│   │   │       │   ├── green-fill.svg
│   │   │       │   ├── green.svg
│   │   │       │   ├── red-accent.svg
│   │   │       │   ├── red-main.svg
│   │   │       │   └── yellow.svg
│   │   │       ├── services/
│   │   │       │   ├── blue-scribble.svg
│   │   │       │   ├── blue-underline.svg
│   │   │       │   ├── butter-scribble.svg
│   │   │       │   ├── cream-underline.svg
│   │   │       │   ├── green-underline.svg
│   │   │       │   ├── green.png
│   │   │       │   ├── hero-underline.svg
│   │   │       │   ├── process-circle.svg
│   │   │       │   ├── process-underline.svg
│   │   │       │   ├── raspberry-underline.svg
│   │   │       │   ├── work-circle.svg
│   │   │       │   ├── work-left.svg
│   │   │       │   ├── work-middle.svg
│   │   │       │   ├── work-with-us-green.svg
│   │   │       │   ├── work-with-us-raspberry.svg
│   │   │       │   └── work-with-us-yellow.svg
│   │   │       ├── creative-toolkit-title.svg
│   │   │       ├── offer-title.svg
│   │   │       ├── scribbleblueourvalues.svg
│   │   │       ├── toolkit-title.svg
│   │   │       └── toolkit.svg
│   │   ├── events/
│   │   │   ├── bgvideo.mp4
│   │   │   ├── calendar-left-long.svg
│   │   │   ├── calendar-left-short.svg
│   │   │   ├── calendar-right-long.svg
│   │   │   ├── calendar-right-short.svg
│   │   │   ├── coming-bottom.svg
│   │   │   ├── coming-dot.svg
│   │   │   ├── coming-left.svg
│   │   │   ├── community.jpg
│   │   │   ├── contact-red.svg
│   │   │   ├── contact-yellow.svg
│   │   │   ├── contact.jpg
│   │   │   ├── cream-glow.svg
│   │   │   ├── email-circle.svg
│   │   │   ├── email-underline.svg
│   │   │   ├── green-curve.svg
│   │   │   ├── hero-curve.svg
│   │   │   ├── hero-underline.svg
│   │   │   ├── hero.png
│   │   │   ├── signup-dot.svg
│   │   │   ├── signup-line.svg
│   │   │   └── yellow-glow.svg
│   │   ├── footer/
│   │   │   ├── home-background.jpg
│   │   │   ├── home-wireframe-background.jpg
│   │   │   └── services-background.jpg
│   │   ├── gradients/
│   │   │   ├── case-study-cream.jpg
│   │   │   └── case-study-yellow.jpg
│   │   ├── home/
│   │   │   ├── mobile/
│   │   │   │   ├── collage-left.png
│   │   │   │   ├── collage-portrait-logo.png
│   │   │   │   ├── collage-portrait.jpg
│   │   │   │   ├── collage-right-logo.png
│   │   │   │   ├── collage-right.jpg
│   │   │   │   ├── offer-arrow.svg
│   │   │   │   ├── offer-underline.svg
│   │   │   │   ├── toolkit-title.svg
│   │   │   │   ├── value-underline.svg
│   │   │   │   ├── values-glow-bottom.svg
│   │   │   │   ├── values-glow-top.svg
│   │   │   │   └── values-underline.svg
│   │   │   ├── textures/
│   │   │   │   ├── paper-grain.svg
│   │   │   │   └── team-olive.svg
│   │   │   ├── creative-toolkit-background.png
│   │   │   └── hero.jpg
│   │   ├── not-found/
│   │   │   ├── four-frame-1.svg
│   │   │   ├── four-frame-2.svg
│   │   │   ├── zero-frame-1.svg
│   │   │   └── zero-frame-2.svg
│   │   ├── offer/
│   │   │   ├── collage-dekker.png
│   │   │   ├── collage-fruit-spirit.png
│   │   │   ├── collage-leisure-portrait.jpg
│   │   │   ├── collage-leisure-table.jpg
│   │   │   ├── collage-painting.jpg
│   │   │   ├── editorial-detail.png
│   │   │   ├── editorial-look.png
│   │   │   ├── editorial-motion.png
│   │   │   ├── editorial-portrait.jpg
│   │   │   └── editorial-still-life.png
│   │   ├── services/
│   │   │   ├── mobile/
│   │   │   │   ├── contact-blue.svg
│   │   │   │   ├── contact-red.svg
│   │   │   │   ├── content-card.svg
│   │   │   │   ├── process-bottom.svg
│   │   │   │   ├── process-circle.svg
│   │   │   │   ├── process-top.svg
│   │   │   │   ├── process-underline.svg
│   │   │   │   ├── work-blue.svg
│   │   │   │   ├── work-circle.svg
│   │   │   │   └── work-yellow.svg
│   │   │   ├── pics-or-it-didnt/
│   │   │   │   ├── branding.jpg
│   │   │   │   ├── branding.svg
│   │   │   │   ├── content-creation.jpg
│   │   │   │   ├── content-creation.svg
│   │   │   │   ├── studio.jpg
│   │   │   │   ├── studio.svg
│   │   │   │   ├── web-design.jpg
│   │   │   │   └── web-design.svg
│   │   │   ├── creative-toolkit-hero.jpg
│   │   │   ├── hero.png
│   │   │   ├── intro-table.png
│   │   │   ├── work-with-us-field.jpg
│   │   │   └── work-with-us.jpg
│   │   └── team/
│   │       ├── anna.png
│   │       ├── anna2.jpg
│   │       ├── gretel.jpg
│   │       ├── gretel2.jpg
│   │       ├── jaden.jpg
│   │       ├── jaden2.jpg
│   │       ├── naomi.jpg
│   │       ├── naomi2.jpg
│   │       ├── raquel-alternate.jpg
│   │       ├── raquel.jpg
│   │       └── raquel2.jpg
│   ├── ourteamassets/
│   │   └── arrow.svg
│   └── scribbles/
│       ├── casestudy/
│       │   ├── scribblegreen.png
│       │   └── scribbleyellow.png
│       ├── footer/
│       │   ├── newbigwhiteright.svg
│       │   ├── newsmallwhiteright.jpg
│       │   ├── newwhiteleft.svg
│       │   ├── scribblerightlowerright.svg
│       │   ├── scribblewhitecenterleft.svg
│       │   └── scribblewhitelupperright.svg
│       ├── hiidio/
│       │   ├── butenough/
│       │   │   ├── blueright.svg
│       │   │   ├── greenright1.svg
│       │   │   ├── greenright2.svg
│       │   │   ├── redright.svg
│       │   │   └── yellowleft.svg
│       │   ├── greenscribbleright.svg
│       │   ├── redscribbleleft1.svg
│       │   ├── redscribbleleft2.svg
│       │   └── yellowscribbleright.svg
│       ├── loader/
│       │   └── line.svg
│       ├── services/
│       │   └── scribble1green.png
│       ├── toolkit/
│       │   ├── creativetoolkit.svg
│       │   └── newscribbleourcreativetoolkit.svg
│       ├── scribble1red.svg
│       ├── scribble2red.svg
│       ├── scribble3green.svg
│       ├── scribble4green.svg
│       ├── scribble5yellow.svg
│       └── scribble6blue.svg
├── docs/
│   ├── homepage-responsive-plan.md
│   ├── newsletter.md
│   ├── privacy-launch-review.md
│   ├── proportion-audit.md
│   ├── responsive-implementation.md
│   ├── responsive-page-template.md
│   └── security-audit.md
├── loading-screens/
│   └── icon-color-loader/
│       ├── index.html
│       ├── README.md
│       └── styles.css
├── scripts/
│   ├── features/
│   │   ├── values-wheel/
│   │   │   ├── config.js
│   │   │   ├── controller.js
│   │   │   └── geometry.js
│   │   ├── about-team-scroll-progress.js
│   │   ├── about-team-selector.js
│   │   ├── about-thread-draw.js
│   │   ├── about-thread-geometry.js
│   │   ├── about-thread-progress.js
│   │   ├── arrow-draw.js
│   │   ├── case-study-stack.js
│   │   ├── case-team-transition.js
│   │   ├── coming-soon-artwork.js
│   │   ├── community-signup-request.js
│   │   ├── community-signup.js
│   │   ├── contact-artwork.js
│   │   ├── copyright-year.js
│   │   ├── custom-cursor.js
│   │   ├── events-hero-video.js
│   │   ├── footer-link-circles.js
│   │   ├── hero-offer-transition.js
│   │   ├── home-loader.js
│   │   ├── home-nav.js
│   │   ├── image-save-deterrent.js
│   │   ├── mobile-landing.js
│   │   ├── not-found-artwork.js
│   │   ├── offer-parallax.js
│   │   ├── privacy-preferences.js
│   │   ├── responsive-nav.js
│   │   ├── services-card-stack.js
│   │   ├── services-hero-reveal.js
│   │   ├── services-process.js
│   │   ├── services-work-carousel.js
│   │   ├── team-carousel.js
│   │   └── viewport-height.js
│   ├── about.js
│   ├── coming-soon.js
│   ├── contact.js
│   ├── events.js
│   ├── home.js
│   ├── not-found.js
│   ├── privacy-bootstrap.js
│   ├── privacy.js
│   ├── register-cache.js
│   └── services.js
├── services/
│   └── assets/
│       ├── img/
│       │   ├── picsordidnt/
│       │   │   ├── branding.svg
│       │   │   ├── contentcreation.svg
│       │   │   ├── contentcreation2.svg
│       │   │   └── webdesign.svg
│       │   ├── sowanna?/
│       │   │   └── bg.jpg
│       │   └── mainbg.jpg
│       ├── scribbles/
│       │   ├── nomatterwhattheservice/
│       │   │   └── circlescribble.svg
│       │   ├── picsordidnt/
│       │   │   ├── greencicrlescribble.svg
│       │   │   └── middlegreenscribble.svg
│       │   ├── sowanna?/
│       │   │   ├── greenscribble.svg
│       │   │   └── rapsberryscribble.svg
│       │   ├── bluescribble.svg
│       │   └── butterscribble.svg
│       └── underlines/
│           ├── nomatterwheretheservice/
│           │   └── greenunderline.svg
│           ├── blueunderline.svg
│           ├── creamunderline.svg
│           ├── greenunderline.svg
│           └── raspberryunderline.svg
├── styles/
│   ├── about-page.css
│   ├── about-responsive.css
│   ├── about.css
│   ├── animations.css
│   ├── buttons.css
│   ├── carousel-controls.css
│   ├── case-study.css
│   ├── coming-soon-page.css
│   ├── coming-soon-responsive.css
│   ├── coming-soon.css
│   ├── contact-hero.css
│   ├── contact-page.css
│   ├── contact-responsive.css
│   ├── contact.css
│   ├── custom-cursor.css
│   ├── events-page.css
│   ├── events-responsive.css
│   ├── events.css
│   ├── footer.css
│   ├── foundation.css
│   ├── hero.css
│   ├── home-no-script.css
│   ├── home.css
│   ├── loader.css
│   ├── navigation-base.css
│   ├── navigation.css
│   ├── not-found-animation.css
│   ├── not-found-page.css
│   ├── not-found-responsive.css
│   ├── not-found.css
│   ├── offer.css
│   ├── privacy-controls.css
│   ├── privacy-page.css
│   ├── privacy-responsive.css
│   ├── privacy.css
│   ├── responsive.css
│   ├── services-page.css
│   ├── services.css
│   ├── signup-confirmation.css
│   ├── team.css
│   ├── toolkit.css
│   └── values.css
├── tests/
│   ├── about-team-scroll.test.mjs
│   ├── about-thread-geometry.test.mjs
│   ├── about-thread-progress.test.mjs
│   ├── community-signup.test.mjs
│   ├── home-loader.test.mjs
│   ├── privacy.test.mjs
│   ├── security.test.mjs
│   └── services-hero-reveal.test.mjs
├── tools/
│   ├── asset-aliases.json
│   ├── check-site.mjs
│   └── prepare-pages.mjs
├── .gitignore
├── .nojekyll
├── 404.html
├── about.html
├── AGENTS.md
├── coming-soon.html
├── contact.html
├── events.html
├── index.html
├── package.json
├── privacy.html
├── README.md
├── service-worker.js
├── services.html
└── styles.css
```
