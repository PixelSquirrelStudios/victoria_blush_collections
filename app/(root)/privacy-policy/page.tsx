import Link from 'next/link';
import { Archive, Cookie, Database, Eye, FileText, Globe, Lock, Scale, Server, ShieldCheck, Target, UserRound } from 'lucide-react';
import LegalPage, { companyNumber, LegalEmail as Email, registeredAddress, type LegalHighlight, type LegalSection } from '@/components/legal/LegalPage';

export const metadata = { title: 'Privacy Policy | Victoria Blush Collections' };

const linkClass = 'font-medium text-text-primary underline underline-offset-4';

const highlights: LegalHighlight[] = [
  { icon: Lock, label: 'Selling your data', value: 'Never' },
  { icon: Cookie, label: 'Cookies', value: 'Only the essential ones' },
  { icon: Eye, label: 'Tracking & ads', value: 'None on this site' },
  { icon: UserRound, label: 'Your control', value: 'Ask for a copy or deletion' },
];

const sections: LegalSection[] = [
  { id: 'who', icon: UserRound, title: 'Who we are', body: <>
    <p>This website is run by Victoria Blush Collections Limited (&quot;we&quot;, &quot;us&quot;). We are responsible for the personal information you share with us here, which makes us the &quot;data controller&quot; under UK data protection law.</p>
    <p>We are registered in England and Wales (company number {companyNumber}). Our registered office is {registeredAddress}.</p>
    <p>If you have any questions about this policy or your information, email <Email />.</p>
  </> },
  { id: 'collect', icon: Database, title: 'What we collect', body: <>
    <ul className="grid gap-3 sm:grid-cols-2">
      <li className="rounded-lg bg-bg-subtle p-4"><strong className="block text-text-primary">Account details</strong>Your name, email address, and profile photo if you add one. If you sign in with Google, we receive your name, email and profile picture from Google.</li>
      <li className="rounded-lg bg-bg-subtle p-4"><strong className="block text-text-primary">Booking details</strong>The session you booked, its date and time, your time zone, payment status, and the boxes you ticked at checkout.</li>
      <li className="rounded-lg bg-bg-subtle p-4"><strong className="block text-text-primary">Questionnaire answers</strong>What you choose to tell Victoria before your session, such as your current role and what you&apos;d like to talk about.</li>
      <li className="rounded-lg bg-bg-subtle p-4"><strong className="block text-text-primary">Messages</strong>Anything you send us by email.</li>
    </ul>
    <p>We never see or store your full card details; Stripe handles payments. Sessions are not recorded.</p>
    <p>Please only share what you&apos;re comfortable with in your questionnaire. If you choose to tell us about health or other sensitive matters, we will only use it to prepare for your session.</p>
  </> },
  { id: 'use', icon: Target, title: 'How we use it', body: <>
    <ul className="list-disc space-y-2 pl-5">
      <li>To take your booking and payment, and create your client account.</li>
      <li>To send your confirmation, Zoom link, questionnaire and reminders.</li>
      <li>To let you reschedule, cancel or get a refund.</li>
      <li>To help Victoria prepare for and run your session.</li>
      <li>To reply to your messages and keep our accounts and tax records.</li>
    </ul>
    <p>We don&apos;t send marketing emails unless you&apos;ve asked to receive them, and we never sell your information.</p>
  </> },
  { id: 'lawful', icon: Scale, title: 'Our legal reasons', body: <>
    <p>UK data protection law requires us to have a lawful reason to use your information. Ours are:</p>
    <ul className="list-disc space-y-2 pl-5">
      <li><strong className="text-text-primary">Contract:</strong> to provide the session you&apos;ve booked and manage your account.</li>
      <li><strong className="text-text-primary">Legal obligation:</strong> to keep financial records for tax purposes.</li>
      <li><strong className="text-text-primary">Legitimate interests:</strong> to keep the site secure, prevent fraud and answer your enquiries.</li>
      <li><strong className="text-text-primary">Consent:</strong> for any sensitive information you choose to share in your questionnaire. You can withdraw this at any time.</li>
    </ul>
  </> },
  { id: 'sharing', icon: Server, title: 'Who we share it with', body: <>
    <p>We use a small number of trusted services to run the site. They only process your information on our instructions:</p>
    <ul className="grid gap-3 sm:grid-cols-2">
      <li className="rounded-lg bg-bg-subtle p-4"><strong className="block text-text-primary">Supabase</strong>Stores your account, bookings and questionnaire answers.</li>
      <li className="rounded-lg bg-bg-subtle p-4"><strong className="block text-text-primary">Stripe</strong>Takes your payment and handles refunds.</li>
      <li className="rounded-lg bg-bg-subtle p-4"><strong className="block text-text-primary">Zoom</strong>Hosts your session. Your name may be shown when you join.</li>
      <li className="rounded-lg bg-bg-subtle p-4"><strong className="block text-text-primary">Resend</strong>Sends our emails, such as confirmations and sign-in links.</li>
      <li className="rounded-lg bg-bg-subtle p-4"><strong className="block text-text-primary">Google</strong>Only if you choose to sign in with Google.</li>
      <li className="rounded-lg bg-bg-subtle p-4"><strong className="block text-text-primary">Our website host</strong>Serves this website and keeps short-term security logs.</li>
    </ul>
    <p>We may also share information if the law requires it, for example with HMRC or to respond to a valid legal request.</p>
  </> },
  { id: 'international', icon: Globe, title: 'International transfers', body: <>
    <p>Some of these services store or process information outside the UK, including in the USA and the EU. Where they do, they use approved safeguards, such as the UK International Data Transfer Addendum or the UK–US data bridge, to protect it.</p>
  </> },
  { id: 'retention', icon: Archive, title: 'How long we keep it', body: <>
    <ul className="list-disc space-y-2 pl-5">
      <li><strong className="text-text-primary">Your account:</strong> until you ask us to delete it.</li>
      <li><strong className="text-text-primary">Questionnaire answers:</strong> kept with your account, so Victoria can refer back to them if you book again.</li>
      <li><strong className="text-text-primary">Booking and payment records:</strong> 6 years, as required for tax and accounting.</li>
      <li><strong className="text-text-primary">Emails:</strong> as long as needed to deal with your enquiry.</li>
    </ul>
  </> },
  { id: 'cookies', icon: Cookie, title: 'Cookies', body: <>
    <p>We only use cookies and similar storage that the site needs to work. We don&apos;t use advertising or analytics cookies, so we don&apos;t need to ask for your cookie consent.</p>
    <ul className="list-disc space-y-2 pl-5">
      <li><strong className="text-text-primary">Sign-in cookies:</strong> keep you signed in to your account.</li>
      <li><strong className="text-text-primary">Booking receipt cookie:</strong> links your browser to a booking for 2 hours after checkout, so we can sign you in safely.</li>
      <li><strong className="text-text-primary">Sound preference:</strong> remembers whether you turned the site&apos;s background sound on.</li>
      <li><strong className="text-text-primary">Stripe:</strong> sets its own cookies on its checkout page to prevent fraud.</li>
    </ul>
  </> },
  { id: 'rights', icon: ShieldCheck, title: 'Your rights', body: <>
    <p>You have the right to:</p>
    <ul className="list-disc space-y-2 pl-5">
      <li>Ask for a copy of the information we hold about you.</li>
      <li>Ask us to correct anything that&apos;s wrong.</li>
      <li>Ask us to delete your information (we may need to keep some records for tax purposes).</li>
      <li>Object to, or ask us to limit, how we use it.</li>
      <li>Ask us to send your information to you or another organisation.</li>
      <li>Withdraw your consent at any time, where we rely on it.</li>
    </ul>
    <p>Email <Email /> to use any of these rights. It&apos;s free, and we&apos;ll reply within one month.</p>
  </> },
  { id: 'security', icon: Lock, title: 'Keeping it safe', body: <>
    <p>Your information is sent over encrypted connections, and access is limited to Victoria and the services listed above. Each Zoom session has its own unique link. Please keep your sign-in details and Zoom link private.</p>
  </> },
  { id: 'complaints', icon: FileText, title: 'Complaints and changes', body: <>
    <p>If you&apos;re unhappy with how we&apos;ve handled your information, please contact us first so we can try to put it right. You can also complain to the Information Commissioner&apos;s Office (ICO) at <a className={linkClass} href="https://ico.org.uk/make-a-complaint/" target="_blank" rel="noreferrer">ico.org.uk</a> or by calling 0303 123 1113.</p>
    <p>We may update this policy from time to time. The latest version will always be on this page. For how bookings work, see our <Link className={linkClass} href="/booking-terms">booking terms</Link>.</p>
  </> },
];

export default function PrivacyPolicy() {
  return <LegalPage
    eyebrow="Your information"
    title="Privacy Policy"
    intro="How we collect, use and look after your personal information when you use this website or book a Shift Session, in plain English."
    updated="7 October 2026"
    highlights={highlights}
    sections={sections}
    cta={{ heading: 'Questions about your data?', text: 'Whether you want a copy of your information, a correction or for us to delete it, just get in touch.', link: { href: '/booking-terms', label: 'Read the booking terms' } }}
  />;
}
