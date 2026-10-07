BEGIN;

CREATE TABLE IF NOT EXISTS public.booking_admins (user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE);
CREATE TABLE IF NOT EXISTS public.booking_clients (user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE, role text NOT NULL DEFAULT 'client' CHECK (role = 'client'));
CREATE OR REPLACE FUNCTION public.is_booking_admin() RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin');
$$;

CREATE OR REPLACE FUNCTION public.protect_profile_role() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF current_user IN ('anon', 'authenticated') THEN
    IF TG_OP = 'INSERT' THEN
      IF NEW.role IS NOT NULL AND NEW.role NOT IN ('user', 'client') THEN
        RAISE EXCEPTION 'Profile roles must be managed by the server';
      END IF;
    ELSIF NEW.role IS DISTINCT FROM OLD.role THEN
      RAISE EXCEPTION 'Profile roles must be managed by the server';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS protect_profile_role ON public.profiles;
CREATE TRIGGER protect_profile_role BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_role();

CREATE TABLE IF NOT EXISTS public.booking_settings (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  enabled boolean NOT NULL DEFAULT false,
  price_pence integer NOT NULL DEFAULT 12500 CHECK (price_pence BETWEEN 50 AND 1000000),
  duration_minutes integer NOT NULL DEFAULT 60 CHECK (duration_minutes BETWEEN 15 AND 240),
  buffer_minutes integer NOT NULL DEFAULT 15 CHECK (buffer_minutes BETWEEN 0 AND 120),
  notice_hours integer NOT NULL DEFAULT 120 CHECK (notice_hours BETWEEN 0 AND 2160),
  horizon_days integer NOT NULL DEFAULT 14 CHECK (horizon_days BETWEEN 1 AND 90),
  cancellation_hours integer NOT NULL DEFAULT 72 CHECK (cancellation_hours BETWEEN 0 AND 2160),
  sync_max_age_minutes integer NOT NULL DEFAULT 30 CHECK (sync_max_age_minutes BETWEEN 5 AND 120),
  timezone text NOT NULL DEFAULT 'Europe/London' CHECK (timezone = 'Europe/London'),
  CHECK (notice_hours < horizon_days * 24)
);
INSERT INTO booking_settings (id) VALUES (1) ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS public.booking_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  weekday integer CHECK (weekday BETWEEN 0 AND 6),
  specific_date date,
  start_time time NOT NULL DEFAULT '09:00',
  end_time time NOT NULL DEFAULT '17:00',
  unavailable boolean NOT NULL DEFAULT false,
  CHECK ((weekday IS NULL) <> (specific_date IS NULL)),
  CHECK (end_time > start_time)
);
CREATE TABLE IF NOT EXISTS public.booking_sync_state (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  last_success timestamptz, last_error text
);
INSERT INTO booking_sync_state (id) VALUES (1) ON CONFLICT DO NOTHING;
CREATE TABLE IF NOT EXISTS public.booking_slot_blocks (
  starts_at timestamptz PRIMARY KEY,
  ends_at timestamptz NOT NULL,
  CHECK (ends_at > starts_at)
);
CREATE TABLE IF NOT EXISTS public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  external_uid text NOT NULL UNIQUE,
  client_name text NOT NULL DEFAULT '',
  details text NOT NULL DEFAULT '',
  location text NOT NULL DEFAULT '',
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  cancelled boolean NOT NULL DEFAULT false,
  synced_at timestamptz NOT NULL DEFAULT now(),
  CHECK (ends_at > starts_at)
);
CREATE INDEX IF NOT EXISTS appointments_time_idx ON appointments(starts_at, ends_at);
CREATE TABLE IF NOT EXISTS public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  name text NOT NULL,
  email text NOT NULL,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  price_pence integer NOT NULL,
  buffer_minutes integer NOT NULL,
  cancellation_hours integer NOT NULL,
  status text NOT NULL DEFAULT 'held' CHECK (status IN ('held','confirmed','cancelled','expired','refund_pending','refunded')),
  hold_expires_at timestamptz NOT NULL DEFAULT now() + interval '35 minutes',
  stripe_session_id text UNIQUE,
  payment_intent text UNIQUE,
  paid_at timestamptz,
  zoom_meeting_id text,
  zoom_join_url text,
  zoom_synced_start timestamptz,
  questionnaire jsonb NOT NULL DEFAULT '{}',
  questionnaire_completed_at timestamptz,
  terms_version text NOT NULL DEFAULT '2026-09-17',
  terms_accepted_at timestamptz NOT NULL DEFAULT now(),
  early_start_requested boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (ends_at > starts_at)
);
CREATE INDEX IF NOT EXISTS bookings_time_idx ON bookings(starts_at, ends_at);
CREATE INDEX IF NOT EXISTS bookings_user_idx ON bookings(user_id);
CREATE TABLE IF NOT EXISTS public.booking_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES bookings(id) ON DELETE CASCADE,
  kind text NOT NULL,
  dedupe_key text NOT NULL UNIQUE,
  available_at timestamptz NOT NULL DEFAULT now(),
  locked_until timestamptz,
  attempts integer NOT NULL DEFAULT 0,
  scheduled_for timestamptz,
  payload jsonb NOT NULL DEFAULT '{}',
  completed_at timestamptz,
  last_error text
);
ALTER TABLE public.booking_jobs ADD COLUMN IF NOT EXISTS scheduled_for timestamptz;
ALTER TABLE public.booking_jobs ADD COLUMN IF NOT EXISTS payload jsonb NOT NULL DEFAULT '{}';

CREATE OR REPLACE FUNCTION public.booking_slots(include_blocked boolean DEFAULT false)
RETURNS TABLE(starts_at timestamptz, ends_at timestamptz, available boolean, reason text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  WITH settings AS (SELECT * FROM booking_settings WHERE id = 1),
  days AS (
    SELECT day::date AS local_day FROM settings,
      generate_series((now() AT TIME ZONE 'Europe/London')::date::timestamp,
      (now() AT TIME ZONE 'Europe/London')::date::timestamp + horizon_days * interval '1 day', interval '1 day') day
  ), windows AS (
    SELECT (local_day + start_time) AT TIME ZONE 'Europe/London' AS first_start,
      (local_day + end_time) AT TIME ZONE 'Europe/London' AS last_end
    FROM days JOIN booking_availability rule ON rule.specific_date = local_day OR
      (rule.weekday = extract(dow FROM local_day) AND NOT EXISTS (SELECT 1 FROM booking_availability override WHERE override.specific_date = local_day))
    WHERE NOT rule.unavailable AND NOT EXISTS (SELECT 1 FROM booking_availability blocked WHERE blocked.specific_date = local_day AND blocked.unavailable)
  ), candidates AS (
    SELECT DISTINCT slot AS starts_at, slot + duration_minutes * interval '1 minute' AS ends_at
    FROM settings, windows,
      LATERAL generate_series(first_start, last_end - duration_minutes * interval '1 minute',
        (duration_minutes + buffer_minutes) * interval '1 minute') slot
    WHERE slot >= greatest(now(), (((now() AT TIME ZONE 'Europe/London')::date + ceil(notice_hours / 24.0)::integer)::timestamp AT TIME ZONE 'Europe/London'))
      AND slot <= now() + horizon_days * interval '1 day'
  ), checked AS (
    SELECT candidate.*, CASE
      WHEN EXISTS (SELECT 1 FROM booking_slot_blocks blocked
        WHERE candidate.starts_at < blocked.ends_at AND candidate.ends_at > blocked.starts_at) THEN 'Blocked by Admin'
      WHEN NOT settings.enabled THEN 'Bookings are currently paused'
      WHEN NOT EXISTS (SELECT 1 FROM booking_sync_state WHERE last_success > now() - sync_max_age_minutes * interval '1 minute') THEN 'Calendar sync needs attention'
      WHEN EXISTS (SELECT 1 FROM appointments busy WHERE NOT busy.cancelled
        AND candidate.starts_at < busy.ends_at + buffer_minutes * interval '1 minute'
        AND candidate.ends_at + buffer_minutes * interval '1 minute' > busy.starts_at) THEN 'This time clashes with an appointment'
      WHEN EXISTS (SELECT 1 FROM bookings busy WHERE (busy.status = 'confirmed' OR (busy.status = 'held' AND busy.hold_expires_at > now()))
        AND candidate.starts_at < busy.ends_at + greatest(settings.buffer_minutes, busy.buffer_minutes) * interval '1 minute'
        AND candidate.ends_at + greatest(settings.buffer_minutes, busy.buffer_minutes) * interval '1 minute' > busy.starts_at) THEN 'This time clashes with a booking'
      ELSE NULL END AS reason
    FROM candidates candidate CROSS JOIN settings
  ) SELECT starts_at, ends_at, reason IS NULL, reason FROM checked WHERE include_blocked OR reason IS NULL ORDER BY starts_at;
$$;

CREATE OR REPLACE FUNCTION public.set_booking_slot_block(slot_start timestamptz, blocked boolean)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE selected_slot record;
BEGIN
  PERFORM pg_advisory_xact_lock(871250);
  IF blocked IS NULL THEN RAISE EXCEPTION 'Choose whether to block this slot'; END IF;
  IF NOT blocked THEN
    DELETE FROM booking_slot_blocks WHERE starts_at = slot_start;
    RETURN;
  END IF;
  IF EXISTS (SELECT 1 FROM booking_slot_blocks WHERE starts_at = slot_start) THEN RETURN; END IF;
  SELECT * INTO selected_slot FROM booking_slots(false) WHERE starts_at = slot_start;
  IF NOT FOUND THEN RAISE EXCEPTION 'That time is no longer available. Refresh the schedule.'; END IF;
  INSERT INTO booking_slot_blocks(starts_at, ends_at) VALUES (selected_slot.starts_at, selected_slot.ends_at);
END;
$$;

CREATE OR REPLACE FUNCTION public.reserve_booking(slot_start timestamptz, customer_name text, customer_email text, customer_id uuid DEFAULT NULL, early_start boolean DEFAULT false)
RETURNS public.bookings LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE selected_slot record; settings booking_settings; result bookings;
BEGIN
  PERFORM pg_advisory_xact_lock(871250);
  SELECT * INTO selected_slot FROM booking_slots(false) WHERE starts_at = slot_start;
  IF NOT FOUND THEN RAISE EXCEPTION 'That time is no longer available. Please choose another slot.'; END IF;
  IF (SELECT count(*) FROM bookings WHERE email = lower(customer_email) AND status = 'held' AND hold_expires_at > now()) >= 3 THEN
    RAISE EXCEPTION 'Please finish an existing checkout or try again later.';
  END IF;
  SELECT * INTO settings FROM booking_settings WHERE id = 1;
  INSERT INTO bookings (name, email, user_id, starts_at, ends_at, price_pence, buffer_minutes, cancellation_hours, early_start_requested)
    VALUES (customer_name, lower(customer_email), customer_id, selected_slot.starts_at, selected_slot.ends_at, settings.price_pence, settings.buffer_minutes, settings.cancellation_hours, early_start)
    RETURNING * INTO result;
  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.confirm_booking(booking_uuid uuid, session_id text, intent_id text, amount integer)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE target bookings;
BEGIN
  PERFORM pg_advisory_xact_lock(871250);
  SELECT * INTO target FROM bookings WHERE id = booking_uuid FOR UPDATE;
  IF NOT FOUND OR target.price_pence <> amount OR (target.stripe_session_id IS NOT NULL AND target.stripe_session_id <> session_id) THEN
    RAISE EXCEPTION 'Payment does not match booking';
  END IF;
  IF target.paid_at IS NOT NULL THEN RETURN; END IF;
  IF target.status <> 'held' OR EXISTS (SELECT 1 FROM bookings busy WHERE busy.id <> target.id
    AND (busy.status = 'confirmed' OR (busy.status = 'held' AND busy.hold_expires_at > now()))
    AND target.starts_at < busy.ends_at + greatest(target.buffer_minutes,busy.buffer_minutes) * interval '1 minute'
    AND target.ends_at + greatest(target.buffer_minutes,busy.buffer_minutes) * interval '1 minute' > busy.starts_at)
    OR EXISTS (SELECT 1 FROM booking_slot_blocks blocked
      WHERE target.starts_at < blocked.ends_at AND target.ends_at > blocked.starts_at)
    OR EXISTS (SELECT 1 FROM appointments busy WHERE NOT busy.cancelled
      AND target.starts_at < busy.ends_at + target.buffer_minutes * interval '1 minute'
      AND target.ends_at + target.buffer_minutes * interval '1 minute' > busy.starts_at) THEN
    UPDATE bookings SET status = 'refund_pending', stripe_session_id = session_id, payment_intent = intent_id, paid_at = now() WHERE id = booking_uuid;
    INSERT INTO booking_jobs (booking_id,kind,dedupe_key) VALUES (booking_uuid,'refund',booking_uuid || ':refund') ON CONFLICT DO NOTHING;
    RETURN;
  END IF;
  UPDATE bookings SET status = 'confirmed', stripe_session_id = session_id, payment_intent = intent_id, paid_at = now() WHERE id = booking_uuid;
  INSERT INTO booking_jobs (booking_id, kind, dedupe_key) VALUES
    (booking_uuid,'provision',booking_uuid || ':provision'),
    (booking_uuid,'admin_booked',booking_uuid || ':admin_booked') ON CONFLICT DO NOTHING;
END;
$$;

CREATE OR REPLACE FUNCTION public.manage_booking(booking_uuid uuid, actor_id uuid, operation text, new_start timestamptz DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE target bookings; selected_slot record;
BEGIN
  PERFORM pg_advisory_xact_lock(871250);
  SELECT * INTO target FROM bookings WHERE id = booking_uuid AND user_id = actor_id FOR UPDATE;
  IF NOT FOUND OR target.status <> 'confirmed' THEN RAISE EXCEPTION 'Booking not found'; END IF;
  IF target.starts_at < now() + target.cancellation_hours * interval '1 hour' THEN RAISE EXCEPTION 'The cancellation/rescheduling deadline has passed. Please contact Victoria.'; END IF;
  IF operation = 'cancel' THEN
    UPDATE bookings SET status = 'refund_pending' WHERE id = booking_uuid;
    INSERT INTO booking_jobs (booking_id,kind,dedupe_key) VALUES (booking_uuid,'refund',booking_uuid || ':refund') ON CONFLICT DO NOTHING;
  ELSIF operation = 'reschedule' THEN
    UPDATE bookings SET status = 'cancelled' WHERE id = booking_uuid;
    SELECT * INTO selected_slot FROM booking_slots(false) WHERE starts_at = new_start;
    IF NOT FOUND OR selected_slot.ends_at - selected_slot.starts_at <> target.ends_at - target.starts_at THEN RAISE EXCEPTION 'That time is unavailable. Please contact Victoria if the session duration has changed.'; END IF;
    UPDATE bookings SET starts_at = selected_slot.starts_at, ends_at = selected_slot.ends_at, status = 'confirmed' WHERE id = booking_uuid;
    INSERT INTO booking_jobs (booking_id,kind,dedupe_key) VALUES (booking_uuid,'rescheduled',booking_uuid || ':rescheduled:' || extract(epoch FROM now())) ON CONFLICT DO NOTHING;
  ELSE RAISE EXCEPTION 'Invalid operation'; END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.submit_booking_questionnaire(booking_uuid uuid, actor_id uuid, answers jsonb, complete boolean)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE target bookings;
BEGIN
  SELECT * INTO target FROM bookings WHERE id = booking_uuid AND user_id = actor_id FOR UPDATE;
  IF NOT FOUND OR target.status <> 'confirmed' OR target.starts_at <= now() THEN RAISE EXCEPTION 'This questionnaire is no longer available'; END IF;
  UPDATE bookings SET questionnaire = answers, questionnaire_completed_at = CASE WHEN complete THEN now() ELSE questionnaire_completed_at END WHERE id = booking_uuid;
  IF complete THEN
    INSERT INTO booking_jobs (booking_id,kind,dedupe_key,payload) VALUES (booking_uuid,'questionnaire',booking_uuid || ':questionnaire:' || md5(answers::text),answers) ON CONFLICT DO NOTHING;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.import_booking_appointments(events jsonb)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM pg_advisory_xact_lock(871250);
  UPDATE appointments SET cancelled = true WHERE NOT cancelled;
  INSERT INTO appointments (external_uid,client_name,details,location,starts_at,ends_at,cancelled)
    SELECT external_uid,client_name,details,location,starts_at,ends_at,false
    FROM jsonb_to_recordset(events) AS event(external_uid text,client_name text,details text,location text,starts_at timestamptz,ends_at timestamptz)
    ON CONFLICT (external_uid) DO UPDATE SET client_name = excluded.client_name, details = excluded.details, location = excluded.location,
      starts_at = excluded.starts_at, ends_at = excluded.ends_at, cancelled = false, synced_at = now();
  INSERT INTO booking_jobs (booking_id,kind,dedupe_key)
    SELECT booking.id,'conflict',booking.id || ':conflict:' || appointment.id || ':' || appointment.starts_at
    FROM bookings booking JOIN appointments appointment ON NOT appointment.cancelled
      AND booking.starts_at < appointment.ends_at + booking.buffer_minutes * interval '1 minute'
      AND booking.ends_at + booking.buffer_minutes * interval '1 minute' > appointment.starts_at
    WHERE booking.status = 'confirmed' AND booking.ends_at > now() ON CONFLICT DO NOTHING;
  UPDATE booking_sync_state SET last_success = now(), last_error = NULL WHERE id = 1;
END;
$$;

CREATE OR REPLACE FUNCTION public.claim_booking_jobs() RETURNS SETOF booking_jobs
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE bookings SET status = 'expired' WHERE status = 'held' AND hold_expires_at <= now();
  INSERT INTO booking_jobs (booking_id,kind,dedupe_key,scheduled_for)
    SELECT id,'reminder',id || ':reminder:' || starts_at,starts_at FROM bookings
    WHERE status = 'confirmed' AND starts_at > now() AND starts_at <= now() + interval '24 hours'
    ON CONFLICT DO NOTHING;
  RETURN QUERY UPDATE booking_jobs SET locked_until = now() + interval '5 minutes', attempts = attempts + 1
    WHERE id IN (SELECT id FROM booking_jobs WHERE completed_at IS NULL AND available_at <= now()
      AND (locked_until IS NULL OR locked_until < now()) ORDER BY available_at LIMIT 10 FOR UPDATE SKIP LOCKED)
    RETURNING *;
END;
$$;

DO $$
DECLARE table_name text; routine record;
BEGIN
  FOREACH table_name IN ARRAY ARRAY['booking_admins','booking_clients','booking_settings','booking_availability','booking_slot_blocks','booking_sync_state','appointments','bookings','booking_jobs'] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
    EXECUTE format('REVOKE ALL ON public.%I FROM anon, authenticated', table_name);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', table_name);
  END LOOP;
  FOR routine IN SELECT oid::regprocedure AS signature FROM pg_proc WHERE pronamespace = 'public'::regnamespace
    AND proname IN ('booking_slots','set_booking_slot_block','reserve_booking','confirm_booking','manage_booking','submit_booking_questionnaire','import_booking_appointments','claim_booking_jobs') LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC, anon, authenticated', routine.signature);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role', routine.signature);
  END LOOP;
END;
$$;
REVOKE ALL ON FUNCTION is_booking_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION is_booking_admin() TO authenticated, service_role;

CREATE TABLE IF NOT EXISTS public.booking_rate_limits (key text PRIMARY KEY, window_start timestamptz NOT NULL DEFAULT now(), hits integer NOT NULL DEFAULT 1);
ALTER TABLE booking_rate_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON booking_rate_limits FROM anon, authenticated;
GRANT ALL ON booking_rate_limits TO service_role;
CREATE OR REPLACE FUNCTION public.booking_rate_limit(bucket_key text, maximum integer, window_seconds integer)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE result integer;
BEGIN
  INSERT INTO booking_rate_limits (key) VALUES (bucket_key)
    ON CONFLICT (key) DO UPDATE SET hits = CASE WHEN booking_rate_limits.window_start < now() - window_seconds * interval '1 second' THEN 1 ELSE booking_rate_limits.hits + 1 END,
      window_start = CASE WHEN booking_rate_limits.window_start < now() - window_seconds * interval '1 second' THEN now() ELSE booking_rate_limits.window_start END
    RETURNING hits INTO result;
  RETURN result <= maximum;
END;
$$;
CREATE OR REPLACE FUNCTION public.booking_user_by_email(address text) RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT id FROM auth.users WHERE lower(email) = lower(address) LIMIT 1;
$$;
REVOKE ALL ON FUNCTION booking_rate_limit(text,integer,integer), booking_user_by_email(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION booking_rate_limit(text,integer,integer), booking_user_by_email(text) TO service_role;

DO $$
DECLARE target text; operation text;
BEGIN
  FOREACH target IN ARRAY ARRAY['sections','homepage','education','services','gallery_images','categories','categories_images','categories_services','notifications','user_notifications'] LOOP
    IF to_regclass('public.' || target) IS NOT NULL THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', target);
      FOREACH operation IN ARRAY ARRAY['INSERT','UPDATE','DELETE'] LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'booking_admin_' || lower(operation), target);
        IF operation = 'INSERT' THEN
          EXECUTE format('CREATE POLICY %I ON public.%I AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK (public.is_booking_admin())', 'booking_admin_insert', target);
        ELSIF operation = 'UPDATE' THEN
          EXECUTE format('CREATE POLICY %I ON public.%I AS RESTRICTIVE FOR UPDATE TO authenticated USING (public.is_booking_admin()) WITH CHECK (public.is_booking_admin())', 'booking_admin_update', target);
        ELSE
          EXECUTE format('CREATE POLICY %I ON public.%I AS RESTRICTIVE FOR DELETE TO authenticated USING (public.is_booking_admin())', 'booking_admin_delete', target);
        END IF;
      END LOOP;
      IF target IN ('notifications','user_notifications') THEN
        EXECUTE format('DROP POLICY IF EXISTS booking_admin_read ON public.%I', target);
        EXECUTE format('CREATE POLICY booking_admin_read ON public.%I AS RESTRICTIVE FOR SELECT TO authenticated USING (public.is_booking_admin())', target);
      END IF;
    END IF;
  END LOOP;
  IF to_regclass('public.profiles') IS NOT NULL THEN
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS booking_profile_access ON public.profiles;
    CREATE POLICY booking_profile_access ON public.profiles AS RESTRICTIVE FOR ALL TO authenticated
      USING (id = auth.uid() OR public.is_booking_admin()) WITH CHECK (id = auth.uid() OR public.is_booking_admin());
  END IF;
  IF to_regclass('storage.objects') IS NOT NULL THEN
    DROP POLICY IF EXISTS booking_storage_insert ON storage.objects;
    DROP POLICY IF EXISTS booking_storage_update ON storage.objects;
    DROP POLICY IF EXISTS booking_storage_delete ON storage.objects;
    CREATE POLICY booking_storage_insert ON storage.objects AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK (
      public.is_booking_admin() OR (bucket_id = 'images' AND split_part(name, '/', 1) = 'avatars'
        AND split_part(name, '/', 2) = auth.uid()::text AND array_length(string_to_array(name, '/'), 1) = 3 AND split_part(name, '/', 3) <> ''));
    DROP POLICY IF EXISTS booking_avatar_insert ON storage.objects;
    CREATE POLICY booking_avatar_insert ON storage.objects FOR INSERT TO authenticated WITH CHECK (
      bucket_id = 'images' AND split_part(name, '/', 1) = 'avatars'
        AND split_part(name, '/', 2) = auth.uid()::text AND array_length(string_to_array(name, '/'), 1) = 3 AND split_part(name, '/', 3) <> '');
    CREATE POLICY booking_storage_update ON storage.objects AS RESTRICTIVE FOR UPDATE TO authenticated USING (public.is_booking_admin()) WITH CHECK (public.is_booking_admin());
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
  END IF;
END;
$$;

COMMIT;