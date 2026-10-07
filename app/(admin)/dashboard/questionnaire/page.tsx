import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import BookingQuestionnaire from '@/components/booking/BookingQuestionnaire';
import styles from '@/components/booking/dashboard.module.css';

export const metadata = { title: 'Your Questionnaire | Victoria Blush Collections', robots: { index: false, follow: false } };

export default async function QuestionnairePage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams;
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) notFound();
  return <div className={styles.dashboard}>
    <header className={styles.header}>
      <div><h1>Your Questionnaire</h1><p className={styles.dateline}>The Shift Session</p></div>
      <Link href="/dashboard/bookings?view=questionnaires" className={styles.secondaryLink}><ArrowLeft size={18} />Back to Dashboard</Link>
    </header>
    <div className="w-full max-w-3xl"><BookingQuestionnaire id={id} /></div>
  </div>;
}