import Hero from '@/components/sections/Hero';
import About from '@/components/sections/About';
import Gallery from '@/components/sections/Gallery';
import Contact from '@/components/sections/Contact';
import Footer from '@/components/sections/Footer';
import HashScrollHandler from '@/components/shared/HashScrollHandler';
import { getPublicServices } from '@/lib/actions/service.actions';
import { getPublicGalleryImages } from '@/lib/actions/image.actions';
import Services from '@/components/sections/Services';

export default async function Home() {
  const { data: services } = await getPublicServices();
  const { data: galleryImages } = await getPublicGalleryImages();

  return (
    <main className="min-h-screen">
      <HashScrollHandler />
      <Hero />
      <About />
      <Services services={services || []} />
      <Gallery images={(galleryImages as any) || []} />
      <Contact />
      <Footer />
    </main>
  );
}
