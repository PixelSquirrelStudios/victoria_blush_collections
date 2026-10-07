'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { CalendarClock, CalendarDays, ClipboardList, Video, X, ArrowRight, RefreshCw, History, CreditCard, CheckCircle2, Mail } from 'lucide-react';
import BookingWidget, { bookingRequest } from './BookingWidget';
import { clientBookingState } from '@/lib/booking-rules';
import CustomerBookingTime, { useCustomerTimeZone } from './CustomerBookingTime';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import styles from './booking.module.css';
import dashboard from './dashboard.module.css';

type ClientBooking = {
  id: string;
  status: string;
  starts_at: string;
  ends_at: string;
  cancellation_hours: number;
  questionnaire_completed_at: string | null;
  price_pence: number;
  zoom_join_url: string | null;
};

const money = (pence: number) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(pence / 100);

export default function ClientBookings({ name = '', avatarUrl, initialBookings, initialNow }: { name?: string; avatarUrl?: string | null; initialBookings: ClientBooking[]; initialNow: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedView = searchParams.get('view');
  const view = requestedView && ['history', 'refunds', 'questionnaires'].includes(requestedView) ? requestedView : 'history';
  const requestedFilter = searchParams.get('filter');
  const filter = view === 'questionnaires' ? requestedFilter === 'completed' ? 'completed' : 'incomplete' : requestedFilter === 'previous' ? 'previous' : 'upcoming';
  const zone = useCustomerTimeZone();
  const [bookings, setBookings] = useState<ClientBooking[]>(initialBookings);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [selected, setSelected] = useState('');
  const reschedulePanel = useRef<HTMLElement>(null);
  useEffect(() => {
    if (selected) reschedulePanel.current?.scrollIntoView({ block: 'start' });
  }, [selected]);
  const [cancelId, setCancelId] = useState('');
  const [busy, setBusy] = useState(false);
  const [refresh, setRefresh] = useState(0);
  useEffect(() => { setSelected(''); setCancelId(''); }, [view, filter]);
  const [now, setNow] = useState(initialNow);
  useEffect(() => {
    setBookings(initialBookings);
    setNow(initialNow);
  }, [initialBookings, initialNow]);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30000);
    return () => window.clearInterval(timer);
  }, []);
  useEffect(() => {
    if (refresh === 0) return;
    const controller = new AbortController();
    setLoading(true);
    fetch('/api/bookings?view=mine', { signal: controller.signal, cache: 'no-store' }).then(async response => {
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      if (controller.signal.aborted) return;
      setBookings(result.bookings); setError(''); setNow(Date.now());
    }).catch(problem => { if (!controller.signal.aborted) setError(problem.message); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [refresh]);
  const pendingRefund = bookings.some(booking => booking.status === 'refund_pending');
  useEffect(() => {
    if (!pendingRefund) return;
    const timer = window.setInterval(() => setRefresh(value => value + 1), 30000);
    return () => window.clearInterval(timer);
  }, [pendingRefund]);
  async function manage(action: string, id: string, starts_at?: string) {
    setBusy(true); setError('');
    try {
      const result = await bookingRequest({ action, id, starts_at });
      setMessage(result.message); setSelected(''); setCancelId('');
      if (action === 'cancel') {
        setBookings(current => current.map(booking => booking.id === id ? { ...booking, status: 'refund_pending' } : booking));
        changeView('refunds');
      }
      setRefresh(value => value + 1);
    }
    catch (problem) { setError((problem as Error).message); throw problem; }
    finally { setBusy(false); }
  }
  const upcoming = bookings.filter(booking => clientBookingState(booking, now).upcoming).sort((first, second) => Date.parse(first.starts_at) - Date.parse(second.starts_at));
  const questionnaires = bookings.filter(booking => booking.status === 'confirmed' || (booking.questionnaire_completed_at && ['cancelled', 'refund_pending', 'refunded'].includes(booking.status)));
  const incomplete = questionnaires.filter(booking => !booking.questionnaire_completed_at);
  const completed = questionnaires.filter(booking => Boolean(booking.questionnaire_completed_at));
  const questionnairesToComplete = upcoming.filter(booking => clientBookingState(booking, now).needsQuestionnaire);
  const history = bookings.filter(booking => !clientBookingState(booking, now).upcoming);
  const refunds = bookings.filter(booking => clientBookingState(booking, now).refund);
  const shown = view === 'refunds' ? refunds : view === 'questionnaires' ? filter === 'completed' ? completed : incomplete : filter === 'previous' ? history : upcoming;
  const rescheduling = bookings.find(booking => booking.id === selected && clientBookingState(booking, now).manageable);
  const disabled = busy || loading;
  function tabCount(count: number) {
    return <span className={styles.clientTabCount}>{count}</span>;
  }
  function changeView(next: string) {
    router.push(next === 'history' ? '/dashboard/bookings' : `/dashboard/bookings?view=${next}`, { scroll: false });
    setSelected(''); setCancelId('');
  }
  function changeFilter(next: string) {
    router.push(`/dashboard/bookings?view=${view}&filter=${next}`, { scroll: false });
    setSelected(''); setCancelId('');
  }
  return <div className={`${dashboard.dashboard} ${styles.surface} ${styles.clientDashboard}`}>
    <header className={dashboard.header}>
      <div><h1>Dashboard</h1><p className={styles.muted}>{name ? `Welcome, ${name}` : 'The Shift Session'}</p></div>
      <div className={dashboard.headerAccount}>
        <Link href="/dashboard/edit-profile" className={dashboard.userProfile} aria-label="Edit Your Avatar" title="Edit Your Avatar"><Image src={avatarUrl || '/assets/images/Default_Avatar.jpg'} alt="" width={36} height={36} /><strong>{name || 'Your Account'}</strong></Link>
        <div className={dashboard.headerActions}>
          <button type="button" className={styles.icon} title="Refresh Bookings" aria-label="Refresh Bookings" disabled={disabled} onClick={() => setRefresh(value => value + 1)}><RefreshCw size={18} /></button>
          <Link className={dashboard.secondaryLink} href="/" target="_blank" rel="noreferrer">View Website<ArrowRight size={16} /></Link>
          <Link className={dashboard.primaryLink} href="/dashboard/book-session"><CalendarDays size={18} />Book a Session<ArrowRight size={16} /></Link>
        </div>
      </div>
    </header>
    {error && <p role="alert" className={`${styles.message} ${styles.error}`}>{error} <button type="button" className={styles.link} disabled={disabled} onClick={() => setRefresh(value => value + 1)}>Try Again</button> <a className={styles.link} href="/booking/login">Sign In</a></p>}
    {message && <p role="status" className={styles.message}>{message}</p>}
    <div className={dashboard.metrics}>
      {[
        { label: 'Upcoming Sessions', count: upcoming.length, target: 'history', icon: CalendarDays, tone: 'sage' },
        { label: 'Questionnaires To Complete', count: questionnairesToComplete.length, target: 'questionnaires', icon: ClipboardList, tone: 'blue' },
        { label: 'Refunds Processing', count: refunds.filter(booking => booking.status === 'refund_pending').length, target: 'refunds', icon: CreditCard, tone: 'blush' },
      ].map(({ label, count, target, icon: Icon, tone }) => <button type="button" key={target} className={`${dashboard.metric} ${styles.clientMetric}`} data-tone={tone} disabled={disabled} onClick={() => changeView(target)}><span className={dashboard.metricTop}><Icon size={20} /><ArrowRight size={16} /></span><strong className={`${dashboard.metricValue} ${styles.clientMetricValue}`}>{count}</strong><span>{label}</span></button>)}
    </div>
    <Tabs value={view} onValueChange={changeView}>
      <TabsList className={dashboard.tabList} aria-label="Your bookings">
        <TabsTrigger className={dashboard.tab} value="history"><History size={16} />Booking History</TabsTrigger>
        <TabsTrigger className={dashboard.tab} value="questionnaires"><ClipboardList size={16} />Questionnaires</TabsTrigger>
        <TabsTrigger className={dashboard.tab} value="refunds"><CreditCard size={16} />Refunds</TabsTrigger>
      </TabsList>
      <TabsContent value={view}>
        <Tabs value={filter} onValueChange={changeFilter}>
          {view !== 'refunds' && <TabsList className={styles.listingTabs} aria-label={view === 'questionnaires' ? 'Questionnaire status' : 'Booking period'}>
            {view === 'questionnaires' ? <>
              <TabsTrigger className={styles.listingTab} value="incomplete"><ClipboardList size={16} />Incomplete {tabCount(incomplete.length)}</TabsTrigger>
              <TabsTrigger className={styles.listingTab} value="completed"><CheckCircle2 size={16} />Completed {tabCount(completed.length)}</TabsTrigger>
            </> : <>
              <TabsTrigger className={styles.listingTab} value="upcoming"><CalendarDays size={16} />Upcoming {tabCount(upcoming.length)}</TabsTrigger>
              <TabsTrigger className={styles.listingTab} value="previous"><History size={16} />Previous {tabCount(history.length)}</TabsTrigger>
            </>}
          </TabsList>}
          <TabsContent value={filter} className={styles.clientResults} aria-busy={loading}>
        {loading && <span role="status" className="sr-only">Updating your bookings...</span>}
        {!shown.length && <div className={styles.clientEmpty}>
          <span className={styles.clientEmptyIcon} aria-hidden="true">{view === 'refunds' ? <CreditCard size={28} /> : view === 'questionnaires' ? <ClipboardList size={28} /> : filter === 'previous' ? <History size={28} /> : <CalendarDays size={28} />}</span>
          <h2>{view === 'refunds' ? 'No Refunds' : view === 'questionnaires' ? filter === 'completed' ? 'No Completed Questionnaires' : 'No Incomplete Questionnaires' : filter === 'previous' ? 'No Previous Bookings' : 'No Upcoming Sessions'}</h2>
          {view === 'history' && filter === 'upcoming' && <Link className={dashboard.primaryLink} href="/dashboard/book-session"><CalendarDays size={18} aria-hidden="true" /><span>Book Your Next Session</span><ArrowRight size={16} aria-hidden="true" /></Link>}
        </div>}
        <div className={styles.bookingCards}>{shown.map(booking => {
          const state = clientBookingState(booking, now);
          if (view === 'questionnaires') {
            const complete = Boolean(booking.questionnaire_completed_at);
            const editable = booking.status === 'confirmed' && Date.parse(booking.starts_at) > now;
            return <article className={styles.clientQuestionnaireCard} key={booking.id} aria-labelledby={`questionnaire-${booking.id}`}>
              <header className={styles.clientQuestionnaireHeader}>
                <ClipboardList size={24} aria-hidden="true" />
                <h2 id={`questionnaire-${booking.id}`}>Session Questionnaire</h2>
                <span className={styles.clientQuestionnaireStatus} data-complete={complete}>{complete ? <CheckCircle2 size={16} aria-hidden="true" /> : <ClipboardList size={16} aria-hidden="true" />}{complete ? 'Completed' : 'Incomplete'}</span>
              </header>
              <div className={styles.clientQuestionnaireBooking}>
                <CalendarDays size={20} aria-hidden="true" />
                <div className={styles.clientQuestionnaireBookingDetails}>
                  <span className={styles.clientDetailLabel}>Related Booking</span>
                  <strong>The Shift Session</strong>
                  <CustomerBookingTime value={booking.starts_at} zone={zone} />
                  <Link href={`/dashboard/bookings?view=history&filter=${state.upcoming ? 'upcoming' : 'previous'}#client-booking-${booking.id}`} className={styles.link}>View Booking <ArrowRight size={14} aria-hidden="true" /></Link>
                </div>
              </div>
              <footer className={styles.clientQuestionnaireActions}>
                <span className={styles.muted}>{booking.status !== 'confirmed' ? `Session Cancelled${state.refund ? ` / ${state.label}` : ''}. Answers are read-only.` : editable ? complete ? 'Answers saved. You can still make changes.' : 'Ready to complete before your session.' : 'Session started. Answers are read-only.'}</span>
                <Link href={`/dashboard/questionnaire?id=${booking.id}`} className={styles.button}><ClipboardList size={16} aria-hidden="true" />{complete || !editable ? 'View Questionnaire' : 'Complete Questionnaire'}<ArrowRight size={16} aria-hidden="true" /></Link>
              </footer>
            </article>;
          }
          const deadline = new Date(Date.parse(booking.starts_at) - booking.cancellation_hours * 3600000).toISOString();
          return <article id={`client-booking-${booking.id}`} className={styles.bookingCard} key={booking.id} aria-labelledby={`client-booking-title-${booking.id}`}>
            <header className={styles.bookingCardHeader}><span className={styles.bookingAvatar}><Video size={24} /></span><div className={styles.bookingIdentity}><h2 id={`client-booking-title-${booking.id}`}>The Shift Session</h2><small>Reference: {booking.id}</small></div><span className={`${styles.badge} ${state.upcoming ? styles.bookingConfirmed : styles.bookingNeutral}`}>{state.label}</span></header>
            <div className={styles.bookingCardBody}><CustomerBookingTime value={booking.starts_at} zone={zone} /><div className={styles.bookingPayment}><span>Paid</span><strong>{money(booking.price_pence)}</strong></div></div>
            <div className={styles.clientBookingDetails}>
              {booking.status === 'refund_pending' && <p className={`${styles.slotNotice} ${styles.infoSlotNotice}`}>Your session is cancelled. Your full refund of {money(booking.price_pence)} is being processed to your original payment method.</p>}
              {booking.status === 'refunded' && <p className={styles.slotNotice}>A full refund of {money(booking.price_pence)} has been issued to your original payment method. Your bank may take 5-10 working days to show it.</p>}
              {state.upcoming && <>
                <div className={styles.clientQuestionnaireStatus} data-complete={Boolean(booking.questionnaire_completed_at)}>{booking.questionnaire_completed_at ? <CheckCircle2 size={18} aria-hidden="true" /> : <ClipboardList size={18} aria-hidden="true" />}<span>{booking.questionnaire_completed_at ? 'Questionnaire Completed' : 'Questionnaire Not Completed'}</span></div>
                <div className={styles.clientDeadline}><CalendarClock size={22} aria-hidden="true" /><div className={styles.clientDeadlineContent}><span className={styles.clientDetailLabel}>{state.manageable ? 'Changes & Refunds' : 'Changes Window Closed'}</span>{state.manageable ? <><p className={styles.clientDeadlineCaption}>Cancel for a full refund or reschedule by:</p><CustomerBookingTime value={deadline} zone={zone} /></> : <p className={styles.muted}>Contact Victoria about any changes or refund questions. Your statutory rights are unaffected.</p>}</div></div>
              </>}
            </div>
            <div className={styles.bookingCardActions}><div className={styles.clientActionGrid}>
              {booking.status === 'confirmed' && <Link href={`/dashboard/questionnaire?id=${booking.id}`} className={`${styles.button} ${styles.secondary}`}><ClipboardList size={16} />{state.needsQuestionnaire ? 'Complete Questionnaire' : 'View Questionnaire'}</Link>}
              {state.upcoming && (booking.zoom_join_url ? <a href={booking.zoom_join_url} target="_blank" rel="noreferrer" className={styles.button}><Video size={16} />Join Zoom</a> : <button type="button" disabled className={`${styles.button} ${styles.clientZoomPending}`}><Video size={16} aria-hidden="true" />Zoom Link Being Prepared</button>)}
              {state.manageable && <><button type="button" disabled={disabled} className={`${styles.button} ${styles.secondary}`} onClick={() => { setSelected(booking.id); setCancelId(''); }}><CalendarClock size={16} />Reschedule</button><button type="button" disabled={disabled} className={`${styles.button} ${styles.clientRefundAction}`} onClick={() => { setCancelId(booking.id); setSelected(''); }}><CreditCard size={16} />Cancel &amp; Request Refund</button></>}
              {!state.manageable && <a className={`${styles.button} ${styles.secondary}`} href="mailto:hello@victoriablushcollections.co.uk"><Mail size={16} />Contact Victoria</a>}
            </div></div>
            {cancelId === booking.id && state.manageable && <div className={styles.clientConfirmation} role="group" aria-label="Confirm cancellation and refund"><h3>Cancel This Session?</h3><p>Your booking will be cancelled and a full refund of {money(booking.price_pence)} requested to your original payment method.</p><div className={styles.row}><button type="button" disabled={disabled} className={`${styles.button} ${styles.danger}`} onClick={() => manage('cancel', booking.id).catch(() => {})}><CreditCard size={16} />{busy ? 'Requesting Refund...' : 'Confirm Cancellation & Refund'}</button><button type="button" disabled={disabled} className={`${styles.button} ${styles.secondary}`} onClick={() => setCancelId('')}>Keep Booking</button></div></div>}
          </article>;
        })}</div>
          </TabsContent>
        </Tabs>
      </TabsContent>
    </Tabs>
    {rescheduling && <section ref={reschedulePanel} className={styles.clientReschedule} aria-labelledby="reschedule-heading"><div className={styles.row}><h2 id="reschedule-heading" className="text-xl font-semibold grow">Reschedule Your Session</h2><button type="button" className={styles.icon} disabled={busy} title="Close Rescheduling" aria-label="Close Rescheduling" onClick={() => setSelected('')}><X size={18} /></button></div><p className="my-4"><CustomerBookingTime value={rescheduling.starts_at} zone={zone} /></p><BookingWidget key={rescheduling.id} onReschedule={start => manage('reschedule', rescheduling.id, start)} /></section>}
    <footer className={styles.clientFooter}><a className={styles.link} href="mailto:hello@victoriablushcollections.co.uk">Contact Victoria</a><a className={styles.link} href="/booking-terms">Booking Terms &amp; Refund Policy</a><a className={styles.link} href="/privacy-policy">Privacy Policy</a></footer>
  </div>;
}