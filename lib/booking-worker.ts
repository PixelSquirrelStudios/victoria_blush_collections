import 'server-only';
import { Resend } from 'resend';
import { bookingDatabase, checked, requiredEnv, siteUrl, stripeClient } from '@/lib/booking-server';
import { formatSessionDate, questionnaireFields } from '@/lib/booking-rules';
import { syncAppointmentCalendar } from '@/lib/booking-sync';
import { bookingEmailButton, escapeBookingHtml as escape, renderBookingEmail } from '@/lib/booking-email';

const victoria = 'hello@victoriablushcollections.co.uk';

async function email(to: string, subject: string, content: string, key: string) {
  const { error } = await new Resend(requiredEnv('RESEND_API_KEY')).emails.send({
    from: `Victoria Blush Collections <${victoria}>`, to, replyTo: victoria, subject,
    html: renderBookingEmail(subject, content, siteUrl()),
  }, { idempotencyKey: key });
  if (error) throw new Error('Email delivery failed');
}

async function magicLink(address: string, bookingId?: string) {
  const result = await bookingDatabase().auth.admin.generateLink({ type: 'magiclink', email: address });
  if (result.error) throw new Error('Could not generate sign-in link');
  return `${siteUrl()}/auth/booking?token_hash=${encodeURIComponent(result.data.properties.hashed_token)}${bookingId ? `&booking=${bookingId}` : ''}`;
}

export async function sendBookingLogin(address: string) {
  const database = bookingDatabase();
  const userId = checked(await database.rpc('booking_user_by_email', { address }));
  if (!userId) return;
  const link = await magicLink(address);
  await email(address, 'Your secure sign-in link', `${bookingEmailButton(link, 'Sign in to manage your bookings')}<p>This link expires in one hour and can only be used once. If you did not request it, you can ignore this email.</p>`, `login:${crypto.randomUUID()}`);
}

async function zoomRequest(path: string, method = 'GET', body?: unknown) {
  const tokenResponse = await fetch(`https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${encodeURIComponent(requiredEnv('ZOOM_ACCOUNT_ID'))}`, {
    method: 'POST', headers: { Authorization: `Basic ${Buffer.from(`${requiredEnv('ZOOM_CLIENT_ID')}:${requiredEnv('ZOOM_CLIENT_SECRET')}`).toString('base64')}` }, signal: AbortSignal.timeout(15000), cache: 'no-store',
  });
  if (!tokenResponse.ok) throw new Error('Zoom authentication failed');
  const token = await tokenResponse.json();
  const response = await fetch(`https://api.zoom.us/v2${path}`, { method, headers: { Authorization: `Bearer ${token.access_token}`, 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined, signal: AbortSignal.timeout(15000), cache: 'no-store' });
  if (method === 'DELETE' && response.status === 404) return null;
  if (!response.ok) throw new Error(`Zoom request failed (${response.status})`);
  return response.status === 204 ? null : response.json();
}

async function ensureZoom(booking: any) {
  const database = bookingDatabase();
  // Zoom only treats start_time as UTC when it ends in "Z"; "+00:00" is read as local time in `timezone`.
  const body = { topic: `The Shift Session | ${booking.id}`, type: 2, start_time: new Date(booking.starts_at).toISOString().replace(/\.\d{3}Z$/, 'Z'), duration: Math.round((Date.parse(booking.ends_at) - Date.parse(booking.starts_at)) / 60000), timezone: 'Europe/London', settings: { waiting_room: true, join_before_host: false, auto_recording: 'none', meeting_authentication: false } };
  if (booking.zoom_meeting_id) {
    await zoomRequest(`/meetings/${booking.zoom_meeting_id}`, 'PATCH', body);
    checked(await database.from('bookings').update({ zoom_synced_start: booking.starts_at }).eq('id', booking.id));
    return booking.zoom_join_url;
  }
  const host = encodeURIComponent(process.env.ZOOM_HOST_USER_ID || 'me');
  let nextPage = '';
  let existing: any;
  do {
    const result = await zoomRequest(`/users/${host}/meetings?type=scheduled&page_size=300&next_page_token=${encodeURIComponent(nextPage)}`);
    existing = result.meetings?.find((meeting: any) => meeting.topic === body.topic);
    nextPage = result.next_page_token || '';
  } while (nextPage && !existing);
  const meeting = existing ? await zoomRequest(`/meetings/${existing.id}`) : await zoomRequest(`/users/${host}/meetings`, 'POST', body);
  checked(await database.from('bookings').update({ zoom_meeting_id: String(meeting.id), zoom_join_url: meeting.join_url, zoom_synced_start: booking.starts_at }).eq('id', booking.id));
  return meeting.join_url as string;
}

async function queue(bookingId: string, kind: string) {
  checked(await bookingDatabase().from('booking_jobs').upsert({ booking_id: bookingId, kind, dedupe_key: `${bookingId}:${kind}` }, { onConflict: 'dedupe_key', ignoreDuplicates: true }));
}

// Idempotent: safe to run from the job worker and from the Stripe return route at the same time.
export async function provisionBookingAccount(booking: any) {
  const database = bookingDatabase();
  let userId = booking.user_id || checked(await database.rpc('booking_user_by_email', { address: booking.email }));
  let created = false;
  if (!userId) {
    const result = await database.auth.admin.createUser({ email: booking.email, email_confirm: false, user_metadata: { username: booking.name }, app_metadata: { role: 'client' } });
    if (result.error) {
      userId = checked(await database.rpc('booking_user_by_email', { address: booking.email }));
      if (!userId) throw new Error('Client account creation failed');
    } else { userId = result.data.user.id; created = true; }
  }
  checked(await database.from('booking_clients').upsert({ user_id: userId }, { onConflict: 'user_id', ignoreDuplicates: true }));
  const account = await database.auth.admin.getUserById(userId);
  if (account.error || !account.data.user?.email) throw new Error('Client account email unavailable');
  const accountEmail = account.data.user.email;
  if (created) checked(await database.from('profiles').upsert({ id: userId, email: accountEmail, role: 'client', username: booking.name, has_onboarded: true, avatar_url: '/assets/images/Default_Avatar.jpg' }, { onConflict: 'id' }));
  checked(await database.from('profiles').update({ email: accountEmail }).eq('id', userId));
  checked(await database.from('profiles').update({ role: 'client' }).eq('id', userId).eq('role', 'user'));
  checked(await database.from('bookings').update({ user_id: userId }).eq('id', booking.id));
  await queue(booking.id, 'customer_confirmed');
  await queue(booking.id, 'zoom');
  return account.data.user;
}

// Signs the current browser in without email delivery by redeeming a freshly generated magic-link token.
export async function bookingSignInToken(address: string) {
  const result = await bookingDatabase().auth.admin.generateLink({ type: 'magiclink', email: address });
  if (result.error) throw new Error('Could not generate sign-in link');
  return result.data.properties.hashed_token;
}

async function performJob(job: any) {
  const database = bookingDatabase();
  const booking = checked(await database.from('bookings').select('*').eq('id', job.booking_id).single());
  const details = `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:22px 0;border-left:3px solid #a7b69d;background-color:#f3f6f0"><tr><td style="padding:18px 20px;font-family:Arial,sans-serif;font-size:15px;line-height:1.8;overflow-wrap:anywhere"><strong>${escape(booking.name)}</strong><br>${escape(booking.email)}<br><span style="color:#52634f">Your session</span><br><strong>${escape(formatSessionDate(booking.starts_at))}</strong><br>UK time (Europe/London)<br>Paid: £${(booking.price_pence / 100).toFixed(2)}</td></tr></table>`;
  const manage = bookingEmailButton(`${siteUrl()}/dashboard/bookings`, 'Manage your booking');
  if (job.kind === 'refund') {
    if (!booking.payment_intent) throw new Error('Missing payment reference');
    const refund = await stripeClient().refunds.create({ payment_intent: booking.payment_intent }, { idempotencyKey: `${booking.id}:refund` });
    if (refund.status !== 'succeeded') throw new Error('Refund is awaiting Stripe confirmation');
    checked(await database.from('bookings').update({ status: 'refunded' }).eq('id', booking.id));
    if (booking.zoom_meeting_id) await zoomRequest(`/meetings/${booking.zoom_meeting_id}`, 'DELETE');
    await email(booking.email, 'Your Shift Session has been cancelled and refunded', `<p>Your session is cancelled and a full refund of £${(booking.price_pence / 100).toFixed(2)} has been issued to your original payment method. Your bank may take 5-10 working days to show it.</p>${details}`, `${job.id}:client`);
    await email(victoria, 'Shift Session cancelled and refunded', details, `${job.id}:admin`);
    return;
  }
  if (booking.status !== 'confirmed') return;
  if (job.kind === 'provision') {
    await provisionBookingAccount(booking);
  } else if (job.kind === 'customer_confirmed') {
    const link = await magicLink(booking.email, booking.id);
    await email(booking.email, 'Your Shift Session is confirmed', `<p>Your payment is confirmed. I look forward to speaking with you.</p>${details}${bookingEmailButton(link, 'Confirm email & open questionnaire')}<p>Your unique Zoom link will follow separately. You can cancel or reschedule until ${escape(formatSessionDate(new Date(Date.parse(booking.starts_at) - booking.cancellation_hours * 3600000).toISOString()))} (UK time). Eligible cancellations receive a full refund. Your statutory rights are unaffected.</p>`, job.id);
  } else if (job.kind === 'admin_booked') {
    await email(victoria, 'New paid Shift Session booking', `${details}${bookingEmailButton(`${siteUrl()}/dashboard/schedule`, 'View booking')}`, job.id);
  } else if (job.kind === 'rescheduled') {
    checked(await database.from('booking_jobs').upsert({ booking_id: booking.id, kind: 'zoom_rescheduled', dedupe_key: `${job.id}:zoom` }, { onConflict: 'dedupe_key', ignoreDuplicates: true }));
    await email(booking.email, 'Your Shift Session has been rescheduled', `<p>Your appointment has been rescheduled. Your updated session details are below.</p>${details}<p>Your Zoom details will follow separately.</p>${manage}`, `${job.id}:client`);
    await email(victoria, 'Shift Session rescheduled', `<p>This appointment has been rescheduled.</p>${details}${bookingEmailButton(`${siteUrl()}/dashboard/schedule`, 'View booking')}`, `${job.id}:admin`);
  } else if (job.kind === 'zoom' || job.kind === 'zoom_rescheduled') {
    const joinUrl = await ensureZoom(booking);
    await email(booking.email, job.kind === 'zoom' ? 'Your Shift Session Zoom link' : 'Your rescheduled Shift Session Zoom details', `${details}${bookingEmailButton(joinUrl, 'Join your Zoom session')}${manage}`, `${job.id}:client`);
  } else if (job.kind === 'questionnaire') {
    await email(victoria, 'Shift Session questionnaire received', `${details}${questionnaireFields.map(field => `<p><strong>${escape(field.label)}</strong><br>${escape(job.payload[field.key] || 'Not supplied').replace(/\n/g, '<br>')}</p>`).join('')}`, job.id);
  } else if (job.kind === 'reminder') {
    const remaining = Date.parse(booking.starts_at) - Date.now();
    if (remaining <= 0 || remaining > 86400000 || Date.parse(job.scheduled_for) !== Date.parse(booking.starts_at)) return;
    await email(booking.email, 'Your Shift Session is tomorrow', `${details}${booking.zoom_join_url ? `<p><a href="${escape(booking.zoom_join_url)}">Join your Zoom session</a></p>` : '<p>Your Zoom link is being prepared. Please contact Victoria if you have not received it before your session.</p>'}${!booking.questionnaire_completed_at ? '<p><strong>Please complete your questionnaire before we speak.</strong></p>' : ''}${manage}<p><a href="${siteUrl()}/booking/login">Request a fresh sign-in link</a></p>`, job.id);
  } else if (job.kind === 'conflict') {
    await email(victoria, 'Action needed: Ovatu appointment overlaps a Shift Session', `${details}<p>An imported appointment now clashes with this paid session. Please contact the client and resolve the conflict. Their booking has not been cancelled automatically.</p><p><a href="${siteUrl()}/dashboard/schedule">Review schedule</a></p>`, job.id);
  }
}

export async function processBookingJobs() {
  const database = bookingDatabase();
  const jobs = checked(await database.rpc('claim_booking_jobs')) || [];
  let completed = 0;
  for (const job of jobs) {
    try {
      await performJob(job);
      checked(await database.from('booking_jobs').update({ completed_at: new Date().toISOString(), locked_until: null, last_error: null }).eq('id', job.id));
      completed++;
    } catch {
      checked(await database.from('booking_jobs').update({ locked_until: null, last_error: `Could not complete ${job.kind}. Check provider configuration and retry.`, available_at: new Date(Date.now() + Math.min(60, 2 ** Math.min(job.attempts, 6)) * 60000).toISOString() }).eq('id', job.id));
    }
  }
  return { claimed: jobs.length, completed };
}

export async function syncAppointments() {
  return syncAppointmentCalendar(bookingDatabase(), requiredEnv('OVATU_ICAL_URL'));
}