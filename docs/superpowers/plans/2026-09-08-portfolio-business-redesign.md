# Portfolio Business Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `portfolio.html` in a plain light minimal style with CV content, isolated from other pages.

**Architecture:** New `portfolio-light.css` linked only from `portfolio.html`; `style.css` and `script.js` untouched. Hero photo wired as `hero-photo.jpg` with `personal.jpg` fallback until the owner uploads the file.

**Tech Stack:** Plain HTML + CSS, Web3Forms contact form, `python -m http.server` local preview on port 8080 (8000 = SurrealDB on this box).

**Spec:** `docs/superpowers/specs/2026-09-08-portfolio-business-redesign-design.md`

## Global Constraints

- Scope is `portfolio.html` (+ new CSS) ONLY — `index.html`, `personal.html`, `success.html`, `adaptive-demo.html`, `style.css`, `script.js`, `translations.js` are NOT modified.
- Work on `dev` branch; `main` only via `dev → main` merge after QA gate.
- Local preview is `http://localhost:8080/` (never 8000).
- No `hero-photo.jpg` in repo yet — hero `<img>` MUST carry `onerror` fallback to `personal.jpg`.
- Keep `gtag G-TE4EZV6NZH`, canonical, Web3Forms `access_key`, `success.html` redirect.
- GitNexus: `script.js` untouched so no `impact` call needed; run `detect_changes({scope:"all"})` before each commit.

---

### Task 1: Setup on dev branch

**Files:**
- Modify: none (git state only)

**Interfaces:**
- Consumes: nothing
- Produces: clean `dev` working tree

- [ ] **Step 1: Checkout dev and verify clean state**

```bash
git checkout dev
git pull origin dev
git status --short
```

Expected: empty output (clean) on branch `dev`.

- [ ] **Step 2: Confirm photo fallback source exists**

```bash
ls personal.jpg dashboard.png grafana_real.png kibana_real.png firebase_real.png
```

Expected: all 5 files listed (hero fallback + project visuals available).

### Task 2: Create portfolio-light.css

**Files:**
- Create: `portfolio-light.css`
- Test: `http://localhost:8080/portfolio-light.css` (after Task 4 links it; standalone check via `python3 -c` file parse)

**Interfaces:**
- Consumes: nothing
- Produces: light theme classes used by Task 3–4 markup (`.pl-header`, `.pl-hero`, `.pl-photo`, `.pl-section`, `.pl-timeline`, `.pl-cards`, `.pl-card`, `.pl-chips`, `.pl-contact`, `.pl-footer`, `.pl-modal`)

- [ ] **Step 1: Write the stylesheet**

```css
/* portfolio-light.css — light minimal theme, portfolio.html only */
:root {
  --pl-bg: #ffffff;
  --pl-text: #111111;
  --pl-muted: #555555;
  --pl-line: #e5e5e5;
  --pl-accent: #0a66c2;
  --pl-card: #f7f7f7;
}
body.pl { background: var(--pl-bg); color: var(--pl-text); font-family: 'Outfit', system-ui, -apple-system, sans-serif; margin: 0; }
body.pl a { color: var(--pl-accent); }
.pl-wrap { max-width: 880px; margin: 0 auto; padding: 0 24px; }
.pl-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 0; border-bottom: 1px solid var(--pl-line); }
.pl-header nav a { margin-left: 20px; text-decoration: none; color: var(--pl-text); }
.pl-hero { display: flex; gap: 32px; padding: 56px 0 40px; align-items: center; flex-wrap: wrap; }
.pl-photo { width: 220px; height: 220px; object-fit: cover; border-radius: 50%; filter: grayscale(1); }
.pl-hero h1 { font-size: 2.4rem; margin: 0 0 4px; }
.pl-role { color: var(--pl-muted); font-size: 1.1rem; margin: 0 0 16px; }
.pl-stats { display: flex; gap: 32px; margin-top: 24px; }
.pl-stats b { display: block; font-size: 1.4rem; }
.pl-stats span { color: var(--pl-muted); font-size: 0.9rem; }
.pl-section { padding: 32px 0; border-top: 1px solid var(--pl-line); }
.pl-section h2 { font-size: 1.5rem; margin: 0 0 16px; }
.pl-timeline li { margin-bottom: 16px; }
.pl-timeline .pl-dates { color: var(--pl-muted); font-size: 0.9rem; }
.pl-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.pl-card { background: var(--pl-card); border: 1px solid var(--pl-line); border-radius: 8px; padding: 16px; cursor: pointer; }
.pl-card img { width: 100%; border-radius: 4px; }
.pl-chips { list-style: none; padding: 0; display: flex; flex-wrap: wrap; gap: 8px; }
.pl-chips li { border: 1px solid var(--pl-line); border-radius: 999px; padding: 4px 12px; font-size: 0.9rem; }
.pl-contact input, .pl-contact textarea { width: 100%; padding: 10px; margin: 6px 0 12px; border: 1px solid var(--pl-line); border-radius: 6px; font: inherit; }
.pl-footer { border-top: 1px solid var(--pl-line); padding: 20px 0 40px; color: var(--pl-muted); font-size: 0.9rem; }
.pl-modal { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); align-items: center; justify-content: center; }
.pl-modal .pl-modal-box { background: #fff; max-width: 640px; width: 90%; border-radius: 8px; padding: 24px; }
.pl-modal .pl-modal-box img { width: 100%; border-radius: 4px; }
@media (max-width: 640px) { .pl-hero { flex-direction: column; align-items: flex-start; } .pl-cards { grid-template-columns: 1fr; } }
```

- [ ] **Step 2: Verify CSS file parses (balanced braces)**

```bash
python3 -c "s=open('portfolio-light.css').read(); assert s.count('{')==s.count('}'), 'unbalanced'; print('braces OK')"
```

Expected: `braces OK`.

### Task 3: Rewrite portfolio.html head + header + hero + experience

**Files:**
- Modify: `portfolio.html` (head block, header nav, `#hero`, new `#experience`)
- Test: `curl -s http://localhost:8080/portfolio.html`

**Interfaces:**
- Consumes: Task 2 classes
- Produces: page top half; Task 4 appends the rest

- [ ] **Step 1: Replace head links (light CSS, white theme-color, keep gtag/SEO)**

Replace `<link rel="stylesheet" href="style.css?v=20260221-map6">` with:

```html
<link rel="stylesheet" href="portfolio-light.css">
```

Replace `<meta name="theme-color" content="#000000">` with:

```html
<meta name="theme-color" content="#ffffff">
```

Keep the `gtag.js G-TE4EZV6NZH` block, canonical, JSON-LD untouched.

- [ ] **Step 2: Replace body with light layout (header, hero, experience)**

Requirements: `<body class="pl">`; delete `.background-glow` + `.cursor-glow` divs;
header logo + nav (`#mainNav` id kept for `script.js`) with About/Projects/Contact links;
hero with photo fallback; experience timeline from CV:

```html
<body class="pl">
<header class="pl-wrap pl-header">
  <a href="index.html">MENGUHAN</a>
  <nav id="mainNav">
    <a href="#about">About</a>
    <a href="#projects">Projects</a>
    <a href="#contact">Contact</a>
  </nav>
</header>
<main class="pl-wrap">
<section id="about" class="pl-hero">
  <img class="pl-photo" src="hero-photo.jpg" onerror="this.onerror=null;this.src='personal.jpg'" alt="Menguhan Bulut">
  <div>
    <h1>Menguhan Bulut</h1>
    <p class="pl-role">Lead Product Owner — AI &amp; E-Commerce Innovation</p>
    <p>Results-driven Lead Product Owner with 8+ years leading cross-functional teams across e-commerce, logistics, and enterprise platforms — turning AI/ML recommendations, personalization, and analytics into revenue, conversion, and engagement growth.</p>
    <p><a href="https://www.linkedin.com/in/menguhan-bulut/">View resume (LinkedIn)</a></p>
    <div class="pl-stats">
      <div><b>8+</b><span>Years Experience</span></div>
      <div><b>+12%</b><span>Add-to-Cart Rate</span></div>
      <div><b>+15%</b><span>Revenue Lift</span></div>
    </div>
  </div>
</section>
<section id="experience" class="pl-section">
  <h2>Experience</h2>
  <ul class="pl-timeline">
    <li><b>Product Owner / Product Manager — Modanisa, Istanbul</b> <span class="pl-dates">Mar 2021 – Aug 2025</span><br>Real-time cart-aware dynamic pricing engine; Similar Products recommendations + AI Search (+12% add-to-cart, +15% revenue); LLM-assisted delivery; mobile releases (Play/App Store/Huawei) with BigQuery analytics.</li>
    <li><b>Product Owner — kartelam.com, Istanbul</b> <span class="pl-dates">Nov 2020 – Mar 2021</span><br>B2B e-commerce platform delivery with streamlined stakeholder communication.</li>
    <li><b>Product Owner — Postmates, Philadelphia PA</b> <span class="pl-dates">Jun 2019 – May 2020</span><br>Driver pickup routing with physical constraints; owned delivery-experience backlog.</li>
    <li><b>Product Owner — MDC Modern Design Center, Cherry Hill NJ</b> <span class="pl-dates">Apr 2017 – Feb 2019</span><br>Agile/Lean stakeholder frameworks aligning client requirements with delivery.</li>
  </ul>
</section>
```

- [ ] **Step 3: Verify head + hero served locally**

```bash
curl -s http://localhost:8080/portfolio.html | grep -c 'portfolio-light.css\|pl-hero\|hero-photo.jpg'
```

Expected: `3` (stylesheet link, hero class, photo ref present).

### Task 4: Projects + skills + contact + footer, remove old sections

**Files:**
- Modify: `portfolio.html` (append sections, delete `#playbook`, `#skills` arsenal wall, `#perspective`, `#modal-principle-N`, glow divs already removed in Task 3)
- Keep: `#modal-modanisa`, `#modal-mobile`, `#modal-viz`, `#modal-grafana` shells, `#contact` Web3Forms form (same action/access_key/redirect), `translations.js` + `script.js` script tags, the 3 `data-i18n` attributes
- Test: `curl` + `grep` checks below

**Interfaces:**
- Consumes: Task 3 page skeleton
- Produces: complete page

- [ ] **Step 1: Add projects, skills, contact, footer; delete old blocks**

```html
<section id="projects" class="pl-section">
  <h2>Projects</h2>
  <div class="pl-cards">
    <article class="pl-card" onclick="openModal('modal-modanisa')"><h3>Dynamic Pricing Engine</h3><p>Cart-aware real-time pricing and badges on listing pages.</p></article>
    <article class="pl-card" onclick="openModal('modal-mobile')"><h3>Similar Products Recommendations</h3><p>+12% add-to-cart, +15% revenue via AI recommendations.</p></article>
    <article class="pl-card" onclick="openModal('modal-viz')"><h3>AI Search + Operational Visibility</h3><p>Enhanced AI search backed by Grafana/Kibana monitoring.</p></article>
    <article class="pl-card" onclick="openModal('modal-grafana')"><h3>Mobile Release Lifecycle</h3><p>Play / App Store / Huawei releases refined with BigQuery analytics.</p></article>
  </div>
</section>
<section id="skills" class="pl-section">
  <h2>Skills</h2>
  <h3>Product &amp; Leadership</h3>
  <ul class="pl-chips"><li>Product Strategy</li><li>Roadmaps</li><li>Agile (Scrum, Kanban)</li><li>Backlog Prioritization</li><li>User Stories</li><li>Stakeholder Management</li></ul>
  <h3>AI &amp; Data</h3>
  <ul class="pl-chips"><li>AI Search</li><li>Recommendation Engines</li><li>Personalization</li><li>BigQuery</li><li>Google Analytics</li><li>Qlik Sense</li><li>Grafana</li><li>Kibana</li></ul>
  <h3>Tools &amp; Technical</h3>
  <ul class="pl-chips"><li>JIRA</li><li>Confluence</li><li>Figma</li><li>GitLab CI/CD</li><li>Firebase</li><li>MySQL</li><li>MongoDB</li><li>Couchbase</li></ul>
  <p>Languages: Turkish (Native) · English (Native) · Russian (Very Basic) · Italian (Beginner) · German (Beginner)</p>
</section>
```

Contact: keep the existing `#contact` Web3Forms `<form>` byte-identical (action, access_key, subject, redirect, all inputs, `#submitBtn`, `#formTooltip`); only change wrapper classes to `pl-section pl-contact`. Footer: LinkedIn link + `Copyright © 2026 Menguhan Bulut`.
Delete entirely: `#playbook` section, all 6 `#modal-principle-N` divs, `#perspective` section, `.glass`/`.hidden` classes on remaining markup (reveal observer then no-ops safely).
Restyle the 4 kept modals: `class="modal"` → `class="pl-modal"`, inner `modal-content glass` → `pl-modal-box` (keep ids + `closeModal(...)` calls so `script.js` works unchanged).

- [ ] **Step 2: Verify structure — new present, old gone**

```bash
curl -s http://localhost:8080/portfolio.html | grep -c 'pl-cards\|pl-chips\|pl-contact'; echo ---; curl -s http://localhost:8080/portfolio.html | grep -c 'modal-principle\|id="playbook"\|id="perspective"\|cursor-glow\|Technical Arsenal'
```

Expected: first count `3`, second count `0`.

- [ ] **Step 3: Verify JS hooks intact**

```bash
curl -s http://localhost:8080/portfolio.html | grep -c 'script.js\|translations.js\|mainNav\|submitBtn\|formTooltip\|api.web3forms.com'
```

Expected: `6`.

### Task 5: SEO touch-ups + sitemap

**Files:**
- Modify: `portfolio.html` (`knowsAbout` list), `sitemap.xml` (`lastmod` for `/portfolio.html`)

**Interfaces:**
- Consumes: Task 4 page
- Produces: shippable page

- [ ] **Step 1: Sync knowsAbout + bump lastmod**

In `portfolio.html` JSON-LD set `"knowsAbout": ["Product Management", "AI Search", "Recommendation Engines", "Dynamic Personalization", "Data Analytics", "BigQuery", "Agile Delivery", "E-commerce"]`. In `sitemap.xml` set the `/portfolio.html` `<lastmod>` to ship date `2026-09-08`.

- [ ] **Step 2: Verify**

```bash
curl -s http://localhost:8080/portfolio.html | grep -c 'Recommendation Engines'; grep -A2 'portfolio.html' sitemap.xml | grep lastmod
```

Expected: `1` and `<lastmod>2026-09-08</lastmod>`.

### Task 6: Verify + commit to dev

**Files:**
- Modify: none

- [ ] **Step 1: Full local check**

```bash
for p in portfolio.html portfolio-light.css robots.txt sitemap.xml; do curl -s -o /dev/null -w "$p -> %{http_code}\n" http://localhost:8080/$p; done; curl -s http://localhost:8080/portfolio.html | grep -c 'data-i18n'
```

Expected: four `200` lines; `data-i18n` count `3` (hooks preserved).

- [ ] **Step 2: Graph change check then commit**

Run `detect_changes({scope:"all"})` (must not be `partial:true`/`truncated:true`; re-run if so). Then:

```bash
git add portfolio.html portfolio-light.css sitemap.xml
git commit -m "Rebuild portfolio page in light minimal theme with CV content"
git push origin dev
```

Expected: push to `dev` succeeds; owner QAs the Vercel preview, then `dev → main` merge per `DEVELOPMENT_WORKFLOW.md`.

## Self-Review

* Spec coverage: flow §2 → Tasks 3–4; theme §3 → Task 2; content §4 → Tasks 3–4; JS §5 → Tasks 3–4 (untouched files + hook checks); visuals §6 → Tasks 2–4 (grayscale, reused PNGs, photo fallback); SEO §7 → Task 5; rollout §8 → Task 6. Open item (photo upload) handled via `onerror` fallback in Task 3.
* Placeholders: none — all code blocks are final copy; the only deferred asset degrades gracefully.
* Type consistency: class names defined once in Task 2, consumed verbatim in Tasks 3–4 (`pl-modal`/`pl-modal-box` keep modal ids so `openModal`/`closeModal` resolve).
