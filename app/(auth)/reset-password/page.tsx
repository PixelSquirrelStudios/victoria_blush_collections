'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { showCustomToast } from '@/components/shared/CustomToast';
import { Logo } from '@/components/shared/Logo';
import { supabaseClient } from '@/lib/supabase/browserClient';

export default function ResetPassword() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Ensure the recovery session is picked up by the client when the page mounts
  useEffect(() => {
    supabaseClient.auth.getSession().catch(() => { });
  }, []);

  async function handleSubmit(formData: FormData) {
    setLoading(true);

    const password = formData.get('password') as string;
    const confirmPassword = formData.get('repeat_password') as string;

    if (!password || !confirmPassword) {
      showCustomToast({
        title: 'Error',
        message: 'Both password fields are required',
        variant: 'error',
        autoDismiss: true,
      });
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      showCustomToast({
        title: 'Error',
        message: 'Passwords do not match',
        variant: 'error',
        autoDismiss: true,
      });
      setLoading(false);
      return;
    }

    // Update password on the client using the recovery session
    const { error } = await supabaseClient.auth.updateUser({ password });

    setLoading(false);

    if (error) {
      showCustomToast({
        title: 'Error',
        message: error.message || 'Password update failed',
        variant: 'error',
        autoDismiss: true,
      });
      return;
    }

    showCustomToast({
      title: 'Success',
      message: 'Password updated successfully. Please sign in.',
      variant: 'success',
      autoDismiss: true,
    });

    router.push('/sign-in');
  }

  return (
    <form
      action={handleSubmit}
      className="mx-auto flex h-auto w-full flex-1 flex-col rounded-xl bg-brand-secondary text-text-primary p-10 shadow-lg xl:min-w-[350px] xl:max-w-[450px]"
    >
      <div>
        <div className="flex w-full justify-center px-0 pb-8">
          <Logo
            className="w-full object-contain max-w-[300px]"
            width={300}
            height={200}
            forceTheme="light"
          />
        </div>
        <Separator className="opacity-20" />
        <h1 className="mt-4 text-2xl font-semibold text-text-primary">
          Reset Password
        </h1>
        <p className="mt-1 text-sm text-text-body">
          Already have an account?{' '}
          <Link className="font-medium underline text-text-primary" href="/sign-in">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 flex flex-col gap-2">
        <Label htmlFor="password" className="text-text-primary">
          New Password
        </Label>
        <PasswordInput
          id="password"
          name="password"
          autoComplete="new-password"
          required
          placeholder="Enter new password"
          className="mt-1.5"
        />

        <Label htmlFor="repeat_password" className="text-text-primary">
          Confirm Password
        </Label>
        <PasswordInput
          id="repeat_password"
          name="repeat_password"
          autoComplete="new-password"
          required
          placeholder="Confirm new password"
          className="mt-1.5"
        />

        <Button
          type="submit"
          disabled={loading}
          className="mt-4 w-full bg-interactive-active hover:bg-interactive-active/90 text-brand-primary transition-all duration-300"
        >
          {loading ? 'Updating...' : 'Reset Password'}
        </Button>
      </div>
    </form>
  );
}