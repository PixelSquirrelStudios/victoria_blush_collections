import { fetchUserData } from '@/app/hooks/useUser';
import Footer from '@/components/sections/Footer';
import Maintenance from '@/components/sections/Maintenance';
import Gallery from '@/components/sections/Gallery';
import { getHomepageData } from '@/lib/actions/homepage.actions';
import { getPublicGalleryImages } from '@/lib/actions/image.actions';

export default async function GalleryPage() {
  const { data: homepageData } = await getHomepageData();
  const { data: images } = await getPublicGalleryImages();
  const { user } = await fetchUserData();

  // If maintenance mode is enabled and user is not signed in, show Maintenance page
  if (homepageData?.enable_maintenance && !user) {
    return <Maintenance />;
  }

  return (
    <>
      <div className='pt-10'>
        <Gallery
          images={images as any || []}
          subheading={homepageData?.gallery_subheading}
          description={homepageData?.gallery_description}
        />
      </div>
      <Footer />
    </>
  );
}
