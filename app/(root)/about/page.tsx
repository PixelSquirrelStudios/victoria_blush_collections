import { fetchUserData } from '@/app/hooks/useUser';
import Footer from '@/components/sections/Footer';
import Maintenance from '@/components/sections/Maintenance';
import About from '@/components/sections/About';
import { getHomepageData } from '@/lib/actions/homepage.actions';

export default async function AboutPage() {
  const { data: homepageData } = await getHomepageData();
  const { user } = await fetchUserData();

  // If maintenance mode is enabled and user is not signed in, show Maintenance page
  if (homepageData?.enable_maintenance && !user) {
    return <Maintenance />;
  }

  return (
    <>
      <div className='pt-10'>
        <About
          aboutDescription={homepageData?.about_description || ''}
          aboutImageUrl={homepageData?.about_image_url}
          isHomepage={false}
        />
      </div>
      <Footer description={homepageData.footer_description} />
    </>
  );
}
