'use client';

import { useEffect } from 'react';
import Navigation from '@/components/shared/Menus/Navigation';
import Hero from '@/components/sections/Hero';
import About from '@/components/sections/About';
import PriceList from '@/components/sections/PriceList';
import Gallery from '@/components/sections/Gallery';
import Contact from '@/components/sections/Contact';
import Footer from '@/components/sections/Footer';

export default function Home() {
  useEffect(() => {
    // Handle hash navigation on page load
    if (window.location.hash) {
      const hash = window.location.hash;
      // Small delay to ensure page is rendered
      setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, []);

  return (
    <main className="min-h-screen">
      {/* <Navigation /> */}
      <Hero />
      <About />
      <PriceList />
      <Gallery />
      <Contact />
      <Footer />
    </main>
  );
}
