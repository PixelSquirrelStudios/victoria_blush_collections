'use client';

import { useEffect, useState } from 'react';
import { customerBookingTimes } from '@/lib/booking-rules';
import styles from './booking.module.css';

export function useCustomerTimeZone() {
  const [zone, setZone] = useState<string | null>(null);
  useEffect(() => {
    setZone(Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/London');
  }, []);
  return zone;
}

export default function CustomerBookingTime({ value, zone, compact = false }: { value: string; zone: string | null; compact?: boolean }) {
  const times = customerBookingTimes(value, zone || 'Europe/London', compact);
  return <span className={`${styles.customerTime} ${compact ? styles.customerTimeCompact : ''}`}>
    <span className={styles.customerTimePrimary}>
      <time dateTime={value} aria-label={`${times.primary.text}, ${times.primary.label}`}>{times.primary.text}</time>
      <small>{times.primary.label}</small>
    </span>
    {times.london && <span className={styles.customerTimeSecondary}>
      <time dateTime={value}>{times.london.text}</time>
      <small>{times.london.label}</small>
    </span>}
  </span>;
}