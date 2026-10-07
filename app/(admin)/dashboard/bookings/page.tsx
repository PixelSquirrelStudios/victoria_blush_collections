import { redirect } from 'next/navigation';
import { bookingDatabase, bookingIdentity, checked } from '@/lib/booking-server';
import ClientBookings from '@/components/booking/ClientBookings';
import { fetchUserData } from '@/app/hooks/useUser';

export default async function BookingsPage() {
  const { user, admin, client } = await bookingIdentity();
  if (!user) redirect('/booking/login');
  if (admin) redirect('/dashboard/schedule?view=bookings');
  if (!client) redirect('/');
  const { profile } = await fetchUserData();
  const initialBookings = checked(await bookingDatabase().from('bookings').select('id,status,starts_at,ends_at,cancellation_hours,questionnaire_completed_at,price_pence,zoom_join_url').eq('user_id', user.id).not('paid_at', 'is', null).order('starts_at', { ascending: false })) ?? [];
  const initialNow = Date.now();
  return <ClientBookings name={profile?.username || user.user_metadata?.username || ''} avatarUrl={profile?.avatar_url} initialBookings={initialBookings} initialNow={initialNow} />;
}