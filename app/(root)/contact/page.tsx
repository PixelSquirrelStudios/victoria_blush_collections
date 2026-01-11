import { fetchUserData } from '@/app/hooks/useUser';
import Footer from '@/components/sections/Footer';
import Maintenance from '@/components/sections/Maintenance';
import Contact from '@/components/sections/Contact';
import { getHomepageData } from '@/lib/actions/homepage.actions';

export default async function ContactPage() {
  const { data: homepageData } = await getHomepageData();
  const { user } = await fetchUserData();

  // If maintenance mode is enabled and user is not signed in, show Maintenance page
  if (homepageData?.enable_maintenance && !user) {
    return <Maintenance />;
  }

  return (
    <>
      <div className='pt-10'>
        <Contact
          subheading={homepageData?.contact_subheading}
          description={homepageData?.contact_description}
          address={homepageData?.contact_address}
          phone={homepageData?.contact_phone}
          email={homepageData?.contact_email}
          openingHours={homepageData?.contact_opening_hours}
          socialUrl={homepageData?.contact_social_url}
        />
      </div>
      <Footer description={homepageData.footer_description} />
    </>
  );
}
