# Production backups (local)

Periodic local backups of the **production** Supabase database and Storage buckets,
so data can be recovered if something is lost/corrupted on prod.

> ⚠️ Backups contain **PII and credential hashes**. They are written to `backups/`
> which is git-ignored. Keep them on an encrypted disk and never commit or share them.

## What gets backed up

Into `backups/db/<timestamp>/` and `backups/storage/<timestamp>/`:

- **Database**
  - `public.sql` (or `schema.sql` + `data.sql`) — real SQL dump, when `pg_dump` or the
    Supabase CLI is available. Best for a full restore.
  - `data.json` — Prisma export of every table. Always written as a guaranteed fallback.
- **Storage** — every file in the `uploads` (public) and `event-registrations` (private) buckets.

## Prerequisites

In `.env.local` (already present, plus one addition):

- `DIRECT_URL` — direct Postgres connection (port 5432). Used for SQL dumps. ✅ present
- `DATABASE_URL` — pooled connection. ✅ present
- `SUPABASE_SERVICE_ROLE_KEY` — **add this** (Supabase → Project Settings → API → service_role key).
  Required for the storage backup. The DB backup works without it.

Optional, for the highest-fidelity SQL dump (recommended):

- Install **PostgreSQL client tools** (`pg_dump`) — https://www.postgresql.org/download/windows/
  (add the `bin` folder to PATH), **or** the **Supabase CLI** — https://supabase.com/docs/guides/cli
- Without either, the JSON export still captures all table data.

## Run a backup

```powershell
npm run backup            # database + storage + prune old backups
npm run backup:db         # database only
npm run backup:storage    # storage only
```

Retention: keeps the most recent `BACKUP_RETENTION` backups (default **14**). Override:

```powershell
$env:BACKUP_RETENTION = "30"; npm run backup
```

## Automate (daily, Windows Task Scheduler)

```powershell
powershell -ExecutionPolicy Bypass -File scripts/setup-backup-task.ps1            # daily 02:00
powershell -ExecutionPolicy Bypass -File scripts/setup-backup-task.ps1 -Time "23:30"
```

Manage the task:

```powershell
Start-ScheduledTask -TaskName "Rac3131 DB Backup"                       # run now
Unregister-ScheduledTask -TaskName "Rac3131 DB Backup" -Confirm:$false  # remove
```

## Restore

### Database — from SQL dump (preferred)

Restore into a **fresh / staging** database first and verify before touching prod.

```powershell
# public.sql (pg_dump plain SQL)
psql "<TARGET_DIRECT_URL>" -f backups/db/<timestamp>/public.sql

# Supabase CLI dump (schema then data)
psql "<TARGET_DIRECT_URL>" -f backups/db/<timestamp>/schema.sql
psql "<TARGET_DIRECT_URL>" -f backups/db/<timestamp>/data.sql
```

### Database — from JSON export (fallback)

`data.json` is `{ "ModelName": [ ...rows ] }`. Re-import with a small script that
`upsert`s per model in FK-safe order (parents before children). Use this only when no
SQL dump exists; SQL restore is strongly preferred for referential integrity.

### Storage

Re-upload the mirrored files back into their buckets, e.g. with a script using
`@supabase/supabase-js` `storage.from(bucket).upload(objectPath, file, { upsert: true })`
pointing at `backups/storage/<timestamp>/<bucket>/...`.

## Also recommended

Enable Supabase's own **daily backups / PITR** (Pro plan) as a second line of defense.
The local copy here is your offline safety net.
