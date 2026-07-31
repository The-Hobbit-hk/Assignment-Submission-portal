-- Run once in Supabase SQL Editor (Dashboard → SQL → New query)
-- Creates a public bucket for ERP file uploads (reports, events, bluebook proofs).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'uploads',
  'uploads',
  true,
  10485760,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- NOTE: Do NOT add a public SELECT policy on storage.objects for this bucket.
-- Because the bucket is public, files are served via public object URLs
-- (/storage/v1/object/public/uploads/...) which do NOT consult RLS. A broad
-- public SELECT policy would only enable clients to LIST/enumerate every file
-- in the bucket (Supabase Security Advisor: "Public Bucket Allows Listing").
-- Uploads happen server-side with the service_role key, which bypasses RLS,
-- so no insert policy is required either.

-- If the old broad policies exist from a previous run, remove them:
drop policy if exists "Public read uploads" on storage.objects;
drop policy if exists "Authenticated upload uploads" on storage.objects;
