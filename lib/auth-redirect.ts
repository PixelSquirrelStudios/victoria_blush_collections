type Profile = { role?: string | null; has_onboarded?: boolean | null } | null | undefined;

export function isClientAccount(profile: Profile, appRole?: unknown) {
  return profile?.role !== 'admin' && (profile?.role === 'client' || appRole === 'client');
}

// Booking-created clients (app_metadata role "client") skip onboarding, matching the middleware.
export function postSignInPath(profile: Profile, appRole?: unknown) {
  if (!profile?.has_onboarded && appRole !== 'client') return '/onboarding';
  return isClientAccount(profile, appRole) ? '/dashboard/bookings' : '/';
}
