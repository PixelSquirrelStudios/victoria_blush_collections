import ical from 'node-ical';
import { DateTime } from 'luxon';

function calendarText(value: unknown): string {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object' && 'val' in value) return String(value.val);
  return '';
}

export async function parseAppointmentCalendar(text: string, now = new Date()) {
  if (!text.trim().startsWith('BEGIN:VCALENDAR') || !text.trim().endsWith('END:VCALENDAR')) throw new Error('Invalid calendar response');
  const calendar = await ical.async.parseICS(text);
  const from = new Date(now.getTime() - 31 * 86_400_000);
  const to = new Date(now.getTime() + 100 * 86_400_000);
  const appointments = new Map<string, { external_uid: string; client_name: string; details: string; location: string; starts_at: string; ends_at: string }>();
  for (const event of Object.values(calendar)) {
    if (!event || event.type !== 'VEVENT' || event.status === 'CANCELLED' || event.transparency === 'TRANSPARENT') continue;
    if (!event.uid || !event.start || (!event.end && event.datetype !== 'date')) throw new Error('Calendar event has no UID or valid time range');
    const instances = ical.expandRecurringEvent(event, { from, to, expandOngoing: true, includeOverrides: true, excludeExdates: true });
    for (const instance of instances) {
      if (instance.event.status === 'CANCELLED') continue;
      const start = instance.isFullDay ? DateTime.fromJSDate(instance.start).setZone('Europe/London', { keepLocalTime: true }).startOf('day').toJSDate() : instance.start;
      const end = instance.isFullDay ? DateTime.fromJSDate(instance.end).setZone('Europe/London', { keepLocalTime: true }).startOf('day').toJSDate() : instance.end;
      if (!(end.getTime() > start.getTime())) throw new Error('Calendar event has an invalid duration');
      const occurrence = instance.event.recurrenceid || instance.start;
      const key = event.rrule ? `${event.uid}:${occurrence.toISOString()}` : event.uid;
      appointments.set(key, { external_uid: key, client_name: calendarText(instance.summary), details: calendarText(instance.event.description), location: calendarText(instance.event.location), starts_at: start.toISOString(), ends_at: end.toISOString() });
    }
  }
  return [...appointments.values()];
}