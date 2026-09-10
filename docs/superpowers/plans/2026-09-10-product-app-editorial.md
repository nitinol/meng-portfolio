# Product & App Editorial Implementation Plan

> For agentic workers: use subagent-driven-development; implement dependency-ordered stories from SurrealDB. No commits unless requested.

**Goal:** Deliver the approved PRODUCT, full editorial article, and APP experience.
**Architecture:** Static HTML, scoped CSS and small progressively enhanced JS. Existing business CSS remains the shared visual foundation. Directory index serves the clean article URL.
**Tech Stack:** HTML, CSS, SVG, JavaScript, Node built-in tests; browser verification.
**Spec:** `docs/superpowers/specs/2026-09-10-product-app-editorial.md`

## Global Constraints

Preserve supplied prose in `docs/content/product-manager-article.txt`. Preserve dirty
tagline/dispatch work. No framework, no book downloads, no invented metrics, no
unlicensed art, no production deployment. Port 8080 is local; 8000 is SurrealDB.

## Story 1: Original Visual System

Create `assets/editorial/{whiteboard,canvas,bus,roadmap,stories,partnership,shipping,systems,flow,loop}.svg` and `assets/editorial/social.svg`.
Each SVG uses viewBox, warm #f5f3ed paper, charcoal lines, blue #0a66c2 accent,
original penlike compositions, meaningful labels. Vector format stays Retina sharp.
Use XML validation and verify images in browser. Social image converted to JPEG by
available system image tooling; page metadata points to JPEG, not SVG.

## Story 2: Editorial Article

Files: article directory index, `editorial.css`, `editorial.js`, `tests/editorial.test.cjs`.
Consumes story 1 assets and exact source prose; produces complete static article.
Write Node tests first asserting 13 chapters, one H1, bookshelf titles, source
paragraph preservation, local links and structured data. Command:
`node --test tests/editorial.test.cjs` (initial missing HTML failure expected).
Render all prose as semantic HTML at author time, not browser-generated text.
Use native details for touch/keyboard book references and mobile contents.
Script progressively tracks current chapter and reading progress; all text visible
without JS. Keep DOM IDs descriptive (`discovery`, `lean-canvas`, etc.).
Shared nav uses root-relative links and mobile button `data-menu-toggle` targeting
`mainNav`. `site-nav.js` owns those new controls, not old global script functions.
Article canonical `https://www.menguhan.com/blog/what-does-a-product-manager-do/`.
Verify text fidelity, contents destinations, JS syntax and responsive screenshots.

## Story 3: APP Release Ownership

Files: `app.html`, `release.css`, `release.js`, `tests/release.test.cjs`.
Independent of article. Shared CSS loaded first; nav as story 2. Build readiness,
new/update versioning, screenshots, metadata, requirements, testing, submission,
review, phased rollout, production, analytics, ratings, crashes, hotfixes all covered.
Stages are ordinary anchored sections. Scroll highlights stage; click/keyboard/tap
can navigate; never move focus on passive scroll. Connected store panel represents
an illustrative successful release, then monitoring. Official docs links distinguish
Google Play Console, App Store Connect and AppGallery Connect without fake UI.
Test before implementation: 8 stage targets, three platforms, no unsupported metrics,
one H1, reduced-motion CSS; run `node --test tests/release.test.cjs`.

## Story 4: PRODUCT + Integration

Files: `product.html`, `product.css`, `site-nav.js`; modify business nav in
`portfolio.html`, `projects.html`, `contact.html`, and sitemap, shared focus styles.
Depends on stories 2 and 3. Product page links full article and APP. Reuse whiteboard
illustration and existing header proportions. Add compact About-page article teaser.
No unrelated legacy JS changes. Header CSS supports five links without overflow.
Node contract test loops all six business pages checking nav order and destinations.
Article/APP metadata links stable author ID `https://www.menguhan.com/#person`.
Update sitemap only for affected/new pages with actual modification date.

## Verification

Run `node --test tests/*.test.cjs` and `node --check` on new JS. Browser QA each
story acceptance criterion: mobile/desktop, no-JS, reduced motion, keyboard controls,
TOC/progress at several chapters, all eight release stages, book disclosures/legal
links, contact/project regressions. Check HTTP 200 for all local assets plus requested
slashless article redirect. Review diff, preserve initial dirty work, report actual
verification and limitations. Do not commit or deploy.
