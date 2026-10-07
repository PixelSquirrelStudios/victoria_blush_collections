'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DateTime } from 'luxon';
import { Ban, CalendarDays, CalendarX2, CheckCircle2, ChevronDown, ClipboardList, Clock3, Mail, RefreshCw, Save, Search, Settings2, UserRound, Video, VideoOff, X } from 'lucide-react';
import { Delete } from '@/components/shared/ActionButtons/Delete';
import { bookingRequest, type Slot } from './BookingWidget';
import { bookingNoticeStart, formatSessionDate, questionnaireFields } from '@/lib/booking-rules';
import styles from './booking.module.css';
import OvatuAgenda from './OvatuAgenda';
import BookingDatePicker from './BookingDatePicker';
import WeeklyHours from './WeeklyHours';
import SpecificDateHours from './SpecificDateHours';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { loadBookingSchedule } from '@/lib/booking-server';

const settingFields = [
  { key: 'price_pence', label: 'Session price (GBP)', divisor: 100, min: .5, max: 10000, step: .01 },
  { key: 'duration_minutes', label: 'Session length (minutes)', min: 15, max: 240 },
  { key: 'buffer_minutes', label: 'Buffer between appointments (minutes)', min: 0, max: 120 },
  { key: 'notice_hours', label: 'Minimum days ahead', divisor: 24, min: 0, max: 90, step: 1 },
  { key: 'horizon_days', label: 'How far ahead clients can book (days)', min: 1, max: 90 },
  { key: 'cancellation_hours', label: 'Cancel / reschedule / refund cutoff (hours)', min: 0, max: 2160 },
  { key: 'sync_max_age_minutes', label: 'Pause bookings if sync is older than (minutes)', min: 5, max: 120 },
];

export default function ScheduleManager({ initialView = 'Availability', initialDate, initialData, initialFilter = 'upcoming', initialBookingId = '', initialAppointmentId = '' }: { initialView?: string; initialDate?: string; initialData: Awaited<ReturnType<typeof loadBookingSchedule>>; initialFilter?: string; initialBookingId?: string; initialAppointmentId?: string }) {
  const router = useRouter();
  const [data, setData] = useState<any>(initialData);
  const tab = initialView;
  const linkedDate = initialDate && /^\d{4}-\d{2}-\d{2}$/.test(initialDate) && DateTime.fromISO(initialDate, { zone: 'Europe/London' }).isValid ? initialDate : '';
  const [settings, setSettings] = useState<any>(() => ({ ...initialData.settings, notice_hours: Math.ceil(initialData.settings.notice_hours / 24) * 24 }));
  const [date, setDate] = useState(() => linkedDate || DateTime.fromMillis(bookingNoticeStart(Date.now(), initialData.settings.notice_hours), { zone: 'Europe/London' }).toISODate()!);
  const [preview, setPreview] = useState(linkedDate);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState(initialFilter);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [refresh, setRefresh] = useState(0);
  const [loading, setLoading] = useState(false);
  const minimumNoticeHours = data?.settings.notice_hours ?? 120;
  useEffect(() => {
    if (tab === 'Availability') {
      setDate(linkedDate || DateTime.fromMillis(bookingNoticeStart(Date.now(), minimumNoticeHours), { zone: 'Europe/London' }).toISODate()!);
      setPreview(linkedDate);
    }
  }, [tab, minimumNoticeHours, linkedDate]);
  useEffect(() => {
    if (refresh === 0) return;
    const controller = new AbortController();
    setLoading(true);
    setError('');
    fetch('/api/bookings?view=admin', { signal: controller.signal, cache: 'no-store' }).then(async response => {
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setData(result); setSettings({ ...result.settings, notice_hours: Math.ceil(result.settings.notice_hours / 24) * 24 });
    }).catch(problem => { if (problem.name !== 'AbortError') setError(problem.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [refresh]);
  async function save(body: object) {
    setBusy(true); setError(''); setMessage('');
    try { const result = await bookingRequest(body); setMessage(result.message); setLoading(true); setRefresh(value => value + 1); return true; }
    catch (problem) { setError((problem as Error).message); return false; }
    finally { setBusy(false); }
  }
  const previewDay = preview || date;
  const specificDates = [...new Set<string>((data?.availability || []).filter((rule: any) => rule.specific_date).map((rule: any) => rule.specific_date))].sort();
  const closedDates = (data?.availability || []).filter((rule: any) => rule.specific_date && rule.unavailable);
  const now = DateTime.now().setZone('Europe/London');
  const earliestStart = DateTime.fromMillis(bookingNoticeStart(now.toMillis(), minimumNoticeHours), { zone: 'Europe/London' });
  const latestStart = now.plus({ hours: (data?.settings.horizon_days ?? 0) * 24 });
  const previewStart = DateTime.fromISO(previewDay, { zone: 'Europe/London' });
  const beforeNotice = previewStart.endOf('day') < earliestStart;
  const beyondHorizon = previewStart > latestStart;
  const noticeDays = Math.ceil(minimumNoticeHours / 24);
  const noticeLabel = `${noticeDays} calendar ${noticeDays === 1 ? 'day' : 'days'}`;
  const shownSlots: Slot[] = (data?.slots || []).filter((slot: Slot) => DateTime.fromISO(slot.starts_at).setZone('Europe/London').toISODate() === previewDay);
  function dateClosureReason(selectedDay: string) {
    const day = DateTime.fromISO(selectedDay, { zone: 'Europe/London' }).setLocale('en-GB');
    const overrides = data.availability.filter((rule: any) => rule.specific_date === selectedDay);
    if (overrides.some((rule: any) => rule.unavailable)) return 'This date is closed all day by a date-specific rule. Edit or remove its all-day closure to make times available.';
    if (overrides.length) return '';
    const weeklyRules = data.availability.filter((rule: any) => rule.weekday === day.weekday % 7);
    if (!weeklyRules.some((rule: any) => !rule.unavailable)) return `${day.toFormat('cccc')} is closed in Weekly Hours. Open ${day.toFormat('cccc')} and set its hours in the Weekly Hours tab to make times available.`;
    return '';
  }
  function addAvailabilityReason(selectedDay: string) {
    const day = DateTime.fromISO(selectedDay, { zone: 'Europe/London' });
    const closure = dateClosureReason(selectedDay);
    if (closure) return closure;
    if (day.endOf('day') < earliestStart) return `Specific availability cannot be added before ${earliestStart.toFormat('d LLL yyyy')}, because of the ${noticeLabel} minimum notice.`;
    if (day > latestStart) return `Specific availability cannot be added this far ahead. Clients can only book up to ${data.settings.horizon_days} days ahead. Adjust the booking limits in Settings.`;
    if (!data.settings.enabled) return 'Specific availability cannot be added while online bookings are paused. Turn bookings on using the header toggle.';
    if (!data.sync.last_success || now.toMillis() - Date.parse(data.sync.last_success) > data.settings.sync_max_age_minutes * 60000) return 'Specific availability cannot be added until the Ovatu calendar has synced successfully. Refresh the schedule after syncing.';
    const slots: Slot[] = data.slots.filter((slot: Slot) => DateTime.fromISO(slot.starts_at).setZone('Europe/London').toISODate() === selectedDay);
    if (slots.some(slot => slot.available)) return '';
    if (!slots.length) return 'There are no bookable windows on this date. Set open hours in Weekly Hours, or edit an existing date-specific range to fit a full session, before adding more hours.';
    const reasons = [...new Set(slots.map(slot => slot.reason))];
    if (reasons.every(reason => reason === 'This time clashes with an appointment')) return 'All slots clash with Ovatu appointments, including the required buffer. Specific availability cannot be added while no slots are available.';
    if (reasons.every(reason => reason === 'Blocked by Admin' || reason === 'Blocked by Victoria')) return 'All slots are blocked by an admin. Restore a blocked slot before adding specific availability.';
    if (reasons.every(reason => reason === 'This time clashes with a booking' || reason === 'This time clashes with a session booking')) return 'All slots clash with session bookings, including the required buffer. Specific availability cannot be added while no slots are available.';
    return 'No slots are available on this date. Resolve the appointment conflicts, session bookings or admin blocks shown in the preview before adding specific availability.';
  }
  const shownConflicts = (data?.appointments || []).filter((appointment: any) => DateTime.fromISO(appointment.starts_at).setZone('Europe/London').toISODate() === previewDay);
  const shownBookings = (data?.bookings || []).filter((booking: any) => (!initialBookingId || booking.id === initialBookingId) && `${booking.name} ${booking.email}`.toLowerCase().includes(search.toLowerCase()) && (filter === 'all' || (filter === 'paid' ? booking.status !== 'refunded' : filter === 'refunded' ? booking.status === 'refunded' : booking.status === 'confirmed' && Date.parse(booking.ends_at) > Date.now() && (filter !== 'incomplete' || !booking.questionnaire_completed_at))));
  return <div className={`${styles.surface} ${styles.scheduleSurface}`}>
    <div className={styles.row}><div className="grow"><p className={styles.muted}>The Shift Session</p><h1 className="text-3xl font-medium">Schedule</h1></div><button title="Refresh schedule" aria-label="Refresh schedule" className={styles.icon} onClick={() => setRefresh(value => value + 1)}><RefreshCw size={20} /></button></div>
    <div className={styles.scheduleFeedback}>
      <p role="alert" className={`${styles.message} ${styles.error}`}>{error}</p>
      <p role="status" className={styles.message}>{!error && (busy ? 'Saving changes...' : loading ? data ? 'Updating schedule...' : 'Loading schedule...' : message)}</p>
    </div>
      <div className={styles.scheduleMeta}>
        <div className={styles.bookingToggle}>
          <Switch aria-label="Accept online bookings" checked={data?.settings.enabled ?? false} disabled={!data || busy || loading} onCheckedChange={enabled => { void save({ action: 'booking_enabled', enabled }); }} />
          <strong className={styles.bookingStatus} data-open={data?.settings.enabled ?? false} role="status">{data ? data.settings.enabled ? 'Bookings Open' : 'Bookings Paused' : 'Loading Status'}</strong>
        </div>
        <div className={styles.scheduleSync}><RefreshCw size={16} aria-hidden="true" /><span>Ovatu: {data ? data.sync.last_success ? `last synced ${DateTime.fromISO(data.sync.last_success).setZone('Europe/London').toFormat('d LLL, HH:mm')}` : 'not synced yet' : 'loading sync status...'}</span></div>
      </div>
      <div role="tablist" aria-label="Schedule views" className={styles.tabs}>{[
        { view: 'Availability', icon: CalendarDays },
        { view: 'Weekly Hours', icon: Clock3 },
        { view: 'Bookings', icon: Video },
        { view: 'Appointments', icon: ClipboardList },
        { view: 'Settings', icon: Settings2 },
      ].map(({ view, icon: Icon }) => <button key={view} role="tab" aria-selected={tab === view} className={styles.tab} onClick={() => { router.push(view === 'Availability' ? '/dashboard/schedule' : `/dashboard/schedule?view=${view === 'Weekly Hours' ? 'weekly' : view.toLowerCase()}`, { scroll: false }); setSearch(''); }}><Icon size={17} aria-hidden="true" /><span>{view}</span></button>)}</div>
    {!data && <div className={styles.schedulePlaceholder} aria-hidden="true"><div className={styles.columns}>{[0, 1].map(column => <div key={column} className={styles.skeletonColumn}><div className={styles.skeletonHeading} /><div className={styles.skeletonInput} /><div className={styles.skeletonInput} /><div className={styles.skeletonInput} /></div>)}</div></div>}
    {data && <>
      {(data.sync.last_error || !data.sync.last_success || Date.now() - Date.parse(data.sync.last_success) > settings.sync_max_age_minutes * 60000) && <p className={`${styles.message} ${styles.error}`}>The Ovatu calendar needs attention. New bookings remain blocked until a fresh sync succeeds. {data.sync.last_error}</p>}
      {data.jobs.length > 0 && <details className={styles.message}><summary className="cursor-pointer font-semibold">{data.jobs.length} background tasks need attention</summary>{data.jobs.map((job: any) => <div key={job.id} className={`${styles.row} mt-3`}><p className="grow">{job.kind}: {job.last_error}</p><button className={`${styles.button} ${styles.secondary}`} disabled={busy} onClick={() => save({ action: 'retry_job', id: job.id })}><RefreshCw size={16} /> Retry</button></div>)}</details>}
      {tab === 'Availability' && <div>
        <div className={styles.availabilityColumns}>
          <div className={styles.availabilityPanel}>
            <div className={styles.availabilityHeading}><h2 className="text-xl font-medium">Specific Date Availability</h2></div>
            <div className={styles.dateAvailabilityForm}>
            <div className={styles.field}>Date<BookingDatePicker label="Availability date" value={date} onChange={value => { setDate(value); setPreview(value); }} /></div>
            <SpecificDateHours key={date} date={date} rules={data.availability} disabled={busy || loading} save={save} addDisabledReason={addAvailabilityReason(date)} />
            </div>
          </div>
          <div className={styles.availabilityPanel}><div className={styles.availabilityHeading}><h2 className="text-xl font-medium">Available Times & Conflicts</h2></div><div className={styles.field}>Date<BookingDatePicker label="Preview date" value={previewDay} onChange={value => { setPreview(value); setDate(value); }} /></div>
            <div className="grid content-start gap-4">
            {beforeNotice && !dateClosureReason(previewDay) && <div className={`${styles.slotNotice} ${styles.infoSlotNotice}`} role="status">
              <h3>Minimum Notice: {noticeLabel}</h3>
              <p>This date is too soon for bookings, even when availability is saved. Earliest permitted start: {earliestStart.toFormat('d LLL yyyy, HH:mm ZZZZ', { locale: 'en-GB' })}.</p>
              <button type="button" className={`${styles.button} ${styles.secondary}`} onClick={() => router.push('/dashboard/schedule?view=settings', { scroll: false })}><Clock3 size={16} aria-hidden="true" /> Edit Booking Limits</button>
            </div>}
            <div className={`${styles.slots} ${styles.adminSlots}`}>{shownSlots.map(slot => {
              const manuallyBlocked = (data.slotBlocks || []).some((block: Slot) => Date.parse(block.starts_at) === Date.parse(slot.starts_at));
              const appointmentClash = slot.reason === 'This time clashes with an appointment';
              const sessionClash = slot.reason === 'This time clashes with a booking' || slot.reason === 'This time clashes with a session booking';
              const label = slot.available ? 'Available' : manuallyBlocked ? 'Blocked by Admin' : sessionClash ? 'Clashes With Another Session' : appointmentClash ? 'Clashes With A Hair Appointment' : slot.reason;
              const SlotIcon = slot.available ? CheckCircle2 : manuallyBlocked ? Ban : sessionClash ? VideoOff : appointmentClash ? CalendarX2 : Clock3;
              const time = DateTime.fromISO(slot.starts_at).setZone('Europe/London').toFormat('HH:mm');
              const action = manuallyBlocked ? 'Restore slot' : slot.available ? 'Block slot' : label;
              return <Delete
                key={slot.starts_at}
                title={`Slot for ${formatSessionDate(slot.starts_at)}`}
                variant="admin"
                confirmationTitle={`${manuallyBlocked ? 'Restore' : 'Block'} Slot for ${formatSessionDate(slot.starts_at)}?`}
                description={manuallyBlocked ? 'This removes the Admin Block. The time will be available if no other Booking restrictions or Conflicts apply.' : 'This adds an Admin Block and prevents new Bookings for this time. You can restore the Slot later.'}
                confirmLabel={manuallyBlocked ? 'Restore Slot' : 'Block Slot'}
                pendingLabel={manuallyBlocked ? 'Restoring...' : 'Blocking...'}
                disabled={busy || loading || (!slot.available && !manuallyBlocked)}
                onConfirm={() => save({ action: 'slot_block', starts_at: slot.starts_at, blocked: !manuallyBlocked })}
                trigger={<button className={`${styles.slot} ${appointmentClash ? styles.appointmentClash : sessionClash ? styles.sessionClash : slot.available ? styles.availableSlot : manuallyBlocked ? styles.blockedSlot : ''}`} disabled={busy || loading || (!slot.available && !manuallyBlocked)} title={`${time}: ${action}`} aria-label={`${time}: ${action}`} aria-pressed={manuallyBlocked} type="button"><span className={styles.slotTime}><SlotIcon size={18} aria-hidden="true" />{time}</span><small className={`${styles.slotStatus} ${styles.slotStateLabel}`}>{label}</small></button>}
              />;
            })}</div>
            {shownSlots.some(slot => slot.available) && <div className={styles.slotNotice}>
              <h3>Slot Availability</h3>
              <p>Click a green slot to turn its Availability off. Click a slot blocked by an Admin to restore it.</p>
            </div>}
            {!shownSlots.length && dateClosureReason(previewDay) && <div className={`${styles.slotNotice} ${styles.infoSlotNotice}`} role="status">
              <h3>Closed This Day</h3>
              <p>{dateClosureReason(previewDay)}</p>
              {!data.availability.some((rule: any) => rule.specific_date === previewDay) && <button type="button" className={`${styles.button} ${styles.secondary}`} onClick={() => router.push('/dashboard/schedule?view=weekly', { scroll: false })}><Clock3 size={16} aria-hidden="true" /> Edit Weekly Hours</button>}
            </div>}
            {!shownSlots.length && !beforeNotice && !dateClosureReason(previewDay) && <div className={`${styles.slotNotice} ${styles.infoSlotNotice}`} role="status">
                <h3>{beyondHorizon ? 'Too Far Ahead' : 'No Bookable Windows'}</h3>
              <p>{beyondHorizon
                  ? `Clients can only book up to ${data.settings.horizon_days} days ahead. This date is further ahead, so slots are hidden even when availability is saved.`
                  : 'No saved availability produces a full session on this date. Date-specific rules replace weekly hours.'}</p>
                  {beyondHorizon && <button type="button" className={`${styles.button} ${styles.secondary}`} onClick={() => router.push('/dashboard/schedule?view=settings', { scroll: false })}><Clock3 size={16} aria-hidden="true" /> Edit Booking Limits</button>}
            </div>}
            {shownConflicts.length > 0 && <details className={styles.conflicts} key={previewDay}>
              <summary className={styles.conflictsSummary}><CalendarX2 size={20} aria-hidden="true" /><span>Conflicts<span className={styles.conflictsHint}>Click to View All</span><span className={styles.conflictsCollapseHint}>Click to Collapse</span></span><span className={styles.conflictsCount}>{shownConflicts.length}</span><ChevronDown size={18} className={styles.conflictsChevron} aria-hidden="true" /></summary>
              {shownConflicts.map((appointment: any) => <div className={styles.conflictCard} key={appointment.id}>
                <CalendarX2 size={20} aria-hidden="true" />
                <div>
                  <p className={styles.conflictTime}>{DateTime.fromISO(appointment.starts_at).setZone('Europe/London').toFormat('HH:mm')} - {DateTime.fromISO(appointment.ends_at).setZone('Europe/London').toFormat('HH:mm')}</p>
                  <strong className={styles.conflictText}>{appointment.client_name}</strong>
                  {appointment.details && <p className={`${styles.conflictText} ${styles.conflictDetails}`}>{appointment.details}</p>}
                </div>
              </div>)}
              <div className={`${styles.slotNotice} ${styles.emptySlotNotice} mt-4`}>
                <p>These Ovatu Appointments block overlapping booking times, including the configured buffer. They cannot be overridden here.</p>
              </div>
            </details>}
          </div>
          </div>
        </div>
        <Tabs defaultValue="specific" className="mt-10">
          <h2 className="text-xl font-medium mb-3">All Specific Date Overrides &amp; Blocks</h2>
          <TabsList aria-label="All saved specific dates and blocks" className={styles.listingTabs}>
            <TabsTrigger value="specific" className={styles.listingTab}><CalendarDays size={16} aria-hidden="true" />Specific Dates</TabsTrigger>
            <TabsTrigger value="blocked" className={`${styles.listingTab} ${styles.blockedListingTab}`}><CalendarX2 size={16} aria-hidden="true" />Blocks</TabsTrigger>
          </TabsList>
          <TabsContent value="specific" className="grid gap-6">
            {!specificDates.length && <p className={styles.message}>No date-specific changes saved.</p>}
            {specificDates.map(savedDate => <SpecificDateHours key={savedDate} date={savedDate} rules={data.availability} disabled={busy || loading} save={save} addDisabledReason={addAvailabilityReason(savedDate)} />)}
          </TabsContent>
          <TabsContent value="blocked">
            {!data.slotBlocks?.length && !closedDates.length && <p className={`${styles.slotNotice} ${styles.infoSlotNotice} mt-3`}>No date or time blocks saved.</p>}
            {closedDates.map((rule: any) => <div className={styles.adminBlockRow} key={rule.id}><CalendarX2 size={20} aria-hidden="true" /><div><p className={styles.adminBlockDate}>{DateTime.fromISO(rule.specific_date).toFormat('cccc d LLL yyyy')}</p><p className={styles.adminBlockTime}>Closed All Day</p></div><Delete title="all-day closure" confirmationTitle="Remove All-Day Closure?" description="Any remaining date-specific rules apply. If none remain, weekly hours apply again." variant="admin" disabled={busy || loading} onConfirm={() => save({ action: 'delete_availability', id: rule.id })} /></div>)}
            {(data.slotBlocks || []).map((block: Slot) => <div className={styles.adminBlockRow} key={block.starts_at}><CalendarX2 size={20} aria-hidden="true" /><div><p className={styles.adminBlockDate}>{DateTime.fromISO(block.starts_at).setZone('Europe/London').toFormat('cccc d LLL yyyy')}</p><p className={styles.adminBlockTime}>{DateTime.fromISO(block.starts_at).setZone('Europe/London').toFormat('HH:mm')} - {DateTime.fromISO(block.ends_at).setZone('Europe/London').toFormat('HH:mm')}</p></div><Delete title={`Admin Block for ${formatSessionDate(block.starts_at)}`} description="This removes the Admin Block. The time will be available if no other Booking restrictions or Conflicts apply." variant="admin" disabled={busy || loading} onConfirm={() => save({ action: 'slot_block', starts_at: block.starts_at, blocked: false })} /></div>)}
          </TabsContent>
        </Tabs>
      </div>}
      {tab === 'Bookings' && <>
        {initialBookingId && <button type="button" className={`${styles.button} ${styles.secondary}`} onClick={() => router.push('/dashboard/schedule?view=bookings&filter=all', { scroll: false })}><ClipboardList size={17} />Show All Bookings</button>}
        <div className={styles.bookingFilters}>
          <div className={styles.field}><label htmlFor="booking-search">Search Bookings</label><div className={styles.agendaSearch}><Search size={18} aria-hidden="true" /><input id="booking-search" className={styles.input} type="search" placeholder="Name or email address" value={search} onChange={event => setSearch(event.target.value)} />{search && <button type="button" className={styles.agendaSearchClear} title="Clear Search" aria-label="Clear Search" onClick={event => { setSearch(''); event.currentTarget.parentElement?.querySelector('input')?.focus(); }}><X size={18} aria-hidden="true" /></button>}</div></div>
          <label className={styles.field}>Show<select className={styles.input} value={filter} onChange={event => setFilter(event.target.value)}><option value="upcoming">Upcoming Confirmed</option><option value="incomplete">Questionnaire Incomplete</option><option value="refunded">Refunded Bookings</option><option value="paid">Paid Bookings</option><option value="all">All Bookings</option></select></label>
          <button type="button" className={styles.icon} title="Clear Filters" aria-label="Clear Filters" disabled={!search && filter === 'upcoming' && !initialBookingId} onClick={() => { setSearch(''); setFilter('upcoming'); router.push('/dashboard/schedule?view=bookings', { scroll: false }); }}><X size={18} aria-hidden="true" /></button>
        </div>
        <p className={styles.agendaCount} role="status">{shownBookings.length} {shownBookings.length === 1 ? 'booking' : 'bookings'}</p>
        <div className={styles.bookingCards}>{shownBookings.map((booking: any) => {
          const start = DateTime.fromISO(booking.starts_at).setZone('Europe/London');
          const end = DateTime.fromISO(booking.ends_at).setZone('Europe/London');
          return <article key={booking.id} className={styles.bookingCard} aria-labelledby={`booking-${booking.id}`}>
            <header className={styles.bookingCardHeader}>
              <span className={styles.bookingAvatar}><UserRound size={24} aria-hidden="true" /></span>
              <div className={styles.bookingIdentity}><h2 id={`booking-${booking.id}`}>{booking.name}</h2><a href={`mailto:${booking.email}`}><Mail size={15} aria-hidden="true" /><span>{booking.email}</span></a></div>
              <span className={`${styles.badge} ${booking.status === 'confirmed' ? styles.bookingConfirmed : styles.bookingNeutral}`}>{booking.status === 'confirmed' && <CheckCircle2 size={14} aria-hidden="true" />}{booking.status.replaceAll('_', ' ')}</span>
            </header>
            <div className={styles.bookingCardBody}>
              <div className={styles.bookingDate}><CalendarDays size={22} aria-hidden="true" /><div><time dateTime={booking.starts_at}>{start.toFormat('cccc d LLLL yyyy')}</time><p><Clock3 size={14} aria-hidden="true" />{start.toFormat('HH:mm')} - {end.toFormat('HH:mm')} <span>{start.toFormat('ZZZZ', { locale: 'en-GB' })}</span></p></div></div>
              <div className={styles.bookingPayment}><span>{booking.status === 'refunded' ? 'Refunded' : booking.status === 'refund_pending' ? 'Refund pending' : 'Paid'}</span><strong>£{(booking.price_pence / 100).toFixed(2)}</strong></div>
            </div>
            <div className={styles.bookingCardActions}>
              <span className={styles.bookingQuestionnaireState}>{booking.questionnaire_completed_at ? <CheckCircle2 size={18} aria-hidden="true" /> : <ClipboardList size={18} aria-hidden="true" />}Questionnaire {booking.questionnaire_completed_at ? 'completed' : 'awaiting completion'}</span>
              {booking.zoom_join_url ? <a className={`${styles.button} ${styles.bookingZoom}`} href={booking.zoom_join_url} target="_blank" rel="noreferrer"><Video size={17} aria-hidden="true" /> Open Zoom</a> : booking.status === 'confirmed' && <span className={styles.bookingZoomPending}><Video size={16} aria-hidden="true" /> Zoom link pending</span>}
            </div>
            <details className={styles.bookingAnswers}><summary><ClipboardList size={17} aria-hidden="true" /><span>Questionnaire answers</span><ChevronDown size={18} aria-hidden="true" /></summary><dl>{questionnaireFields.map(field => <div key={field.key}><dt>{field.label}</dt><dd>{booking.questionnaire?.[field.key] || 'Not supplied'}</dd></div>)}</dl></details>
          </article>;
        })}</div>
        {!shownBookings.length && <div className={styles.agendaEmpty}><CalendarDays size={28} aria-hidden="true" /><h3>{data.bookings.length ? 'No matching bookings' : 'No paid bookings yet'}</h3>{data.bookings.length > 0 && <button type="button" className={`${styles.button} ${styles.secondary}`} onClick={() => { setSearch(''); setFilter('all'); if (initialBookingId) router.push('/dashboard/schedule?view=bookings&filter=all', { scroll: false }); }}>Show All Bookings</button>}</div>}
      </>}
      {tab === 'Appointments' && <OvatuAgenda appointments={data.appointments} appointmentId={initialAppointmentId} />}
      {tab === 'Weekly Hours' && <section className="max-w-3xl"><h2 className="text-xl font-medium mb-4">Weekly Hours</h2><WeeklyHours rules={data.availability} disabled={busy || loading} save={save} /></section>}
      {tab === 'Settings' && <form className="grid gap-6 max-w-3xl" onSubmit={event => { event.preventDefault(); save({ action: 'settings', settings }); }}><div className={styles.columns}>{settingFields.map(field => <label className={styles.field} key={field.key}>{field.label}<input className={styles.input} type="number" required min={field.min} max={field.max} step={field.step || 1} value={settings[field.key] / (field.divisor || 1)} onChange={event => setSettings({ ...settings, [field.key]: Math.round(Number(event.target.value) * (field.divisor || 1)) })} /></label>)}</div><p className={styles.muted}>Changes apply to new bookings. Existing bookings keep their agreed price, duration and cancellation cutoff. Date-specific availability replaces weekly hours for that date.</p><button className={styles.button} disabled={busy || loading}><Save size={18} /> Save settings</button></form>}
    </>}
  </div>;
}