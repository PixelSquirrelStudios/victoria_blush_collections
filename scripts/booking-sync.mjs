import nextEnv from '@next/env';
import { createClient } from '@supabase/supabase-js';
import { syncAppointmentCalendar } from '../lib/booking-sync.ts';

nextEnv.loadEnvConfig(process.cwd(), true);

const databaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const databaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const feedUrl = process.env.OVATU_ICAL_URL;
const once = process.argv.includes('--once');

if (!databaseUrl || !databaseKey || !feedUrl) {
  console.error('Configure NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY (or SUPABASE_SERVICE_ROLE_KEY), and OVATU_ICAL_URL in the local environment.');
  process.exitCode = 1;
} else {
  const database = createClient(databaseUrl, databaseKey, { auth: { persistSession: false, autoRefreshToken: false } });
  let stopped = false;
  let timer;
  const stop = () => { stopped = true; clearTimeout(timer); };
  process.once('SIGINT', stop);
  process.once('SIGTERM', stop);

  async function run() {
    try {
      const result = await syncAppointmentCalendar(database, feedUrl);
      console.log(`[${new Date().toISOString()}] Ovatu sync complete: ${result.imported} appointments imported. No email or payment jobs processed.`);
    } catch {
      console.error(`[${new Date().toISOString()}] Ovatu sync failed. Check the feed URL, connection and database configuration.`);
      if (once) process.exitCode = 1;
    }
    if (!once && !stopped) timer = setTimeout(run, 5 * 60 * 1000);
  }

  console.log(once ? 'Importing Ovatu appointments once.' : 'Local Ovatu sync running every five minutes. Press Ctrl+C to stop.');
  await run();
}