'use client';

import { useState } from 'react';
import { DateTime } from 'luxon';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import styles from './booking.module.css';

export default function BookingDatePicker({ value, onChange, label, placeholder = 'Select Date', allowPast = false }: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
  allowPast?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const selected = DateTime.fromISO(value);
  const selectedDate = selected.isValid ? selected.toJSDate() : undefined;
  const displayDate = selected.isValid ? selected.setLocale('en-GB').toFormat('ccc, dd/MM/yyyy') : placeholder;
  const isPastDate = (day: Date) => DateTime.fromJSDate(day).toISODate()! < DateTime.now().setZone('Europe/London').toISODate()!;
  const previousDisabled = !selected.isValid || (!allowPast && isPastDate(selected.minus({ days: 1 }).toJSDate()));
  function moveDay(days: number) {
    if (!selected.isValid) return;
    const next = selected.plus({ days });
    if (!allowPast && isPastDate(next.toJSDate())) return;
    onChange(next.toISODate()!);
    setOpen(false);
  }

  return <div className={styles.dateNavigation}>
    <button type="button" className={styles.dateArrow} title="Previous day" aria-label={`${label}: Previous day`} disabled={previousDisabled} onClick={() => moveDay(-1)}><ChevronLeft size={20} aria-hidden="true" /></button>
    <Popover open={open} onOpenChange={setOpen}>
    <PopoverTrigger asChild>
      <button type="button" className={`${styles.input} ${styles.datePickerTrigger}`} aria-label={`${label}: ${displayDate}`}>
        <span>{displayDate}</span>
        <CalendarDays size={20} aria-hidden="true" />
      </button>
    </PopoverTrigger>
    <PopoverContent align="start" className="w-auto max-w-[calc(100vw-2rem)] rounded border-[#b9c8ad] bg-white p-0 text-[#263229]">
      <Calendar
        className={styles.dateCalendar}
        mode="single"
        required
        autoFocus
        fixedWeeks
        weekStartsOn={1}
        selected={selectedDate}
        defaultMonth={selectedDate}
        disabled={allowPast ? undefined : isPastDate}
        onSelect={day => {
          if (!allowPast && isPastDate(day)) return;
          onChange(DateTime.fromJSDate(day).toISODate()!);
          setOpen(false);
        }}
      />
    </PopoverContent>
    </Popover>
    <button type="button" className={styles.dateArrow} title="Next day" aria-label={`${label}: Next day`} disabled={!selected.isValid} onClick={() => moveDay(1)}><ChevronRight size={20} aria-hidden="true" /></button>
  </div>;
}