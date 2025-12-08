'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { Provider } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';

function normalizeAuthError(msg: string) {
  const m = msg.toLowerCase();
  if (m.includes('invalid login credentials'))
    return 'Invalid email or password.';
  if (m.includes('email not confirmed'))
    return 'Email not confirmed. Please check your inbox or resend the link below.';
  if (m.includes('otp_expired') || m.includes('expired'))
    return 'Your confirmation link has expired. Please request a new one below.';
  return msg;
}

/**
 * Email/password sign-up
 * Returns:
 *  - string error (friendly) if failed
 *  - null on success (email confirmation likely required)
 */
export const signUp = async (values: {
  email: string;
  password: string;
  username?: string;
}) => {
  const { username, email, password } = values;
  const supabase = await createClient();
  const origin = (await headers()).get('origin');

  if (!email || !password) return 'Email and password are required';

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: { username, email, role: 'user' },
    },
  });

  if (error) {
    return normalizeAuthError(error.message);
  }

  // success (user will confirm via email link)
  return null;
};

/**
 * Email/password sign-in used by the client form
 * Returns:
 *  - string error (friendly) if failed
 *  - null on success
 */
export const signIn = async (values: { email: string; password: string }) => {
  const { email, password } = values;
  const supabase = await createClient();

  if (!email || !password) return 'Email and password are required';

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return normalizeAuthError(error.message);
  }

  return null;
};

/**
 * Resend confirmation email for an existing (unconfirmed) user
 * Returns an object { success, message }
 */
export const resendConfirmationAction = async (formData: FormData) => {
  const email = formData.get('email')?.toString();
  if (!email) return { success: false, message: 'Email is required' };

  const supabase = await createClient();
  const origin = (await headers()).get('origin');

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false,
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    return { success: false, message: normalizeAuthError(error.message) };
  }
  return {
    success: true,
    message: 'A new confirmation link has been sent to your email.',
  };
};

/**
 * Forgot password: sends reset link
 * Returns an object { success, message }
 */
export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get('email')?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get('origin');

  if (!email) return { success: false, message: 'Email is required' };

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/reset-password`, // must match the page path exactly
  });

  if (error) {
    return {
      success: false,
      message: error.message || 'Could not reset password',
    };
  }

  return {
    success: true,
    message: 'Check your email for a link to reset your password',
  };
};

/**
 * Reset password (server-side) — currently unused (client-driven reset).
 */
export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();
  const { data: user, error: userError } = await supabase.auth.getClaims();

  if (userError || !user) {
    return {
      success: false,
      message: 'Session expired. Please use the reset link again.',
    };
  }

  const password = formData.get('password') as string;
  const confirmPassword = formData.get('repeat_password') as string;

  if (!password || !confirmPassword) {
    return { success: false, message: 'Both password fields are required' };
  }
  if (password !== confirmPassword) {
    return { success: false, message: 'Passwords do not match' };
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    return {
      success: false,
      message: normalizeAuthError(error.message) || 'Password update failed',
    };
  }

  return {
    success: true,
    message: 'Password updated successfully. Please sign in.',
  };
};

/**
 * Sign out
 */
export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect('/');
};

/**
 * OAuth sign-in
 */
export async function oAuthSignIn(provider: Provider) {
  if (!provider) return redirect('/sign-in');

  const supabase = await createClient();
  const origin = (await headers()).get('origin');
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: `${origin}/auth/callback` },
  });

  if (error) {
    console.error(error.message);
    return redirect('/sign-in');
  }
  return redirect(data.url);
}
