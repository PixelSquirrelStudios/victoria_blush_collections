'use client';

import { useEffect, useState } from 'react';
import { Save, Send, RefreshCw, CheckCircle2, CalendarDays } from 'lucide-react';
import { questionnaireFields, occupations } from '@/lib/booking-rules';
import { bookingRequest } from './BookingWidget';
import CustomerBookingTime, { useCustomerTimeZone } from './CustomerBookingTime';
import styles from './booking.module.css';

export default function BookingQuestionnaire({ id }: { id: string }) {
  const zone = useCustomerTimeZone();
  const [booking, setBooking] = useState<any>(null);
  const [questionnaireAllowed, setQuestionnaireAllowed] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    async function load() {
      try {
        const response = await fetch(`/api/bookings?id=${encodeURIComponent(id)}`, { cache: 'no-store' });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error);
        if (cancelled) return;
        setBooking(result.booking); setError('');
        setQuestionnaireAllowed(result.questionnaireAllowed === true);
        setAnswers({ name: result.booking.name, email: result.booking.email, ...result.booking.questionnaire });
        if (result.booking.status === 'held' || (result.booking.status === 'confirmed' && !result.booking.user_id)) timer = setTimeout(load, 5000);
      } catch (problem) { if (!cancelled) setError((problem as Error).message); }
    }
    load();
    return () => { cancelled = true; clearTimeout(timer); };
  }, [id, refresh]);

  const readOnly = Boolean(booking && (booking.status !== 'confirmed' || Date.parse(booking.starts_at) <= Date.now()));

  async function save(complete: boolean) {
    if (!questionnaireAllowed || readOnly || busy) return;
    setBusy(true); setError(''); setMessage('');
    try { const result = await bookingRequest({ action: 'questionnaire', id, answers, complete }); setMessage(result.message); if (complete) setBooking({ ...booking, questionnaire_completed_at: new Date().toISOString() }); }
    catch (problem) { setError((problem as Error).message); }
    finally { setBusy(false); }
  }
  return <div className={`${styles.surface} ${styles.questionnaire}`}>
    {error && <p role="alert" className={`${styles.message} ${styles.error}`}>{error} <a className={styles.link} href="/booking/login">Request a sign-in link</a></p>}
    {!booking && !error && <p role="status">Loading your booking...</p>}
    {booking && <>
      <div className={styles.questionnaireSession}><CalendarDays size={22} aria-hidden="true" /><div><span className={styles.questionnaireSessionLabel}>Your Session</span><CustomerBookingTime value={booking.starts_at} zone={zone} /></div></div>
      {booking.status === 'held' || (booking.status === 'confirmed' && !booking.user_id) ? <div className={styles.message} role="status">Your payment and account are being confirmed. This page will update automatically. Your email confirmation will follow shortly.<button type="button" className={`${styles.button} ${styles.secondary} mt-4`} onClick={() => setRefresh(value => value + 1)}><RefreshCw size={18} /> Check again</button></div> : booking.status !== 'confirmed' && !questionnaireAllowed ? <p className={styles.message}>Booking status: {booking.status.replaceAll('_', ' ')}. Contact Victoria if you need assistance.</p> : !questionnaireAllowed ? <div className={styles.message} role="status"><h2 className="text-2xl mb-3">Check your inbox</h2><p>Your payment is confirmed. Open the link in your booking email to confirm your email address and complete your questionnaire.</p><p className="mt-3">Already confirmed? <a className={styles.link} href="/booking/login">Request a sign-in link</a>.</p><button type="button" className={`${styles.button} ${styles.secondary} mt-4`} onClick={() => setRefresh(value => value + 1)}><RefreshCw size={18} /> Check again</button></div> : <>
        {booking.questionnaire_completed_at && <div className={`${styles.slotNotice} ${styles.questionnaireStatus}`}><CheckCircle2 size={20} aria-hidden="true" /><p>Questionnaire completed. Your answers are saved.</p></div>}
        {readOnly && <p role="status" className={styles.slotNotice}>{booking.status === 'refunded' ? 'This session was cancelled and refunded.' : booking.status === 'refund_pending' ? 'This session was cancelled. Your refund is being processed.' : booking.status === 'cancelled' ? 'This session was cancelled.' : 'This session has already started.'} Your saved answers are read-only and cannot be changed or resent.</p>}
        <form onSubmit={event => { event.preventDefault(); save(true); }} className={styles.questionnaireForm}>
          <h2 className="text-xl font-semibold">Your Answers</h2>
          <fieldset disabled={busy || readOnly} className={styles.questionnaireFields}>
            {questionnaireFields.map(field => <label key={field.key} className={styles.field}>{field.label}{field.required ? ' *' : ' (optional)'}
              {field.key === 'occupation' ? <select className={styles.input} required value={answers[field.key] || ''} onChange={event => setAnswers({ ...answers, [field.key]: event.target.value })}><option value="">Select your role</option>{occupations.map(occupation => <option key={occupation}>{occupation}</option>)}</select>
                : ['name', 'email', 'instagram'].includes(field.key) ? <input className={styles.input} type={field.key === 'email' ? 'email' : 'text'} required={field.required} maxLength={3000} value={answers[field.key] || ''} onChange={event => setAnswers({ ...answers, [field.key]: event.target.value })} />
                : <textarea className={styles.input} rows={4} required={field.required} maxLength={3000} value={answers[field.key] || ''} onChange={event => setAnswers({ ...answers, [field.key]: event.target.value })} />}
            </label>)}
            {!readOnly && <div className={`${styles.row} ${styles.questionnaireActions}`}><button type="button" className={`${styles.button} ${styles.secondary}`} onClick={() => save(false)}><Save size={18} /> Save draft</button><button type="submit" className={styles.button}><Send size={18} /> {busy ? 'Saving...' : booking.questionnaire_completed_at ? 'Resend Updated Answers' : 'Send Answers to Victoria'}</button></div>}
          </fieldset>
        </form>
      </>}
    </>}
    {message && <p role="status" className={styles.message}>{message}</p>}
    <footer className={styles.questionnaireFooter}><a className={styles.link} href="/dashboard/bookings">Manage Bookings</a><a className={styles.link} href="/privacy-policy">Privacy Policy</a></footer>
  </div>;
}