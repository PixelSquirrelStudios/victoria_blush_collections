import 'server-only';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

export function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

export function bookingDatabase() {
  return createSupabaseClient(requiredEnv('NEXT_PUBLIC_SUPABASE_URL'), process.env.SUPABASE_SECRET_KEY || requiredEnv('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function stripeClient() { return new Stripe(requiredEnv('STRIPE_SECRET_KEY')); }

export function siteUrl() {
  const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : '';
  return (process.env.APP_URL || vercelUrl || (process.env.NODE_ENV !== 'production' ? 'http://localhost:3000' : requiredEnv('APP_URL'))).replace(/\/$/, '');
}

export function checked<T>({ data, error }: { data: T; error: { message: string } | null }): T {
  if (error) throw new Error(error.message);
  return data;
}

export async function loadBookingSchedule(database = bookingDatabase()) {
  const [settings, availability, appointments, bookings, sync, jobs, slots, slotBlocks] = await Promise.all([
    database.from('booking_settings').select('*').single(),
    database.from('booking_availability').select('*').order('specific_date'),
    database.from('appointments').select('*').eq('cancelled', false).gte('ends_at', new Date().toISOString()).order('starts_at').limit(1000),
    database.from('bookings').select('*').not('paid_at', 'is', null).order('starts_at', { ascending: false }).limit(500),
    database.from('booking_sync_state').select('*').single(),
    database.from('booking_jobs').select('id,kind,last_error,attempts').is('completed_at', null).not('last_error', 'is', null),
    database.rpc('booking_slots', { include_blocked: true }),
    database.from('booking_slot_blocks').select('starts_at,ends_at').gte('ends_at', new Date().toISOString()).order('starts_at'),
  ]);
  return { settings: checked(settings), availability: checked(availability), appointments: checked(appointments), bookings: checked(bookings), sync: checked(sync), jobs: checked(jobs), slots: checked(slots), slotBlocks: checked(slotBlocks) };
}

export async function bookingIdentity() {
  const client = await createClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) return { user: null, admin: false, client: false };
  const profile = checked(await bookingDatabase().from('profiles').select('role').eq('id', user.id).single());
  const admin = profile?.role === 'admin';
  return { user, admin, client: !admin && (profile?.role === 'client' || user.app_metadata?.role === 'client') };
}

export async function requireBookingAdmin() {
  const identity = await bookingIdentity();
  if (!identity.admin) throw new Error('Administrator access required');
  return identity;
}

function signature(value: string) {
  return createHmac('sha256', process.env.BOOKING_TOKEN_SECRET || process.env.SUPABASE_SECRET_KEY || requiredEnv('SUPABASE_SERVICE_ROLE_KEY')).update(value).digest('hex');
}

export async function setBookingReceipt(id: string) {
  const value = `${id}.${Date.now() + 2 * 3_600_000}`;
  (await cookies()).set('shift_receipt', `${value}.${signature(value)}`, {
    httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 7200,
  });
}

export async function hasBookingReceipt(id: string) {
  const token = (await cookies()).get('shift_receipt')?.value;
  if (!token) return false;
  const [bookingId, expires, signed] = token.split('.');
  if (bookingId !== id || Number(expires) < Date.now() || !signed) return false;
  const expected = signature(`${bookingId}.${expires}`);
  return signed.length === expected.length && timingSafeEqual(Buffer.from(signed), Buffer.from(expected));
}

export async function accessibleBooking(id: string, allowReceipt = false) {
  const { user, admin } = await bookingIdentity();
  const booking = checked(await bookingDatabase().from('bookings').select('*').eq('id', id).single());
  if (!(admin || (user && booking.user_id === user.id) || (allowReceipt && await hasBookingReceipt(id)))) throw new Error('Please sign in to access this booking');
  return { booking, user, admin };
}

export function assertSameOrigin(request: Request) {
  const origin = request.headers.get('origin');
  if (!origin || (origin !== new URL(request.url).origin && origin !== new URL(siteUrl()).origin)) throw new Error('Invalid request origin');
}

export async function consumeBookingLimit(key: string, limit: number, seconds: number) {
  const allowed = checked(await bookingDatabase().rpc('booking_rate_limit', { bucket_key: signature(key), maximum: limit, window_seconds: seconds }));
  if (!allowed) throw new Error('Too many requests. Please try again later.');
}