import BookingQuestionnaire from '@/components/booking/BookingQuestionnaire';
import { cormorant } from '@/app/fonts';
import { notFound, redirect } from 'next/navigation';
import { bookingIdentity } from '@/lib/booking-server';

export const metadata = { title: 'Your Shift Session | Victoria Blush Collections', robots: { index: false, follow: false } };
export default async function ConfirmedBooking({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams;
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { user, admin, client } = await bookingIdentity();
  if (user && (admin || client)) redirect(`/dashboard/questionnaire?id=${id}`);
  return <section className="mx-auto max-w-3xl px-4 pt-32 pb-20"><h1 className={`${cormorant.className} text-4xl mb-8`}>Your Shift Session</h1><BookingQuestionnaire id={id} /></section>;
}