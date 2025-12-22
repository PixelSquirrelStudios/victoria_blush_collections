import EditUserForm from '@/components/forms/EditUserForm';
import { getUserWithProfile } from '@/lib/actions/user.actions';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

const EditProfile = async () => {
  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getClaims();
  const userId = userData?.claims.sub;

  if (!userId) {
    redirect('/sign-in');
  }

  const profile = await getUserWithProfile(userId);

  return (
    <>
      <div className="flex w-full h-full max-lg:pb-[150px]">
        <EditUserForm profileDetails={JSON.stringify(profile)} />
      </div>
    </>
  );
};

export default EditProfile;
