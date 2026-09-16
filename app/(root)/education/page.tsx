import EducationContent from '@/components/sections/Education';
import Footer from '@/components/sections/Footer';
import { getHomepageData } from '@/lib/actions/homepage.actions';
import { getEducationData } from '@/lib/actions/education.actions';
import { fetchUserData } from '@/app/hooks/useUser';
import Maintenance from '@/components/sections/Maintenance';
import PageSections from '@/components/sections/PageSections';
import { getSections } from '@/lib/actions/section.actions';

export default async function EducationPage() {
  const { data: homepageData } = await getHomepageData();
  const { data: educationData } = await getEducationData();
  const { user } = await fetchUserData();

  if (homepageData?.enable_maintenance && !user) {
    return <Maintenance />;
  }

  const { data: sections, error } = await getSections('education');
  if (error) throw new Error(`Unable to load education sections: ${error}`);

  return (
    <>
      <div className="pt-10">
        <EducationContent
          heroHeading={educationData?.hero_heading}
          heroSubheading={educationData?.hero_subheading}
          heroDescription1={educationData?.hero_description_1}
          heroDescription2={educationData?.hero_description_2}
          heroImageUrl={educationData?.hero_image_url}
          contactButtonText={educationData?.contact_button_text}
        >
          <PageSections sections={sections} />
        </EducationContent>
      </div>
      <Footer description={homepageData?.footer_description} />
    </>
  );
}
