import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;
  const redirectTo = requestUrl.searchParams.get('redirect_to')?.toString();

  const err = requestUrl.searchParams.get('error');
  const errCode = requestUrl.searchParams.get('error_code');
  const errDesc = requestUrl.searchParams.get('error_description');

  if (err) {
    let msg = 'Authentication error. Please try again.';
    if (errCode === 'otp_expired') {
      msg = 'Your confirmation link has expired. Please request a new one.';
    } else if (errDesc) {
      msg = errDesc.replace(/\+/g, ' ');
    }
    const url = new URL(`${origin}/sign-in`);
    url.searchParams.set('error', msg);
    return NextResponse.redirect(url);
  }

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      const url = new URL(`${origin}/sign-in`);
      url.searchParams.set(
        'error',
        'Session exchange failed. Please sign in again.'
      );
      return NextResponse.redirect(url);
    }
  }

  if (redirectTo) {
    return NextResponse.redirect(`${origin}${redirectTo}`);
  }

  const updatedSupabase = await createClient();
  const { data: userData } = await updatedSupabase.auth.getClaims();
  const user = userData?.claims?.sub;

  if (!user) {
    const url = new URL(`${origin}/sign-in`);
    url.searchParams.set('error', 'No active session. Please sign in.');
    return NextResponse.redirect(url);
  }

  const { data: profile, error: profileErr } = await updatedSupabase
    .from('profiles')
    .select('has_onboarded')
    .eq('id', user as string)
    .single();

  if (profileErr) {
    const url = new URL(`${origin}/sign-in`);
    url.searchParams.set('error', 'Could not fetch profile. Please sign in.');
    return NextResponse.redirect(url);
  }

  const isOnboarded = profile?.has_onboarded as boolean;
  if (isOnboarded === false) return redirect('/onboarding');
  return redirect('/');
}
