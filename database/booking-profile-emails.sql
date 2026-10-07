BEGIN;

UPDATE public.profiles AS profile
SET email = account.email
FROM auth.users AS account
WHERE profile.id = account.id
  AND (profile.email IS NULL OR btrim(profile.email) = '')
  AND account.email IS NOT NULL
  AND (profile.role = 'client' OR EXISTS (
    SELECT 1 FROM public.booking_clients AS client WHERE client.user_id = profile.id
  ));

COMMIT;