'use client';

import { useState } from 'react';
import { Mail } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { magicLinkAction } from '@/app/(auth)/actions';

const optionButton = 'flex w-full items-center justify-center gap-2 rounded-md border bg-bg-muted border-border hover:bg-bg-subtle text-text-primary p-2 cursor-pointer hover:text-accent-foreground transition-colors';

export default function MagicLinkForm({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const label = mode === 'sign-up' ? 'Sign Up With Magic Link' : 'Sign In With Magic Link';

  if (!open) {
    return (
      <Button type="button" variant="outline" className={optionButton} onClick={() => setOpen(true)}>
        <Mail className="size-5" />
        {label}
      </Button>
    );
  }

  return (
    <form
      className="flex w-full flex-col gap-3"
      onSubmit={async (event) => {
        event.preventDefault();
        setBusy(true);
        setResult(null);
        try {
          setResult(await magicLinkAction({ email, mode }));
        } catch {
          setResult({ success: false, message: 'Unable to send the link. Please try again.' });
        } finally {
          setBusy(false);
        }
      }}
    >
      <label htmlFor={`magic-link-${mode}`} className="text-md font-medium">
        {mode === 'sign-up' ? 'Email for your sign-up link' : 'Email for your sign-in link'}
      </label>
      <Input
        id={`magic-link-${mode}`}
        type="email"
        autoComplete="email"
        required
        autoFocus
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="Enter your Email..."
        className="rounded-lg border border-bg-section bg-bg-primary text-text-primary"
      />
      <Button type="submit" variant="outline" disabled={busy} className={optionButton}>
        <Mail className="size-5" />
        {busy ? 'Sending...' : 'Email Me a Link'}
      </Button>
      {result && (
        <p role={result.success ? 'status' : 'alert'} className={`text-sm ${result.success ? 'text-text-body' : 'text-red-900'}`}>
          {result.message}
        </p>
      )}
    </form>
  );
}
