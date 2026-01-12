import { fetchUserData } from '@/app/hooks/useUser';
import Footer from '@/components/sections/Footer';
import Maintenance from '@/components/sections/Maintenance';
import Services from '@/components/sections/Services';
import { getHomepageData } from '@/lib/actions/homepage.actions';
import { getPublicServices } from '@/lib/actions/service.actions';

export default async function ServicesPage() {
  const { data: homepageData } = await getHomepageData();
  const { data: services } = await getPublicServices();

  const { user } = await fetchUserData();

  // If maintenance mode is enabled and user is not signed in, show Maintenance page
  if (homepageData?.enable_maintenance && !user) {
    return <Maintenance />;
  }
  return (
    <>
      <div className='pt-10'>
        <Services
          services={services || []}
          subheading={homepageData?.services_subheading}
          description={homepageData?.services_description}
          importantNotice={homepageData?.services_important_notice}

        />
      </div >
     <Footer description={homepageData.footer_description} />
    </>
  );
}