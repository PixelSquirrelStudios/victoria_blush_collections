import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { isClientAccount } from '@/lib/auth-redirect';

export async function updateSession(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api/')) return NextResponse.next({ request });
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
  const isClientDashboardPage = ['/dashboard/bookings', '/dashboard/book-session', '/dashboard/questionnaire', '/dashboard/edit-profile'].includes(url.pathname);

  const redirectWithCookies = () => {
    const response = NextResponse.redirect(url);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      response.cookies.set(cookie);
    });
    return response;
  };

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

  // Redirect unauthenticated users away from dashboard routes
  if (!user && url.pathname.startsWith('/dashboard')) {
    url.pathname = '/booking/login';
    return redirectWithCookies();
  }

  if (user && url.pathname.startsWith('/dashboard')) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
    const isAdmin = profile?.role === 'admin';
    const isClient = !isAdmin && (profile?.role === 'client' || user.app_metadata?.role === 'client');
    if (!isAdmin && (!isClient || !isClientDashboardPage)) {
      url.pathname = isClient ? '/dashboard/bookings' : '/';
      return redirectWithCookies();
    }
  }

  // Redirect authenticated users away from auth pages (except callback routes)
  if (user && isAuthPage && !isCallbackRoute) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
    url.pathname = isClientAccount(profile, user.app_metadata?.role) ? '/dashboard/bookings' : '/';
    return redirectWithCookies();
  }

  // Handle onboarding page separately
  if (user && url.pathname.startsWith('/onboarding')) {
    // Fetch user profile to check has_onboarded status
    const { data: profile } = await supabase
      .from('profiles')
      .select('has_onboarded, role')
      .eq('id', user.id)
      .single();

    // If user has already onboarded, send them to their usual landing page
    if (profile?.has_onboarded) {
      url.pathname = isClientAccount(profile, user.app_metadata?.role) ? '/dashboard/bookings' : '/';
      return redirectWithCookies();
    }
  }

  // If user hasn't onboarded, redirect from any page to onboarding (except auth routes and onboarding itself)
  if (user && !isCallbackRoute && !url.pathname.startsWith('/onboarding') && !url.pathname.startsWith('/booking') && !isClientDashboardPage && user.app_metadata?.role !== 'client') {
    const { data: profile } = await supabase
      .from('profiles')
      .select('has_onboarded')
      .eq('id', user.id)
      .single();

    if (profile && !profile.has_onboarded) {
      url.pathname = '/onboarding';
      return redirectWithCookies();
    }
  }

  return supabaseResponse;
}
