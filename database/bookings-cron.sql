BEGIN;

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM vault.decrypted_secrets WHERE name = 'booking_app_url' AND decrypted_secret <> '')
    OR NOT EXISTS (SELECT 1 FROM vault.decrypted_secrets WHERE name = 'booking_cron_secret' AND decrypted_secret <> '') THEN
    RAISE EXCEPTION 'Create Vault secrets booking_app_url (public HTTPS site origin) and booking_cron_secret (matching BOOKING_CRON_SECRET on the app server), then rerun this script.';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.enqueue_booking_cron(task text)
RETURNS bigint LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE app_url text; cron_secret text; request_id bigint;
BEGIN
  IF task IS NULL OR task NOT IN ('sync', 'jobs') THEN
    RAISE EXCEPTION 'Unknown booking cron task';
  END IF;
  SELECT decrypted_secret INTO app_url FROM vault.decrypted_secrets WHERE name = 'booking_app_url';
  SELECT decrypted_secret INTO cron_secret FROM vault.decrypted_secrets WHERE name = 'booking_cron_secret';
  IF app_url IS NULL OR app_url !~ '^https://[^/?#[:space:]]+/?$' THEN
    RAISE EXCEPTION 'Vault booking_app_url must be a public HTTPS site origin without a path or query';
  END IF;
  IF cron_secret IS NULL OR cron_secret = '' THEN
    RAISE EXCEPTION 'Vault booking_cron_secret is missing';
  END IF;
  SELECT net.http_post(
    url := rtrim(app_url, '/') || '/api/bookings/cron?task=' || task,
    headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || cron_secret),
    body := '{}'::jsonb,
    timeout_milliseconds := 125000
  ) INTO request_id;
  RETURN request_id;
END;
$$;

REVOKE ALL ON FUNCTION public.enqueue_booking_cron(text) FROM PUBLIC, anon, authenticated, service_role;

SELECT cron.schedule('booking-ovatu-sync', '*/5 * * * *', $$SELECT public.enqueue_booking_cron('sync');$$);
SELECT cron.schedule('booking-background-jobs', '* * * * *', $$SELECT public.enqueue_booking_cron('jobs');$$);

SELECT public.enqueue_booking_cron('sync') AS initial_sync_request_id;

COMMIT;