'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { showCustomToast } from '@/components/shared/CustomToast';
import { forgotPasswordAction } from '../actions';
import { Logo } from '@/components/shared/Logo';

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    const response = await forgotPasswordAction(formData);
    setLoading(false);

    showCustomToast({
      title: response.success ? 'Success' : 'Error',
      message: response.message,
      variant: response.success ? 'success' : 'error',
      autoDismiss: true,
    });
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

      <div className="mt-8 flex flex-col gap-2 [&>input]:mb-3">
        <Label htmlFor="email" className="text-text-primary">
          Email
        </Label>
        <Input
          id="email"
          name="email"
          required
          placeholder="Enter your email"
          className="mt-1.5 rounded-lg border border-border border-bg-section bg-bg-primary text-text-primary placeholder:text-text-body/75"
        />
        <Button
          type="submit"
          disabled={loading}
          className="mt-4 w-full bg-interactive-active hover:bg-interactive-active/90 text-brand-primary transition-all duration-300"
        >
          {loading ? 'Sending...' : 'Reset Password'}
        </Button>
      </div>
    </form>
  );
}