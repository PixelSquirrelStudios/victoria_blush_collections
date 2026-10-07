'use client';

import { useState } from 'react';
import { Mail } from 'lucide-react';
import { bookingRequest } from '@/components/booking/BookingWidget';
import styles from '@/components/booking/booking.module.css';
import { cormorant } from '@/app/fonts';

export default function BookingLogin() {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  return <section className={`${styles.surface} mx-auto max-w-xl px-4 pt-32 pb-20`}><h1 className={`${cormorant.className} text-4xl mb-8`}>Manage Your Shift Session</h1><form className="grid gap-5" onSubmit={async event => { event.preventDefault(); const form = new FormData(event.currentTarget); setBusy(true); setError(''); try { const result = await bookingRequest({ action: 'login', email: form.get('email') }); setMessage(result.message); } catch (problem) { setError((problem as Error).message); } finally { setBusy(false); } }}><label className={styles.field}>Your booking email<input className={styles.input} type="email" name="email" autoComplete="email" required /></label><button className={styles.button} disabled={busy}><Mail size={18} /> {busy ? 'Sending...' : 'Email me a sign-in link'}</button></form>{message && <p role="status" className={styles.message}>{message}</p>}{error && <p role="alert" className={`${styles.message} ${styles.error}`}>{error}</p>}<a className={`${styles.link} inline-block mt-6`} href="/sign-in">Sign in with a password instead</a></section>;
}