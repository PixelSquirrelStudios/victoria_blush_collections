import { after, NextResponse } from 'next/server';
import { bookingDatabase, checked, requiredEnv, stripeClient } from '@/lib/booking-server';
import { processBookingJobs } from '@/lib/booking-worker';

export const runtime = 'nodejs';
export const maxDuration = 60;
export async function POST(request: Request) {
  let event;
  try {
    event = stripeClient().webhooks.constructEvent(await request.text(), request.headers.get('stripe-signature') || '', requiredEnv('STRIPE_WEBHOOK_SECRET'));
  } catch { return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 }); }
  try {
    if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
      const session = event.data.object;
      if (session.payment_status === 'paid' && session.metadata?.booking_id) {
        if (session.currency !== 'gbp' || typeof session.payment_intent !== 'string') throw new Error('Unexpected payment');
        checked(await bookingDatabase().rpc('confirm_booking', { booking_uuid: session.metadata.booking_id, session_id: session.id, intent_id: session.payment_intent, amount: session.amount_total }));
        after(() => processBookingJobs().catch(error => console.error('Booking jobs could not run:', error instanceof Error ? error.message : 'Unknown error')));
      }
    }
    return NextResponse.json({ received: true });
  } catch { return NextResponse.json({ error: 'Payment processing will be retried' }, { status: 500 }); }
}