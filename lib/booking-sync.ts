import type { SupabaseClient } from '@supabase/supabase-js';
import { parseAppointmentCalendar } from './booking-calendar.ts';

export async function syncAppointmentCalendar(database: SupabaseClient, feedUrl: string) {
  try {
    const url = new URL(feedUrl);
    if (url.protocol !== 'https:' || url.hostname !== 'ovatu.com') throw new Error('Invalid Ovatu calendar URL');
    const response = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(20000), redirect: 'error' });
    if (!response.ok) throw new Error('Calendar download failed');
    const text = await response.text();
    if (text.length > 10_000_000) throw new Error('Calendar response too large');
    const events = await parseAppointmentCalendar(text);
    const { error } = await database.rpc('import_booking_appointments', { events });
    if (error) throw new Error('Calendar database import failed');
    return { imported: events.length };
  } catch {
    await database.from('booking_sync_state').update({ last_error: 'Ovatu sync failed. Existing appointments have been retained.' }).eq('id', 1);
    throw new Error('Ovatu sync failed. Check the feed URL, connection and database configuration.');
  }
}