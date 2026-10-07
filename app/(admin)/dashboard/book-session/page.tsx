import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import BookingWidget from '@/components/booking/BookingWidget';
import styles from '@/components/booking/dashboard.module.css';

export const metadata = { title: 'Book a Session | Victoria Blush Collections', robots: { index: false, follow: false } };

export default function BookSessionPage() {
  return <div className={styles.dashboard}>
    <header className={styles.header}>
      <div><h1>Book a Session</h1><p className={styles.dateline}>The Shift Session</p></div>
      <Link href="/dashboard/bookings" className={styles.secondaryLink}><ArrowLeft size={18} />Booking History</Link>
    </header>
    <div className="w-full max-w-4xl"><BookingWidget /></div>
  </div>;
}