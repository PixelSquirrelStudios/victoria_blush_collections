import Link from 'next/link';
import { OAUthButtons } from '../oauth-sign-in';
import { Separator } from '@/components/ui/separator';
import SignUpForm from '@/components/forms/SignUpForm';
import { FormMessage, Message } from '@/components/form-message';
import { Logo } from '@/components/shared/Logo';

export default async function Signup(props: { searchParams: Promise<Message>; }) {
  const searchParams = await props.searchParams;

  if ('message' in searchParams) {
    return (
      <div className="flex h-screen w-full flex-1 items-center justify-center gap-2 p-4 sm:max-w-md">
        <FormMessage message={searchParams} />
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-auto w-full flex-1 flex-col rounded-xl bg-bg-dark text-card-foreground p-10 shadow-lg xl:min-w-[350px] xl:max-w-[450px]">
      <div className="flex w-full justify-center px-0 pb-8">
        <Logo
          className="w-full object-contain max-w-[300px]"
          width={300}
          height={200}
          forceTheme="dark"
        />
      </div>
      <Separator className="opacity-20" />
      <h1 className="mt-4 text-2xl font-semibold text-stone-200">Sign up</h1>
      <p className="mt-1 text-sm text-text-muted/80">
        Already have an account?{' '}
        <Link className="font-medium underline text-stone-200" href="/sign-in">
          Sign in
        </Link>
      </p>

      <div className="mt-8 flex flex-col gap-2 [&>input]:mb-3">
        <SignUpForm />
        <div className="flex w-full items-center justify-center gap-2 py-2 text-text-muted">
          <span>{'—'}</span>
          OR
          <span>{'—'}</span>
        </div>
        <OAUthButtons />
        <FormMessage message={searchParams} />
      </div>
    </div>
  );
}