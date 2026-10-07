import Link from 'next/link';
import { AlertCircle, CalendarClock, CalendarX, Clock, CreditCard, Gavel, HeartHandshake, MessageCircle, RefreshCw, Scale, ShieldCheck, Sparkles, UserRound, Video } from 'lucide-react';
import { bookingDatabase } from '@/lib/booking-server';
import LegalPage, { companyNumber, LegalEmail as Email, registeredAddress, type LegalHighlight, type LegalSection } from '@/components/legal/LegalPage';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Shift Session Booking Terms | Victoria Blush Collections' };

async function loadSettings() {
  try {
    const { data } = await bookingDatabase().from('booking_settings').select('price_pence,duration_minutes,cancellation_hours').single();
    if (data) return data;
  } catch {}
  return { price_pence: 12500, duration_minutes: 60, cancellation_hours: 72 };
}

export default async function BookingTerms() {
  const { price_pence, duration_minutes, cancellation_hours } = await loadSettings();
  const price = `£${(price_pence / 100).toFixed(2)}`;
  const notice = cancellation_hours % 24 === 0 ? `${cancellation_hours / 24} days` : `${cancellation_hours} hours`;

  const glance: LegalHighlight[] = [
    { icon: Video, label: 'Format', value: '1-to-1 on Zoom' },
    { icon: Clock, label: 'Length', value: `${duration_minutes} minutes` },
    { icon: CreditCard, label: 'Price', value: `${price}, paid on booking` },
    { icon: RefreshCw, label: 'Change of plans', value: `Free changes up to ${notice} before` },
  ];

  const sections: LegalSection[] = [
    { id: 'session', icon: Sparkles, title: 'The session', body: <>
      <p>The Shift Session is a {duration_minutes}-minute, one-to-one conversation with Victoria held over Zoom. It is a space to reflect on your working life and talk through what comes next.</p>
      <p>The session is guidance and conversation only. It is not medical, psychological, legal, financial or other regulated professional advice, and you remain responsible for any decisions you make afterwards.</p>
      <p>Sessions are not recorded.</p>
    </> },
    { id: 'payment', icon: CreditCard, title: 'Booking and payment', body: <>
      <p>The price is {price}, payable in full when you book. Payment is taken securely by Stripe; we never see or store your card details.</p>
      <p>Your chosen time is held for a short period while you complete checkout. Your booking is confirmed once payment succeeds, and we will email you a confirmation.</p>
      <p>All times are confirmed in UK time (Europe/London). The booking page may also show your local time zone.</p>
      <p>You must be 18 or over to book. Please make sure the name and email address you give are correct, as we use them to send your session details.</p>
    </> },
    { id: 'account', icon: UserRound, title: 'Your account', body: <>
      <p>When you book, we create a client account for you using your email address, if you don't already have one. You can use it to view, reschedule or cancel your bookings and to complete your questionnaire.</p>
      <p>Keep your sign-in details private; you are responsible for activity on your account.</p>
    </> },
    { id: 'before', icon: MessageCircle, title: 'Before your session', body: <>
      <p>We will email you a link to a short questionnaire. Completing it before your session helps Victoria prepare, but the session will go ahead if you don't.</p>
      <p>Your unique Zoom link will be emailed to you and shown in your dashboard. You are responsible for having a suitable device, a stable internet connection and a quiet, private space. Please do not share your Zoom link.</p>
    </> },
    { id: 'changes', icon: CalendarClock, title: 'Rescheduling and cancelling', body: <>
      <p>You can reschedule or cancel from your dashboard up to <strong className="text-text-primary">{notice} ({cancellation_hours} hours)</strong> before your session starts.</p>
      <ul className="grid gap-3 sm:grid-cols-2">
        <li className="rounded-lg bg-bg-subtle p-4"><strong className="block text-text-primary">Cancel in time</strong>Full refund to your original payment method. Banks usually take 5–10 working days to show it.</li>
        <li className="rounded-lg bg-bg-subtle p-4"><strong className="block text-text-primary">Reschedule in time</strong>Move to any other available time at no extra charge.</li>
      </ul>
      <p>After that deadline, bookings can&apos;t be cancelled or rescheduled online. If something unexpected has happened, please contact us at <Email /> and we will consider your request. Your right to change your mind (below) still applies.</p>
    </> },
    { id: 'rights', icon: ShieldCheck, title: 'Your right to change your mind', body: <>
      <p>When you buy a service online in the UK, the law normally gives you 14 days after booking to change your mind and get your money back. (This comes from the Consumer Contracts Regulations 2013.)</p>
      <p>Sessions can only be booked up to a few weeks ahead, so your session will usually happen within those 14 days. That&apos;s why we ask you to tick a box at checkout saying you&apos;re happy for it to go ahead on the date you picked.</p>
      <ul className="grid gap-3 sm:grid-cols-2">
        <li className="rounded-lg bg-bg-subtle p-4"><strong className="block text-text-primary">Before the deadline</strong>Cancel up to {notice} before your session for a full refund. This is more generous than the law requires.</li>
        <li className="rounded-lg bg-bg-subtle p-4"><strong className="block text-text-primary">Once the session has happened</strong>You lose the right to cancel, because the service has been fully provided.</li>
      </ul>
      <p>If you change your mind after the online deadline but before your session, email us at <Email /> and we&apos;ll still give you a full refund, as long as it&apos;s within 14 days of booking.</p>
      <p>Nothing in these terms affects your statutory rights.</p>
    </> },
    { id: 'lateness', icon: Clock, title: 'Lateness and missed sessions', body: <>
      <p>Sessions start and finish at the booked times. If you join late, the session will still end at the scheduled time and the price will not be reduced.</p>
      <p>If you don't join within 15 minutes of the start time and haven't contacted us, the session will be treated as missed and is not refundable.</p>
    </> },
    { id: 'our-changes', icon: CalendarX, title: 'Changes or cancellation by us', body: <>
      <p>Occasionally Victoria may need to move or cancel a session, for example because of illness or circumstances beyond our control. If that happens, we will contact you as soon as possible and offer either a new time or a full refund, whichever you prefer.</p>
      <p>If a session can't go ahead or is significantly disrupted because of a technical problem on our side, we will offer a replacement session or a full refund.</p>
    </> },
    { id: 'conduct', icon: HeartHandshake, title: 'Respectful conduct', body: <>
      <p>We want every session to be a safe, respectful space. Victoria may end a session early if you behave abusively or inappropriately; in that case, no refund will be due.</p>
    </> },
    { id: 'liability', icon: Scale, title: 'Our responsibility to you', body: <>
      <p>We will provide the session with reasonable care and skill. If we fail to do so, please tell us and we will try to put things right, which may include a replacement session or a refund.</p>
      <p>We are not responsible for losses that were not foreseeable, for business losses, or for decisions you make after the session. Our total liability to you for any booking is limited to the price you paid for it. Nothing in these terms limits our liability for death or personal injury caused by our negligence, for fraud, or for anything else that cannot be limited by law.</p>
    </> },
    { id: 'privacy', icon: AlertCircle, title: 'Your information', body: <>
      <p>We use your details and questionnaire answers only to provide and manage your session. Please see our <Link className="font-medium text-text-primary underline underline-offset-4" href="/privacy-policy">privacy policy</Link> for more information.</p>
    </> },
    { id: 'law', icon: Gavel, title: 'Changes to these terms and the law', body: <>
      <p>We may update these terms from time to time. The version shown when you booked applies to that booking.</p>
      <p>These terms are governed by the law of England and Wales. If you live elsewhere in the UK, you may also bring proceedings in your local courts.</p>
      <p>Victoria Blush Collections Limited is registered in England and Wales (company number {companyNumber}). Registered office: {registeredAddress}.</p>
    </> },
  ];

  return <LegalPage
    eyebrow="The Shift Session"
    title="Booking Terms"
    intro="Everything you need to know before you book, written as plainly as we can. By ticking the boxes at checkout, you agree to these terms with Victoria Blush Collections Limited."
    updated="7 October 2026"
    highlights={glance}
    sections={sections}
    cta={{ heading: 'Questions about your booking?', text: 'We will always try to resolve things with you directly first. Get in touch any time.', link: { href: '/education#shift-session', label: 'Book a Shift Session' } }}
  />;
}
