import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import EditHomepageForm from '@/components/forms/EditHomepageForm';
import { getHomepageData } from '@/lib/actions/homepage.actions';
import { getUserWithProfile } from '@/lib/actions/user.actions';

export default async function EditHomepagePage() {
  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getClaims();
  const userId = userData?.claims.sub;

  if (!userId) {
    redirect('/sign-in');
  }

  const profile = await getUserWithProfile(userId);

  // Fetch the homepage data
  const { data: homepageData } = await getHomepageData();

  return (
    <div className="w-full max-w-4xl">
      <EditHomepageForm homepageData={homepageData} currentUser={profile} />
    </div>
  );
}
