-- Lets admins manage availability and make test bookings while online bookings are paused.
-- The pause is enforced by the booking API for customers instead of inside slot generation.
BEGIN;

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

NOTIFY pgrst, 'reload schema';
COMMIT;