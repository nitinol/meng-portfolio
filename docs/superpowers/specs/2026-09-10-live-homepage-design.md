# Live Homepage (Piece 1) — Design Spec

Date: 2026-09-10 | Status: approved by owner | Scope: `index.html` (rewrite) + `news.html` (new shell)

## 1. Goal

`menguhan.com/` becomes the living-atmosphere personal page directly. The old
split "SEVERANCE" landing is gone. Visitors feel the real time of day, season
and weather; text stays readable on any sky via the existing adaptive-color
system. Portfolio lives under an apps-menu button; News and Account buttons sit
beside it. No backend in this piece — composer, feed, login and real news arrive
in pieces 2–4.

## 2. Layout

- Full-viewport live sky (reuse `personal.html` engine: sky/star/temp/weather/
  haze/flash layers + particle canvas, ipapi → GPS → Bursa-default location,
  Open-Meteo refresh every 60s). Self-contained page; `personal.html` untouched.
- Top-right control cluster: [apps grid button] [account button]. Google-apps
  style 3×3 dot grid, adaptive color, 44px+ touch targets, keyboard accessible
  (`aria-haspopup`, `aria-expanded`, Escape closes, focus returns).
- Apps menu items: Portfolio (`/portfolio.html`), News (`/news.html`). Account
  button opens a small dialog: "Accounts arrive in step 2 — email/Google login."
  No dead-end navigation: every control does something visible.
- Center: name + "Living Atmosphere" subtitle + live clock/condition line
  (e.g. "Istanbul · 21° · Clear · 8:05 PM"). New SEO H1 pattern kept
  (visually-hidden H1 with name + roles; visible brand title stays).
- Identity preserved: Person JSON-LD, canonical `/`, gtag `G-TE4EZV6NZH`,
  favicons/manifest, `theme-color #000000`.

## 3. `news.html` shell (piece 4 preview)

Same weather engine + top-right cluster + adaptive text. Content: "Tech news"
heading, short note that the live Android/iOS/tech feed lands in step 4, links
back home and to portfolio. Distinct title/description/canonical, added to
sitemap with `2026-09-10`.

## 4. Non-goals (pieces 2–4)

Post composer, feed, likes/comments, image upload, registration/login sessions,
forgot password, real news content, backend/API/database, dev/prod split beyond
the existing `dev`-branch preview workflow.

## 5. Verification

`python http.server 8080`: root + news return 200 with zero console errors;
menu/account open/close via mouse, keyboard and touch; Escape works; 390/768/
1280px; reduced-motion respected (animation stills, content intact); text
contrast readable over bright and dark skies; `personal.html`/`portfolio.html`
unchanged in behavior. Push to `dev` only (Vercel preview = dev environment).
