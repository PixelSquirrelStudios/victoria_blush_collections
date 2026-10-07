import assert from 'node:assert/strict';
import { test } from 'node:test';
import { existsSync, readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { stripTypeScriptTypes } from 'node:module';
import { bookingEmailButton, bookingLogoUrl, escapeBookingHtml, renderBookingEmail } from '../lib/booking-email.ts';
import { parseAppointmentCalendar } from '../lib/booking-calendar.ts';
import { bookingDefaults, bookingNoticeStart, overlapsWithBuffer, withinBookingWindow, canManageBooking, canAccessQuestionnaire, canViewQuestionnaire, questionnaireFields, customerBookingTimes, clientBookingState } from '../lib/booking-rules.ts';
import { resolveBookingPrice } from '../lib/booking-stripe.ts';
import { z } from 'zod';
import { isSidebarLinkActive } from '../lib/sidebar-navigation.ts';
import { DateTime } from 'luxon';

test('client profile email repair fills only blank linked client profiles and is repeatable', async () => {
  const database = new PGlite();
  try {
    await database.exec(`CREATE SCHEMA auth; CREATE TABLE auth.users (id text PRIMARY KEY, email text);
      CREATE TABLE profiles (id text PRIMARY KEY, email text, role text);
      CREATE TABLE booking_clients (user_id text PRIMARY KEY);
      INSERT INTO auth.users VALUES ('new','new@example.test'),('existing','auth@example.test'),('other','other@example.test'),('linked','linked@example.test');
      INSERT INTO profiles VALUES ('new',NULL,'client'),('existing','keep@example.test','client'),('other',NULL,'admin'),('linked','  ','user');
      INSERT INTO booking_clients VALUES ('linked');`);
    const migration = readFileSync(new URL('./booking-profile-emails.sql', import.meta.url), 'utf8');
    await database.exec(migration);
    await database.exec(migration);
    assert.deepEqual((await database.query('SELECT * FROM profiles ORDER BY id')).rows, [
      { id: 'existing', email: 'keep@example.test', role: 'client' },
      { id: 'linked', email: 'linked@example.test', role: 'user' },
      { id: 'new', email: 'new@example.test', role: 'client' },
      { id: 'other', email: null, role: 'admin' },
    ]);
  } finally { await database.close(); }
});

test('client bookings API restricts history to its owner and returns only dashboard fields', async () => {
  const source = readFileSync(new URL('../app/api/bookings/route.ts', import.meta.url), 'utf8');
  const body = source.slice(source.indexOf('export async function GET'), source.indexOf('export async function POST')).replace('export ', '');
  const operations = [];
  const query = {};
  for (const method of ['select', 'eq', 'not', 'order']) query[method] = (...args) => { operations.push([method, ...args]); return query; };
  query.then = resolve => resolve({ data: [] });
  const database = { from: table => { assert.equal(table, 'bookings'); return query; } };
  const load = new Function('bookingDatabase', 'bookingIdentity', 'checked', 'NextResponse', `${stripTypeScriptTypes(body)};return GET;`);
  for (const user of [null, { id: 'owner-id' }]) {
    operations.length = 0;
    const get = load(() => database, async () => ({ user }), result => result.data, { json: (data, options) => ({ data, options }) });
    const result = await get(new Request('http://localhost/api/bookings?view=mine'));
    if (!user) { assert.equal(result.options.status, 401); assert.equal(operations.length, 0); continue; }
    assert.ok(operations.some(operation => operation[0] === 'eq' && operation[1] === 'user_id' && operation[2] === user.id));
    assert.ok(operations.some(operation => operation[0] === 'not' && operation[1] === 'paid_at'));
    assert.equal(result.options.headers['Cache-Control'], 'no-store');
    const fields = operations.find(operation => operation[0] === 'select')[1];
    assert.ok(!fields.includes('*') && !fields.includes('payment_intent') && !fields.includes('questionnaire,'));
  }
});

test('client dashboard loads owner bookings before rendering without initial count placeholders', async () => {
  const source = readFileSync(new URL('../app/(admin)/dashboard/bookings/page.tsx', import.meta.url), 'utf8');
  const body = source.slice(source.indexOf('  const { user'), source.indexOf('  return <ClientBookings'));
  const bookings = [{ id: 'paid-booking', status: 'confirmed' }];
  const operations = [];
  let identity = { user: { id: 'owner-id' }, admin: false, client: true };
  let databaseError = null;
  const query = {};
  for (const method of ['select', 'eq', 'not', 'order']) query[method] = (...args) => { operations.push([method, ...args]); return query; };
  query.then = resolve => resolve({ data: bookings, error: databaseError });
  const page = new Function('bookingIdentity', 'redirect', 'fetchUserData', 'bookingDatabase', 'checked', `return async function() { ${body}; return { initialBookings, initialNow }; };`)(
    async () => identity,
    location => { throw new Error(`Redirect: ${location}`); },
    async () => ({ profile: {} }),
    () => ({ from: table => { assert.equal(table, 'bookings'); return query; } }),
    result => { if (result.error) throw result.error; return result.data; },
  );
  const result = await page();
  assert.equal(result.initialBookings, bookings);
  assert.equal(typeof result.initialNow, 'number');
  assert.ok(operations.some(operation => JSON.stringify(operation) === JSON.stringify(['eq', 'user_id', 'owner-id'])));
  assert.ok(operations.some(operation => JSON.stringify(operation) === JSON.stringify(['not', 'paid_at', 'is', null])));
  const api = readFileSync(new URL('../app/api/bookings/route.ts', import.meta.url), 'utf8');
  assert.equal(operations.find(operation => operation[0] === 'select')[1], api.match(/select\('(id,status,[^']+)'\)/)[1]);
  assert.ok(source.includes('initialBookings={initialBookings} initialNow={initialNow}'));
  databaseError = new Error('Unavailable');
  await assert.rejects(page, /Unavailable/);
  for (const denied of [{ user: null }, { user: { id: 'admin' }, admin: true }, { user: { id: 'other' }, client: false }]) {
    identity = denied;
    operations.length = 0;
    await assert.rejects(page, /Redirect:/);
    assert.equal(operations.length, 0);
  }
  const client = readFileSync(new URL('../components/booking/ClientBookings.tsx', import.meta.url), 'utf8');
  assert.ok(client.includes('useState<ClientBooking[]>(initialBookings)'));
  assert.ok(client.includes('useState(initialNow)'));
  assert.ok(client.includes('const [loading, setLoading] = useState(false)'));
  assert.ok(client.includes('if (refresh === 0) return;'));
  assert.ok(!client.includes('clientCountPlaceholder') && !client.includes('initialLoading'));
  assert.match(client, /clientMetricValue\}`\}>\{count\}<\/strong>/);
  assert.ok(client.includes('!shown.length && <div className={styles.clientEmpty}'));
});

test('client avatar image editor ignores missing files during crop and upload events', async () => {
  const { default: ImageEditor } = await import('@uppy/image-editor');
  const source = readFileSync(new URL('../components/shared/Uploader.tsx', import.meta.url), 'utf8');
  const editorSource = source.slice(source.indexOf('class AvatarImageEditor'), source.indexOf('interface Props'));
  const Editor = new Function('ImageEditor', `${stripTypeScriptTypes(editorSource)};return AvatarImageEditor;`)(ImageEditor);
  const canEdit = file => Editor.prototype.canEditFile.call({}, file);
  assert.equal(canEdit(undefined), false);
  assert.equal(canEdit(null), false);
  assert.equal(canEdit({ type: 'image/jpeg', isRemote: false }), true);
  assert.equal(canEdit({ type: 'image/png', isRemote: false }), true);
  assert.equal(canEdit({ type: 'image/webp', isRemote: false }), true);
  assert.equal(canEdit({ type: 'video/mp4', isRemote: false }), false);
  assert.equal(canEdit({ type: 'image/jpeg', isRemote: true }), false);
  assert.ok(source.includes('uploader.use(AvatarImageEditor,'));
});

test('client avatar storage permits only deletes from the signed-in users own avatar folder', async () => {
  const database = new PGlite();
  try {
    await database.exec(`CREATE ROLE authenticated;
      CREATE SCHEMA auth; CREATE SCHEMA storage;
      CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$ SELECT current_setting('test.uid')::uuid $$;
      CREATE FUNCTION public.is_booking_admin() RETURNS boolean LANGUAGE sql AS $$ SELECT false $$;
      CREATE TABLE storage.objects (bucket_id text, name text);
      ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
      GRANT USAGE ON SCHEMA auth, storage TO authenticated;
      GRANT SELECT, DELETE ON storage.objects TO authenticated;`);
    const migration = readFileSync(new URL('./booking-client-avatars.sql', import.meta.url), 'utf8');
    await database.exec(migration);
    await database.exec(migration);
    const id = '11111111-1111-4111-8111-111111111111';
    const paths = [`avatars/${id}/photo.jpg`, 'avatars/other/photo.jpg', `gallery/${id}/photo.jpg`, `avatars/${id}/nested/photo.jpg`];
    for (const path of paths) await database.query('INSERT INTO storage.objects VALUES ($1,$2)', ['images', path]);
    await database.query('INSERT INTO storage.objects VALUES ($1,$2)', ['private', `avatars/${id}/photo.jpg`]);
    await database.exec(`SET ROLE authenticated; SET test.uid = '${id}';`);
    const deleted = await database.query('DELETE FROM storage.objects RETURNING bucket_id, name');
    assert.deepEqual(deleted.rows, [{ bucket_id: 'images', name: `avatars/${id}/photo.jpg` }]);
    await database.exec('RESET ROLE');
    assert.equal((await database.query('SELECT count(*)::int AS n FROM storage.objects')).rows[0].n, 4);
  } finally { await database.close(); }
});

test('client avatar storage permits only uploads to the signed-in users own avatar folder', async () => {
  const database = new PGlite();
  try {
    await database.exec(`CREATE ROLE authenticated;
      CREATE SCHEMA auth; CREATE SCHEMA storage;
      CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$ SELECT current_setting('test.uid')::uuid $$;
      CREATE FUNCTION public.is_booking_admin() RETURNS boolean LANGUAGE sql AS $$ SELECT false $$;
      CREATE TABLE storage.objects (bucket_id text, name text);
      ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
      GRANT USAGE ON SCHEMA auth, storage TO authenticated;
      GRANT INSERT ON storage.objects TO authenticated;
      CREATE POLICY existing_upload ON storage.objects FOR INSERT TO authenticated WITH CHECK (true);`);
    const migration = readFileSync(new URL('./booking-client-avatars.sql', import.meta.url), 'utf8');
    await database.exec(migration);
    await database.exec(migration);
    const id = '11111111-1111-4111-8111-111111111111';
    await database.exec(`SET ROLE authenticated; SET test.uid = '${id}';`);
    await database.query('INSERT INTO storage.objects VALUES ($1,$2)', ['images', `avatars/${id}/photo.jpg`]);
    for (const [bucket, path] of [['images', 'avatars/other/photo.jpg'], ['images', `gallery/${id}/photo.jpg`], ['private', `avatars/${id}/photo.jpg`], ['images', `avatars/${id}/nested/photo.jpg`], ['images', `avatars/${id}/`]]) {
      await assert.rejects(database.query('INSERT INTO storage.objects VALUES ($1,$2)', [bucket, path]));
    }
  } finally { await database.close(); }
});

test('client avatar action only updates the authenticated profiles avatar and reports failures', async () => {
  const source = readFileSync(new URL('../lib/actions/user.actions.ts', import.meta.url), 'utf8');
  const body = stripTypeScriptTypes(source.slice(source.indexOf('export async function updateOwnAvatar'), source.indexOf('export async function updateUser'))).replace('export ', '');
  let user = { id: 'client-id' };
  let databaseError = null;
  const writes = [];
  const refreshed = [];
  const query = { update: values => { writes.push(values); return query; }, eq: (key, value) => { assert.equal(key, 'id'); assert.equal(value, 'client-id'); return query; }, select: () => query, single: async () => ({ error: databaseError }) };
  const action = new Function('createClient', 'revalidatePath', `${body};return updateOwnAvatar;`)(async () => ({ auth: { getUser: async () => ({ data: { user }, error: null }) }, storage: { from: () => ({ getPublicUrl: path => ({ data: { publicUrl: `https://example.test/${path}` } }) }) }, from: table => { assert.equal(table, 'profiles'); return query; } }), (...args) => refreshed.push(args));
  for (const path of ['avatars/another/photo.jpg', 'gallery/client-id/photo.jpg', 'avatars/client-id/../photo.jpg', 'https://untrusted.test/image.jpg']) assert.ok((await action(path)).error);
  assert.equal(writes.length, 0);
  assert.equal((await action('avatars/client-id/photo.jpg')).error, null);
  assert.deepEqual(writes[0], { avatar_url: 'https://example.test/avatars/client-id/photo.jpg' });
  assert.deepEqual(refreshed[0], ['/dashboard', 'layout']);
  assert.equal((await action(null)).error, null);
  assert.deepEqual(writes[1], { avatar_url: null });
  databaseError = new Error('Denied');
  assert.ok((await action(null)).error);
  const count = writes.length;
  user = null;
  assert.ok((await action(null)).error);
  assert.equal(writes.length, count);
});

test('client questionnaire middleware allows clients through without granting admin routes', async () => {
  const source = readFileSync(new URL('../lib/supabase/middleware.ts', import.meta.url), 'utf8');
  const body = stripTypeScriptTypes(source).replace(/^import .*;\r?\n/gm, '').replace('export async function updateSession', 'async function updateSession');
  let user = { id: 'client-id', app_metadata: {} };
  let profile = { role: 'client', has_onboarded: false };
  const query = { select: () => query, eq: () => query, maybeSingle: async () => ({ data: profile }), single: async () => ({ data: profile }) };
  const response = location => ({ location, cookies: { getAll: () => [], set: () => {} } });
  const middleware = new Function('createServerClient', 'NextResponse', `${body};return updateSession;`)(
    () => ({ auth: { getUser: async () => ({ data: { user } }) }, from: () => query }),
    { next: () => response(null), redirect: url => response(url.pathname + url.search) },
  );
  const request = path => {
    const url = new URL(path, 'https://example.test');
    return { nextUrl: Object.assign(url, { clone: () => new URL(url) }), cookies: { getAll: () => [], set: () => {} } };
  };
  assert.equal((await middleware(request('/dashboard/questionnaire?id=booking-id'))).location, null);
  assert.equal((await middleware(request('/dashboard/bookings'))).location, null);
  assert.equal((await middleware(request('/dashboard/book-session'))).location, null);
  assert.equal((await middleware(request('/dashboard/book-session/unauthorized'))).location, '/dashboard/bookings');
  assert.equal((await middleware(request('/dashboard/edit-profile'))).location, null);
  assert.equal((await middleware(request('/dashboard/schedule'))).location, '/dashboard/bookings');
  assert.equal((await middleware(request('/dashboard/questionnaire/unauthorized'))).location, '/dashboard/bookings');
  profile = { role: 'user', has_onboarded: false };
  assert.equal((await middleware(request('/dashboard/book-session'))).location, '/');
  assert.equal((await middleware(request('/dashboard/questionnaire'))).location, '/');
  user = { id: 'client-id', app_metadata: { role: 'client' } };
  assert.equal((await middleware(request('/dashboard/book-session'))).location, null);
  assert.equal((await middleware(request('/dashboard/questionnaire'))).location, null);
  user = null;
  assert.equal((await middleware(request('/dashboard/book-session'))).location, '/booking/login');
  assert.equal((await middleware(request('/dashboard/questionnaire'))).location, '/booking/login');
});

test('client questionnaire opens inside the dashboard from booking and verified email links', async () => {
  const client = readFileSync(new URL('../components/booking/ClientBookings.tsx', import.meta.url), 'utf8');
  assert.ok(client.includes('href={`/dashboard/questionnaire?id=${booking.id}`}'));
  const page = readFileSync(new URL('../app/(admin)/dashboard/questionnaire/page.tsx', import.meta.url), 'utf8');
  assert.match(page, /<BookingQuestionnaire id=\{id\}/);
  assert.match(page, /className=\{styles.header\}/);
  const legacy = readFileSync(new URL('../app/(root)/booking/confirmed/page.tsx', import.meta.url), 'utf8');
  assert.ok(legacy.includes('if (user && (admin || client)) redirect(`/dashboard/questionnaire?id=${id}`)'));
  const callback = readFileSync(new URL('../app/(auth)/auth/booking/route.ts', import.meta.url), 'utf8');
  const body = stripTypeScriptTypes(callback).replace(/^import .*;\r?\n/gm, '').replace('export async function GET', 'async function GET');
  let verificationError = null;
  const handler = new Function('NextResponse', 'createClient', 'siteUrl', `${body};return GET;`)(
    { redirect: destination => destination },
    async () => ({ auth: { verifyOtp: async () => ({ error: verificationError }) } }),
    () => 'https://example.test',
  );
  const id = '11111111-1111-4111-8111-111111111111';
  assert.equal(await handler(new Request(`https://example.test/auth/booking?token_hash=test&booking=${id}`)), `https://example.test/dashboard/questionnaire?id=${id}`);
  assert.equal(await handler(new Request('https://example.test/auth/booking?token_hash=test')), 'https://example.test/dashboard/bookings');
  verificationError = new Error('Expired');
  assert.equal(await handler(new Request(`https://example.test/auth/booking?token_hash=test&booking=${id}`)), 'https://example.test/booking/login?expired=1');
  const routes = ['/dashboard/bookings', '/dashboard/bookings?view=questionnaires', '/dashboard/bookings?view=history'];
  assert.deepEqual(routes.filter(route => isSidebarLinkActive(route, '/dashboard/questionnaire', new URLSearchParams({ id }), routes)), ['/dashboard/bookings?view=questionnaires']);
});

test('client dashboard sidebar limits routes and matches the selected booking view', () => {
  const sidebar = readFileSync(new URL('../components/shared/Menus/Sidebar.tsx', import.meta.url), 'utf8');
  const clientGroups = sidebar.slice(sidebar.indexOf('const clientGroups ='), sidebar.indexOf('type SidebarProps'));
  const routes = [...clientGroups.matchAll(/route: '([^']+)'/g)].map(match => match[1]);
  assert.deepEqual(routes, ['/dashboard/bookings', '/dashboard/bookings?view=questionnaires', '/dashboard/bookings?view=refunds', '/dashboard/book-session', '/contact', '/']);
  assert.deepEqual(routes.filter(route => isSidebarLinkActive(route, '/dashboard/book-session', new URLSearchParams(), routes)), ['/dashboard/book-session']);
  assert.ok(clientGroups.includes("route: '/dashboard/bookings', label: 'Booking History'"));
  assert.ok(!clientGroups.includes("label: 'Your Dashboard'"));
  const source = readFileSync(new URL('../components/booking/ClientBookings.tsx', import.meta.url), 'utf8');
  const viewSource = source.slice(source.indexOf('  const requestedView ='), source.indexOf('  const zone ='));
  const selectedView = new Function('searchParams', `${viewSource};return view;`);
  for (const view of ['', 'history', 'refunds', 'questionnaires']) {
    const params = new URLSearchParams(view ? `view=${view}` : '');
    const target = view && view !== 'history' ? `/dashboard/bookings?view=${view}` : '/dashboard/bookings';
    assert.deepEqual(routes.filter(route => isSidebarLinkActive(route, '/dashboard/bookings', params, routes)), [target]);
    assert.equal(selectedView(params), view || 'history');
  }
  assert.equal(selectedView(new URLSearchParams('view=settings')), 'history');
  assert.equal((source.match(/href="\/dashboard\/book-session"/g) || []).length, 2);
  assert.ok(!source.includes('/education#shift-session'));
  const bookingPage = readFileSync(new URL('../app/(admin)/dashboard/book-session/page.tsx', import.meta.url), 'utf8');
  assert.match(bookingPage, /<BookingWidget\s*\/>/);
  assert.match(bookingPage, /className=\{styles.dashboard\}/);
  assert.match(sidebar, /client \? clientGroups : groups/);
  assert.ok(sidebar.includes("client ? 'Edit Avatar' : 'Edit Profile'"));
  const layout = readFileSync(new URL('../app/(admin)/layout.tsx', import.meta.url), 'utf8');
  assert.match(layout, /<Sidebar client=\{!identity.admin\}/);
  assert.ok(!layout.includes('aria-label="Client navigation"'));
  assert.match(source, /className=\{dashboard.headerAccount\}/);
});

test('client dashboard booking and questionnaire subtabs include completed and previous sessions', () => {
  const source = readFileSync(new URL('../components/booking/ClientBookings.tsx', import.meta.url), 'utf8');
  const routeSource = source.slice(source.indexOf('  const requestedView ='), source.indexOf('  const zone ='));
  const routeState = new Function('searchParams', `${routeSource}; return { view, filter };`);
  assert.deepEqual(routeState(new URLSearchParams()), { view: 'history', filter: 'upcoming' });
  assert.deepEqual(routeState(new URLSearchParams('view=history&filter=previous')), { view: 'history', filter: 'previous' });
  assert.deepEqual(routeState(new URLSearchParams('view=questionnaires')), { view: 'questionnaires', filter: 'incomplete' });
  assert.deepEqual(routeState(new URLSearchParams('view=questionnaires&filter=completed')), { view: 'questionnaires', filter: 'completed' });
  assert.deepEqual(routeState(new URLSearchParams('view=questionnaires&filter=previous')), { view: 'questionnaires', filter: 'incomplete' });
  const filterSource = source.slice(source.indexOf('  const upcoming ='), source.indexOf('  const rescheduling ='));
  const select = new Function('bookings', 'now', 'clientBookingState', 'view', 'filter', `${filterSource}; return { ids: shown.map(booking => booking.id), due: questionnairesToComplete.length };`);
  const now = Date.parse('2026-09-19T12:00:00Z');
  const future = { status: 'confirmed', starts_at: '2026-09-25T12:00:00Z', ends_at: '2026-09-25T13:00:00Z', cancellation_hours: 72, questionnaire_completed_at: null };
  const past = { ...future, starts_at: '2026-09-01T12:00:00Z', ends_at: '2026-09-01T13:00:00Z' };
  const bookings = [
    { ...future, id: 'upcoming-incomplete' },
    { ...future, id: 'upcoming-completed', questionnaire_completed_at: '2026-09-18T12:00:00Z' },
    { ...past, id: 'previous-completed', questionnaire_completed_at: '2026-08-31T12:00:00Z' },
    { ...past, id: 'previous-incomplete' },
    { ...future, id: 'cancelled', status: 'cancelled' },
    { ...future, id: 'refunded', status: 'refunded' },
  ];
  assert.deepEqual(select(bookings, now, clientBookingState, 'history', 'upcoming').ids, ['upcoming-incomplete', 'upcoming-completed']);
  assert.deepEqual(select(bookings, now, clientBookingState, 'history', 'previous').ids, ['previous-completed', 'previous-incomplete', 'cancelled', 'refunded']);
  assert.deepEqual(select(bookings, now, clientBookingState, 'questionnaires', 'completed').ids, ['upcoming-completed', 'previous-completed']);
  assert.deepEqual(select(bookings, now, clientBookingState, 'questionnaires', 'incomplete'), { ids: ['upcoming-incomplete', 'previous-incomplete'], due: 1 });
  assert.deepEqual(select(bookings, now, clientBookingState, 'refunds', 'upcoming').ids, ['refunded']);
  const archived = ['cancelled', 'refund_pending', 'refunded'].flatMap(status => [
    { ...future, id: `${status}-completed`, status, questionnaire_completed_at: '2026-09-18T12:00:00Z' },
    { ...future, id: `${status}-draft`, status },
  ]);
  assert.deepEqual(select(archived, now, clientBookingState, 'questionnaires', 'completed').ids, ['cancelled-completed', 'refund_pending-completed', 'refunded-completed']);
  assert.deepEqual(select(archived, now, clientBookingState, 'questionnaires', 'incomplete'), { ids: [], due: 0 });
  const editableSource = source.match(/const editable = ([^;]+);/)[1];
  const editable = new Function('booking', 'now', `return ${editableSource};`);
  for (const booking of archived) assert.equal(editable(booking, now), false);
  assert.equal(editable(future, now), true);
  assert.equal(editable(past, now), false);
  const questionnaire = readFileSync(new URL('../components/booking/BookingQuestionnaire.tsx', import.meta.url), 'utf8');
  const readOnlySource = questionnaire.match(/const readOnly = ([^;]+);/)[1];
  const readOnly = new Function('booking', `return ${readOnlySource};`);
  for (const booking of archived) assert.equal(readOnly(booking), true);
  assert.equal(readOnly({ ...future, starts_at: '2099-01-01T12:00:00Z' }), false);
  assert.equal(readOnly({ ...past, starts_at: '2000-01-01T12:00:00Z' }), true);
  assert.match(questionnaire, /disabled=\{busy \|\| readOnly\}/);
  assert.match(questionnaire, /\{!readOnly && <div/);
  assert.ok(questionnaire.includes('Your saved answers are read-only and cannot be changed or resent.'));
});

test('client dashboard separates upcoming, history, questionnaires and refund eligibility', () => {
  const now = Date.parse('2026-09-19T12:00:00Z');
  const booking = { status: 'confirmed', starts_at: '2026-09-22T12:00:00Z', ends_at: '2026-09-22T13:00:00Z', cancellation_hours: 72, questionnaire_completed_at: null };
  assert.deepEqual(clientBookingState(booking, now), { upcoming: true, needsQuestionnaire: true, manageable: true, refund: false, label: 'Confirmed' });
  assert.equal(clientBookingState(booking, now + 1).manageable, false);
  assert.equal(clientBookingState({ ...booking, questionnaire_completed_at: '2026-09-19T11:00:00Z' }, now).needsQuestionnaire, false);
  const past = clientBookingState(booking, Date.parse('2026-09-23T12:00:00Z'));
  assert.equal(past.upcoming, false);
  assert.equal(past.manageable, false);
  assert.equal(past.label, 'Completed');
  for (const status of ['refund_pending', 'refunded', 'cancelled']) {
    const state = clientBookingState({ ...booking, status }, now);
    assert.equal(state.upcoming, false);
    assert.equal(state.needsQuestionnaire, false);
    assert.equal(state.manageable, false);
    assert.equal(state.refund, status !== 'cancelled');
  }
});

test('booking provision saves the auth account email without overwriting existing profile details', async () => {
  const source = readFileSync(new URL('../lib/booking-worker.ts', import.meta.url), 'utf8');
  const body = source.split("if (job.kind === 'provision') {")[1].split("} else if (job.kind === 'customer_confirmed')")[0];
  for (const existing of [false, true]) {
    const writes = [];
    const database = {
      rpc: async () => ({ data: existing ? 'account-id' : null }),
      auth: { admin: {
        createUser: async () => ({ data: { user: { id: 'account-id' } } }),
        getUserById: async () => ({ data: { user: { email: 'account@example.test' } } }),
      } },
      from: table => {
        const query = { eq: () => query, then: resolve => resolve({ data: null }) };
        return {
          upsert: values => { writes.push({ table, kind: 'upsert', values }); return query; },
          update: values => { writes.push({ table, kind: 'update', values }); return query; },
        };
      },
    };
    const run = new Function('database', 'booking', 'checked', 'queue', `return (async () => { ${body} })();`);
    await run(database, { id: 'booking-id', email: 'old@example.test', name: 'Client' }, result => { if (result.error) throw result.error; return result.data; }, async () => {});
    assert.ok(writes.some(write => write.table === 'profiles' && write.kind === 'update' && write.values.email === 'account@example.test'));
    const profile = writes.find(write => write.table === 'profiles' && write.kind === 'upsert');
    assert.equal(Boolean(profile), !existing);
    if (profile) assert.equal(profile.values.email, 'account@example.test');
  }
});

test('customer booking times show local time first and date-specific London time', () => {
  const summer = customerBookingTimes('2026-09-18T18:00:00Z', 'America/New_York');
  assert.equal(summer.primary.text, 'Friday 18 September 2026, 2:00 PM');
  assert.equal(summer.primary.label, 'Your time (America/New York)');
  assert.equal(summer.london.text, 'Friday 18 September 2026, 7:00 PM');
  assert.equal(summer.london.label, 'London time (BST)');
  const winter = customerBookingTimes('2026-01-15T12:00:00Z', 'America/New_York', true);
  assert.equal(winter.primary.text, '7:00 AM');
  assert.equal(winter.london.text, '12:00 PM');
  assert.equal(winter.london.label, 'London time (GMT)');
  const differentDate = customerBookingTimes('2026-09-18T23:30:00Z', 'America/Los_Angeles', true);
  assert.equal(differentDate.primary.text, '4:30 PM');
  assert.equal(differentDate.london.text, 'Sat 19 Sep, 12:30 AM');
  for (const zone of ['Europe/London', 'Europe/Belfast', 'invalid/timezone']) {
    const result = customerBookingTimes('2026-09-18T18:00:00Z', zone);
    assert.equal(result.primary.label, 'London time (BST)');
    assert.equal(result.london, null);
  }
  assert.equal(customerBookingTimes('2026-03-29T00:30:00Z', 'America/New_York').london.label, 'London time (GMT)');
  assert.equal(customerBookingTimes('2026-03-29T01:30:00Z', 'America/New_York').london.label, 'London time (BST)');
});

test('salon appointment link filters by exact ID and leaves the all appointments view unfiltered', () => {
  const source = readFileSync(new URL('../components/booking/OvatuAgenda.tsx', import.meta.url), 'utf8');
  const filterSource = source.slice(source.indexOf('  const matching ='), source.indexOf('  for (const appointment of matching)'));
  const filter = new Function('appointments', 'appointmentId', 'date', 'search', 'DateTime', `${filterSource};return matching;`);
  const appointments = [
    { id: 'first', client_name: 'Same Client', details: 'Colour', starts_at: '2026-09-28T09:00:00Z' },
    { id: 'second', client_name: 'Same Client', details: 'Cut', starts_at: '2026-09-28T11:00:00Z' },
  ];
  assert.deepEqual(filter(appointments, 'second', '', '', DateTime), [appointments[1]]);
  assert.deepEqual(filter(appointments, '', '', '', DateTime), appointments);
  assert.deepEqual(filter(appointments, 'missing', '', '', DateTime), []);
  assert.deepEqual(filter(appointments, 'second', '2026-09-29', '', DateTime), []);
  assert.deepEqual(filter(appointments, 'second', '', 'Colour', DateTime), []);
  const dashboard = readFileSync(new URL('../components/booking/DashboardOverview.tsx', import.meta.url), 'utf8');
  assert.ok(dashboard.includes('view=appointments&appointment=${encodeURIComponent(appointment.id)}'));
  assert.match(dashboard, /href="\/dashboard\/schedule\?view=appointments" className=\{styles.quietLink\}>All Appointments/);
});

test('date-specific add controls explain unavailable dates and permit dates with a free slot', () => {
  const source = readFileSync(new URL('../components/booking/ScheduleManager.tsx', import.meta.url), 'utf8');
  const functionSource = source.slice(source.indexOf('  function dateClosureReason('), source.indexOf('  const shownConflicts'));
  const load = new Function('DateTime', 'data', 'now', 'earliestStart', 'latestStart', 'noticeLabel', `${stripTypeScriptTypes(functionSource)};return addAvailabilityReason;`);
  const now = DateTime.fromISO('2026-09-18T18:00:00', { zone: 'Europe/London' });
  const weeklyRules = Array.from({ length: 7 }, (_, weekday) => ({ weekday, specific_date: null, unavailable: false }));
  const data = { settings: { enabled: true, horizon_days: 14, sync_max_age_minutes: 30 }, sync: { last_success: now.toISO() }, availability: [...weeklyRules], slots: [] };
  const reason = load(DateTime, data, now, now.startOf('day').plus({ days: 5 }), now.plus({ days: 14 }), '5 calendar days');
  const date = '2026-09-23';
  const slot = { starts_at: '2026-09-23T08:00:00Z', available: false, reason: 'This time clashes with an appointment' };
  assert.match(reason('2026-09-22'), /minimum notice/);
  assert.match(reason('2026-10-03'), /this far ahead/);
  assert.match(reason(date), /no bookable windows/);
  data.slots = [slot];
  assert.match(reason(date), /Ovatu appointments/);
  data.slots = [{ ...slot, reason: 'Blocked by Admin' }];
  assert.match(reason(date), /Restore a blocked slot/);
  data.slots = [{ ...slot, reason: 'This time clashes with a booking' }];
  assert.match(reason(date), /session bookings/);
  data.slots.push(slot);
  assert.match(reason(date), /Resolve the appointment conflicts/);
  data.slots.push({ ...slot, starts_at: '2026-09-23T13:00:00Z', available: true, reason: null });
  assert.equal(reason(date), '');
  assert.match(reason('2026-09-24'), /no bookable windows/);
  data.slots = [];
  data.availability = [{ specific_date: date, unavailable: true }];
  assert.match(reason(date), /closed all day/);
  data.availability = [{ weekday: 3, specific_date: null, unavailable: true }];
  assert.match(reason(date), /Wednesday is closed in Weekly Hours/);
  data.availability = [];
  assert.match(reason('2026-09-27'), /Sunday is closed in Weekly Hours/);
  data.availability = [{ weekday: 3, specific_date: null, unavailable: true }, { specific_date: date, unavailable: false }];
  assert.match(reason(date), /no bookable windows/);
  data.slots = [{ ...slot, available: true, reason: null }];
  assert.equal(reason(date), '');
  data.availability = [...weeklyRules];
  data.settings.enabled = false;
  assert.match(reason(date), /paused/);
  data.settings.enabled = true;
  data.sync.last_success = now.minus({ hours: 1 }).toISO();
  assert.match(reason(date), /synced successfully/);
});

test('next opening passes its UK date through the schedule page and keeps both pickers on it', async () => {
  const dashboard = readFileSync(new URL('../components/booking/DashboardOverview.tsx', import.meta.url), 'utf8');
  const href = dashboard.split('className={styles.nextOpening} href={')[1].split('} title=')[0];
  const openingLink = new Function('data', 'ukDate', `return ${href};`);
  const ukDate = value => DateTime.fromISO(value).setZone('Europe/London');
  const url = new URL(openingLink({ nextSlot: '2026-09-28T08:00:00Z' }, ukDate), 'http://localhost');
  assert.equal(url.searchParams.get('date'), '2026-09-28');
  assert.equal(new URL(openingLink({ nextSlot: '2026-09-27T23:30:00Z' }, ukDate), 'http://localhost').searchParams.get('date'), '2026-09-28');
  assert.equal(openingLink({ nextSlot: null }, ukDate), '/dashboard/schedule');

  const pageSource = readFileSync(new URL('../app/(admin)/dashboard/schedule/page.tsx', import.meta.url), 'utf8');
  const initialDateExpression = pageSource.split('initialDate={')[1].split('} initialView=')[0];
  const pageBody = stripTypeScriptTypes(pageSource.replace(/  return <div[^\n]+/, `  return ${initialDateExpression};`)).replace(/^import .*;\r?\n/gm, '').replace('export default ', '');
  const loadPage = new Function('bookingIdentity', 'redirect', 'loadBookingSchedule', `${pageBody};return SchedulePage;`);
  let admin = false;
  let loaded = false;
  const page = loadPage(async () => ({ admin }), () => { throw new Error('Not authorized'); }, async () => { loaded = true; return {}; });
  await assert.rejects(page({ searchParams: Promise.resolve({}) }), /Not authorized/);
  assert.equal(loaded, false);
  admin = true;
  const initialDate = await page({ searchParams: Promise.resolve(Object.fromEntries(url.searchParams)) });
  assert.equal(loaded, true);
  assert.equal(initialDate, '2026-09-28');

  const source = readFileSync(new URL('../components/booking/ScheduleManager.tsx', import.meta.url), 'utf8');
  const linkedDateSource = source.slice(source.indexOf('  const linkedDate ='), source.indexOf('  const [settings,'));
  const effectSource = source.slice(source.indexOf("    if (tab === 'Availability')"), source.indexOf('  }, [tab, minimumNoticeHours, linkedDate]'));
  const selectDate = new Function('initialDate', 'minimumNoticeHours', 'DateTime', 'bookingNoticeStart', 'setDate', 'setPreview', stripTypeScriptTypes(`const tab = 'Availability';${linkedDateSource}${effectSource}`));
  for (const noticeHours of [120, 168]) {
    const selected = {};
    selectDate(initialDate, noticeHours, DateTime, bookingNoticeStart, value => { selected.date = value; }, value => { selected.preview = value; });
    assert.deepEqual(selected, { date: '2026-09-28', preview: '2026-09-28' });
  }
});

test('dashboard booking links select incomplete questionnaires, refunded sessions or one exact booking', async () => {
  const dashboard = readFileSync(new URL('../components/booking/DashboardOverview.tsx', import.meta.url), 'utf8');
  const questionnaireHref = dashboard.match(/label: 'Awaiting Answers'.*?href: '([^']+)'/)[1];
  const sessionHref = dashboard.split('className={styles.session} href={')[1].split('} title=')[0];
  const bookingHref = new Function('session', `return ${sessionHref};`)({ id: 'target' });
  const pageSource = readFileSync(new URL('../app/(admin)/dashboard/schedule/page.tsx', import.meta.url), 'utf8');
  const pageBody = stripTypeScriptTypes(pageSource.replace(/  return <div[^\n]+/, '  return { initialFilter, initialBookingId };')).replace(/^import .*;\r?\n/gm, '').replace('export default ', '');
  const loadPage = new Function('bookingIdentity', 'redirect', 'loadBookingSchedule', `${pageBody};return SchedulePage;`);
  const page = loadPage(async () => ({ admin: true }), () => { throw new Error('Unexpected redirect'); }, async () => ({}));
  const propsFor = href => page({ searchParams: Promise.resolve(Object.fromEntries(new URL(href, 'http://localhost').searchParams)) });
  const source = readFileSync(new URL('../components/booking/ScheduleManager.tsx', import.meta.url), 'utf8');
  const filterSource = source.split('\n').find(line => line.includes('const shownBookings ='));
  const select = new Function('data', 'filter', 'initialBookingId', 'search', `${stripTypeScriptTypes(filterSource)};return shownBookings.map(booking => booking.id);`);
  const future = new Date(Date.now() + 86400000).toISOString();
  const base = { name: 'Same Client', email: 'client@example.test', status: 'confirmed', ends_at: future, questionnaire_completed_at: null };
  const data = { bookings: [
    { ...base, id: 'target' },
    { ...base, id: 'same-name' },
    { ...base, id: 'answered', questionnaire_completed_at: future },
    { ...base, id: 'past', ends_at: '2020-01-01T10:00:00Z' },
    { ...base, id: 'cancelled', status: 'cancelled' },
  ] };
  const incomplete = await propsFor(questionnaireHref);
  assert.deepEqual(incomplete, { initialFilter: 'incomplete', initialBookingId: '' });
  assert.deepEqual(select(data, incomplete.initialFilter, incomplete.initialBookingId, ''), ['target', 'same-name']);
  const specific = await propsFor(bookingHref);
  assert.deepEqual(specific, { initialFilter: 'all', initialBookingId: 'target' });
  assert.deepEqual(select(data, specific.initialFilter, specific.initialBookingId, ''), ['target']);
  assert.deepEqual(select(data, 'all', 'missing', ''), []);
  const all = await propsFor('/dashboard/schedule?view=bookings&filter=all');
  assert.equal(select(data, all.initialFilter, all.initialBookingId, '').length, 5);
  assert.deepEqual(await propsFor('/dashboard/schedule?view=bookings&filter=invalid'), { initialFilter: 'upcoming', initialBookingId: '' });
  const refundedHref = dashboard.match(/href="([^"]+filter=refunded)"/)[1];
  const refunded = await propsFor(refundedHref);
  assert.deepEqual(refunded, { initialFilter: 'refunded', initialBookingId: '' });
  assert.ok(dashboard.indexOf('<strong>Refunds</strong>') > dashboard.indexOf('<strong>Questionnaires</strong>'));
  const refundLabelSource = dashboard.split('<strong>Refunds</strong><span>{')[1].split('}</span>')[0];
  const refundLabel = new Function('data', `return ${refundLabelSource};`);
  for (const [count, expected] of [[0, '0 Refunded Bookings'], [1, '1 Refunded Booking'], [12, '12 Refunded Bookings'], [null, 'Status unavailable']]) {
    assert.equal(refundLabel({ counts: { refunded: count } }), expected);
  }
  assert.ok(source.includes('<option value="refunded">Refunded Bookings</option>'));
  data.bookings.push(
    { ...base, id: 'refunded-future', status: 'refunded' },
    { ...base, id: 'refunded-past', status: 'refunded', ends_at: '2020-01-01T10:00:00Z', name: 'Another Client' },
    { ...base, id: 'pending', status: 'refund_pending' },
  );
  assert.deepEqual(select(data, refunded.initialFilter, '', ''), ['refunded-future', 'refunded-past']);
  const paid = await propsFor('/dashboard/schedule?view=bookings&filter=paid');
  assert.deepEqual(paid, { initialFilter: 'paid', initialBookingId: '' });
  assert.deepEqual(select(data, paid.initialFilter, '', ''), ['target', 'same-name', 'answered', 'past', 'cancelled', 'pending']);
  assert.deepEqual(select(data, 'paid', '', 'another'), []);
  assert.deepEqual(select(data, 'all', '', ''), data.bookings.map(booking => booking.id));
  assert.deepEqual(select(data, 'all', '', 'another'), ['refunded-past']);
  assert.ok(source.includes('<option value="paid">Paid Bookings</option><option value="all">All Bookings</option></select>'));
  assert.deepEqual(select(data, 'all', 'refunded-past', ''), ['refunded-past']);
  assert.deepEqual(select(data, 'refunded', '', 'another'), ['refunded-past']);
  assert.deepEqual(select(data, 'refunded', 'refunded-future', ''), ['refunded-future']);
  assert.deepEqual(await propsFor('/dashboard/schedule?view=bookings&filter=refunded&booking=target'), { initialFilter: 'all', initialBookingId: 'target' });
});

test('website shortcuts cover existing creation and ordering pages with adjacent editors', () => {
  const source = readFileSync(new URL('../components/booking/DashboardOverview.tsx', import.meta.url), 'utf8');
  const shortcuts = source.split('<div className={styles.contentLinks}>')[1].split('</section>')[0];
  const links = [...shortcuts.matchAll(/<Link href="([^"]+)"[^\n]*?<h3>([^<]+)<\/h3>/g)].map(match => ({ href: match[1], label: match[2] }));
  assert.deepEqual(links.map(link => link.label), ['Edit Homepage', 'Edit Education', 'Add Gallery Image', 'Add Service', 'Reorder Gallery', 'Reorder Services', 'Add Page Section', 'Reorder Page Sections']);
  for (const { href } of links) {
    const url = new URL(href, 'http://localhost');
    assert.ok(existsSync(new URL(`../app/(admin)${url.pathname}/page.tsx`, import.meta.url)), href);
  }
  assert.ok(!source.includes('Refunds in progress'));
});

test('schedule starts fully populated without a mount fetch and preserves content during refresh', async () => {
  const source = readFileSync(new URL('../components/booking/ScheduleManager.tsx', import.meta.url), 'utf8');
  const initialization = source.slice(source.indexOf('export default function ScheduleManager'), source.indexOf('  async function save(')).replace('export default ', '');
  const body = stripTypeScriptTypes(`${initialization}return { data, settings, date, preview, loading, error, refresh: () => setRefresh(value => value + 1) }; }`);
  const load = new Function('useRouter', 'useState', 'useEffect', 'DateTime', 'bookingNoticeStart', 'fetch', `${body};return ScheduleManager;`);
  for (const enabled of [true, false]) {
    const initialData = { settings: { enabled, notice_hours: 168 }, bookings: [{ id: 'existing' }], availability: [], appointments: [], slots: [], slotBlocks: [], sync: {}, jobs: [] };
    const states = [];
    let cursor = 0;
    let effects = [];
    let fetchCount = 0;
    let fail = false;
    let finishRequest;
    const component = load(() => ({}), initial => {
      const index = cursor++;
      if (!(index in states)) states[index] = typeof initial === 'function' ? initial() : initial;
      return [states[index], value => { states[index] = typeof value === 'function' ? value(states[index]) : value; }];
    }, effect => { effects.push(effect); }, DateTime, bookingNoticeStart, async () => {
      fetchCount++;
      await new Promise(resolve => { finishRequest = resolve; });
      return { ok: !fail, json: async () => fail ? { error: 'Refresh unavailable' } : { ...initialData, settings: { ...initialData.settings, enabled: !enabled } } };
    });
    const render = () => {
      cursor = 0;
      effects = [];
      return component({ initialData });
    };
    const initial = render();
    assert.equal(initial.data, initialData);
    assert.equal(initial.settings.enabled, enabled);
    assert.equal(initial.loading, false);
    assert.equal(initial.date, DateTime.fromMillis(bookingNoticeStart(Date.now(), 168), { zone: 'Europe/London' }).toISODate());
    effects.forEach(effect => effect());
    assert.equal(fetchCount, 0);
    initial.refresh();
    render();
    effects.forEach(effect => effect());
    assert.equal(fetchCount, 1);
    const updating = render();
    assert.equal(updating.loading, true);
    assert.equal(updating.data, initialData);
    finishRequest();
    await new Promise(resolve => setImmediate(resolve));
    const updated = render();
    assert.equal(updated.loading, false);
    assert.equal(updated.data.settings.enabled, !enabled);
    fail = true;
    updated.refresh();
    render();
    effects.forEach(effect => effect());
    finishRequest();
    await new Promise(resolve => setImmediate(resolve));
    const failed = render();
    assert.equal(failed.loading, false);
    assert.equal(failed.data, updated.data);
    assert.equal(failed.error, 'Refresh unavailable');
  }
});

test('dashboard overview guards client data and keeps query failures distinct from empty counts', async () => {
  const source = stripTypeScriptTypes(readFileSync(new URL('../app/(admin)/dashboard/page.tsx', import.meta.url), 'utf8').replace('return <DashboardOverview data={data} />;', 'return data;')).replace(/^import .*;\r?\n/gm, '').replace(/^export default /gm, '').replace(/^export /gm, '');
  const load = new Function('redirect', 'DateTime', 'bookingDatabase', 'bookingIdentity', 'fetchUserData', `${source};return DashboardPage;`);
  let identity = { user: null, admin: false };
  let databaseCalls = 0;
  let profileCalls = 0;
  let profile = { username: 'Sample Admin', avatar_url: '/assets/images/Default_Avatar.jpg' };
  let failGallery = false;
  const queries = [];
  const database = {
    from(table) {
      const query = { table, filters: [], columns: '', options: null };
      queries.push(query);
      const chain = {
        select(columns, options) { query.columns = columns; query.options = options; return this; },
        eq(...args) { query.filters.push(['eq', ...args]); return this; },
        not(...args) { query.filters.push(['not', ...args]); return this; },
        gte(...args) { query.filters.push(['gte', ...args]); return this; },
        gt(...args) { query.filters.push(['gt', ...args]); return this; },
        lt(...args) { query.filters.push(['lt', ...args]); return this; },
        is(...args) { query.filters.push(['is', ...args]); return this; },
        order(...args) { query.order = args; return this; },
        limit(value) { query.limit = value; return this; },
        single() { return this; },
        then(resolve) {
          if (failGallery && table === 'gallery_images') return Promise.resolve({ error: { message: 'Unavailable' } }).then(resolve);
          const data = table === 'booking_settings' ? { enabled: true, sync_max_age_minutes: 30 } : table === 'booking_sync_state' ? { last_success: new Date().toISOString(), last_error: null } : [];
          return Promise.resolve({ data, count: 0, error: null }).then(resolve);
        },
      };
      return chain;
    },
    rpc(name, args) { assert.equal(name, 'booking_slots'); assert.deepEqual(args, { include_blocked: false }); return Promise.resolve({ data: [], error: null }); },
  };
  const page = load(path => { throw new Error(`redirect:${path}`); }, DateTime, () => { databaseCalls++; return database; }, async () => identity, async () => { profileCalls++; return { profile }; });
  await assert.rejects(page(), /redirect:\/booking\/login/);
  identity = { user: { id: 'client' }, admin: false };
  await assert.rejects(page(), /redirect:\/dashboard\/bookings/);
  assert.equal(databaseCalls, 0);
  assert.equal(profileCalls, 0);
  identity = { user: { id: 'admin', email: 'admin@example.com' }, admin: true };
  const data = await page();
  assert.deepEqual(data.profile, { ...profile, email: 'admin@example.com' });
  assert.equal(data.counts.sessions, 0);
  assert.equal(data.counts.refunded, 0);
  const refundedQuery = queries.find(query => query.table === 'bookings' && query.filters.some(filter => JSON.stringify(filter) === JSON.stringify(['eq', 'status', 'refunded'])));
  assert.ok(refundedQuery.options.head);
  assert.equal(refundedQuery.options.count, 'exact');
  assert.ok(refundedQuery.filters.some(filter => JSON.stringify(filter) === JSON.stringify(['not', 'paid_at', 'is', null])));
  assert.ok(!refundedQuery.filters.some(filter => filter[0] === 'gte'));
  assert.equal(data.counts.images, 0);
  assert.equal(data.enabled, true);
  assert.deepEqual(data.sessions, []);
  assert.deepEqual(data.issues, []);
  assert.ok(!queries.some(query => query.table === 'booking_jobs'));
  const sessions = queries.find(query => query.table === 'bookings' && query.limit === 4);
  assert.ok(sessions.filters.some(filter => JSON.stringify(filter) === JSON.stringify(['eq', 'status', 'confirmed'])));
  assert.ok(sessions.filters.some(filter => JSON.stringify(filter) === JSON.stringify(['not', 'paid_at', 'is', null])));
  assert.ok(sessions.filters.some(filter => filter[0] === 'gte' && filter[1] === 'ends_at'));
  const appointments = queries.find(query => query.table === 'appointments' && query.options?.head);
  const nextAppointment = queries.find(query => query.table === 'appointments' && query.limit === 1);
  assert.ok(nextAppointment);
  assert.deepEqual(nextAppointment.order, ['starts_at']);
  assert.ok(nextAppointment.filters.some(filter => JSON.stringify(filter) === JSON.stringify(['eq', 'cancelled', false])));
  assert.ok(nextAppointment.filters.some(filter => filter[0] === 'gte' && filter[1] === 'starts_at'));
  assert.ok(!nextAppointment.filters.some(filter => filter[0] === 'lt'));
  assert.ok(appointments.filters.some(filter => filter[0] === 'gt' && filter[1] === 'ends_at'));
  assert.ok(appointments.filters.some(filter => filter[0] === 'lt' && filter[1] === 'starts_at'));
  failGallery = true;
  profile = null;
  const partial = await page();
  assert.deepEqual(partial.profile, { username: null, avatar_url: null, email: 'admin@example.com' });
  assert.equal(partial.counts.images, null);
  assert.ok(queries.filter(query => query.table === 'gallery_images').every(query => query.options?.head));
  assert.equal(partial.counts.sessions, 0);
  assert.ok(partial.issues.includes('gallery count'));
});

test('sidebar highlights the matching schedule subpage without highlighting availability as well', () => {
  const routes = ['/dashboard', '/dashboard/schedule', '/dashboard/schedule?view=bookings', '/dashboard/schedule?view=appointments', '/dashboard/services'];
  const active = (pathname, query) => routes.filter(route => isSidebarLinkActive(route, pathname, new URLSearchParams(query), routes));
  assert.deepEqual(active('/dashboard/schedule', 'view=bookings'), [routes[2]]);
  assert.deepEqual(active('/dashboard/schedule', 'view=appointments'), [routes[3]]);
  assert.deepEqual(active('/dashboard/schedule', 'page=2&view=bookings'), [routes[2]]);
  assert.deepEqual(active('/dashboard/schedule', ''), [routes[1]]);
  assert.deepEqual(active('/dashboard/schedule', 'view=settings'), [routes[1]]);
  assert.deepEqual(active('/dashboard/schedule', 'view=unknown'), [routes[1]]);
  assert.deepEqual(active('/dashboard', ''), [routes[0]]);
  assert.deepEqual(active('/dashboard/services/edit', ''), [routes[4]]);
  assert.deepEqual(active('/dashboard/services-other', ''), []);
});

test('header booking toggle updates only enabled and requires admin access', async () => {
  const source = stripTypeScriptTypes(readFileSync(new URL('../app/api/bookings/route.ts', import.meta.url), 'utf8')).replace(/^import .*;\r?\n/gm, '').replace(/^export /gm, '');
  const load = new Function('z', 'NextResponse', 'assertSameOrigin', 'bookingDatabase', 'requireBookingAdmin', 'checked', `${source}\nreturn POST;`);
  const writes = [];
  let adminAllowed = true;
  let failSave = false;
  const database = { from: table => ({ update: values => ({ eq: async (column, id) => {
    if (failSave) return { error: new Error('Unable to save status') };
    writes.push({ table, values, column, id });
    return { data: null };
  } }) }) };
  const post = load(z, Response, () => {}, () => database, async () => { if (!adminAllowed) throw new Error('Administrator access required'); }, result => { if (result.error) throw result.error; return result.data; });
  const request = enabled => post(new Request('http://localhost:3000/api/bookings', { method: 'POST', body: JSON.stringify({ action: 'booking_enabled', enabled }) }));
  for (const enabled of [false, true]) {
    const response = await request(enabled);
    assert.equal(response.status, 200);
    assert.match((await response.json()).message, enabled ? /opened/ : /paused/);
    assert.deepEqual(writes.at(-1), { table: 'booking_settings', values: { enabled }, column: 'id', id: 1 });
  }
  assert.equal((await request('false')).status, 400);
  failSave = true;
  assert.equal((await request(false)).status, 400);
  failSave = false;
  adminAllowed = false;
  assert.equal((await request(false)).status, 400);
  assert.equal(writes.length, 2);
});

test('dashboard settings sync Stripe before saving and do not save on Stripe failure', async () => {
  const source = stripTypeScriptTypes(readFileSync(new URL('../app/api/bookings/route.ts', import.meta.url), 'utf8')).replace(/^import .*;\r?\n/gm, '').replace(/^export /gm, '');
  const load = new Function('z', 'NextResponse', 'assertSameOrigin', 'bookingDatabase', 'requireBookingAdmin', 'resolveBookingPrice', 'stripeClient', 'requiredEnv', 'checked', `${source}\nreturn POST;`);
  const settings = { enabled: true, price_pence: 15000, duration_minutes: 60, buffer_minutes: 15, notice_hours: 120, horizon_days: 14, cancellation_hours: 72, sync_max_age_minutes: 30 };
  const calls = [];
  let stripeFails = false;
  let defaultPriceFails = false;
  let adminAllowed = true;
  const stripe = { products: { update: async (productId, values) => {
    calls.push({ operation: 'default_price', productId, values });
    if (defaultPriceFails) throw new Error('Product update unavailable');
    return { id: productId, ...values };
  } } };
  const database = { from: table => ({ update: value => ({ eq: async (column, id) => { calls.push({ operation: 'save', table, value, column, id }); return { data: null }; } }) }) };
  const post = load(z, Response, () => {}, () => database,
    async () => { calls.push({ operation: 'admin' }); if (!adminAllowed) throw new Error('Administrator access required'); },
    async (client, productId, priceId, amount) => { calls.push({ operation: 'stripe', productId, priceId, amount }); assert.equal(client, stripe); if (stripeFails) throw new Error('Provider unavailable'); return 'price_matched'; },
    () => stripe, name => ({ STRIPE_SHIFT_SESSION_PRODUCT_ID: 'prod_session', STRIPE_SHIFT_SESSION_PRICE_ID: 'price_configured' })[name],
    result => { if (result.error) throw result.error; return result.data; });
  const request = values => new Request('http://localhost:3000/api/bookings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'settings', settings: values }) });
  const response = await post(request(settings));
  assert.equal(response.status, 200);
  assert.match((await response.json()).message, /synced with Stripe/);
  assert.deepEqual(calls.map(call => call.operation), ['admin', 'stripe', 'default_price', 'save']);
  assert.deepEqual(calls[1], { operation: 'stripe', productId: 'prod_session', priceId: 'price_configured', amount: 15000 });
  assert.deepEqual(calls[2], { operation: 'default_price', productId: 'prod_session', values: { default_price: 'price_matched' } });
  assert.equal(calls[3].table, 'booking_settings');
  assert.deepEqual(calls[3].value, settings);
  calls.length = 0;
  stripeFails = true;
  const failure = await post(request(settings));
  assert.equal(failure.status, 502);
  assert.match((await failure.json()).error, /Settings were not saved/);
  assert.deepEqual(calls.map(call => call.operation), ['admin', 'stripe']);
  calls.length = 0;
  stripeFails = false;
  defaultPriceFails = true;
  const defaultFailure = await post(request(settings));
  assert.equal(defaultFailure.status, 502);
  assert.match((await defaultFailure.json()).error, /Settings were not saved/);
  assert.deepEqual(calls.map(call => call.operation), ['admin', 'stripe', 'default_price']);
  calls.length = 0;
  assert.equal((await post(request({ ...settings, price_pence: 1 }))).status, 400);
  assert.deepEqual(calls.map(call => call.operation), ['admin']);
  calls.length = 0;
  assert.equal((await post(request({ ...settings, notice_hours: 25 }))).status, 400);
  assert.deepEqual(calls.map(call => call.operation), ['admin']);
  calls.length = 0;
  adminAllowed = false;
  assert.equal((await post(request(settings))).status, 400);
  assert.deepEqual(calls.map(call => call.operation), ['admin']);
});

test('weekly hours can close, reopen, edit and remove ranges without changing date overrides', async () => {
  const source = stripTypeScriptTypes(readFileSync(new URL('../app/api/bookings/route.ts', import.meta.url), 'utf8')).replace(/^import .*;\r?\n/gm, '').replace(/^export /gm, '');
  const load = new Function('z', 'NextResponse', 'assertSameOrigin', 'bookingDatabase', 'requireBookingAdmin', 'checked', `${source}\nreturn POST;`);
  const firstId = '00000000-0000-4000-8000-000000000001';
  const secondId = '00000000-0000-4000-8000-000000000002';
  let rows = [
    { id: firstId, weekday: 1, specific_date: null, start_time: '09:00', end_time: '12:00', unavailable: false },
    { id: secondId, weekday: 1, specific_date: null, start_time: '13:00', end_time: '17:00', unavailable: false },
    { id: '00000000-0000-4000-8000-000000000003', weekday: null, specific_date: '2026-09-28', start_time: '10:00', end_time: '14:00', unavailable: false },
  ];
  const override = { ...rows[2] };
  let adminAllowed = true;
  let writes = 0;
  const database = { from(table) {
    assert.equal(table, 'booking_availability');
    let operation, values;
    const filters = [];
    const execute = () => {
      writes++;
      if (operation === 'insert') { rows.push({ ...values }); return { data: null }; }
      const matches = rows.filter(row => filters.every(filter => filter(row)));
      if (operation === 'update') matches.forEach(row => Object.assign(row, values));
      if (operation === 'delete') rows = rows.filter(row => !matches.includes(row));
      return { data: matches.map(row => ({ id: row.id })) };
    };
    return {
      update(input) { operation = 'update'; values = input; return this; },
      insert(input) { operation = 'insert'; values = input; return this; },
      delete() { operation = 'delete'; return this; },
      eq(column, value) { filters.push(row => row[column] === value); return this; },
      not(column, operator, value) { assert.equal(operator, 'is'); filters.push(row => row[column] !== value); return this; },
      select() { return this; },
      single() { const result = execute(); return result.data.length === 1 ? { data: result.data[0] } : { error: new Error('Weekly time range not found') }; },
      then(resolve) { return Promise.resolve(execute()).then(resolve); },
    };
  } };
  const post = load(z, Response, () => {}, () => database, async () => { if (!adminAllowed) throw new Error('Administrator access required'); }, result => { if (result.error) throw result.error; return result.data; });
  const request = body => post(new Request('http://localhost:3000/api/bookings', { method: 'POST', body: JSON.stringify(body) }));
  assert.equal((await request({ action: 'weekly_day', weekday: 1, closed: true })).status, 200);
  assert.ok(rows.filter(row => row.weekday === 1).every(row => row.unavailable));
  assert.equal((await request({ action: 'weekly_day', weekday: 1, closed: false })).status, 200);
  assert.ok(rows.filter(row => row.weekday === 1).every(row => !row.unavailable));
  assert.equal(rows[0].start_time, '09:00');
  assert.equal((await request({ action: 'weekly_day', weekday: 0, closed: false })).status, 200);
  assert.equal(rows.find(row => row.weekday === 0).end_time, '17:00');
  assert.equal((await request({ action: 'update_weekly_time', id: firstId, start_time: '10:00', end_time: '12:30' })).status, 200);
  assert.equal(rows[0].start_time, '10:00');
  assert.equal((await request({ action: 'update_weekly_time', id: firstId, start_time: '17:00', end_time: '09:00' })).status, 400);
  assert.equal((await request({ action: 'update_weekly_time', id: firstId, start_time: '25:00', end_time: '26:00' })).status, 400);
  assert.equal((await request({ action: 'weekly_day', weekday: 7, closed: true })).status, 400);
  assert.equal((await request({ action: 'update_weekly_time', id: override.id, start_time: '09:00', end_time: '12:00' })).status, 400);
  assert.equal((await request({ action: 'delete_availability', id: secondId })).status, 200);
  assert.ok(!rows.some(row => row.id === secondId));
  assert.deepEqual(rows.find(row => row.id === override.id), override);
  const weeklyBeforeDateEdit = { ...rows.find(row => row.id === firstId) };
  assert.equal((await request({ action: 'update_date_time', id: override.id, start_time: '11:00', end_time: '15:00', unavailable: false })).status, 200);
  assert.equal(rows.find(row => row.id === override.id).start_time, '11:00');
  assert.equal((await request({ action: 'update_date_time', id: override.id, start_time: '11:00', end_time: '15:00', unavailable: true })).status, 200);
  assert.deepEqual(rows.find(row => row.id === override.id), { ...override, start_time: '00:00', end_time: '23:59', unavailable: true });
  assert.equal((await request({ action: 'update_date_time', id: override.id, start_time: '09:00', end_time: '17:00', unavailable: false })).status, 200);
  assert.equal(rows.find(row => row.id === override.id).unavailable, false);
  assert.equal((await request({ action: 'update_date_time', id: firstId, start_time: '11:00', end_time: '15:00', unavailable: true })).status, 400);
  assert.equal((await request({ action: 'update_date_time', id: override.id, start_time: '16:00', end_time: '10:00', unavailable: false })).status, 400);
  assert.equal((await request({ action: 'update_date_time', id: override.id, start_time: '25:00', end_time: '26:00', unavailable: false })).status, 400);
  assert.deepEqual(rows.find(row => row.id === firstId), weeklyBeforeDateEdit);
  const savedWrites = writes;
  adminAllowed = false;
  for (const body of [{ action: 'weekly_day', weekday: 1, closed: true }, { action: 'update_weekly_time', id: firstId, start_time: '09:00', end_time: '12:00' }, { action: 'update_date_time', id: override.id, start_time: '09:00', end_time: '12:00', unavailable: false }]) assert.equal((await request(body)).status, 400);
  assert.equal(writes, savedWrites);
});

test('Stripe checkout reuses configured and historical prices and creates prices on the same product', async () => {
  const base = { id: 'price_configured', product: 'prod_session', currency: 'gbp', unit_amount: 12500, type: 'one_time', billing_scheme: 'per_unit', active: true, livemode: false, tax_behavior: 'unspecified' };
  const catalogue = [];
  const creations = [];
  let configured = { ...base };
  const stripe = {
    products: { retrieve: async () => ({ id: 'prod_session', active: true, livemode: false }) },
    prices: {
      retrieve: async () => configured,
      list: async function* () { yield* catalogue; },
      create: async (params, options) => {
        creations.push({ params, options });
        const price = { ...base, ...params, id: `price_created_${creations.length}` };
        catalogue.unshift(price);
        return price;
      },
    },
  };
  assert.equal(await resolveBookingPrice(stripe, 'prod_session', base.id, 12500), base.id);
  assert.equal(creations.length, 0);
  catalogue.push({ ...base, id: 'price_previous', unit_amount: 15000 });
  assert.equal(await resolveBookingPrice(stripe, 'prod_session', base.id, 15000), 'price_previous');
  assert.equal(creations.length, 0);
  assert.equal(await resolveBookingPrice(stripe, 'prod_session', base.id, 17500), 'price_created_1');
  assert.equal(await resolveBookingPrice(stripe, 'prod_session', base.id, 17500), 'price_created_1');
  assert.equal(creations.length, 1);
  assert.deepEqual(creations[0].params, { product: 'prod_session', currency: 'gbp', unit_amount: 17500, tax_behavior: 'inclusive' });
  assert.match(creations[0].options.idempotencyKey, /prod_session:gbp:17500/);
  catalogue[0].active = false;
  assert.equal(await resolveBookingPrice(stripe, 'prod_session', base.id, 17500), 'price_created_2');
  assert.notEqual(creations[0].options.idempotencyKey, creations[1].options.idempotencyKey);
  for (const invalid of [{ product: 'prod_other' }, { currency: 'usd' }, { type: 'recurring' }, { billing_scheme: 'tiered' }, { transform_quantity: { divide_by: 2 } }, { tax_behavior: 'exclusive' }, { livemode: true }]) {
    configured = { ...base, ...invalid };
    await assert.rejects(resolveBookingPrice(stripe, 'prod_session', base.id, 12500));
  }
  configured = base;
  await assert.rejects(resolveBookingPrice(stripe, '', base.id, 12500));
  await assert.rejects(resolveBookingPrice(stripe, 'prod_session', base.id, 1));
  stripe.products.retrieve = async () => ({ deleted: true });
  await assert.rejects(resolveBookingPrice(stripe, 'prod_session', base.id, 12500));
});

test('questionnaire requires a verified signed-in owner and confirmed payment', () => {
  const booking = { user_id: 'client', status: 'confirmed' };
  assert.equal(canAccessQuestionnaire(booking, null), false);
  assert.equal(canAccessQuestionnaire(booking, { id: 'client' }), false);
  assert.equal(canAccessQuestionnaire(booking, { id: 'other', email_confirmed_at: '2026-09-18' }), false);
  assert.equal(canAccessQuestionnaire(booking, { id: 'client', email_confirmed_at: '2026-09-18' }), true);
  assert.equal(canAccessQuestionnaire({ ...booking, status: 'held' }, { id: 'client', email_confirmed_at: '2026-09-18' }), false);
  assert.equal(canAccessQuestionnaire({ ...booking, user_id: null }, { id: 'client', email_confirmed_at: '2026-09-18' }), false);
});

test('submitted cancelled questionnaires are readable only by verified owners and never writable', () => {
  const owner = { id: 'client', email_confirmed_at: '2026-09-18' };
  for (const status of ['cancelled', 'refund_pending', 'refunded']) {
    const booking = { user_id: 'client', status, questionnaire_completed_at: '2026-09-18' };
    assert.equal(canViewQuestionnaire(booking, owner), true);
    assert.equal(canAccessQuestionnaire(booking, owner), false);
    assert.equal(canViewQuestionnaire(booking, null), false);
    assert.equal(canViewQuestionnaire(booking, { id: 'client' }), false);
    assert.equal(canViewQuestionnaire(booking, { ...owner, id: 'other' }), false);
    assert.equal(canViewQuestionnaire({ ...booking, questionnaire_completed_at: null }, owner), false);
    assert.equal(canViewQuestionnaire({ ...booking, user_id: null }, owner), false);
  }
  for (const status of ['held', 'expired']) {
    assert.equal(canViewQuestionnaire({ user_id: owner.id, status, questionnaire_completed_at: '2026-09-18' }, owner), false);
  }
  const route = readFileSync(new URL('../app/api/bookings/route.ts', import.meta.url), 'utf8');
  assert.match(route, /const questionnaireAllowed = canViewQuestionnaire\(booking, user\)/);
  assert.match(route, /if \(!canAccessQuestionnaire\(booking, user\)\)/);
});

test('booking notice, horizon and cancellation boundaries', () => {
  const now = Date.parse('2026-09-17T12:00:00Z');
  const hour = 3_600_000;
  assert.equal(bookingDefaults.notice_hours, 120);
  assert.equal(withinBookingWindow(Date.parse('2026-09-21T22:59:59.999Z'), now, 120, 14), false);
  assert.equal(withinBookingWindow(Date.parse('2026-09-21T23:00:00Z'), now, 120, 14), true);
  assert.equal(withinBookingWindow(now + 120 * hour - 1, now, 120, 14), true);
  assert.equal(withinBookingWindow(now + 120 * hour, now, 120, 14), true);
  assert.equal(withinBookingWindow(now + 14 * 24 * hour, now, 120, 14), true);
  assert.equal(withinBookingWindow(now + 14 * 24 * hour + 1, now, 120, 14), false);
  assert.equal(canManageBooking(now + 72 * hour, now, 72), true);
  assert.equal(canManageBooking(now + 72 * hour - 1, now, 72), false);
  assert.equal(questionnaireFields.length, 11);
});

test('buffers protect both sides without doubling the gap', () => {
  const minute = 60_000;
  const start = 600 * minute;
  const end = 660 * minute;
  assert.equal(overlapsWithBuffer(start, end, 660 * minute, 720 * minute, 15), true);
  assert.equal(overlapsWithBuffer(start, end, 674 * minute, 734 * minute, 15), true);
  assert.equal(overlapsWithBuffer(start, end, 675 * minute, 735 * minute, 15), false);
  assert.equal(overlapsWithBuffer(start, end, 525 * minute, 585 * minute, 15), false);
  assert.equal(overlapsWithBuffer(start, end, 526 * minute, 586 * minute, 15), true);
});

test('calendar parser handles UK timezone, recurring exceptions, cancellation and all-day events', async () => {
  const feed = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'BEGIN:VEVENT', 'UID:weekly', 'DTSTAMP:20260917T000000Z', 'DTSTART;TZID=Europe/London:20260922T090000', 'DTEND;TZID=Europe/London:20260922T100000', 'RRULE:FREQ=WEEKLY;COUNT=3', 'EXDATE;TZID=Europe/London:20260929T090000', 'SUMMARY:Client appointment', 'DESCRIPTION:Hair appointment', 'END:VEVENT', 'BEGIN:VEVENT', 'UID:cancelled', 'DTSTAMP:20260917T000000Z', 'DTSTART:20260923T100000Z', 'DTEND:20260923T110000Z', 'STATUS:CANCELLED', 'SUMMARY:Cancelled', 'END:VEVENT', 'BEGIN:VEVENT', 'UID:holiday', 'DTSTAMP:20260917T000000Z', 'DTSTART;VALUE=DATE:20261025', 'DTEND;VALUE=DATE:20261026', 'SUMMARY:Away', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  const events = await parseAppointmentCalendar(feed, new Date('2026-09-17T12:00:00Z'));
  assert.equal(events.length, 3);
  assert.equal(events.find(event => event.external_uid.startsWith('weekly')).starts_at, '2026-09-22T08:00:00.000Z');
  const holiday = events.find(event => event.external_uid === 'holiday');
  assert.equal(holiday.starts_at, '2026-10-24T23:00:00.000Z');
  assert.equal(holiday.ends_at, '2026-10-26T00:00:00.000Z');
  await assert.rejects(parseAppointmentCalendar('<html>Service unavailable</html>'));
});

test('database reservations, payment retries, ownership, overrides, sync and RLS', async () => {
  const database = new PGlite();
  const clientId = '11111111-1111-4111-8111-111111111111';
  const adminId = '22222222-2222-4222-8222-222222222222';
  try {
    await database.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role;
      CREATE SCHEMA auth; CREATE TABLE auth.users(id uuid PRIMARY KEY, email text);
      CREATE TABLE profiles(id uuid PRIMARY KEY REFERENCES auth.users(id), role text NOT NULL DEFAULT 'user');
      GRANT SELECT, UPDATE ON profiles TO authenticated;
      ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
      CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$ SELECT nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
      CREATE POLICY own_profile ON profiles FOR ALL TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
      GRANT USAGE ON SCHEMA auth TO authenticated;
      CREATE TABLE sections(id uuid PRIMARY KEY DEFAULT gen_random_uuid(), heading text);
      GRANT ALL ON sections TO authenticated;
      ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
      CREATE POLICY legacy_access ON sections FOR ALL TO authenticated USING (true) WITH CHECK (true);
      INSERT INTO auth.users VALUES ('${clientId}','client@example.com'),('${adminId}','admin@example.com');`);
    const migration = readFileSync(new URL('./bookings.sql', import.meta.url), 'utf8');
    await database.exec(migration);
    await database.exec('ALTER TABLE booking_jobs DROP COLUMN scheduled_for, DROP COLUMN payload');
    await database.exec(migration);
    const calendarMigration = readFileSync(new URL('./booking-calendar-days.sql', import.meta.url), 'utf8');
    const slotFunction = migration.slice(migration.indexOf('CREATE OR REPLACE FUNCTION public.booking_slots('), migration.indexOf('CREATE OR REPLACE FUNCTION public.set_booking_slot_block(')).trim();
    assert.ok(calendarMigration.includes(slotFunction));
    await database.exec(calendarMigration);
    await database.exec(calendarMigration);
    assert.deepEqual((await database.query('SELECT * FROM claim_booking_jobs()')).rows, []);
    await database.query("INSERT INTO profiles(id,role) VALUES ($1,'admin'),($2,'client')", [adminId, clientId]);
    await database.exec("UPDATE booking_settings SET enabled = true; UPDATE booking_sync_state SET last_success = now(); INSERT INTO booking_availability(weekday,start_time,end_time) SELECT weekday,'09:00','17:00' FROM generate_series(0,6) weekday;");
    for (const [current, hours, cutoff, firstSlot] of [
      ['2026-09-18T17:30:00Z', 120, '2026-09-22T23:00:00Z', '2026-09-23T08:00:00Z'],
      ['2026-09-18T23:30:00Z', 120, '2026-09-23T23:00:00Z', '2026-09-24T08:00:00Z'],
      ['2026-03-27T17:30:00Z', 120, '2026-03-31T23:00:00Z', '2026-04-01T08:00:00Z'],
      ['2026-10-23T17:30:00Z', 120, '2026-10-28T00:00:00Z', '2026-10-28T09:00:00Z'],
      ['2026-09-18T17:30:00Z', 25, '2026-09-19T23:00:00Z', '2026-09-20T08:00:00Z'],
      ['2026-09-18T12:30:00Z', 0, '2026-09-18T12:30:00Z', '2026-09-18T13:00:00Z'],
    ]) {
      assert.equal(bookingNoticeStart(Date.parse(current), hours), Date.parse(cutoff));
      await database.exec('BEGIN');
      try {
        await database.query('UPDATE booking_settings SET notice_hours=$1', [hours]);
        await database.query('UPDATE booking_sync_state SET last_success=$1', [current]);
        await database.exec(slotFunction.replaceAll('now()', `TIMESTAMPTZ '${current}'`));
        const generated = (await database.query('SELECT * FROM booking_slots(false)')).rows;
        assert.equal(new Date(generated[0].starts_at).getTime(), Date.parse(firstSlot));
        assert.ok(generated.every(slot => new Date(slot.starts_at).getTime() >= Date.parse(cutoff)));
      } finally {
        await database.exec('ROLLBACK');
      }
    }
    let slots = (await database.query('SELECT * FROM booking_slots(false)')).rows;
    assert.ok(slots.length > 0);
    const first = slots[0];
    await database.query('SELECT set_booking_slot_block($1,true)', [first.starts_at]);
    await database.query('SELECT set_booking_slot_block($1,true)', [first.starts_at]);
    assert.equal((await database.query('SELECT * FROM booking_slots(false) WHERE starts_at=$1', [first.starts_at])).rows.length, 0);
    assert.equal((await database.query('SELECT reason FROM booking_slots(true) WHERE starts_at=$1', [first.starts_at])).rows[0].reason, 'Blocked by Admin');
    await assert.rejects(database.query('SELECT reserve_booking($1,$2,$3)', [first.starts_at, 'Other', 'other@example.com']));
    await database.query('SELECT set_booking_slot_block($1,false)', [first.starts_at]);
    await database.query('SELECT set_booking_slot_block($1,false)', [first.starts_at]);
    assert.equal((await database.query('SELECT * FROM booking_slots(false) WHERE starts_at=$1', [first.starts_at])).rows.length, 1);
    assert.ok(new Date(first.starts_at).getTime() >= bookingNoticeStart(Date.now(), 120));
    const booking = (await database.query('SELECT * FROM reserve_booking($1,$2,$3,$4,true)', [first.starts_at, 'Client', 'CLIENT@example.com', clientId])).rows[0];
    assert.equal(booking.email, 'client@example.com');
    await assert.rejects(database.query('SELECT set_booking_slot_block($1,true)', [first.starts_at]));
    await assert.rejects(database.query('SELECT reserve_booking($1,$2,$3)', [first.starts_at, 'Other', 'other@example.com']));
    await assert.rejects(database.query('SELECT confirm_booking($1,$2,$3,$4)', [booking.id, 'cs_test', 'pi_test', 1]));
    await database.query('SELECT confirm_booking($1,$2,$3,$4)', [booking.id, 'cs_test', 'pi_test', 12500]);
    await database.query('SELECT confirm_booking($1,$2,$3,$4)', [booking.id, 'cs_test', 'pi_test', 12500]);
    assert.equal((await database.query('SELECT * FROM booking_jobs')).rows.length, 2);
    await assert.rejects(database.query('SELECT manage_booking($1,$2,$3)', [booking.id, adminId, 'cancel']));
    await database.query('SELECT submit_booking_questionnaire($1,$2,$3,true)', [booking.id, clientId, JSON.stringify({ name: 'Original' })]);
    await database.query('SELECT submit_booking_questionnaire($1,$2,$3,false)', [booking.id, clientId, JSON.stringify({ name: 'Draft edit' })]);
    assert.equal((await database.query("SELECT payload FROM booking_jobs WHERE kind = 'questionnaire'")).rows[0].payload.name, 'Original');
    const next = (await database.query('SELECT * FROM booking_slots(false)')).rows[0];
    await database.query('SELECT manage_booking($1,$2,$3,$4)', [booking.id, clientId, 'reschedule', next.starts_at]);
    await database.query('SELECT manage_booking($1,$2,$3)', [booking.id, clientId, 'cancel']);
    assert.equal((await database.query('SELECT status FROM bookings WHERE id=$1', [booking.id])).rows[0].status, 'refund_pending');
    slots = (await database.query('SELECT * FROM booking_slots(false)')).rows;
    const busy = slots[0];
    const imported = [{ external_uid: 'ovatu-id', client_name: 'Appointment', details: 'Details', location: '', starts_at: busy.starts_at, ends_at: busy.ends_at }];
    await database.query('SELECT import_booking_appointments($1)', [JSON.stringify(imported)]);
    const appointmentId = (await database.query('SELECT id FROM appointments')).rows[0].id;
    await database.query('SELECT import_booking_appointments($1)', [JSON.stringify(imported)]);
    assert.equal((await database.query('SELECT id FROM appointments')).rows[0].id, appointmentId);
    assert.equal((await database.query('SELECT reason FROM booking_slots(true) WHERE starts_at=$1', [busy.starts_at])).rows[0].reason, 'This time clashes with an appointment');
    await assert.rejects(database.query('SELECT set_booking_slot_block($1,true)', [busy.starts_at]));
    await database.query('SELECT import_booking_appointments($1)', ['[]']);
    assert.equal((await database.query('SELECT cancelled FROM appointments')).rows[0].cancelled, true);
    await database.query("INSERT INTO booking_availability(specific_date,start_time,end_time,unavailable) VALUES (($1::timestamptz AT TIME ZONE 'Europe/London')::date,'09:00','17:00',false), (($1::timestamptz AT TIME ZONE 'Europe/London')::date,'00:00','23:59',true)", [busy.starts_at]);
    assert.equal((await database.query("SELECT * FROM booking_slots(false) WHERE (starts_at AT TIME ZONE 'Europe/London')::date = ($1::timestamptz AT TIME ZONE 'Europe/London')::date", [busy.starts_at])).rows.length, 0);
    await database.exec("UPDATE booking_sync_state SET last_success=now()-interval '1 hour'");
    assert.equal((await database.query('SELECT * FROM booking_slots(false)')).rows.length, 0);
    await database.exec(`SET ROLE authenticated; SET request.jwt.claim.sub='${clientId}'`);
    assert.equal((await database.query('SELECT is_booking_admin() AS admin')).rows[0].admin, false);
    await assert.rejects(database.query("UPDATE profiles SET role='admin' WHERE id=$1", [clientId]));
    await assert.rejects(database.exec("INSERT INTO sections(heading) VALUES ('Forbidden')"));
    await assert.rejects(database.exec('SELECT * FROM appointments'));
    await assert.rejects(database.exec('SELECT * FROM bookings'));
    await assert.rejects(database.exec('SELECT booking_slots(false)'));
    await assert.rejects(database.query('SELECT set_booking_slot_block($1,true)', [first.starts_at]));
    await assert.rejects(database.exec('SELECT * FROM booking_slot_blocks'));
    await database.exec(`SET request.jwt.claim.sub='${adminId}'`);
    assert.equal((await database.query('SELECT is_booking_admin() AS admin')).rows[0].admin, true);
    await database.exec("INSERT INTO sections(heading) VALUES ('Allowed')");
    await database.exec('RESET ROLE; SET ROLE anon');
    await assert.rejects(database.exec('SELECT booking_user_by_email(\'client@example.com\')'));
    await database.exec('RESET ROLE');
    assert.equal((await database.query("SELECT booking_rate_limit('test',1,60) AS allowed")).rows[0].allowed, true);
    assert.equal((await database.query("SELECT booking_rate_limit('test',1,60) AS allowed")).rows[0].allowed, false);
  } finally { await database.close(); }
});

test('booking emails include branding, accessible logo, safe headings and action links', () => {
  const html = renderBookingEmail('Confirmed <session>', bookingEmailButton('https://example.com/?first=1&second=2', 'Open & confirm'), 'https://example.com');
  assert.ok(html.includes(`src="${bookingLogoUrl}"`));
  assert.ok(html.includes('alt="Victoria Blush Collections"'));
  assert.ok(html.includes('Confirmed &lt;session&gt;'));
  assert.ok(html.includes('https://example.com/?first=1&amp;second=2'));
  assert.ok(html.includes('Open &amp; confirm'));
  assert.ok(html.includes('https://example.com/privacy-policy'));
  assert.ok(html.includes('https://example.com/booking-terms'));
  assert.ok(html.includes('max-width:600px'));
  assert.ok(html.includes('href="https://instagram.com/victoriablushcollections"'));
  assert.ok(html.includes('alt="Instagram"'));
  assert.ok(html.includes('alt="Email Victoria"'));
  assert.ok(!html.includes('Company 16268010'));
});

test('rescheduling emails reach client and admin independently of failed Zoom jobs', async () => {
  const booking = { id: 'booking', status: 'confirmed', name: 'Test <Client>', email: 'client@example.com', starts_at: '2026-10-01T10:00:00Z', ends_at: '2026-10-01T11:00:00Z', price_pence: 12500 };
  const messages = [];
  const queued = [];
  const updates = [];
  const jobs = [{ id: 'reschedule-job', booking_id: booking.id, kind: 'rescheduled', attempts: 1 }, { id: 'zoom-job', booking_id: booking.id, kind: 'zoom_rescheduled', attempts: 1 }];
  const database = {
    rpc: async () => ({ data: jobs }),
    from(table) {
      return {
        select: () => ({ eq: () => ({ single: async () => ({ data: booking }) }) }),
        upsert: async value => { queued.push(value); return { data: null }; },
        update: value => ({ eq: async (column, id) => { updates.push({ table, id, ...value }); return { data: null }; } }),
      };
    },
  };
  const source = stripTypeScriptTypes(readFileSync(new URL('../lib/booking-worker.ts', import.meta.url), 'utf8')).replace(/^import .*;\r?\n/gm, '').replace(/^export /gm, '');
  const load = new Function('bookingDatabase', 'checked', 'requiredEnv', 'siteUrl', 'Resend', 'formatSessionDate', 'bookingEmailButton', 'escape', 'renderBookingEmail', `${source}\nreturn processBookingJobs;`);
  const processJobs = load(() => database, result => { if (result.error) throw result.error; return result.data; }, name => { if (name.startsWith('ZOOM_')) throw new Error('Zoom not configured'); return 'test-key'; }, () => 'https://example.com', class { emails = { send: async (message, options) => { messages.push({ ...message, ...options }); return {}; } }; }, value => value, bookingEmailButton, escapeBookingHtml, renderBookingEmail);
  assert.deepEqual(await processJobs(), { claimed: 2, completed: 1 });
  assert.deepEqual(messages.map(message => message.to), ['client@example.com', 'hello@victoriablushcollections.co.uk']);
  assert.ok(messages.every(message => message.html.includes(booking.starts_at) && message.html.includes(bookingLogoUrl)));
  assert.ok(messages[0].html.includes('Test &lt;Client&gt;'));
  assert.deepEqual(messages.map(message => message.idempotencyKey), ['reschedule-job:client', 'reschedule-job:admin']);
  assert.equal(queued[0].kind, 'zoom_rescheduled');
  assert.equal(queued[0].dedupe_key, 'reschedule-job:zoom');
  assert.ok(updates.find(update => update.id === 'reschedule-job').completed_at);
  assert.match(updates.find(update => update.id === 'zoom-job').last_error, /zoom_rescheduled/);
});