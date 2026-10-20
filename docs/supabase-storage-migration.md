# Supabase storage migration

Assessment and runbook for moving historical Storage files onto `fgryedvsunlmgbiuqoit` without taking https://rotaractweb.vercel.app offline.

The database is already on the new project. This tool does not copy database rows again, does not change Vercel settings, and does not delete files.

## What is already true

- The site is a Next.js 15 app. Login is NextAuth, not Supabase Auth. Prisma talks to Postgres as the database owner, so table RLS is not what serves the website.
- Production and Preview `DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, and `SUPABASE_SERVICE_ROLE_KEY` point at the new project. The app storage client is `getSupabaseAdmin()` in `src/lib/supabase-server.ts`.
- Public files are stored as full `getPublicUrl()` links. There is no `createSignedUrl()` path. Private registration files, when they exist, are object paths in the `event-registrations` bucket and are downloaded on the server.
- The new database has the application tables and the previously copied rows. File columns still contain the old host `xtojaphqdxdrrodskqar`.
- The old storage API answers HTTP 402: `exceed_storage_size_quota`. Bucket lists and file bytes cannot be read from that project.
- A local mirror already exists at `backups/storage/live`. It is git-ignored. Do not delete it.

Public RLS on the new database: 22 public tables, 0 with row-level security, 0 policies. That matches the current app, which does not use the Supabase anon key. This migration does not turn RLS off or on.

Hardcoded old project strings remain only in `.env.example` and `DEPLOYMENT.md`. Runtime uploads use the environment URL.

## Dry run, 19 October 2026

Read-only. No uploads. No database updates.

| Fact | Result |
| --- | --- |
| Old storage API | Inaccessible, HTTP 402, storage quota |
| New `uploads` | Present, public, 0 objects |
| New `event-registrations` | Present, private, 0 objects |
| Local backup | 2,988 files, 1,626,808,069 bytes |
| Old public URLs in the database | 2,578 references, 2,577 unique objects |
| Those objects present in the local backup | 2,577. Missing: 0 |
| Referenced bytes | 1,472,910,551 |
| Backup files with no scanned database reference | 411 files, 153,897,518 bytes |
| External URLs left untouched | 93 (59 member avatars, 32 event banners, 2 registration links) |
| Private registration paths | 0 (`PublicEventRegistration` has 0 rows) |
| Signed or private-bucket URLs | 0 |
| Free-plan cap used by the tool | 1,000,000,000 bytes |
| Shortfall if every local file were copied | 626,808,069 bytes |

Referenced files alone are still about 473 MB over the cap. A full copy cannot succeed on this free project.

Row counts read from the new database: User 194, Club 107, Member 1,038, Event 1,118, EventGallery 170, CitationAssignment 3,232, MonthlyReport 430, CouncilBluebookReport 148, PublicEventRegistration 0.

Old public URLs by column:

| Column | References |
| --- | --- |
| Event.bannerUrl | 946 |
| Event.minutesPdfUrl | 815 |
| CitationAssignment.proofUrl | 174 |
| EventGallery.url | 170 |
| CouncilBluebookReport.proofUrls | 162 |
| MonthlyReport.districtDuesFileUrl | 87 |
| MonthlyReport.bylawsFileUrl | 62 |
| MonthlyReport.masterBudgetFileUrl | 62 |
| MonthlyReport.resolutionFileUrl | 44 |
| Member.avatar | 33 |
| Club.logo | 23 |

The manifest with object paths is `backups/migration/manifest.jsonl`. It is git-ignored and is not a website download.

## Why a website dashboard is not the control

File bytes are on this computer, not on Vercel. A serverless request cannot walk the 1.6 GB mirror or keep a multi-hour copy alive. The District Command Center stays a metrics page. Migration commands run locally, with the service role read from `.env.local` and never printed.

The website keeps using the new project. Pointing it back at the frozen project would not bring the old files back.

## Commands

Dry run:

```powershell
npm run migrate:storage:dry-run
```

Status:

```powershell
npm run migrate:storage:status
```

Approved copy of every pending file. This currently refuses before any upload because the backup does not fit:

```powershell
npm run migrate:storage:copy -- --approve
```

Partial copy, referenced files first, stopping at the free cap. This uploads real files. Database links stay on the old host until a later rewrite. Not run.

```powershell
npm run migrate:storage:copy -- --approve --within-quota
```

After a copy, checksum verification re-downloads destination objects. Size match alone is not enough to rewrite a link.

```powershell
npm run migrate:storage:verify -- --download
```

Rewrite database links only for objects whose checksum was verified. Requires the phase `files_verified` and a second approval. Unverified links are left as they are. A snapshot is written to `backups/migration/reference-snapshot.jsonl` before each committed change.

```powershell
npm run migrate:storage:rewrite -- --approve
```

Pause and resume affect the local copy loop. Pause does not delete anything.

```powershell
npm run migrate:storage:pause
npm run migrate:storage:resume
npm run migrate:storage:copy -- --approve
```

Roll back database values that this tool changed, and only if the cell still holds the migrated value. Later edits are left alone. Destination files are not deleted.

```powershell
npm run migrate:storage:rollback -- --approve
```

There is no snapshot yet, so rollback correctly has nothing to restore.

## Backup preflight, 20 October 2026

Read-only. Report file: `backups/migration/preflight-report.json`.

| Fact | Result |
| --- | --- |
| Database snapshot folders | 14, from `20261006-220011` through `20261018-110008` |
| Files inside those folders | 0. No `data.json`, `public.sql`, `schema.sql`, or `data.sql` |
| Selected database source | None. A restore from `backups/db` is refused |
| Destination database | 13,778 public rows already present. Leave them in place |
| Local `uploads` | Present. 2,988 files, 1,626,808,069 bytes |
| Local `event-registrations` | Folder absent. 0 files |
| Last sync that listed remote objects | `20261015-223133`, 2,988 objects, 0 failures, 2,988 already local |
| Later sync runs | `20261016-114434` and `20261018-110048` recorded `remoteObjects: 0` |
| Destination buckets | `uploads` public, `event-registrations` private |

The sync log records one line per run: `at`, `downloaded`, `skipped`, `failed`, `remoteObjects`, and the bucket names. A line with `remoteObjects: 0` means the listing returned nothing. The script keeps every local file, so those runs did not delete the mirror. They also did not prove the remote project was unchanged. Anything added to the old project after 15 October 22:31 is not in this mirror. The 19 October database copy had no references to files missing from the mirror.

A destination recovery snapshot was then written and read back: `backups/migration/recovery/20261020T070929Z`. It is 6,783,605 bytes, SHA-256 `946398ce0cccc32ba9142cc27c35d12a911d12930b0257e098f14e8f9d6ef974`. Event rows are 1,119, one more than the 19 October copy, so the destination has newer live data than any local database folder.

`npm run backup` reads `.env.local`. That file now points at the new project. The Windows task `Rac3131 DB Backup` was not changed. A future run will try to snapshot the new database and list the new, empty buckets. The storage script still does not delete local files. Empty database folders should not be treated as good backups: the task creates the folder first, and the 20 October 12:02 run ended with Windows result `2147943467` before any file was written.

Proposed backup change, not applied: treat a snapshot as successful only when `data.json` or a SQL dump is non-empty, stop pruning empty folders as if they were good copies, and keep the `uploads` mirror even when a later listing returns zero objects.

## Commands

```powershell
npm run migrate:storage:preflight
npm run migrate:storage:dry-run
npm run migrate:storage:snapshot
npm run migrate:storage:copy -- --approve
npm run migrate:storage:database
npm run migrate:storage:verify -- --download
npm run migrate:storage:rewrite -- --approve
npm run migrate:storage:rollback -- --dry-run
npm run migrate:storage:rollback -- --approve
```

`snapshot` writes a checksummed copy of the destination database under `backups/migration/recovery/` and reads it back before treating it as a rollback point. `migrate-database` refuses an empty snapshot and refuses to replace a destination that already has rows. `rollback --dry-run` only previews. Reference rollback still requires the value currently stored to be the value this tool wrote.

## Gates that were executed

- 19 unit tests passed (`plan.test.ts` and `assess.test.ts`): empty snapshots, sync-log ambiguity, missing files, checksum mismatch, destination conflicts, retries, quota, repeated size matches, approval, missing rollback snapshots, later edits, and private URLs.
- `preflight` completed. It uploaded nothing and changed no rows.
- `dry-run` completed against the new database and the local mirror.
- `copy` without `--approve` stopped immediately.
- `copy --approve` stopped before any upload and left the phase at `dry_run_complete`.

Not executed, because they would change destination files or database links:

- `--within-quota` copy
- `verify --download`
- `rewrite-references`
- `rollback-references` against the database
- A full website pass of login, uploads, and dashboards

## Recovery boundary

The old project cannot serve files until its owner upgrades or the stored objects are reduced under the quota. This tool will not try to bypass that restriction.

Practical options:

1. Keep the website on the new project. New uploads already go to the empty `uploads` and `event-registrations` buckets.
2. Free enough quota on the old project, run `npm run backup:storage` to refresh the local mirror, then dry-run again.
3. Move the club to a Supabase plan whose file cap is at least 2 GB, then run the approved copy. Do not rewrite links until `verify --download` reports every referenced object.
4. A partial `--within-quota` copy can place about 1 GB of referenced files on the new project. Links for files that were not verified stay on the old host and will still fail.

Historical links keep failing until the matching object is copied and the database cell is rewritten. Changing environment variables again does not rewrite the 2,578 stored URLs.

## Application rollback

Do not change `NEXT_PUBLIC_SUPABASE_URL` or `SUPABASE_SERVICE_ROLE_KEY` back to the old project. The last known-good production deployment is the current alias, https://rotaractweb.vercel.app. A bad future code deploy can be restored from the Vercel deployment list. That restore does not move Storage and does not revive the frozen project.
