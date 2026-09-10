<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **meng-portfolio** (68 symbols, 281 relationships, 2 execution flows).

> Index stale? Run `node .gitnexus/run.cjs analyze --index-only` from the project root — it auto-selects an available runner. No `.gitnexus/run.cjs` yet? Bootstrap with `npx`, `bunx`, or `pnpm dlx` — e.g. `bunx gitnexus@latest analyze` (npm 11 npx crash; #1939).

## Always Do

- **MUST run impact before editing.** Use `impact({target: "symbolName", direction: "upstream"})` or `node .gitnexus/run.cjs impact "symbolName" --direction upstream --repo .`; report callers, processes, and risk. Never substitute grep for graph analysis.
- **MUST analyze graph changes before committing.** Use `detect_changes({scope: "all"})` (MCP) or `node .gitnexus/run.cjs detect-changes --scope all --repo .` (CLI fallback). `partial: true` or `truncated: true` is not a clean check — a zero means unseen, not unaffected; re-run it. For regression review: `detect_changes({scope: "compare", base_ref: "main"})` or `node .gitnexus/run.cjs detect-changes --scope compare --base-ref "main" --repo .`.
- MUST warn on HIGH/CRITICAL `risk` pre-edit; never use `riskSharedAxes` to waive a HIGH/CRITICAL `risk` warning. Compare File/symbol: MCP File omits axes; Graph-RAG expands File.
- **MUST treat `risk: UNKNOWN` as unresolved, not as low.** An empty caller set is not evidence the symbol is unused — it can also mean the callers are not resolvable by the index (plain-object property access, dynamic dispatch, cross-language calls). `impact` pairs `UNKNOWN` with a `riskNote` saying so. Confirm with a text search before treating the symbol as safe to change or delete; do not proceed on the strength of a zero.
- **MUST use `query({search_query: "concept"})` for concepts/flows, `context({name: "symbolName"})` for a named symbol, or `impact` for blast radius, on read-only callers, dependencies, imports, or execution flow.** Graph first; text search only for empty/`UNKNOWN`/literals.
- For security review, `explain({target: "fileOrSymbol"})` lists taint findings (source→sink flows; needs `analyze --pdg`).

## Never Do

- NEVER edit a function, class, or method before MCP/CLI impact analysis.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis, and never read `UNKNOWN` as an all-clear — it means the walk could not answer, which is the one verdict that requires confirming by other means.
- NEVER rename symbols with find-and-replace — use `rename` which understands the call graph.
- NEVER commit before MCP/CLI graph change analysis.

## Resources

| Resource | Use for |
| --- | --- |
| `gitnexus://repo/meng-portfolio/context` | Codebase overview, check index freshness |
| `gitnexus://repo/meng-portfolio/clusters` | All functional areas |
| `gitnexus://repo/meng-portfolio/processes` | All execution flows |
| `gitnexus://repo/meng-portfolio/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
| --- | --- |
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->

# meng-portfolio — Agent Guide

Static personal-portfolio site for **Menguhan Bulut, Senior Technical Product
Manager**. No framework, no bundler, no dependencies, no
backend. Plain HTML + one CSS file + two JS files, deployed as static files.
Live: `https://www.menguhan.com` (primary), `https://menguhan.com` redirects
to `www`. GitNexus index: `meng-portfolio` (14 files, 68 symbols, 281 edges,
2 flows — both are the i18n init path in `script.js`).

## File map

| File | Lines | Role |
| --- | --- | --- |
| `index.html` | 139 | Split-screen landing. Left → `personal.html`, right → `portfolio.html`. Hidden SEO `h1`, inline cursor-glow script only. Does NOT load `script.js`/`translations.js`. |
| `portfolio.html` | 572 | Main business page. Only page that loads `translations.js` + `script.js` (cache-busted `?v=20260221-map6`). Sections below. |
| `personal.html` | 946 | "Living Atmosphere" — fully standalone (inline `<style>` + inline `<script>`, CSS vars `--adaptive-*`). Loads NO local CSS/JS. Weather-adaptive experiment. |
| `success.html` | 72 | `noindex` form-success page (`Web3Forms redirect`). Loads `style.css`. |
| `adaptive-demo.html` | 643 | Standalone demo/prototype, no local assets. |
| `style.css` | 1512 | Single shared stylesheet (`Outfit` font, dark-green theme `--bg-color: #022c22`, `.glass`, `.cursor-glow`, `.background-glow`, `.hidden`/`show` reveal, modals, responsive). |
| `script.js` | 389 | All shared JS: i18n + cursor glow + scroll reveal + smooth scroll + modals + principle cards + mobile menu + contact validation. Runs on `DOMContentLoaded`. |
| `translations.js` | 373 | Global `const translations` dict. Comment says `en/ru/ja`, but shape is `{ section: { key: { ru, ja } } }` — English lives in the HTML, `ru`/`ja` here. Top keys: `nav, hero, about, skills, perspective, contact, modals, footer` (+ legacy `en/ru/ja` tail). Mostly UNUSED (see i18n note). |
| `vercel.json` / `netlify.toml` | — | Same 6 security headers both hosts: `X-Frame-Options: DENY`, `X-XSS-Protection`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `HSTS preload`, `Permissions-Policy: geolocation=(), microphone=(), camera=()`. `netlify.toml` also sets `publish = "."`. |
| `sitemap.xml` / `robots.txt` / `site.webmanifest` | — | Sitemap lists `/`, `/portfolio.html`, `/personal.html` (`lastmod 2026-02-21`). Manifest: `Menguhan Bulut Portfolio`, black theme. Favicons + `personal.jpg`/PNGs at root. |
| `DEVELOPMENT_WORKFLOW.md` | 217 | Branch/QA/release process (summarized below). Read it before shipping. |

## `portfolio.html` sections (all content lives here)

`#mainNav` nav → `#hero` (headline + stats) → `#playbook` (6 principle cards,
each opens `#modal-principle-N`) → `#skills` ("Technical Arsenal" branded
clickable cards) → `#projects` (case-study cards opening `#modal-modanisa`,
`#modal-mobile`, `#modal-viz`, `#modal-grafana`, `#modal-kibana`) →
`#perspective` → `#contact` (Web3Forms form) → footer. Non-hero sections use
`.hidden` + IntersectionObserver reveal (`.show`). principle cards allow ONE
`.expanded` at a time (`togglePrinciple`, `script.js:282`).

## JS behavior (`script.js`, all inside one `DOMContentLoaded` closure)

1. **i18n** (`initLanguage → setLanguage → applyTranslations → getTranslation`,
   `updateActiveLanguageOption`): reads `localStorage 'portfolioLanguage'`
   (default `'en'`), sets `documentElement.lang`, swaps `[data-i18n]` innerHTML
   and `[data-i18n-placeholder]` via dotted keys (`hero.title`) into
   `translations`. English = restore `dataset.originalText`. Exposes
   `window.setLanguage` / `window.toggleLanguageDropdown`.
2. **Cursor/background glow** (`:169`): `.cursor-glow` follows mouse;
   `.background-glow` parallaxes ±20px.
3. **Scroll reveal** (`:189`): `.hidden` → `.show` at 10% visibility (never
   unobserves — re-hides on scroll-out since CSS drives it).
4. **Smooth anchor scroll + active nav** (`:208`): header-height offset;
   `#mainNav a[href^="#"]` tracked at 45% threshold.
5. **Modals** (`:256`): global `openModal(id)`/`closeModal(id)` (`display:flex`,
   body overflow lock); outside-click close via `window.onclick` (overwrites —
   don't add a second `window.onclick`).
6. **Mobile menu** (`:302`): `toggleMobileMenu()` toggles `#mainNav.active` +
   `.mobile-menu-btn.active`; any nav-link click closes it.
7. **Contact validation** (`:325`): name ≥ 2 words, `/^[^\s@]+@[^\s@]+\.[^\s@]+$`
   email, message ≥ 35 chars → enables `#submitBtn` (`.disabled`); invalid
   submit shows `#formTooltip` text for 3s. Ends with
   `console.log("Menguhan's Portfolio Loaded and Ready")`.

## i18n — IMPORTANT: currently mostly disconnected

* Only **3** `data-i18n` hooks remain (`nav.contact`, `hero.title`,
  `hero.titleSpan`, all in `portfolio.html`). No `#langSelector`,
  `#currentLang`, or `.lang-option` element exists in any HTML — the selector
  UI was removed (commit `df7923f "language selector is lame anymore"`), so
  `initLanguage()` still runs on `portfolio.html` but only affects those 3
  nodes; `updateActiveLanguageOption()` is a no-op. `index.html`,
  `personal.html`, `success.html` have zero i18n hooks.
* `translations.js` (~373 lines of `ru`/`ja`) is therefore ~95% dead code.
  Do NOT delete it (restoring the selector only needs UI + keys), but do NOT
  assume adding a key there displays anything — you must also add the
  `data-i18n="section.key"` attribute in HTML with the English default inline.
* Convention when extending: English default inline in HTML + `ru`/`ja` at
  `translations.section.key`; nested lookup only (`getTranslation`,
  `script.js:136`); missing key = keep current content, missing
  `translations` global = `console.warn` + null.

## Contact form (`portfolio.html` `#contact`)

Posts to `https://api.web3forms.com/submit` with hardcoded `access_key`
`1860d79d-…`, `subject "New Portfolio Contact!"`,
`redirect https://www.menguhan.com/success.html`. Fields: `name` (placeholder
`Name Lastname`), `email`, `company` (optional), `linkedin` (optional),
`message` (≥35 chars enforced in JS). Validation is JS-only (no backend);
keep tooltip/message strings in sync if you reword them.

## SEO / analytics per page

* `index.html` + `personal.html` + `success.html`: GTM `GTM-P4C7N3BT` (+ noscript).
  `portfolio.html`: `gtag.js` `G-TE4EZV6NZH` instead — don't "unify" without owner OK.
* JSON-LD: `index.html` = `Person`, `portfolio.html` = `ProfilePage` (+
  `knowsAbout` skills list — keep in sync with `#skills` cards),
  `personal.html` = `WebApplication`. Canonicals are absolute
  `https://www.menguhan.com/...`; `success.html` is `noindex,nofollow,noarchive`.
* Favicons/manifest referenced on every page except `personal.html` uses same
  set; `theme-color #000000`.

## Workflow (from `DEVELOPMENT_WORKFLOW.md`)

* Branches: `main` = prod (auto-deploys `menguhan.com`), `dev` = preview
  (`meng-portfolio-dev.vercel.app` + per-commit URLs). Feature branches
  optional. Never push experiments straight to `main`.
* Local check: `python -m http.server 8000` (+ `curl -I
  http://localhost:8000/{robots.txt,sitemap.xml}`). Hard-refresh (Cmd+Shift+R)
  to beat cache; Vercel preview takes ~30–60s.
* QA before `dev→main`: correct preview URL, zero console errors, nav/hero/
  images/animations, responsive `390/768/1280px`, Chrome+Safari smoke,
  SEO tags + `sitemap.xml`/`robots.txt` + headers, no regressions on the other
  pages. Release gate: `dev` green + QA passed + no P0/P1 + scope verified +
  rollback target (previous Vercel deployment) identified. Rollback = Vercel
  Dashboard → Deployments → `...` → Promote to Production.
* Commit style: imperative, specific (`Add …`, `Fix: …`, `Update: …`).

## Rules for AI agents

* No build step — edit files in place and reload. No `npm`/bundler.
* Bump the `?v=` cache-buster on `style.css`/`script.js`/`translations.js`
  links when you change those files (current `20260221-map6`).
* `personal.html` and `adaptive-demo.html` are standalone — changes to
  `style.css`/`script.js` do NOT affect them; edit their inline blocks directly.
* Keep `ru`/`ja` entries paired whenever you touch `translations.js`; keep
  `sitemap.xml` `lastmod` + JSON-LD `knowsAbout` + visible `#skills` cards in
  sync with content changes.
* There are no tests. Verify by serving locally and exercising: all pages
  load, nav/smooth-scroll/modals/principle-cards/mobile-menu, form validation
  states (bad name / bad email / short message / valid), and the 3 translated
  strings under `localStorage portfolioLanguage = ru|ja` (selector UI absent,
  so set via console + `setLanguage('ru')`).
* GitNexus is indexed — run `impact({target, direction:"upstream"})` before
  touching `script.js` functions and `detect_changes({scope:"all"})` before
  committing; treat `UNKNOWN` risk as unresolved, not safe.
