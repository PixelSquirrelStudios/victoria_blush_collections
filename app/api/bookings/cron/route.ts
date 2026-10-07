import { NextResponse } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import { requiredEnv } from '@/lib/booking-server';
import { processBookingJobs, syncAppointments } from '@/lib/booking-worker';

export const runtime = 'nodejs';
export const maxDuration = 120;
export async function POST(request: Request) {
  const expected = `Bearer ${requiredEnv('BOOKING_CRON_SECRET')}`;
  const provided = request.headers.get('authorization') || '';
  if (provided.length !== expected.length || !timingSafeEqual(Buffer.from(provided), Buffer.from(expected))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const result = new URL(request.url).searchParams.get('task') === 'sync' ? await syncAppointments() : await processBookingJobs();
    return NextResponse.json(result);
  } catch { return NextResponse.json({ error: 'Scheduled task failed' }, { status: 500 }); }
}