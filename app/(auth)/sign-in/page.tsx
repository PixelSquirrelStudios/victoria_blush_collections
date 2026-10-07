import Link from 'next/link';
import SignInForm from '@/components/forms/SignInForm';
import { OAUthButtons } from '../oauth-sign-in';
import MagicLinkForm from '@/components/forms/MagicLinkForm';

export default async function Login() {
  return (
    <div className="mx-auto flex h-auto w-full flex-1 flex-col rounded-xl bg-brand-secondary text-text-primary p-10 shadow-lg xl:min-w-[350px] xl:max-w-[450px]">
      <h1 className="text-2xl font-semibold text-text-primary">Sign in</h1>
      <p className="mt-1 text-sm text-text-body">
        Don't have an account?{' '}
        <Link className="font-medium underline text-text-primary" href="/sign-up">
          Sign up
        </Link>
      </p>
      <div className="mt-8 flex flex-col gap-2 [&>input]:mb-3">
        <SignInForm />
        <div className="flex w-full items-center justify-center gap-2 py-2 text-text-primary">
          <span>{'—'}</span>
          OR
          <span>{'—'}</span>
        </div>
        <OAUthButtons />
        <MagicLinkForm mode="sign-in" />
      </div>
    </div>
  );
}