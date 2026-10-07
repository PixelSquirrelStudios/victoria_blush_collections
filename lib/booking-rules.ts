import { DateTime } from 'luxon';

export const bookingDefaults = {
  price_pence: 12500,
  duration_minutes: 60,
  buffer_minutes: 15,
  notice_hours: 120,
  horizon_days: 14,
  cancellation_hours: 72,
  timezone: 'Europe/London',
};

export const questionnaireFields = [
  { key: 'name', label: 'Name', required: true },
  { key: 'email', label: 'Email', required: true },
  { key: 'instagram', label: 'Instagram handle / business name if relevant', required: false },
  { key: 'occupation', label: 'What do you currently do?', required: true },
  { key: 'reason', label: 'What made you book The Shift Session?', required: true },
  { key: 'challenge', label: 'What feels like the biggest challenge for you right now?', required: true },
  { key: 'clarity', label: 'What are you trying to change, decide or get clarity on?', required: true },
  { key: 'outcome', label: 'If this session went really well, what would you want to leave with?', required: true },
  { key: 'avoiding', label: 'Is there anything you feel you have been avoiding, overthinking or going round in circles with?', required: false },
  { key: 'tried', label: 'What have you already tried?', required: false },
  { key: 'anything_else', label: 'Is there anything else you think I should know before we speak?', required: false },
] as const;

export const occupations = ['Employed stylist', 'Self-employed stylist', 'Manager', 'Salon owner', 'Other'];

export function canAccessQuestionnaire(booking: { user_id: string | null; status: string }, user: { id: string; email_confirmed_at?: string | null } | null) {
  return Boolean(user?.email_confirmed_at && booking.user_id === user.id && booking.status === 'confirmed');
}

export function canViewQuestionnaire(booking: { user_id: string | null; status: string; questionnaire_completed_at?: string | null }, user: { id: string; email_confirmed_at?: string | null } | null) {
  return canAccessQuestionnaire(booking, user) || Boolean(user?.email_confirmed_at && booking.user_id === user.id && booking.questionnaire_completed_at && ['cancelled', 'refund_pending', 'refunded'].includes(booking.status));
}

export function overlapsWithBuffer(start: number, end: number, busyStart: number, busyEnd: number, bufferMinutes: number) {
  const buffer = bufferMinutes * 60_000;
  return start < busyEnd + buffer && end + buffer > busyStart;
}

export function withinBookingWindow(start: number, now: number, noticeHours: number, horizonDays: number) {
  return start >= bookingNoticeStart(now, noticeHours) && start <= now + horizonDays * 86_400_000;
}

export function bookingNoticeStart(now: number, noticeHours: number) {
  const firstDay = DateTime.fromMillis(now, { zone: 'Europe/London' }).startOf('day').plus({ days: Math.ceil(noticeHours / 24) });
  return Math.max(now, firstDay.toMillis());
}

export function canManageBooking(start: number, now: number, cancellationHours: number) {
  return start >= now + cancellationHours * 3_600_000;
}

export function clientBookingState(booking: { status: string; starts_at: string; ends_at: string; cancellation_hours: number; questionnaire_completed_at: string | null }, now: number) {
  const upcoming = booking.status === 'confirmed' && Date.parse(booking.ends_at) > now;
  return {
    upcoming,
    needsQuestionnaire: upcoming && Date.parse(booking.starts_at) > now && !booking.questionnaire_completed_at,
    manageable: upcoming && Date.parse(booking.starts_at) > now && canManageBooking(Date.parse(booking.starts_at), now, booking.cancellation_hours),
    refund: booking.status === 'refund_pending' || booking.status === 'refunded',
    label: booking.status === 'refund_pending' ? 'Refund Processing' : booking.status === 'refunded' ? 'Refund Issued' : booking.status === 'confirmed' ? upcoming ? 'Confirmed' : 'Completed' : booking.status === 'cancelled' ? 'Cancelled' : booking.status,
  };
}

export function formatSessionDate(value: string) {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London', dateStyle: 'full', timeStyle: 'short',
  }).format(new Date(value));
}

export function customerBookingTimes(value: string, timezone: string, compact = false) {
  let zone = 'Europe/London';
  try {
    zone = new Intl.DateTimeFormat('en-GB', { timeZone: timezone }).resolvedOptions().timeZone;
  } catch {}
  const london = DateTime.fromISO(value).setZone('Europe/London');
  const local = london.setZone(zone);
  const londonLabel = `London time (${london.toFormat('ZZZZ', { locale: 'en-GB' })})`;
  const format = compact ? 'h:mm a' : 'cccc d LLLL yyyy, h:mm a';
  return {
    primary: {
      label: zone === 'Europe/London' ? londonLabel : `Your time (${zone.replaceAll('_', ' ')})`,
      text: local.toFormat(format, { locale: 'en-US' }),
    },
    london: zone === 'Europe/London' ? null : {
      label: londonLabel,
      text: london.toFormat(compact && local.toISODate() !== london.toISODate() ? 'ccc d LLL, h:mm a' : format, { locale: 'en-US' }),
    },
  };
}