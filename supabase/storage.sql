-- ==========================================
-- STORAGE BUCKET CONFIGURATION
-- ==========================================

-- 1. Create the storage bucket 'company-logos'
-- Note: We use 'insert into' because there is no 'create bucket' command in standard SQL for Supabase Storage.
-- The 'public' flag is set to true so logos can be accessed via public URL.
insert into storage.buckets (id, name, public)
values ('company-logos', 'company-logos', true)
on conflict (id) do nothing;

-- 2. Set up RLS Policies for the bucket

-- Allow public read access to all files in the 'company-logos' bucket
create policy "Public Access to Company Logos"
on storage.objects for select
using ( bucket_id = 'company-logos' );

-- Allow authenticated users to upload files to the 'company-logos' bucket
-- You might want to restrict this further to only allow users to upload to a path containing their organization ID
create policy "Authenticated Users can Upload Logos"
on storage.objects for insert
with check (
  bucket_id = 'company-logos'
  and auth.role() = 'authenticated'
);

-- Allow authenticated users to update their files
create policy "Authenticated Users can Update Logos"
on storage.objects for update
using (
  bucket_id = 'company-logos'
  and auth.role() = 'authenticated'
);

-- Allow authenticated users to delete their files
create policy "Authenticated Users can Delete Logos"
on storage.objects for delete
using (
  bucket_id = 'company-logos'
  and auth.role() = 'authenticated'
);
