import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: Array<{ name: string; value: string; options: any }>
        ) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // refreshing the auth token
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const url = request.nextUrl.clone();

  // Auth pages that logged-in users should be redirected away from
  const authPages = [
    '/sign-in',
    '/sign-up',
    '/forgot-password',
    '/reset-password',
  ];
  const isAuthPage = authPages.some((page) => url.pathname.startsWith(page));

  // Callback routes need to work for authentication flow
  const isCallbackRoute = url.pathname.startsWith('/auth/');

  // Redirect authenticated users away from auth pages (except callback routes)
  if (user && isAuthPage && !isCallbackRoute) {
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  // Handle onboarding page separately
  if (user && url.pathname.startsWith('/onboarding')) {
    // Fetch user profile to check has_onboarded status
    const { data: profile } = await supabase
      .from('profiles')
      .select('has_onboarded')
      .eq('id', user.id)
      .single();

    // If user has already onboarded, redirect to home
    if (profile?.has_onboarded) {
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
  }

  // If user hasn't onboarded, redirect from any page to onboarding (except auth routes and onboarding itself)
  if (user && !isCallbackRoute && !url.pathname.startsWith('/onboarding')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('has_onboarded')
      .eq('id', user.id)
      .single();

    if (profile && !profile.has_onboarded) {
      url.pathname = '/onboarding';
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
