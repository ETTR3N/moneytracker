# Money Tracker

A personal money & subscriptions tracker: manage accounts across currencies, log
transactions, track recurring subscriptions, and see net worth / spending trends
on a dashboard. Password-protected, built with Next.js + Prisma + PostgreSQL.

## Features

- Add/delete/edit accounts, each with its own currency and starting balance
- Log income/expense transactions per account
- Track subscriptions (weekly/monthly/yearly) with a "Mark paid" action that
  logs a transaction and advances the next billing date
- Dashboard: total net worth, monthly spending trend, net worth trend, and
  monthly subscription cost — all converted into one display currency you
  choose in Settings
- Currency conversion via [frankfurter.app](https://frankfurter.app) (free,
  no API key), cached for 6 hours
- Single shared password gate (no user accounts) for personal deployments

## Local development

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local` and fill in the values:

   ```bash
   cp .env.example .env.local
   ```

   - `DATABASE_URL` — a PostgreSQL connection string. The free tier of
     [Neon](https://neon.tech) or [Supabase](https://supabase.com) both work
     well and take a couple of minutes to set up.
   - `APP_PASSWORD` — the password you'll use to log in.
   - `SESSION_SECRET` — a random string used to sign the login session.
     Generate one with `openssl rand -base64 32`.

3. Create the database tables:

   ```bash
   npx prisma migrate dev --name init
   ```

4. Start the dev server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) and log in with your
   `APP_PASSWORD`.

## Deploying to Vercel

1. Push this project to a GitHub repository.
2. Create a free PostgreSQL database (e.g. on [Neon](https://neon.tech)) and
   copy its connection string.
3. In [Vercel](https://vercel.com), import the repository as a new project.
4. Add the same three environment variables from `.env.example`
   (`DATABASE_URL`, `APP_PASSWORD`, `SESSION_SECRET`) in the Vercel project's
   Settings → Environment Variables.
5. Deploy. Vercel runs `npm install` (which also runs `prisma generate` via
   the `postinstall` script) and then `npm run build` automatically.
6. Once deployed, run the initial migration against your production database
   one time from your machine (with `DATABASE_URL` pointed at the production
   database, e.g. by temporarily using the production value in `.env.local`):

   ```bash
   npx prisma migrate deploy
   ```

   After that, any future schema changes just need a new
   `npx prisma migrate dev --name <change>` locally, committed, then
   `npx prisma migrate deploy` against production after deploying.

Visit your `*.vercel.app` URL, log in with your password, and start adding
accounts.

## Notes

- All amounts are stored in integer minor units (cents) to avoid
  floating-point rounding issues.
- The net worth trend chart uses **current** exchange rates applied
  retroactively to past transactions — it's a simplification meant for a
  personal-use trend line, not historically-accurate accounting.
- This app is meant for single-user personal use behind one shared password;
  it does not support multiple user accounts.
