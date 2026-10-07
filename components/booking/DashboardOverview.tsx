'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { DateTime } from 'luxon';
import { ArrowDownUp, ArrowRight, CalendarDays, CheckCircle2, ClipboardList, Clock3, CreditCard, Globe, GraduationCap, ImageIcon, ListChecks, Plus, RefreshCw, Settings2, UserRound, Video } from 'lucide-react';
import { TbHomeEdit } from 'react-icons/tb';
import styles from './dashboard.module.css';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { bookingRequest } from './BookingWidget';

export type DashboardSnapshot = {
  profile: { username: string | null; avatar_url: string | null; email: string | null };
  generatedAt: string;
  enabled: boolean | null;
  sync: { last_success: string | null; last_error: string | null } | null;
  syncMaxAge: number;
  counts: { sessions: number | null; questionnaires: number | null; refunded: number | null; appointments: number | null; images: number | null; services: number | null; sections: number | null };
  sessions: { id: string; name: string; starts_at: string; ends_at: string; questionnaire_completed_at: string | null; zoom_join_url: string | null }[] | null;
  appointments: { id: string; client_name: string; starts_at: string; ends_at: string }[] | null;
  nextSlot: string | null;
  slotsLoaded: boolean;
  issues: string[];
};

const ukDate = (value: string) => DateTime.fromISO(value).setZone('Europe/London').setLocale('en-GB');
const countLabel = (value: number | null) => value === null ? 'Unavailable' : String(value);

export default function DashboardOverview({ data }: { data: DashboardSnapshot }) {
  const router = useRouter();
  const [enabled, setEnabled] = useState(data.enabled);
  const [statusError, setStatusError] = useState('');
  const [pending, startTransition] = useTransition();
  const [clock, setClock] = useState(data.generatedAt);
  useEffect(() => {
    const updateClock = () => setClock(new Date().toISOString());
    updateClock();
    const interval = window.setInterval(updateClock, 1000);
    return () => window.clearInterval(interval);
  }, []);
  useEffect(() => { setEnabled(data.enabled); }, [data.enabled, data.generatedAt]);
  function toggleBookings(nextEnabled: boolean) {
    setStatusError('');
    startTransition(async () => {
      try {
        await bookingRequest({ action: 'booking_enabled', enabled: nextEnabled });
        setEnabled(nextEnabled);
        router.refresh();
      } catch (error) {
        setStatusError(error instanceof Error ? error.message : 'Unable to update booking status. Please try again.');
      }
    });
  }
  const now = ukDate(data.generatedAt);
  const currentTime = ukDate(clock);
  const syncFresh = Boolean(data.sync?.last_success && now.toMillis() - Date.parse(data.sync.last_success) <= data.syncMaxAge * 60000);
  const syncHealthy = syncFresh && !data.sync?.last_error;
  const stats = [
    { label: 'Upcoming Sessions', value: data.counts.sessions, detail: 'Confirmed Shift Sessions', href: '/dashboard/schedule?view=bookings', icon: Video, tone: 'sage' },
    { label: 'Salon Appointments', value: data.counts.appointments, detail: 'Today', href: '/dashboard/schedule?view=appointments', icon: CalendarDays, tone: 'blue' },
    { label: 'Awaiting Answers', value: data.counts.questionnaires, detail: 'Upcoming Session Questionnaires', href: '/dashboard/schedule?view=bookings&filter=incomplete', icon: ClipboardList, tone: 'blush' },
  ];
  const websiteStats = [
    { label: 'Gallery Images', value: data.counts.images, detail: 'Manage Gallery', href: '/dashboard/gallery-images', icon: ImageIcon, tone: 'sage' },
    { label: 'Services', value: data.counts.services, detail: 'Manage Services', href: '/dashboard/services', icon: ListChecks, tone: 'blue' },
    { label: 'Education Sections', value: data.counts.sections, detail: 'Edit Education', href: '/dashboard/edit-education', icon: GraduationCap, tone: 'blush' },
  ];
  return <div className={styles.dashboard}>
    <header className={styles.header}>
      <div><h1>Dashboard</h1><p className={styles.dateline}>{currentTime.toFormat('cccc, d LLLL yyyy')} <span className={styles.timeText}>{currentTime.toFormat('h:mm a', { locale: 'en-US' })}</span></p></div>
      <div className={styles.headerAccount}>
        <Link href="/dashboard/edit-profile" className={styles.userProfile} aria-label="Edit Your Profile">
          <Image src={data.profile.avatar_url || '/assets/images/Default_Avatar.jpg'} alt="" width={36} height={36} />
          <strong>{data.profile.username || 'Victoria Blush'}</strong>
        </Link>
        <div className={styles.headerActions}><Link className={styles.secondaryLink} href="/" target="_blank" rel="noreferrer">View Website <ArrowRight size={16} /></Link><Link className={styles.primaryLink} href="/dashboard/schedule"><CalendarDays size={18} /> Open Scheduler</Link></div>
      </div>
    </header>

    <div className={styles.statusBar}>
      <div className={styles.bookingState}><Switch aria-label="Accept online bookings" checked={enabled ?? false} disabled={enabled === null || pending} onCheckedChange={toggleBookings} /><span className={styles.bookingStatus} role="status"><span className={styles.statusDot} data-state={enabled === null ? 'unknown' : enabled ? 'open' : 'paused'} />{enabled === null ? 'Booking status unavailable' : enabled ? 'Online bookings open' : 'Online bookings paused'}</span></div>
    </div>
    {statusError && <p role="alert" className={styles.notice}>{statusError}</p>}
    {data.issues.length > 0 && <p role="alert" className={styles.notice}>Some information could not be loaded: {data.issues.join(', ')}. Refresh the page to try again.</p>}

    <Tabs defaultValue="bookings" className={styles.dashboardTabs}>
    <TabsList className={styles.tabList} aria-label="Dashboard views">
      <TabsTrigger value="bookings" className={styles.tab}><CalendarDays size={18} />Bookings</TabsTrigger>
      <TabsTrigger value="website" className={styles.tab}><Globe size={18} />Website</TabsTrigger>
    </TabsList>
    <TabsContent value="bookings">
    <div className={styles.metrics}>{stats.map(({ label, value, detail, href, icon: Icon, tone }) => <Link key={label} href={href} className={styles.metric} data-tone={tone}><div className={styles.metricTop}><Icon size={20} /><ArrowRight size={16} /></div><strong className={value === null ? styles.unavailable : styles.metricValue}>{countLabel(value)}</strong><h2>{label}</h2><p>{detail}</p></Link>)}</div>

    <div className={styles.operations}>
      <div className={styles.sessions}>
      <section className={styles.sessions} aria-labelledby="upcoming-sessions-heading">
        <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>On the Calendar</p><h2 id="upcoming-sessions-heading">Next Shift Session</h2></div><Link href="/dashboard/schedule?view=bookings" className={styles.quietLink}>All bookings <ArrowRight size={16} /></Link></div>
        {data.sessions === null ? <p className={styles.empty}>Upcoming sessions are temporarily unavailable.</p> : !data.sessions.length ? <div className={styles.empty}><Video size={26} /><h3>No upcoming sessions</h3><p>Confirmed bookings will appear here.</p><Link href="/dashboard/schedule?view=weekly" className={styles.quietLink}>Manage weekly hours <ArrowRight size={16} /></Link></div> : <ol className={styles.sessionList}>{data.sessions.map(session => {
          const start = ukDate(session.starts_at);
          return <li key={session.id}><Link className={styles.session} href={`/dashboard/schedule?view=bookings&booking=${encodeURIComponent(session.id)}`} title={`View booking for ${session.name}`}>
            <div className={styles.dateStamp}><span>{start.toFormat('LLL')}</span><strong>{start.toFormat('dd')}</strong><span>{start.toFormat('ccc')}</span></div>
            <div className={styles.sessionInfo}><h3>{session.name}</h3><p><Clock3 size={14} />{start.toFormat('h:mm a', { locale: 'en-US' })} - {ukDate(session.ends_at).toFormat('h:mm a', { locale: 'en-US' })}</p><span className={styles.answerState} data-complete={Boolean(session.questionnaire_completed_at)}>{session.questionnaire_completed_at ? <CheckCircle2 size={14} /> : <ClipboardList size={14} />}{session.questionnaire_completed_at ? 'Answers received' : 'Awaiting questionnaire'}</span></div>
            <span className={styles.sessionAction} aria-hidden="true"><ArrowRight size={20} /></span>
          </Link></li>;
        })}</ol>}
        <Link className={styles.nextOpening} href={data.nextSlot ? `/dashboard/schedule?view=availability&date=${ukDate(data.nextSlot).toISODate()}` : '/dashboard/schedule'} title="Manage Available Times"><CalendarDays size={20} /><div><span>Next Bookable Opening</span><strong>{!data.slotsLoaded ? 'Availability unavailable' : data.nextSlot ? <time className={styles.timeText} dateTime={data.nextSlot}>{ukDate(data.nextSlot).toFormat('ccc d LLL, h:mm a', { locale: 'en-US' })}</time> : 'No available slots in the booking window'}</strong></div><ArrowRight size={18} /></Link>
      </section>

      <section className={styles.nextSalon} aria-labelledby="next-salon-heading"><div className={styles.sectionHeading}><h2 id="next-salon-heading">Next Salon Appointment</h2><Link href="/dashboard/schedule?view=appointments" className={styles.quietLink}>All Appointments <ArrowRight size={18} /></Link></div>
        {data.appointments === null ? <p className={styles.muted}>Appointments unavailable.</p> : !data.appointments.length ? <p className={styles.muted}>No upcoming salon appointments.</p> : <ol className={styles.sessionList}>{data.appointments.slice(0, 1).map(appointment => <li key={appointment.id}><Link className={styles.session} href={`/dashboard/schedule?view=appointments&appointment=${encodeURIComponent(appointment.id)}`} title="View Salon Appointment">
          <div className={styles.dateStamp}><span>{ukDate(appointment.starts_at).toFormat('LLL')}</span><strong>{ukDate(appointment.starts_at).toFormat('dd')}</strong><span>{ukDate(appointment.starts_at).toFormat('ccc')}</span></div>
          <div className={styles.sessionInfo}><h3>{appointment.client_name || 'Salon Appointment'}</h3><p><Clock3 size={14} /><time dateTime={appointment.starts_at}>{ukDate(appointment.starts_at).toFormat('h:mm a', { locale: 'en-US' })}</time> - {ukDate(appointment.ends_at).toFormat('h:mm a', { locale: 'en-US' })}</p></div>
          <span className={styles.sessionAction} aria-hidden="true"><ArrowRight size={20} /></span>
        </Link></li>)}</ol>}
      </section>
      </div>

      <aside className={styles.sideColumn}>
        <section aria-labelledby="booking-health-heading"><div className={styles.sectionHeading}><h2 id="booking-health-heading">Booking essentials</h2><Settings2 size={18} /></div>
          <Link className={styles.healthRow} href="/dashboard/schedule?view=appointments"><RefreshCw size={19} /><div><strong>Ovatu calendar</strong><span>{!data.sync ? 'Sync status unavailable' : data.sync.last_success ? <>Last synced <time className={styles.timeText} dateTime={data.sync.last_success}>{ukDate(data.sync.last_success).toFormat('d LLL, h:mm a', { locale: 'en-US' })}</time></> : 'Not synced yet'}</span>{!syncHealthy && <span className={styles.healthState} data-ok={false}>Check sync</span>}</div><ArrowRight size={16} /></Link>
          <Link className={styles.healthRow} href="/dashboard/schedule?view=bookings&filter=incomplete"><ClipboardList size={19} /><div><strong>Questionnaires</strong><span>{data.counts.questionnaires === null ? 'Status unavailable' : `${data.counts.questionnaires} awaiting completion`}</span></div><ArrowRight size={16} /></Link>
          <Link className={styles.healthRow} href="/dashboard/schedule?view=bookings&filter=refunded"><CreditCard size={19} /><div><strong>Refunds</strong><span>{data.counts.refunded === null ? 'Status unavailable' : `${data.counts.refunded} Refunded ${data.counts.refunded === 1 ? 'Booking' : 'Bookings'}`}</span></div><ArrowRight size={16} /></Link>
          <div className={styles.shortcuts}><Link href="/dashboard/schedule?view=weekly"><Clock3 size={17} />Weekly hours<ArrowRight size={15} /></Link><Link href="/dashboard/schedule?view=settings"><Settings2 size={17} />Booking settings<ArrowRight size={15} /></Link></div>
        </section>
      </aside>
    </div>
    </TabsContent>
    <TabsContent value="website">
    <div className={`${styles.metrics} ${styles.websiteMetrics}`}>{websiteStats.map(({ label, value, detail, href, icon: Icon, tone }) => <Link key={label} href={href} className={styles.metric} data-tone={tone}><div className={styles.metricTop}><Icon size={22} /><ArrowRight size={18} /></div><strong className={value === null ? styles.unavailable : styles.metricValue}>{countLabel(value)}</strong><h2>{label}</h2><span className={styles.metricAction}>{detail}<ArrowRight size={16} /></span></Link>)}</div>
    <section className={styles.website} aria-labelledby="website-heading"><div className={styles.sectionHeading}><h2 id="website-heading">Website Management</h2><Link className={styles.quietLink} href="/dashboard/edit-profile"><UserRound size={16} />Profile</Link></div>
      <div className={styles.contentLinks}>
        <Link href="/dashboard/edit-homepage"><TbHomeEdit size={22} /><div><h3>Edit Homepage</h3><p>Welcome & Story</p></div><ArrowRight size={18} /></Link>
        <Link href="/dashboard/edit-education"><GraduationCap size={22} /><div><h3>Edit Education</h3><p>Sections & Content</p></div><ArrowRight size={18} /></Link>
        <Link href="/dashboard/gallery-images/add-gallery-image"><Plus size={22} /><div><h3>Add Gallery Image</h3><p>New Work</p></div><ArrowRight size={18} /></Link>
        <Link href="/dashboard/gallery-images/reorder"><ArrowDownUp size={22} /><div><h3>Reorder Gallery</h3><p>Gallery Image Order</p></div><ArrowRight size={18} /></Link>
        <Link href="/dashboard/services/add-service"><Plus size={22} /><div><h3>Add Service</h3><p>Services & Pricing</p></div><ArrowRight size={18} /></Link>
        <Link href="/dashboard/services/reorder"><ArrowDownUp size={22} /><div><h3>Reorder Services</h3><p>Service Display Order</p></div><ArrowRight size={18} /></Link>
        <Link href="/dashboard/edit-education?action=new"><Plus size={22} /><div><h3>Add Page Section</h3><p>Homepage & Education</p></div><ArrowRight size={18} /></Link>
        <Link href="/dashboard/edit-education"><ArrowDownUp size={22} /><div><h3>Reorder Page Sections</h3><p>Homepage & Education</p></div><ArrowRight size={18} /></Link>
      </div>
    </section>
    </TabsContent>
    </Tabs>
  </div>;
}