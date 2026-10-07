import { NextResponse } from 'next/server';
import { z } from 'zod';
import { accessibleBooking, assertSameOrigin, bookingDatabase, bookingIdentity, checked, consumeBookingLimit, loadBookingSchedule, requireBookingAdmin, requiredEnv, setBookingReceipt, siteUrl, stripeClient } from '@/lib/booking-server';
import { canAccessQuestionnaire, canViewQuestionnaire, occupations, questionnaireFields } from '@/lib/booking-rules';
import { sendBookingLogin } from '@/lib/booking-worker';
import { resolveBookingPrice } from '@/lib/booking-stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const uuid = z.string().uuid();

export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams;
    const database = bookingDatabase();
    if (params.has('id')) {
      const { booking, user } = await accessibleBooking(uuid.parse(params.get('id')), true);
      const questionnaireAllowed = canViewQuestionnaire(booking, user);
      const visibleBooking = questionnaireAllowed ? booking : { id: booking.id, status: booking.status, starts_at: booking.starts_at, user_id: booking.user_id ? 'pending-verification' : null };
      return NextResponse.json({ booking: visibleBooking, questionnaireAllowed }, { headers: { 'Cache-Control': 'no-store' } });
    }
    if (params.get('view') === 'mine') {
      const { user } = await bookingIdentity();
      if (!user) return NextResponse.json({ error: 'Please sign in' }, { status: 401 });
      return NextResponse.json({ bookings: checked(await database.from('bookings').select('id,status,starts_at,ends_at,cancellation_hours,questionnaire_completed_at,price_pence,zoom_join_url').eq('user_id', user.id).not('paid_at', 'is', null).order('starts_at', { ascending: false })) }, { headers: { 'Cache-Control': 'no-store' } });
    }
    if (params.get('view') === 'admin') {
      const { user, admin } = await bookingIdentity();
      if (!user) return NextResponse.json({ error: 'Your session has expired. Please sign in again to load the schedule.' }, { status: 401 });
      if (!admin) return NextResponse.json({ error: 'An admin account is required to view the schedule.' }, { status: 403 });
      return NextResponse.json(await loadBookingSchedule(database), { headers: { 'Cache-Control': 'no-store' } });
    }
    const settings = checked(await database.from('booking_settings').select('enabled,price_pence,duration_minutes,buffer_minutes,notice_hours,horizon_days,cancellation_hours,timezone').single());
    const slots = checked(await database.rpc('booking_slots', { include_blocked: false }));
    const { user } = await bookingIdentity();
    return NextResponse.json({ settings, slots, user: user ? { email: user.email, name: user.user_metadata?.username || '' } : null }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Unable to load booking information:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Booking information is unavailable. Please try again or contact Victoria.' }, { status: 503 });
  }
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    if (Number(request.headers.get('content-length') || 0) > 40000) throw new Error('Request too large');
    const body = await request.json();
    const database = bookingDatabase();
    if (body.action === 'checkout') {
      const input = z.object({ starts_at: z.iso.datetime({ offset: true }), name: z.string().trim().min(2).max(150), email: z.email().max(254), terms: z.literal(true), early_start: z.literal(true) }).parse(body);
      const { user } = await bookingIdentity();
      if (user && user.email?.toLowerCase() !== input.email.toLowerCase()) throw new Error('Please use the email address on your signed-in account.');
      await consumeBookingLimit(`checkout:${input.email.toLowerCase()}`, 5, 3600);
      const booking = checked(await database.rpc('reserve_booking', { slot_start: input.starts_at, customer_name: input.name, customer_email: input.email, customer_id: user?.id || null, early_start: input.early_start }));
      try {
        const stripe = stripeClient();
        const price = await resolveBookingPrice(stripe, requiredEnv('STRIPE_SHIFT_SESSION_PRODUCT_ID'), requiredEnv('STRIPE_SHIFT_SESSION_PRICE_ID'), booking.price_pence);
        const session = await stripe.checkout.sessions.create({
          mode: 'payment', payment_method_types: ['card'], customer_email: input.email,
          client_reference_id: booking.id, metadata: { booking_id: booking.id },
          line_items: [{ price, quantity: 1 }],
          expires_at: Math.floor(Date.now() / 1000) + 1800,
          success_url: `${siteUrl()}/auth/booking/complete?id=${booking.id}`,
          cancel_url: `${siteUrl()}/education?checkout=cancelled#shift-session`,
        }, { idempotencyKey: `checkout:${booking.id}` });
        checked(await database.from('bookings').update({ stripe_session_id: session.id }).eq('id', booking.id));
        await setBookingReceipt(booking.id);
        return NextResponse.json({ url: session.url });
      } catch (error) {
        throw error;
      }
    }
    if (body.action === 'login') {
      const email = z.email().max(254).parse(body.email).toLowerCase();
      await consumeBookingLimit(`login:${email}`, 1, 60);
      await consumeBookingLimit('login:global', 100, 3600);
      await sendBookingLogin(email);
      return NextResponse.json({ message: 'If you have a booking account, a sign-in link is on its way. Check your inbox.' });
    }
    if (body.action === 'cancel' || body.action === 'reschedule') {
      const { user } = await bookingIdentity();
      if (!user) throw new Error('Please sign in to manage your booking');
      checked(await database.rpc('manage_booking', { booking_uuid: uuid.parse(body.id), actor_id: user.id, operation: body.action, new_start: body.action === 'reschedule' ? z.iso.datetime({ offset: true }).parse(body.starts_at) : null }));
      return NextResponse.json({ message: body.action === 'cancel' ? 'Booking cancelled. Your full refund is being processed.' : 'Your booking has been rescheduled.' });
    }
    if (body.action === 'questionnaire') {
      const { booking, user } = await accessibleBooking(uuid.parse(body.id));
      if (!canAccessQuestionnaire(booking, user)) return NextResponse.json({ error: 'Confirm your email using the link in your booking email before completing your questionnaire.' }, { status: 403 });
      const answers = z.record(z.string(), z.string().max(3000)).parse(body.answers);
      const complete = z.boolean().parse(body.complete);
      for (const key of Object.keys(answers)) if (!questionnaireFields.some(field => field.key === key)) throw new Error('Unknown questionnaire field');
      if (complete) {
        for (const field of questionnaireFields) if (field.required && !answers[field.key]?.trim()) throw new Error(`Please complete: ${field.label}`);
        z.email().parse(answers.email);
        if (!occupations.includes(answers.occupation)) throw new Error('Please select your occupation');
      }
      if (!booking.user_id) throw new Error('Your account is still being prepared. Please try again shortly.');
      checked(await database.rpc('submit_booking_questionnaire', { booking_uuid: booking.id, actor_id: booking.user_id, answers, complete }));
      return NextResponse.json({ message: complete ? 'Thank you. Your answers have been submitted to Victoria.' : 'Draft saved.' });
    }
    await requireBookingAdmin();
    if (body.action === 'booking_enabled') {
      const enabled = z.boolean().parse(body.enabled);
      checked(await database.from('booking_settings').update({ enabled }).eq('id', 1));
      return NextResponse.json({ message: enabled ? 'Online bookings opened.' : 'Online bookings paused.' });
    }
    if (body.action === 'settings') {
      const settings = z.object({ enabled: z.boolean(), price_pence: z.number().int().min(50).max(1000000), duration_minutes: z.number().int().min(15).max(240), buffer_minutes: z.number().int().min(0).max(120), notice_hours: z.number().int().min(0).max(2160), horizon_days: z.number().int().min(1).max(90), cancellation_hours: z.number().int().min(0).max(2160), sync_max_age_minutes: z.number().int().min(5).max(120) }).parse(body.settings);
      if (settings.notice_hours % 24 !== 0) throw new Error('Minimum days ahead must be a whole number of days.');
      if (settings.notice_hours >= settings.horizon_days * 24) throw new Error('Clients must be able to book further ahead than the minimum notice period allows. Increase how far ahead clients can book or reduce the minimum notice.');
      try {
        const stripe = stripeClient();
        const productId = requiredEnv('STRIPE_SHIFT_SESSION_PRODUCT_ID');
        const priceId = await resolveBookingPrice(stripe, productId, requiredEnv('STRIPE_SHIFT_SESSION_PRICE_ID'), settings.price_pence);
        await stripe.products.update(productId, { default_price: priceId });
      } catch {
        return NextResponse.json({ error: 'Settings were not saved because the price could not be synced with Stripe. Check your Stripe configuration and try again.' }, { status: 502 });
      }
      checked(await database.from('booking_settings').update(settings).eq('id', 1));
      return NextResponse.json({ message: 'Settings saved and price synced with Stripe.' });
    } else if (body.action === 'slot_block') {
      const input = z.object({ starts_at: z.iso.datetime({ offset: true }), blocked: z.boolean() }).parse(body);
      checked(await database.rpc('set_booking_slot_block', { slot_start: input.starts_at, blocked: input.blocked }));
      return NextResponse.json({ message: input.blocked ? 'Slot blocked.' : 'Slot restored, subject to availability and appointment conflicts.' });
    } else if (body.action === 'weekly_day') {
      const input = z.object({ weekday: z.number().int().min(0).max(6), closed: z.boolean() }).parse(body);
      const rules = checked(await database.from('booking_availability').update({ unavailable: input.closed }).eq('weekday', input.weekday).select('id'));
      if (!input.closed && !rules?.length) checked(await database.from('booking_availability').insert({ weekday: input.weekday, specific_date: null, start_time: '09:00', end_time: '17:00', unavailable: false }));
    } else if (body.action === 'update_weekly_time') {
      const input = z.object({ id: uuid, start_time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/), end_time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/) }).parse(body);
      if (input.start_time >= input.end_time) throw new Error('The end time must be after the start time.');
      checked(await database.from('booking_availability').update({ start_time: input.start_time, end_time: input.end_time }).eq('id', input.id).not('weekday', 'is', null).select('id').single());
    } else if (body.action === 'update_date_time') {
      const input = z.object({ id: uuid, start_time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/), end_time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/), unavailable: z.boolean() }).parse(body);
      if (input.start_time >= input.end_time) throw new Error('The end time must be after the start time.');
      checked(await database.from('booking_availability').update({ start_time: input.unavailable ? '00:00' : input.start_time, end_time: input.unavailable ? '23:59' : input.end_time, unavailable: input.unavailable }).eq('id', input.id).not('specific_date', 'is', null).select('id').single());
    } else if (body.action === 'availability') {
      const rule = z.object({ weekday: z.number().int().min(0).max(6).nullable(), specific_date: z.iso.date().nullable(), start_time: z.string().regex(/^\d{2}:\d{2}$/), end_time: z.string().regex(/^\d{2}:\d{2}$/), unavailable: z.boolean() }).parse(body.rule);
      if ((rule.weekday === null) === (rule.specific_date === null) || rule.start_time >= rule.end_time) throw new Error('Choose a day and a valid time range.');
      checked(await database.from('booking_availability').insert(rule));
    } else if (body.action === 'delete_availability') {
      checked(await database.from('booking_availability').delete().eq('id', uuid.parse(body.id)));
    } else if (body.action === 'retry_job') {
      checked(await database.from('booking_jobs').update({ available_at: new Date().toISOString(), last_error: null }).eq('id', uuid.parse(body.id)).is('completed_at', null));
    } else throw new Error('Unknown action');
    return NextResponse.json({ message: 'Saved.' });
  } catch (error) {
    const message = error instanceof z.ZodError ? 'Please check the form fields and required agreements.' : error instanceof Error ? error.message : 'Unable to complete your request';
    const safe = /Missing |relation |column |permission denied|API Key|Invalid API|fetch failed/i.test(message) ? 'Booking services need attention. Please contact Victoria.' : message;
    return NextResponse.json({ error: safe }, { status: 400 });
  }
}