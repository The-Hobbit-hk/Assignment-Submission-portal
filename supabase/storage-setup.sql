-- Run once in Supabase SQL Editor (Dashboard → SQL → New query)
-- Creates a public bucket for ERP file uploads (reports, events, bluebook proofs).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'uploads',
  'uploads',
  true,
  8388608,
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

-- Public read for uploaded files
create policy "Public read uploads"
on storage.objects for select
to public
using (bucket_id = 'uploads');

-- Authenticated users can upload (optional; server uses service role which bypasses RLS)
create policy "Authenticated upload uploads"
on storage.objects for insert
to authenticated
with check (bucket_id = 'uploads');
