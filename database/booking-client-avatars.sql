BEGIN;

DROP POLICY IF EXISTS booking_storage_insert ON storage.objects;
CREATE POLICY booking_storage_insert ON storage.objects AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK (
  public.is_booking_admin() OR (bucket_id = 'images' AND split_part(name, '/', 1) = 'avatars'
    AND split_part(name, '/', 2) = auth.uid()::text AND array_length(string_to_array(name, '/'), 1) = 3 AND split_part(name, '/', 3) <> ''));

DROP POLICY IF EXISTS booking_avatar_insert ON storage.objects;
CREATE POLICY booking_avatar_insert ON storage.objects FOR INSERT TO authenticated WITH CHECK (
  bucket_id = 'images' AND split_part(name, '/', 1) = 'avatars'
    AND split_part(name, '/', 2) = auth.uid()::text AND array_length(string_to_array(name, '/'), 1) = 3 AND split_part(name, '/', 3) <> '');

-- Clients may remove files from their own avatar folder. Storage deletes also need SELECT on the row.
DROP POLICY IF EXISTS booking_storage_delete ON storage.objects;
CREATE POLICY booking_storage_delete ON storage.objects AS RESTRICTIVE FOR DELETE TO authenticated USING (
  public.is_booking_admin() OR (bucket_id = 'images' AND split_part(name, '/', 1) = 'avatars'
    AND split_part(name, '/', 2) = auth.uid()::text AND array_length(string_to_array(name, '/'), 1) = 3 AND split_part(name, '/', 3) <> ''));

DROP POLICY IF EXISTS booking_avatar_delete ON storage.objects;
CREATE POLICY booking_avatar_delete ON storage.objects FOR DELETE TO authenticated USING (
  bucket_id = 'images' AND split_part(name, '/', 1) = 'avatars'
    AND split_part(name, '/', 2) = auth.uid()::text AND array_length(string_to_array(name, '/'), 1) = 3 AND split_part(name, '/', 3) <> '');

DROP POLICY IF EXISTS booking_avatar_select ON storage.objects;
CREATE POLICY booking_avatar_select ON storage.objects FOR SELECT TO authenticated USING (
  bucket_id = 'images' AND split_part(name, '/', 1) = 'avatars'
    AND split_part(name, '/', 2) = auth.uid()::text AND array_length(string_to_array(name, '/'), 1) = 3 AND split_part(name, '/', 3) <> '');

COMMIT;