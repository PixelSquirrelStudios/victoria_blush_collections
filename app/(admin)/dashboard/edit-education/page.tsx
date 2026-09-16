import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import EditEducationForm from '@/components/forms/EditEducationForm';
import { getEducationData } from '@/lib/actions/education.actions';
import { getUserWithProfile } from '@/lib/actions/user.actions';
import SectionsManager from '@/components/forms/SectionsManager';
import { getSections } from '@/lib/actions/section.actions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
  const [educationSections, homepageSections] = await Promise.all([getSections('education'), getSections('homepage')]);

  return (
    <div className="w-full min-w-0 max-w-4xl rounded-xl bg-brand-secondary p-4 text-text-primary shadow-md md:p-10">
      <h1 className="mb-6 text-2xl font-semibold">Education & Page Sections</h1>
      <Tabs defaultValue="sections" className="w-full min-w-0">
        <TabsList className="mb-6 bg-brand-primary">
          <TabsTrigger value="sections">Sections</TabsTrigger>
          <TabsTrigger value="hero">Education Hero</TabsTrigger>
        </TabsList>
        <TabsContent value="sections" forceMount className="data-[state=inactive]:hidden">
          <SectionsManager initialSections={[...educationSections.data, ...homepageSections.data]} loadError={educationSections.error || homepageSections.error} />
        </TabsContent>
        <TabsContent value="hero" forceMount className="data-[state=inactive]:hidden">
          <EditEducationForm educationData={educationData} currentUser={profile} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
