import { after, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { bookingDatabase, bookingIdentity, checked, hasBookingReceipt, siteUrl, stripeClient } from '@/lib/booking-server';
import { bookingSignInToken, processBookingJobs, provisionBookingAccount } from '@/lib/booking-worker';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const go = (path: string) => NextResponse.redirect(`${siteUrl()}${path}`, { headers: { 'Referrer-Policy': 'no-referrer', 'Cache-Control': 'no-store' } });

// Stripe Checkout returns here. Confirms the payment directly with Stripe (so the buyer doesn't wait
// for the webhook and job worker), creates the client account and signs the paying browser in.
export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get('id') || '';
  if (!/^[0-9a-f-]{36}$/i.test(id)) return go('/');
  const fallback = `/booking/confirmed?id=${id}`;
  try {
    const database = bookingDatabase();
    const [{ user }, receipt] = await Promise.all([bookingIdentity(), hasBookingReceipt(id)]);
    let booking = checked(await database.from('bookings').select('*').eq('id', id).single());
    if (!receipt && !(user && booking.user_id === user.id)) return go(fallback);

    if (booking.status === 'held' && booking.stripe_session_id) {
      const session = await stripeClient().checkout.sessions.retrieve(booking.stripe_session_id);
      if (session.payment_status === 'paid' && session.metadata?.booking_id === id && session.currency === 'gbp' && typeof session.payment_intent === 'string') {
        checked(await database.rpc('confirm_booking', { booking_uuid: id, session_id: session.id, intent_id: session.payment_intent, amount: session.amount_total }));
        booking = checked(await database.from('bookings').select('*').eq('id', id).single());
      }
    }
    if (booking.status !== 'confirmed') return go(fallback);

    const account = await provisionBookingAccount(booking);
    // Send confirmation emails and create the Zoom meeting now rather than waiting for the next cron run.
    after(() => processBookingJobs().catch(error => console.error('Booking jobs could not run:', error instanceof Error ? error.message : 'Unknown error')));
    if (user) return go(user.id === account.id ? '/dashboard/bookings' : fallback);

    // Only sign in automatically when the account was created for this booking. Paying with the email
    // of an existing account must not grant access to it; those clients sign in as usual.
    if (!receipt || !account.email || Date.parse(account.created_at) < Date.parse(booking.created_at)) return go(fallback);
    const { error } = await (await createClient()).auth.verifyOtp({ token_hash: await bookingSignInToken(account.email), type: 'magiclink' });
    return go(error ? fallback : '/dashboard/bookings');
  } catch (error) {
    console.error('Booking return could not complete:', error instanceof Error ? error.message : 'Unknown error');
    return go(fallback);
  }
}
