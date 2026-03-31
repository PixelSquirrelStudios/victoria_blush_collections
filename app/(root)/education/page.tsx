import EducationContent from '@/components/sections/Education';
import Footer from '@/components/sections/Footer';
import { getHomepageData } from '@/lib/actions/homepage.actions';
import { fetchUserData } from '@/app/hooks/useUser';
import Maintenance from '@/components/sections/Maintenance';

export default async function EducationPage() {
  const { data: homepageData } = await getHomepageData();
  const { user } = await fetchUserData();

  if (homepageData?.enable_maintenance && !user) {
    return <Maintenance />;
  }

  return (
    <>
      <div className="pt-10">
        <EducationContent />
      </div>
      <Footer description={homepageData?.footer_description} />
    </>
  );
}
