
import { getUserWithProfile } from '@/lib/actions/user.actions';
import { UserData } from '@/types';
import { createClient } from '@/lib/supabase/server';

export async function fetchUserData(): Promise<UserData> {
  const supabase = await createClient();

  const { data: claimsData } = await supabase.auth.getClaims();

  const user = claimsData?.claims || null;

  if (!user) {
    return {
      user: null,
      profile: null,
      error: 'User ID not found in claims.',
    };
  }

  const profile = await getUserWithProfile(user.sub);

  //console.log('Fetched user data:', { user, profile });
  if (!profile || profile.error) {
    return {
      user: null,
      profile: null,
      error: typeof profile?.error === 'string' ? profile.error : 'Profile not found.',
    };
  }
  return { user, profile, error: null };
}

