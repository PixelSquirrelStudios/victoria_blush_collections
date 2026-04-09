import EducationContent from '@/components/sections/Education';
import Footer from '@/components/sections/Footer';
import { getHomepageData } from '@/lib/actions/homepage.actions';
import { getEducationData } from '@/lib/actions/education.actions';
import { fetchUserData } from '@/app/hooks/useUser';
import Maintenance from '@/components/sections/Maintenance';

export default async function EducationPage() {
  const { data: homepageData } = await getHomepageData();
  const { data: educationData } = await getEducationData();
  const { user } = await fetchUserData();

  if (homepageData?.enable_maintenance && !user) {
    return <Maintenance />;
  }

  return (
    <>
      <div className="pt-10">
        <EducationContent
          heroHeading={educationData?.hero_heading}
          heroSubheading={educationData?.hero_subheading}
          heroDescription1={educationData?.hero_description_1}
          heroDescription2={educationData?.hero_description_2}
          heroImageUrl={educationData?.hero_image_url}
          whoHeading={educationData?.who_heading}
          whoDescriptions={educationData?.who_descriptions}
          helpHeading={educationData?.help_heading}
          helpDescription={educationData?.help_description}
          helpItems={educationData?.help_items}
          approachHeading={educationData?.approach_heading}
          approachParagraphs={educationData?.approach_paragraphs}
          outcomeHeading={educationData?.outcome_heading}
          outcomeParagraphs={educationData?.outcome_paragraphs}
          whyMeHeading={educationData?.why_me_heading}
          whyMeParagraphs={educationData?.why_me_paragraphs}
          whyMeImageUrl={educationData?.why_me_image_url}
          contactHeading={educationData?.contact_heading}
          contactDescription={educationData?.contact_description}
          contactButtonText={educationData?.contact_button_text}
          contactNote={educationData?.contact_note}
        />
      </div>
      <Footer description={homepageData?.footer_description} />
    </>
  );
}
