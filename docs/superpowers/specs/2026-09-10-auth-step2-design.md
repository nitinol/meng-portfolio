# Auth Step 2 (email) — Design Spec

Date: 2026-09-10 | Status: approved direction (own code + Atlas free)

## 1. Goal

Visitors register/login with email + password on the static site. Sessions
persist via secure cookies. Account button shows login state, initial avatar,
logout. Forgot/reset password follows once the email sender is chosen
(open: Resend vs Gmail — no email sending in this slice).

## 2. Backend (Vercel serverless, own code)

- `package.json`: `mongodb`, `bcryptjs`, `jsonwebtoken` (no framework).
- `api/_lib/db.js`: cached MongoClient from `MONGODB_URI`, db `menguhan`.
- `api/_lib/auth.js`: JSON body parse, JWT sign/verify (`JWT_SECRET`),
  `auth`/`guest` cookie helpers (HttpOnly, Secure, SameSite=Lax, 30 days).
- `POST /api/auth/register` {name, email, password≥8}: 409 if taken, bcrypt
  hash, `users` doc {name, email, passHash, createdAt}, sets cookie.
- `POST /api/auth/login` {email, password}: 401 on mismatch (same message
  for unknown email — no enumeration), sets cookie.
- `POST /api/auth/logout`: clears cookie.
- `GET /api/auth/me`: 200 {name, email} or 401.
- Validation: email format, password ≥ 8, name 1–60 chars. Errors are JSON
  `{error}` with correct status codes. No secrets in responses or logs.

## 3. Frontend (`index.html`, `news.html` — engine untouched)

Account dialog becomes three views: login / register / logged-in (name,
avatar initial, logout). Fetches same-origin API, shows inline errors,
calls `/me` on load. Logged-in avatar replaces the ○ button. No backend →
dialog falls back to "Coming soon." (fetch failure = offline/pre-deploy).

## 4. Env (owner sets, never in chat/repo)

Vercel dashboard (preview + production): `MONGODB_URI` (with password),
`JWT_SECRET` (32+ random chars), `MONGODB_DB=menguhan`. `.env*` gitignored.

## 5. Verification

`node --test` contract tests with mocked driver; `node --check` all API
files; browser QA after owner sets preview env vars (register → persist →
logout → wrong-password error). Push `dev` only.
