import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import EditEducationForm from '@/components/forms/EditEducationForm';
import { getEducationData } from '@/lib/actions/education.actions';
import { getUserWithProfile } from '@/lib/actions/user.actions';

export default async function EditEducationPage() {
  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getClaims();
  const userId = userData?.claims.sub;

  if (!userId) {
    redirect('/sign-in');
  }

  const profile = await getUserWithProfile(userId);

  // Fetch the education data
  const { data: educationData } = await getEducationData();

  return (
    <div className="w-full max-w-4xl">
      <EditEducationForm educationData={educationData} currentUser={profile} />
    </div>
  );
}
