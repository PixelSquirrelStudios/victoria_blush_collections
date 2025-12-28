
import Hero from '@/components/sections/Hero';
import About from '@/components/sections/About';
import Gallery from '@/components/sections/Gallery';
import Contact from '@/components/sections/Contact';
import Footer from '@/components/sections/Footer';
import HashScrollHandler from '@/components/shared/HashScrollHandler';
import { getHomepageData } from '@/lib/actions/homepage.actions';
import { getPublicServices } from '@/lib/actions/service.actions';
import { getPublicGalleryImages } from '@/lib/actions/image.actions';
import Services from '@/components/sections/Services';


export default async function Home() {
  const { data: services } = await getPublicServices();
  const { data: galleryImages } = await getPublicGalleryImages();
  const { data: homepageData } = await getHomepageData();
  return (
    <main className="min-h-screen">
      <HashScrollHandler />
      <Hero
        imageUrl={homepageData?.hero_image_url}
        subheading={homepageData?.hero_subheading}
        description={homepageData?.hero_description}
      />
      <About aboutDescription={homepageData?.about_description || ''} />
      <Services
        services={services || []}
        subheading={homepageData?.services_subheading}
        description={homepageData?.services_description}
        importantNotice={homepageData?.services_important_notice}
      />
      <Gallery
        images={(galleryImages as any) || []}
        subheading={homepageData?.gallery_subheading}
        description={homepageData?.gallery_description}
      />
      <Contact
        subheading={homepageData?.contact_subheading}
        description={homepageData?.contact_description}
        address={homepageData?.contact_address}
        phone={homepageData?.contact_phone_number}
        email={homepageData?.contact_email}
        openingHours={homepageData?.opening_hours}
        socialUrl={homepageData?.contact_social_media_url}
      />
      <Footer description={homepageData?.footer_description} />
    </main>
  );
}
