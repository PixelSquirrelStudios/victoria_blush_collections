import nextEnv from '@next/env';
import { randomBytes } from 'node:crypto';
import { spawn } from 'node:child_process';
import { access } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';

nextEnv.loadEnvConfig(process.cwd(), true);

const port = Number(process.env.PORT || 3000);
const origin = `http://localhost:${port}`;
const bundledCli = join(homedir(), '.local', 'bin', process.platform === 'win32' ? 'stripe.exe' : 'stripe');
const cli = process.env.STRIPE_CLI_PATH || (await access(bundledCli).then(() => bundledCli).catch(() => 'stripe'));
const stripeEnv = { ...process.env, STRIPE_API_KEY: process.env.STRIPE_SECRET_KEY };
const children = new Set();
let stopped = false;
let timer;

function stop(code = 0) {
  if (stopped) return;
  stopped = true;
  clearTimeout(timer);
  for (const child of children) child.kill();
  process.exitCode = code;
}

function start(command, args, options) {
  const child = spawn(command, args, options);
  children.add(child);
  child.once('exit', () => children.delete(child));
  return child;
}

function signingSecret() {
  return new Promise((resolve, reject) => {
    const child = start(cli, ['listen', '--print-secret'], { env: stripeEnv, stdio: ['ignore', 'pipe', 'pipe'] });
    let output = '';
    const timeout = setTimeout(() => { child.kill(); reject(new Error('Stripe CLI connection timed out.')); }, 30000);
    child.stdout.on('data', chunk => { output += chunk.toString(); });
    child.once('error', () => { clearTimeout(timeout); reject(new Error('Stripe CLI is unavailable. Install it or set STRIPE_CLI_PATH.')); });
    child.once('exit', code => {
      clearTimeout(timeout);
      const secret = output.match(/whsec_[A-Za-z0-9]+/)?.[0];
      if (code === 0 && secret) resolve(secret);
      else reject(new Error('Stripe CLI could not obtain a signing secret. Check the test key and connection.'));
    });
  });
}

process.once('SIGINT', () => stop());
process.once('SIGTERM', () => stop());

try {
  if (!process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_')) throw new Error('Local booking development requires a Stripe test secret key.');
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be a valid port number.');
  const webhookSecret = await signingSecret();
  const cronSecret = randomBytes(32).toString('hex');
  if (!stopped) {
    const server = start(process.execPath, ['--max-http-header-size=65536', 'node_modules/next/dist/bin/next', 'dev', '--port', String(port)], {
      env: { ...process.env, APP_URL: origin, STRIPE_WEBHOOK_SECRET: webhookSecret, BOOKING_CRON_SECRET: cronSecret },
      stdio: 'inherit',
    });
    server.once('error', () => { console.error('Local Next.js server could not start.'); stop(1); });
    server.once('exit', code => { if (!stopped) stop(code || 1); });

    const listener = start(cli, ['listen', '--events', 'checkout.session.completed,checkout.session.async_payment_succeeded', '--forward-to', `${origin}/api/stripe/webhook`], {
      env: stripeEnv, stdio: ['ignore', 'pipe', 'pipe'],
    });
    for (const stream of [listener.stdout, listener.stderr]) {
      let pending = '';
      stream.on('data', chunk => {
        pending += chunk.toString();
        const lines = pending.split(/\r?\n/);
        pending = lines.pop();
        for (const line of lines) console.log(line.replace(/(?:whsec_|sk_test_|rk_test_)\S+/g, '[redacted]'));
      });
    }
    listener.once('error', () => { console.error('Stripe forwarding could not start.'); stop(1); });
    listener.once('exit', code => { if (!stopped) stop(code || 1); });

    async function jobs() {
      try {
        const response = await fetch(`${origin}/api/bookings/cron?task=jobs`, {
          method: 'POST', headers: { Authorization: `Bearer ${cronSecret}` }, signal: AbortSignal.timeout(120000),
        });
        if (!response.ok) throw new Error(`Worker returned HTTP ${response.status}`);
        const result = await response.json();
        if (result.claimed) console.log(`Booking jobs: ${result.completed}/${result.claimed} completed.`);
      } catch {
        if (!stopped) console.error('Booking worker unavailable; retrying in 15 seconds.');
      }
      if (!stopped) timer = setTimeout(jobs, 15000);
    }

    console.log(`Local booking development: ${origin}. Stripe TEST payments; real emails and configured Zoom jobs. Ctrl+C stops all three services.`);
    console.log('Ovatu sync remains a separate command: npm run bookings:sync');
    if (!process.env.ZOOM_ACCOUNT_ID || !process.env.ZOOM_CLIENT_ID || !process.env.ZOOM_CLIENT_SECRET) console.warn('Zoom credentials are missing. Confirmation emails can run, but Zoom jobs will retry until configured.');
    await jobs();
  }
} catch (error) {
  console.error(error.message);
  stop(1);
}