# Momentum — Productive Calendar

A habit tracker and productivity calendar: check off daily habits on a month
grid, plan tasks with notes, and see your progress on an interactive
dashboard. Built with Next.js, Prisma/PostgreSQL, NextAuth, Resend, and
Recharts.

**Live demo:** [productive-calender.vercel.app](https://productive-calender.vercel.app/dashboard)

## Features

- **Habit calendar** — a month grid of habits × days, click to toggle,
  right-click/double-click to attach a note to any day.
- **Tasks** — one-off to-dos with due date, priority, and a note field.
- **Dashboard** — stat cards, a weekly bar chart, a completion donut, an
  analysis table, and a top-habits leaderboard (last 5 weeks).
- **Dark / light mode** — system-aware, toggleable from the header or Settings.
- **Email notifications** — a daily reminder for unchecked habits and a
  weekly summary, sent via [Resend](https://resend.com).
- **Multi-user accounts** — email/password auth via NextAuth (Auth.js).

## Local setup

### 1. Install dependencies

```bash
npm install
```

### 2. Database

You need a PostgreSQL database. For local development:

```bash
# If you don't already have Postgres running locally:
# macOS: brew install postgresql && brew services start postgresql
# Or use Docker: docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:16

createdb productive_calendar
```

### 3. Environment variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

- `DATABASE_URL` — your Postgres connection string.
- `NEXTAUTH_SECRET` — generate with `openssl rand -base64 32`.
- `RESEND_API_KEY` — create a free account at resend.com and generate an API
  key. Without it, the app still works — emails are just skipped (logged as
  `skipped-no-resend-key`).
- `EMAIL_FROM` — must be a verified sender/domain in Resend for production use.
  The default `onboarding@resend.dev` works for testing.
- `CRON_SECRET` — any random string; used to authorize the scheduled email
  endpoints.

### 4. Apply the database schema

```bash
npx prisma migrate dev
```

### 5. Run the dev server

```bash
npm run dev
```

Visit http://localhost:3000, create an account, and start tracking.

## Deploying to Vercel

This repo deploys with **Vercel's native GitHub integration** — connect it
once and every push to the branch auto-deploys, no CLI or GitHub Actions
required.

1. Go to [vercel.com/new](https://vercel.com/new) and import this repo,
   selecting the branch you want deployed.
2. Add a Postgres database (Vercel Postgres, [Neon](https://neon.tech), or
   [Supabase](https://supabase.com) all work) and set `DATABASE_URL` in the
   Vercel project's environment variables.
3. Set `NEXTAUTH_SECRET`, `RESEND_API_KEY`, `EMAIL_FROM`, and `CRON_SECRET`
   in the same place. `NEXTAUTH_URL` can be left unset until after the first
   deploy — once Vercel assigns your `*.vercel.app` domain, set it and
   redeploy (Deployments → ⋯ → Redeploy).
4. Deploy. `vercel.json` already defines the build command
   (`prisma migrate deploy && next build`, so the schema is applied on every
   deploy) and the two cron jobs, both within Vercel Hobby's once-per-day
   cron limit:
   - `/api/cron/daily-reminders` — runs once daily at 13:00 UTC and emails
     anyone with the daily reminder enabled who still has an unchecked habit.
   - `/api/cron/weekly-summary` — runs Monday 08:00 UTC.

   **Note:** if you're on Vercel Pro, you can change the daily-reminders
   schedule to run hourly (e.g. `0 * * * *`) for closer-to-real-time
   reminders — Pro removes the once-per-day cron cap.

From then on, every `git push` to the connected branch triggers a new
deployment automatically — no further setup needed.

## Tech stack

- **Framework:** Next.js 16 (App Router, TypeScript, Tailwind CSS v4)
- **Database / ORM:** PostgreSQL + Prisma 6
- **Auth:** NextAuth (Auth.js) v5, credentials provider with hashed passwords
- **Email:** Resend
- **Charts:** Recharts
- **Animation:** Motion (Framer Motion)
- **Theming:** next-themes (class-based dark mode)
