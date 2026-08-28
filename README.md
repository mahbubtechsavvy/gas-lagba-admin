# gas-lagba-admin

Next.js (App Router, TypeScript) administration panel for the Gas Lagba platform, deployed on Vercel (region `sin1`). It is a pure client of `gas-lagba-api`: sign-in uses the API's email-OTP endpoints, the session is an HttpOnly cookie pair, and every data call is made server-side with the admin's bearer token. No Supabase SDK, no database access, no secrets in the browser.

Documentation lives in the API repository: `gas-lagba-api/docs/03-admin/ADMIN.md`.

## Develop

```bash
pnpm install
cp .env.example .env.local     # API_BASE_URL=http://localhost:3000
pnpm dev                       # http://localhost:3001 (set PORT) or 3000 if the API is elsewhere
pnpm verify                    # lint + typecheck + vitest + build
```

Sign in with an admin email created by `pnpm admin:bootstrap` in the API repo. With `AUTH_IDENTITY_PROVIDER=fake` in the API, the one-time code is deterministic (see the API's `docs/02-backend/DEVELOPMENT.md`).

## Deploy

Vercel Git integration; environment variables per environment: `API_BASE_URL`, `SESSION_COOKIE_PREFIX`. Region is pinned to Singapore in `vercel.json`.
