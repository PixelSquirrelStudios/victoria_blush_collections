import { redirect } from 'next/navigation';
import { DateTime } from 'luxon';
import { bookingDatabase, bookingIdentity } from '@/lib/booking-server';
import { fetchUserData } from '@/app/hooks/useUser';
import DashboardOverview, { type DashboardSnapshot } from '@/components/booking/DashboardOverview';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const { user, admin } = await bookingIdentity();
  if (!user) redirect('/booking/login');
  if (!admin) redirect('/dashboard/bookings');

  const { profile } = await fetchUserData();
  const database = bookingDatabase();
  const now = DateTime.now().setZone('Europe/London');
  const timestamp = now.toISO()!;
  const today = now.startOf('day').toISO()!;
  const tomorrow = now.startOf('day').plus({ days: 1 }).toISO()!;
  const issues: string[] = [];
  async function result<Value extends { error: unknown }>(label: string, query: PromiseLike<Value>): Promise<Value | null> {
    try {
      const response = await query;
      if (response.error) throw new Error(label);
      return response;
    } catch {
      issues.push(label);
      return null;
    }
  }

  const [settings, sync, sessions, sessionCount, questionnaireCount, refundedCount, appointments, appointmentCount, images, services, sections, slots] = await Promise.all([
    result('booking settings', database.from('booking_settings').select('enabled,sync_max_age_minutes').eq('id', 1).single()),
    result('calendar sync', database.from('booking_sync_state').select('last_success,last_error').eq('id', 1).single()),
    result('upcoming sessions', database.from('bookings').select('id,name,starts_at,ends_at,questionnaire_completed_at,zoom_join_url').eq('status', 'confirmed').not('paid_at', 'is', null).gte('ends_at', timestamp).order('starts_at').limit(4)),
    result('session count', database.from('bookings').select('id', { count: 'exact', head: true }).eq('status', 'confirmed').not('paid_at', 'is', null).gte('ends_at', timestamp)),
    result('questionnaires', database.from('bookings').select('id', { count: 'exact', head: true }).eq('status', 'confirmed').not('paid_at', 'is', null).gte('ends_at', timestamp).is('questionnaire_completed_at', null)),
    result('refunded bookings', database.from('bookings').select('id', { count: 'exact', head: true }).eq('status', 'refunded').not('paid_at', 'is', null)),
    result('next salon appointment', database.from('appointments').select('id,client_name,starts_at,ends_at').eq('cancelled', false).gte('starts_at', timestamp).order('starts_at').limit(1)),
    result('appointment count', database.from('appointments').select('id', { count: 'exact', head: true }).eq('cancelled', false).gt('ends_at', today).lt('starts_at', tomorrow)),
    result('gallery count', database.from('gallery_images').select('id', { count: 'exact', head: true })),
    result('service count', database.from('services').select('id', { count: 'exact', head: true })),
    result('education sections', database.from('sections').select('id', { count: 'exact', head: true }).eq('type', 'education')),
    result('available times', database.rpc('booking_slots', { include_blocked: false })),
  ]);

  const data: DashboardSnapshot = {
    profile: { username: profile?.username ?? null, avatar_url: profile?.avatar_url ?? null, email: user.email ?? null },
    generatedAt: timestamp,
    enabled: settings?.data?.enabled ?? null,
    sync: sync?.data ?? null,
    syncMaxAge: settings?.data?.sync_max_age_minutes ?? 30,
    counts: {
      sessions: sessionCount?.count ?? null,
      questionnaires: questionnaireCount?.count ?? null,
      refunded: refundedCount?.count ?? null,
      appointments: appointmentCount?.count ?? null,
      images: images?.count ?? null,
      services: services?.count ?? null,
      sections: sections?.count ?? null,
    },
    sessions: sessions?.data ?? null,
    appointments: appointments?.data ?? null,
    nextSlot: slots?.data?.[0]?.starts_at ?? null,
    slotsLoaded: slots !== null,
    issues,
  };
  return <DashboardOverview data={data} />;
}