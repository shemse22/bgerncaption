# Bgern Caption

React/Vite frontend plus an Express API for authenticated Amharic caption jobs, wallet credits, admin review, and payment verification.

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env.local` from `.env.example` and set:
   ```bash
   GEMINI_API_KEY="..."
   SESSION_SECRET="a-long-random-secret"
   ADMIN_EMAILS="thebigel16@gmail.com"
   DATABASE_URL=""
   DB_PATH="./data/bgern-db.json"
   ```

3. Run the API and frontend in separate terminals:
   ```bash
   npm run api
   npm run dev
   ```

Vite proxies `/api` to `http://localhost:8787`. If `DATABASE_URL` is set, the API runs migrations and stores users, projects, payments, notifications, ledger transactions, credits, and job status in Postgres. If `DATABASE_URL` is empty, it falls back to `DB_PATH` for local development.

## Database

The first Postgres migration creates relational tables for `users`, `projects`, `payments`, `minute_transactions`, `notifications`, `jobs`, and `system_settings`. Each table keeps queryable production columns plus a JSONB copy of the existing app model, so the current API contract stays stable while the backend moves onto real database tables.

Recommended managed Postgres options:

- Neon
- Supabase
- Railway Postgres
- Render Postgres

## Auth And Admin

Users sign in through `/api/auth/google`, which issues a signed bearer session stored by the frontend. Admin routes under `/api/admin/*` require both an admin user role and an email listed in `ADMIN_EMAILS`, so `/#/admin` data and actions are blocked for non-approved accounts.

For production Google OAuth, exchange a real Google ID token on the server before calling or replacing `/api/auth/google`. The rest of the app already expects server-issued sessions.

## Payments

Payments are submitted to `/api/payments/verify`. Chapa payments are verified automatically when `CHAPA_SECRET_KEY` is set and the reference resolves to a successful transaction with enough ETB amount. Credits are added only after automatic verification or an approved admin action.

Telebirr and CBE currently remain in pending review unless you add their provider verification credentials/API calls inside `verifyPayment` in `server.ts`.

## Deployment

Frontend:

- Deploy `npm run build` output to Vercel or Netlify.
- Set `VITE_API_URL` and `VITE_TRANSCRIPTION_API_URL` to the deployed API origin.

API and worker:

- Deploy `npm run api` to Render, Railway, or Cloud Run.
- Set `GEMINI_API_KEY`, `SESSION_SECRET`, `ADMIN_EMAILS`, `DATABASE_URL`, `DATABASE_SSL`, and `CHAPA_SECRET_KEY`.
- Put uploaded video/object storage behind the API before serving large production videos.

Verification:

```bash
npm run lint
npm run build
```
