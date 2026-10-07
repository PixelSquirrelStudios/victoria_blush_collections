import { redirect } from 'next/navigation';
import { bookingIdentity, loadBookingSchedule } from '@/lib/booking-server';
import ScheduleManager from '@/components/booking/ScheduleManager';

export default async function SchedulePage({ searchParams }: { searchParams: Promise<{ view?: string; date?: string | string[]; filter?: string | string[]; booking?: string | string[]; appointment?: string | string[] }> }) {
  const { admin } = await bookingIdentity();
  if (!admin) redirect('/dashboard/bookings');
  const { view, date, filter, booking, appointment } = await searchParams;
  const initialAppointmentId = typeof appointment === 'string' ? appointment : '';
  const initialBookingId = typeof booking === 'string' ? booking : '';
  const initialFilter = initialBookingId || filter === 'all' ? 'all' : filter === 'paid' ? 'paid' : filter === 'refunded' ? 'refunded' : filter === 'incomplete' ? 'incomplete' : 'upcoming';
  const initialData = await loadBookingSchedule();
  return <div className="w-full p-3 md:p-6"><ScheduleManager key={`${view}:${initialFilter}:${initialBookingId}:${initialAppointmentId}`} initialAppointmentId={initialAppointmentId} initialFilter={initialFilter} initialBookingId={initialBookingId} initialData={initialData} initialDate={typeof date === 'string' ? date : undefined} initialView={view === 'appointments' ? 'Appointments' : view === 'bookings' ? 'Bookings' : view === 'weekly' ? 'Weekly Hours' : view === 'settings' ? 'Settings' : 'Availability'} /></div>;
}