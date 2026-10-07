'use client';

import { useEffect, useId, useState } from 'react';
import { DateTime } from 'luxon';
import { ChevronLeft, ChevronRight, CreditCard, Mail, Clock3, Video, ArrowRight, Info } from 'lucide-react';
import styles from './booking.module.css';
import CustomerBookingTime, { useCustomerTimeZone } from './CustomerBookingTime';

export async function bookingRequest(body: object) {
  const response = await fetch('/api/bookings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Please try again.');
  return result;
}

export type Slot = { starts_at: string; ends_at: string; available: boolean; reason?: string };

export default function BookingWidget({ onReschedule }: { onReschedule?: (start: string) => Promise<void> }) {
  const id = useId();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [selectedMonth, setMonth] = useState<DateTime | null>(null);
  const [selectedZone, setZone] = useState<string | null>(null);
  const localZone = useCustomerTimeZone();
  const zone = selectedZone || localZone || 'Europe/London';
  const [day, setDay] = useState('');
  const [selected, setSelected] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/bookings', { signal: controller.signal, cache: 'no-store' }).then(async response => {
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setData(result);
      if (result.user) { setEmail(result.user.email); setName(result.user.name); }
      setError('');
    }).catch(problem => { if (problem.name !== 'AbortError') setError(problem.message); });
    return () => controller.abort();
  }, [refresh]);

  const slots: Slot[] = data?.slots || [];
  const daysWithSlots = new Set(slots.map(slot => DateTime.fromISO(slot.starts_at).setZone(zone).toISODate()));
  const daySlots = slots.filter(slot => DateTime.fromISO(slot.starts_at).setZone(zone).toISODate() === day);
  const today = DateTime.now().setZone(zone);
  const month = selectedMonth || today.startOf('month');
  const lastMonth = today.plus({ days: data?.settings.horizon_days || 14 }).startOf('month');

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || !selected) return;
    setBusy(true); setError('');
    try {
      if (onReschedule) { await onReschedule(selected); return; }
      const form = new FormData(event.currentTarget);
      const result = await bookingRequest({ action: 'checkout', starts_at: selected, name, email, terms: form.get('terms') === 'on', early_start: form.get('early_start') === 'on' });
      window.location.assign(result.url);
    } catch (problem) { setError(problem instanceof Error ? problem.message : 'Please try again.'); setRefresh(value => value + 1); }
    finally { setBusy(false); }
  }

  return <div className={styles.surface}>
    {data && <div className={`${styles.row} mb-5`}><span className={styles.badge}><Video size={16} /> 1-to-1 Zoom</span><span className={styles.badge}><Clock3 size={16} /> {data.settings.duration_minutes} minutes</span><strong className="text-xl">{new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 2 }).format(data.settings.price_pence / 100)}</strong></div>}
    {error && <div role="alert" className={`${styles.message} ${styles.error}`}>{error} <button type="button" className={styles.link} onClick={() => setRefresh(value => value + 1)}>Try again</button></div>}
    {!data && !error && <p role="status" className={styles.message}>Loading available sessions...</p>}
    {data && <div className={styles.frame} aria-busy={busy}>
      {!slots.length && <p role="status" className={`${styles.message} mx-4`}>{data.settings.enabled ? 'There are no available sessions at the moment. Please check back soon or contact Victoria.' : 'Online booking is not open yet. Please contact Victoria to enquire.'}</p>}
      <div className={styles.calendarLayout}>
        <div className={styles.calendar}>
          <div className={styles.month}><button title="Previous month" aria-label="Previous month" className={styles.icon} disabled={month <= today.startOf('month')} onClick={() => setMonth(month.minus({ months: 1 }))}><ChevronLeft size={20} /></button><h3 aria-live="polite">{month.toFormat('MMMM yyyy')}</h3><button title="Next month" aria-label="Next month" className={styles.icon} disabled={month >= lastMonth} onClick={() => setMonth(month.plus({ months: 1 }))}><ChevronRight size={20} /></button></div>
          <div className={styles.grid}>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(label => <span className={styles.weekday} key={label}>{label}</span>)}
            {Array.from({ length: month.weekday - 1 }, (_, index) => <span key={`blank-${index}`} />)}
            {Array.from({ length: month.daysInMonth || 31 }, (_, index) => {
              const date = month.plus({ days: index });
              const key = date.toISODate()!;
              return <button type="button" className={styles.day} key={key} aria-label={date.toFormat('cccc d LLLL yyyy')} aria-pressed={day === key} disabled={!daysWithSlots.has(key) || busy} onClick={() => { setDay(key); setSelected(''); }}>{index + 1}</button>;
            })}
          </div>
          <label className={`${styles.field} mt-5`} htmlFor={`${id}-zone`}>Time zone<select id={`${id}-zone`} className={styles.input} value={zone} onChange={event => { setZone(event.target.value); setMonth(null); setDay(''); setSelected(''); }}><option value="Europe/London">United Kingdom (London)</option>{localZone && localZone !== 'Europe/London' && <option value={localZone}>Your time ({localZone.replaceAll('_', ' ')})</option>}</select></label>
        </div>
        <div className={styles.times}><h3 className="font-semibold">{day ? DateTime.fromISO(day).toFormat('cccc d LLLL') : 'Choose a date'}</h3>{day && daySlots.length > 0 && <p className={`${styles.muted} mt-2`}>Choose an Available Time Slot</p>}<div className={styles.slots}>{daySlots.map(slot => <button type="button" key={slot.starts_at} className={styles.slot} disabled={busy} aria-pressed={selected === slot.starts_at} onClick={() => setSelected(slot.starts_at)}><CustomerBookingTime value={slot.starts_at} zone={zone} compact /></button>)}</div>{day && daySlots.length > 0 && <div role="note" className={`${styles.slotNotice} ${styles.infoSlotNotice} ${styles.timezoneNotice} mt-4`}><Info size={18} aria-hidden="true" /><p>Times are shown in your selected time zone. Victoria is on UK time ({DateTime.fromISO(selected || daySlots[0].starts_at).setZone('Europe/London').toFormat('ZZZZ', { locale: 'en-GB' })}).</p></div>}{day && !daySlots.length && <p className={styles.muted}>No times available on this date.</p>}</div>
      </div>
      {selected && <form onSubmit={submit} className={styles.form}>
        <h3 className="font-semibold"><CustomerBookingTime value={selected} zone={zone} /></h3>
        {!onReschedule && <>
          <div className={styles.columns}><label className={styles.field}>Your name<input className={styles.input} autoComplete="name" required maxLength={150} value={name} onChange={event => setName(event.target.value)} /></label><label className={styles.field}>Email<input className={styles.input} type="email" autoComplete="email" required maxLength={254} readOnly={!!data.user} value={email} onChange={event => setEmail(event.target.value)} /></label></div>
          {!data.user && <button type="button" className={`${styles.button} ${styles.secondary}`} disabled={busy || !email} onClick={async () => { setBusy(true); setError(''); try { const result = await bookingRequest({ action: 'login', email }); setMessage(result.message); } catch (problem) { setError((problem as Error).message); } finally { setBusy(false); } }}><Mail size={18} /> Already booked? Email me a sign-in link</button>}
          <p className={styles.muted}>Cancel or reschedule at least {data.settings.cancellation_hours} hours before your session. Eligible cancellations receive a full refund.</p>
          <label className={styles.check}><input type="checkbox" name="terms" required /><span>I agree to the <a className={styles.link} href="/booking-terms" target="_blank" rel="noreferrer">booking terms</a> and have read the <a className={styles.link} href="/privacy-policy" target="_blank" rel="noreferrer">privacy policy</a>.</span></label>
                   <label className={styles.check}><input type="checkbox" name="early_start" required /><span>Online bookings normally come with a 14-day cooling-off period, during which I could cancel for a refund. Because my session is within 14 days, I agree to it going ahead on the date I&apos;ve chosen. I understand I can still cancel for a full refund up to {data.settings.cancellation_hours} hours before, but not once the session has taken place.</span></label>
                 </>}
        <button type="submit" className={styles.button} disabled={busy}>{onReschedule ? <ArrowRight size={18} /> : <CreditCard size={18} />}{busy ? 'Please wait...' : onReschedule ? 'Confirm new time' : `Pay £${(data.settings.price_pence / 100).toFixed(2)} & book`}</button>
      </form>}
    </div>}
    {message && <p role="status" className={styles.message}>{message}</p>}
    {!onReschedule && <p className={`${styles.muted} mt-4`}><a className={styles.link} href="/booking/login">Manage an existing booking</a> · <a className={styles.link} href="/booking-terms">Booking terms</a> · <a className={styles.link} href="/privacy-policy">Privacy policy</a></p>}
  </div>;
}