# Business Portfolio Redesign — Design Spec

Date: 2026-09-08 | Status: approved (sections §1–§4) | Scope: `portfolio.html` only
(Landing `index.html` + `personal.html` untouched; landing restyle is follow-up work.)

## 1. Goal

Make the business side (`portfolio.html`, live at `www.menguhan.com/portfolio.html`)
look plain, professional, and HR-attractive — modeled on the minimal light style of
`https://www.adrianhiotis.com/` (original implementation, not a copy): a hiring
manager reads top-to-toe and wants to hire. Content is sourced from the owner's CV
(Lead Product Owner — AI & E-Commerce, 8+ yrs).

## 2. Page flow (§1 approved)

Header (logo + `About / Projects / Contact` + LinkedIn) → hero → Experience
timeline → Projects → Skills → Contact → footer.

* Hero: B&W `hero-photo.jpg` (owner drops file in repo root; CSS `grayscale`
  filter so any source photo renders B&W), H1 name, role line
  "Lead Product Owner — AI & E-Commerce Innovation", CV summary (shortened),
  contact line (email / phones / LinkedIn), buttons (View resume → LinkedIn;
  no PDF exists in repo), 3 metric stats: `8+ yrs`, `+12% add-to-cart`,
  `+15% revenue`.
* Experience timeline: Modanisa 2021–25 (5 CV bullets condensed to 3),
  kartelam.com 2020–21, Postmates 2019–20, MDC 2017–19 (1–2 bullets each).
* Projects: 4 metric case-study cards — Dynamic Pricing engine, Similar-Products
  Recommendation engine, AI Search, Mobile release lifecycle. Existing modal
  shells (`#modal-modanisa`, `#modal-mobile`, `#modal-viz`, `#modal-grafana`)
  kept, restyled light.
* Skills: 3 plain CV groups (Product & Leadership / AI & Data / Tools & Technical)
  as text lists + languages line (TR native, EN native, RU very basic, IT/DE beginner).
  The 25-card branded "Technical Arsenal" wall is removed.
* Contact: Web3Forms form + details kept, restyled light.
* CUT: Product Playbook + 6 `#modal-principle-N` modals, `Beyond the Screen`
  (`#perspective`) section, `.cursor-glow` / `.background-glow` elements.

## 3. Theme (§2 approved)

* New `portfolio-light.css` (white bg, near-black text, generous whitespace, thin
  dividers, clean cards) linked ONLY from `portfolio.html`. `style.css` untouched
  so `index.html` / `personal.html` / `success.html` keep the dark-green theme —
  zero regression risk on other pages.
* `theme-color` → `#ffffff` on `portfolio.html` only. No glass/glow classes used.
* No webfont change (keep `Outfit` to avoid new dependencies), neutral system
  fallback stack acceptable.

## 4. Content mapping (§3 approved)

Per §2 above. `knowsAbout` JSON-LD list synced to the 3 new skill groups.
`sitemap.xml` `lastmod` bumped for `/portfolio.html` on ship day.
`translations.js` + the 3 existing `data-i18n` hooks kept as-is (English default).

## 5. JS / behavior (§4 approved)

* Keep `translations.js` + `script.js` linked: smooth scroll, IntersectionObserver
  reveal, mobile menu, form validation, `openModal`/`closeModal` all untouched.
  Cursor-glow code no-ops safely once its elements are removed from the HTML.
  `togglePrinciple` becomes unused (Playbook removed) — left in place, no deletion.
* No `window.onclick` changes. No i18n key additions.

## 6. Visuals

* Hero: `hero-photo.jpg` (pending owner upload), `filter: grayscale(1)`.
* Project cards: reuse `dashboard.png`, `grafana_real.png`, `kibana_real.png`,
  `firebase_real.png` as clean card/modal images. No new image deps.
* `personal.jpg` stays where it is (perspective section removed).

## 7. SEO / analytics preservation

* Keep `gtag.js G-TE4EZV6NZH`, canonical
  `https://www.menguhan.com/portfolio.html`, `ProfilePage` JSON-LD, favicons,
  manifest. `success.html` redirect unchanged. Security headers untouched.

## 8. Testing & rollout (§4 approved)

1. Local: `python -m http.server 8000`, exercise nav/smooth-scroll/modals/
   mobile-menu, all 4 form validation states, `390/768/1280px`, Chrome+Safari,
   zero console errors. Screenshots shown to owner BEFORE any push.
2. Commit to `dev`, Vercel preview QA per `DEVELOPMENT_WORKFLOW.md` checklist.
3. Merge `dev → main` only after release gate (green preview + QA + no P0/P1 +
   rollback target identified). No `test` branch exists — `dev` is the preview
   branch (repo has `main` + `origin/dev`).

## 9. Open items

* `hero-photo.jpg` missing from repo — owner uploads to repo root before build.
* "View resume" points to LinkedIn until a resume PDF is added to the repo.
* Landing (`index.html`) restyle explicitly deferred.

## 10. Files touched (planned)

* `portfolio.html` (rewrite), `portfolio-light.css` (new), `sitemap.xml`
  (`lastmod`), `script.js` (none planned), `style.css` (none), all other pages (none).

## Spec self-review

* Placeholders: `hero-photo.jpg` is the single external dependency, flagged in §9.
* Consistency: light theme isolated to one page (§3) matches "portfolio only" scope;
  modal retention (§2) matches untouched-JS constraint (§5).
* Scope: single page + one new CSS file — fits one implementation plan.
* Ambiguity: resume target (LinkedIn fallback) and preview branch (`dev`) decided.
