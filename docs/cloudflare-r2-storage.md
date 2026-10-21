# Historical files on Cloudflare R2

Supabase remains the database. Public archive files live in the R2 bucket named by `R2_BUCKET_PUBLIC`. New uploads go there when the five server variables below are set.

## What the site stores today

Older public files are still stored as Supabase URLs in columns such as `Event.bannerUrl`, `Event.minutesPdfUrl`, `EventGallery.url`, `CitationAssignment.proofUrl`, monthly-report file columns, `CouncilBluebookReport.proofUrls`, `Member.avatar`, and `Club.logo`. When a page reads those rows, only `*.supabase.co/storage/v1/object/public/uploads/...` links are turned into `/api/storage/public/<same object key>`. That route reads the object from R2. External links stay as they are.

Private registration files are object paths, not public URLs. `GET /api/events/[id]/public-registrations/[registrationId]/[file]` requires a district role and then calls `readPrivateUpload`. The local mirror has no `event-registrations` folder, and `PublicEventRegistration` has 0 rows. Those private files are not in the backup and are not invented.

External links (93 at the last database scan) are left alone. A URL is never treated as an R2 object key.

New uploads go to R2 when the five server variables below are set. Existing public file links are rewritten on read to `/api/storage/public/<object key>`. That route reads the object from the private R2 bucket. Event banners, galleries, and club logos can load on the public site. Minutes, reports, proofs, dues files, and avatars require a signed-in user. Registration identity and payment files are not served by this route. Direct R2 addresses are not given to the browser. The database values stay unchanged.

## R2 setup

1. In Cloudflare, create one R2 bucket for the historical public archive and a second bucket for private files. Do not enable public access on the private bucket.
2. Create an API token limited to those two buckets, with Object Read and Object Write. Do not use an account-wide token.
3. Set these server-side variables in `.env.local` and in the Vercel project. Do not use a `NEXT_PUBLIC_` prefix.

```
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_PUBLIC=
R2_BUCKET_PRIVATE=
```

The S3 endpoint is `https://<R2_ACCOUNT_ID>.r2.cloudflarestorage.com`. The account id is the 32-character Cloudflare account id.

4. Attach a custom domain to the public bucket only when you want file links to use that domain. After that domain answers, set `R2_PUBLIC_BASE_URL` to its `https` origin. Until then, links use `/api/storage/public/<object key>`.
5. On the public bucket, add this CORS policy so the browser can PUT new files directly. The current API token cannot change bucket CORS.

```json
[
  {
    "AllowedOrigins": ["https://www.rotaractdistrict3131.org", "https://rotaractdistrict3131.org", "https://rotaractweb.vercel.app", "http://localhost:3000"],
    "AllowedMethods": ["GET", "PUT", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

6. Check connectivity without uploading:

```powershell
npm run migrate:r2:preflight
```

The five variables are set locally and on Vercel Production and Preview. They are not public.

## Commands

```powershell
npm run migrate:r2:preflight
npm run migrate:r2:dry-run
npm run migrate:r2:snapshot
npm run migrate:r2:copy -- --approve
npm run migrate:r2:verify
npm run migrate:r2:rewrite -- --approve
npm run migrate:r2:validate
npm run migrate:r2:rollback -- --dry-run
npm run migrate:r2:rollback -- --approve
```

`dry-run` writes `backups/migration/r2/manifest.jsonl`. It records size and path, marks the missing private archive as `missing_source`, and does not hash every byte yet. SHA-256 is calculated when an approved upload reads each file. An existing R2 object is not overwritten. A matching checksum is skipped. A different checksum, or a size match without a checksum, is a conflict.

`snapshot` re-reads `backups/migration/recovery/20261020T070929Z` and checks its SHA-256. It does not replace that copy.

`rewrite-references --approve` changes a database cell only when the recovery snapshot still matches, the R2 object status is `verified`, and `R2_PUBLIC_BASE_URL` can form the new public URL. Private objects are never given a public URL. Rollback restores a cell only when it still holds the migrated value, and it does not delete R2 objects.

## Backup task

`Rac3131 DB Backup` was not changed. `npm run backup` follows `.env.local`, which points at the new Supabase project. The empty folders in `backups/db` are not recovery copies. The usable database copy is the verified snapshot under `backups/migration/recovery/20261020T070929Z`. The usable file copy is `backups/storage/live/uploads`, last confirmed against the old project on 15 October 2026 at 22:31.

## Tests

Unit tests cover missing credentials, the account endpoint, unsafe paths, separate public and private buckets, unauthorized private downloads, checksum conflicts, retries, and the rewrite gate. Login, dashboards, and live uploads were not retested. No historical file was uploaded in this pass.
