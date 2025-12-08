'use client';

import { useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import About from '@/components/About';
import PriceList from '@/components/PriceList';
import Gallery from '@/components/Gallery';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';

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
