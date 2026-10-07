import Link from 'next/link';
import { OAUthButtons } from '../oauth-sign-in';
import SignUpForm from '@/components/forms/SignUpForm';
import MagicLinkForm from '@/components/forms/MagicLinkForm';
import { CalendarCheck, ClipboardList, RefreshCw, Video } from 'lucide-react';

const benefits = [
  { icon: CalendarCheck, title: 'All your sessions in one place', text: 'See upcoming and past Shift Sessions, with dates and times shown in your own time zone.' },
  { icon: Video, title: 'Join with one click', text: 'Your private Zoom link is waiting in your account, so there\u2019s no hunting through emails on the day.' },
  { icon: ClipboardList, title: 'Prepare before you meet', text: 'Complete your pre-session questionnaire at your own pace, so Victoria can get to know you before your session.' },
  { icon: RefreshCw, title: 'Change of plans? No problem', text: 'Reschedule or cancel yourself, within the booking terms, without needing to email.' },
];

export default async function Signup() {

  return (
    <div className="mx-auto grid w-full max-w-5xl items-start gap-8 lg:grid-cols-[minmax(0,1fr)_450px]">
    <section aria-labelledby="account-benefits" className="order-2 rounded-xl bg-bg-dark p-8 text-white shadow-lg lg:order-1 lg:p-10">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">Your client account</p>
      <h2 id="account-benefits" className="mt-2 text-2xl font-semibold">Why create an account?</h2>
      <p className="mt-3 text-sm leading-relaxed text-white/80">
        A free client account keeps everything for your Shift Session together, from booking to the day itself.
      </p>
      <ul className="mt-8 grid gap-6">
        {benefits.map(({ icon: Icon, title, text }) => (
          <li key={title} className="flex gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15"><Icon size={20} aria-hidden="true" /></span>
            <div>
              <h3 className="font-semibold">{title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-white/80">{text}</p>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-8 border-t border-white/20 pt-6 text-sm text-white/80">
        Booking as a guest? We&apos;ll still create your account from the email you book with, and you can sign in any time to manage your session.
      </p>
    </section>
    <div className="order-1 mx-auto flex h-auto w-full flex-1 flex-col rounded-xl bg-brand-secondary text-text-primary p-10 shadow-lg xl:min-w-[350px] xl:max-w-[450px]">
      <h1 className="text-2xl font-semibold text-text-primary">Sign up</h1>
      <p className="mt-1 text-sm text-text-body">
        Already have an account?{' '}
        <Link className="font-medium underline text-text-primary" href="/sign-in">
          Sign in
        </Link>
      </p>

      <div className="mt-8 flex flex-col gap-2 [&>input]:mb-3">
        <SignUpForm />
        <div className="flex w-full items-center justify-center gap-2 py-2 text-text-primary">
          <span>{'—'}</span>
          OR
          <span>{'—'}</span>
        </div>
        <OAUthButtons mode="sign-up" />
        <MagicLinkForm mode="sign-up" />
      </div>
    </div>
    </div>
  );
}