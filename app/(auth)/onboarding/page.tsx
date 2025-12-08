import Onboarding from '@/components/forms/Onboarding';
import { getUserWithProfile } from '@/lib/actions/user.actions';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

const OnboardingPage = async () => {
 const supabase = await createClient();
 
   const { data: userData } = await supabase.auth.getClaims();
   const userId = userData?.claims.sub;

  if (!userId) {
    redirect('/sign-in');
  }

  const profile = await getUserWithProfile(userId);

  return (
    <>
      <div className="flex w-full h-full justify-center max-lg:pb-[150px]">
        <Onboarding profileDetails={JSON.stringify(profile)} />
      </div>
    </>
  );
};

export default OnboardingPage;
