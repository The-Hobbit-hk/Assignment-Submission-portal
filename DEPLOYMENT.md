# Production Deployment — Vercel + Supabase

Deploy the Rotaract District 3131 ERP to **Vercel** (hosting) and **Supabase** (PostgreSQL + file storage).

---

## Architecture

| Layer | Service | Purpose |
|-------|---------|---------|
| Frontend + API | Vercel | Next.js 15 App Router, serverless functions |
| Database | Supabase Postgres | Prisma ORM, all app data |
| File uploads | Supabase Storage | Reports, event images, bluebook proofs |
| Auth | NextAuth (Credentials) | JWT sessions; users stored in Postgres |

> **Important:** Vercel has no persistent disk. Uploads **must** use Supabase Storage in production (`SUPABASE_SERVICE_ROLE_KEY`).

---

## Prerequisites

- [GitHub](https://github.com) account with this repo pushed
- [Vercel](https://vercel.com) account
- [Supabase](https://supabase.com) account (free tier works for staging)
- [Node.js](https://nodejs.org) 20+ locally for one-time DB setup

---

## Step 1 — Create Supabase Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**
2. Choose region close to users (e.g. **Mumbai / South Asia** for District 3131)
3. Set a strong database password and save it securely

### 1.1 Get connection strings

**Project Settings → Database → Connect**

Supabase may show the **direct** host as IPv6-only (`db.xxxxx.supabase.co:5432`). On most home/office networks (IPv4), use the **pooler** strings instead.

| Variable | Supabase UI option | Port | Where |
|----------|-------------------|------|--------|
| `DATABASE_URL` | **Transaction** pooler | `6543` | Vercel + local dev runtime. Add `?pgbouncer=true&connection_limit=1` |
| `DIRECT_URL` | **Session** pooler *or* Direct | `5432` | Local `npm run db:deploy` only |

**Project `xtojaphqdxdrrodskqar`:**

```env
# Vercel — Transaction pooler (replace [REGION] from Supabase Connect UI, e.g. ap-south-1)
DATABASE_URL="postgresql://postgres.xtojaphqdxdrrodskqar:YOUR_PASSWORD@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"

# Local schema push — Session pooler if direct host is "Not IPv4 compatible"
DIRECT_URL="postgresql://postgres.xtojaphqdxdrrodskqar:YOUR_PASSWORD@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres"

# Or direct (IPv6 only):
# DIRECT_URL="postgresql://postgres:YOUR_PASSWORD@db.xtojaphqdxdrrodskqar.supabase.co:5432/postgres"

NEXT_PUBLIC_SUPABASE_URL="https://xtojaphqdxdrrodskqar.supabase.co"
```

> Pooler URLs use user `postgres.xtojaphqdxdrrodskqar`. Direct URL uses user `postgres`.

### 1.2 Get API keys

**Project Settings → API**

| Variable | Value |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL (`https://xxxxx.supabase.co`) |
| `SUPABASE_SERVICE_ROLE_KEY` | `service_role` key (secret — server only) |

### 1.3 Create Storage bucket

1. Open **SQL Editor** in Supabase
2. Run the script: [`supabase/storage-setup.sql`](./supabase/storage-setup.sql)
3. Verify under **Storage** → bucket `uploads` exists and is **public**

---

## Step 2 — Apply Database Schema

From your machine (not Vercel), with `DIRECT_URL` set:

```bash
cp .env.example .env.local
# Edit .env.local with your Supabase URLs and keys

npm install
npm run db:deploy
```

This runs `prisma db push` over `DIRECT_URL` (required — the pooled URL cannot run schema migrations on Supabase).

### 2.1 Seed production data (one time)

```bash
npm run db:seed
```

Creates district admin, council logins, demo clubs, events, and reporting period.

**Change default passwords** before going live. Seed credentials are listed in `.env.example`.

---

## Step 3 — Deploy to Vercel

### 3.1 Import project

1. [vercel.com/new](https://vercel.com/new) → Import Git repository
2. Framework: **Next.js** (auto-detected)
3. Root directory: `.` (repo root)
4. Build command: `npm run vercel-build` (set in `vercel.json`)

### 3.2 Environment variables

In **Vercel → Project → Settings → Environment Variables**, add for **Production** (and Preview if needed):

| Name | Value | Sensitive |
|------|--------|-----------|
| `DATABASE_URL` | Supabase pooled URI (6543) | Yes |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` | No |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key | Yes |
| `SUPABASE_UPLOAD_BUCKET` | `uploads` | No |
| `AUTH_SECRET` | `openssl rand -base64 32` | Yes |
| `AUTH_URL` | `https://rotaractweb.vercel.app` | No |
| `AUTH_TRUST_HOST` | `true` | No |
| `NEXT_PUBLIC_APP_URL` | Same as `AUTH_URL` | No |

### 3.3 Deploy

Click **Deploy**. Vercel runs:

```
prisma generate → next build
```

Schema is **not** applied on each deploy — run `db:deploy` manually when schema changes.

### 3.4 Custom domain (optional)

**Vercel → Settings → Domains** → add e.g. `erp.rotaract3131.org`

Update:

- `AUTH_URL`
- `NEXT_PUBLIC_APP_URL`

Redeploy after changing env vars.

---

## Step 4 — Verify Production

| Check | How |
|-------|-----|
| App loads | Visit `https://rotaractweb.vercel.app` |
| Admin login | `admin@rotaract3131.org` / `Admin@3131` (after seed or `db:ensure-admin`) |
| Club login | `club.panvel@rotaract3131.org` / `Rotaract@3131` (after full seed) |
| Reporting | `/dashboard/reporting` |
| File upload | Admin reporting → upload resolution proof |
| Storage URL | Uploaded file URL should be `*.supabase.co/storage/...` |

---

## Ongoing Operations

### Schema updates

```bash
# Local, against Supabase DIRECT_URL
npm run db:deploy
git push   # triggers Vercel redeploy (generate + build only)
```

### Re-seed (staging only)

```bash
npm run db:seed
```

Never re-seed production without understanding it resets demo data.

### Import district council roster (safe — does not wipe data)

```bash
npm run db:import-council
```

Creates login accounts and member profiles for all **57** council office bearers (used on `/council/*` and Council Live Scores). Default password: `Rotaract@3131`.

### Import club presidents (safe — does not wipe data)

```bash
npm run db:import-presidents
```

Sets the club president on each matched club (name, email, phone, RI ID, Instagram in bio).

### Import district clubs (safe — does not wipe data)

```bash
npm run db:import-clubs
```

Upserts all **101** official District 3131 clubs (Zones 1–7) by RI club ID.

### Admin login only (safe — does not wipe data)

If login shows **Invalid email or password** but the app loads, the database usually has no users yet:

```bash
# .env.local must point DATABASE_URL at your Supabase pooler (6543)
npm run db:ensure-admin
```

This creates or resets only `admin@rotaract3131.org` with password `Admin@3131`.

### Preview deployment logins

URLs like `rotaractweb-xxxxx-….vercel.app` are **Preview** builds. In Vercel → **Environment Variables**, enable the same `DATABASE_URL`, `AUTH_SECRET`, and Supabase keys for **Preview** (not only Production), then redeploy.

### Logs

- **Vercel:** Project → Logs / Runtime Logs
- **Supabase:** Database → Logs, Storage → Logs

---

## Configuration Reference

### `vercel.json`

- `buildCommand`: `npm run vercel-build`
- `regions`: `bom1` (Mumbai) — change in `vercel.json` if needed
- `maxDuration`: 60s for API routes (file uploads)

### Upload limits

| Context | Max size |
|---------|----------|
| Admin proofs / bylaws | 5 MB |
| Event minutes / images (reporting) | 2 MB |

Vercel Hobby plan has a **4.5 MB request body limit**. For 5 MB uploads, use **Vercel Pro** or lower limits in code.

### Security checklist

- [ ] Rotate `AUTH_SECRET` and DB password before production launch
- [ ] Never commit `.env.local` or expose `SUPABASE_SERVICE_ROLE_KEY` to the client
- [ ] Change all seed passwords from defaults
- [ ] Enable Supabase **database backups** (Pro plan)
- [ ] Restrict Vercel deployment to your GitHub org

---

## Troubleshooting

### `P1001` / Can't reach database

- Use **pooled** `DATABASE_URL` on Vercel (port 6543, `pgbouncer=true`)
- Use **direct** `DIRECT_URL` only for local `db:push`

### Upload fails on Vercel

- Confirm `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set
- Run `supabase/storage-setup.sql`
- Check Storage bucket `uploads` is public

### NextAuth redirect loops / logout 404

- `AUTH_URL` and `NEXT_PUBLIC_APP_URL` must match the **actual** Vercel deployment URL (Vercel → Project → **Domains**). Production is currently **`https://rotaractweb.vercel.app`**. If you delete a Vercel project, its `*.vercel.app` URL stops working (`DEPLOYMENT_NOT_FOUND`) — use the surviving project’s domain only.
- Set `AUTH_TRUST_HOST=true`
- No trailing slash on `AUTH_URL`

### Prisma errors after deploy

- Run `npm run db:deploy` locally against Supabase
- Redeploy Vercel

### Build fails on Prisma generate

- Ensure `postinstall`: `prisma generate` in `package.json` (already configured)

---

## Quick Command Reference

```bash
# Local development (Prisma local Postgres)
npm run db:dev
npm run db:push
npm run db:seed
npm run dev

# Supabase production DB setup (one time)
npm run db:deploy
npm run db:seed

# Production build (same as Vercel)
npm run vercel-build
```

---

## Cost estimate (starter)

| Service | Free tier | Notes |
|---------|-----------|-------|
| Vercel Hobby | Free | Custom domain, 4.5MB body limit |
| Supabase Free | 500 MB DB, 1 GB storage | Sufficient for pilot |

Upgrade when traffic or storage grows.
