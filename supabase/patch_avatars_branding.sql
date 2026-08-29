-- Run this ONCE if you already executed schema.sql / functions.sql / seed.sql
-- before this update. It adds the missing avatar_url column and sets up
-- Supabase Storage buckets + policies for profile photos and the platform
-- logo. Safe to re-run (every statement is idempotent).

-- 1. Add avatar_url to profiles (skipped automatically if it already exists)
alter table profiles add column if not exists avatar_url text;

-- 2. Storage buckets
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('branding', 'branding', true)
on conflict (id) do nothing;

-- 3. Storage policies
-- Public read for both buckets (avatars/logo need to be visible in the UI).
drop policy if exists "avatars public read" on storage.objects;
create policy "avatars public read" on storage.objects for select
  using (bucket_id = 'avatars');

drop policy if exists "branding public read" on storage.objects;
create policy "branding public read" on storage.objects for select
  using (bucket_id = 'branding');

-- Any authenticated user may upload/replace their OWN avatar file
-- (the app names files "<user-id>-<timestamp>.<ext>", so this checks the
-- object name starts with the caller's uid).
drop policy if exists "avatars own write" on storage.objects;
create policy "avatars own write" on storage.objects for insert
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] is not null and name like auth.uid()::text || '-%');

drop policy if exists "avatars own update" on storage.objects;
create policy "avatars own update" on storage.objects for update
  using (bucket_id = 'avatars' and name like auth.uid()::text || '-%');

-- Only admins may upload/replace the platform logo.
drop policy if exists "branding admin write" on storage.objects;
create policy "branding admin write" on storage.objects for insert
  with check (bucket_id = 'branding' and is_admin());

drop policy if exists "branding admin update" on storage.objects;
create policy "branding admin update" on storage.objects for update
  using (bucket_id = 'branding' and is_admin());
