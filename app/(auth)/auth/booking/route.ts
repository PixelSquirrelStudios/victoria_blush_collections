import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { siteUrl } from '@/lib/booking-server';

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const hash = params.get('token_hash');
  if (hash) {
    const client = await createClient();
    const { error } = await client.auth.verifyOtp({ token_hash: hash, type: 'magiclink' });
    if (!error) {
      const booking = params.get('booking');
      const destination = booking && /^[0-9a-f-]{36}$/i.test(booking) ? `/dashboard/questionnaire?id=${booking}` : '/dashboard/bookings';
      return NextResponse.redirect(`${siteUrl()}${destination}`, { headers: { 'Referrer-Policy': 'no-referrer' } });
    }
  }
  return NextResponse.redirect(`${siteUrl()}/booking/login?expired=1`);
}