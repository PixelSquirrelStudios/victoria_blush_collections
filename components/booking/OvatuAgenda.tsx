'use client';

import { useId, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DateTime } from 'luxon';
import { CalendarDays, ChevronDown, Clock3, Search, X } from 'lucide-react';
import styles from './booking.module.css';
import BookingDatePicker from './BookingDatePicker';

type Appointment = {
  id: string;
  client_name: string;
  details: string;
  starts_at: string;
  ends_at: string;
};

export default function OvatuAgenda({ appointments, appointmentId = '' }: { appointments: Appointment[]; appointmentId?: string }) {
  const router = useRouter();
  const searchId = useId();
  const searchInput = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState('');
  const [date, setDate] = useState('');
  const today = DateTime.now().setZone('Europe/London').startOf('day');
  const groups = new Map<string, Appointment[]>();
  const matching = appointments.filter(appointment => {
    const day = DateTime.fromISO(appointment.starts_at).setZone('Europe/London').toISODate();
    return (!appointmentId || appointment.id === appointmentId) && (!date || day === date) && `${appointment.client_name} ${appointment.details}`.toLowerCase().includes(search.trim().toLowerCase());
  }).sort((first, second) => Date.parse(first.starts_at) - Date.parse(second.starts_at));
  for (const appointment of matching) {
    const day = DateTime.fromISO(appointment.starts_at).setZone('Europe/London').toISODate()!;
    const group = groups.get(day) || [];
    group.push(appointment);
    groups.set(day, group);
  }

  return <section aria-label="Ovatu Appointments" className={styles.agenda}>
    <header className={styles.agendaHeading}>
      <div><h2>Ovatu Appointments</h2><p className={styles.muted}>{appointmentId ? 'Selected Salon Appointment' : 'Upcoming Salon Appointments'}</p></div>
      <p className={styles.agendaCount} role="status">{matching.length} {matching.length === 1 ? 'appointment' : 'appointments'}</p>
    </header>
    {appointmentId && <button type="button" className={`${styles.button} ${styles.secondary}`} onClick={() => router.push('/dashboard/schedule?view=appointments', { scroll: false })}><CalendarDays size={17} aria-hidden="true" />Show All Appointments</button>}
    <div className={styles.agendaFilters}>
      <div className={styles.field}><label htmlFor={searchId}>Search Appointments</label><div className={styles.agendaSearch}><Search size={18} aria-hidden="true" /><input id={searchId} ref={searchInput} className={styles.input} type="search" placeholder="Client Name or Appointment Details" value={search} onChange={event => setSearch(event.target.value)} />{search && <button type="button" className={styles.agendaSearchClear} title="Clear Search" aria-label="Clear Search" onClick={() => { setSearch(''); searchInput.current?.focus(); }}><X size={18} aria-hidden="true" /></button>}</div></div>
      <div className={styles.field}>Date<BookingDatePicker label="Appointment date" value={date} onChange={setDate} placeholder="All Dates" /></div>
      <button type="button" className={styles.icon} title="Clear filters" aria-label="Clear filters" disabled={!search && !date && !appointmentId} onClick={() => { setSearch(''); setDate(''); if (appointmentId) router.push('/dashboard/schedule?view=appointments', { scroll: false }); }}><X size={18} /></button>
    </div>
    {[...groups].map(([day, entries]) => {
      const localDay = DateTime.fromISO(day, { zone: 'Europe/London' });
      const relative = day === today.toISODate() ? 'Today' : day === today.plus({ days: 1 }).toISODate() ? 'Tomorrow' : localDay.toFormat('cccc');
      return <section key={day} aria-label={localDay.toFormat('cccc d LLLL yyyy')} className={styles.agendaDay}>
        <header className={styles.agendaDayHeading}><CalendarDays size={18} aria-hidden="true" /><h3>{relative}<time dateTime={day}>{localDay.toFormat('d LLL yyyy')}</time></h3><span>{entries.length} {entries.length === 1 ? 'appointment' : 'appointments'}</span></header>
        <ol className={styles.agendaEntries}>{entries.map(appointment => {
          const start = DateTime.fromISO(appointment.starts_at).setZone('Europe/London');
          const end = DateTime.fromISO(appointment.ends_at).setZone('Europe/London');
          const duration = Math.round(end.diff(start, 'minutes').minutes);
          return <li key={appointment.id} className={styles.agendaEntry}>
            <div className={styles.agendaTime}><time dateTime={appointment.starts_at}>{start.toFormat('HH:mm')}</time><span>to <time dateTime={appointment.ends_at}>{end.toFormat(start.hasSame(end, 'day') ? 'HH:mm' : 'd LLL, HH:mm')}</time></span></div>
            <article className={styles.agendaContent}>
              <h4>{appointment.client_name || 'Ovatu appointment'}</h4>
              <p className={styles.agendaDuration}><Clock3 size={14} aria-hidden="true" />{duration >= 60 ? `${Math.floor(duration / 60)}h${duration % 60 ? ` ${duration % 60}m` : ''}` : `${duration} min`}</p>
              {appointment.details?.trim() && <details className={styles.agendaDetails}><summary>Appointment details<ChevronDown size={16} aria-hidden="true" /></summary><p>{appointment.details}</p></details>}
            </article>
          </li>;
        })}</ol>
      </section>;
    })}
    {!matching.length && <div className={styles.agendaEmpty}><CalendarDays size={28} aria-hidden="true" /><h3>{appointments.length ? 'No Matching Appointments' : 'No Upcoming Appointments'}</h3><p className={styles.muted}>{appointments.length ? 'Try another name or date, or clear the filters.' : 'No upcoming Appointments have been imported from Ovatu.'}</p></div>}
  </section>;
}