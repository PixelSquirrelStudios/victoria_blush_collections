'use client';

import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import Link from 'next/link';
import { cormorant } from '@/app/fonts';

const showcaseImages = [
  {
    src: '/assets/images/balayage-1.jpg',
    alt: 'Balayage hair transformation',
    category: 'Balayage'
  },
  {
    src: '/assets/images/balayage-2.jpg',
    alt: 'Lived in color',
    category: 'Balayage'
  },
  {
    src: '/assets/images/colour-1.jpg',
    alt: 'Colour transformation',
    category: 'Colour'
  },
  {
    src: '/assets/images/styling-1.jpg',
    alt: 'Hair styling',
    category: 'Styling'
  },
  {
    src: '/assets/images/blonde-1.jpg',
    alt: 'Platinum blonde',
    category: 'Highlights'
  },
  {
    src: '/assets/images/cut-1.jpg',
    alt: 'Precision haircut',
    category: 'Cuts'
  },
  {
    src: '/assets/images/balayage-3.jpg',
    alt: 'Natural balayage',
    category: 'Balayage'
  },
  {
    src: '/assets/images/blonde-2.jpg',
    alt: 'Blonde highlights',
    category: 'Highlights'
  },
  {
    src: '/assets/images/colour-2.jpg',
    alt: 'Rich colour',
    category: 'Colour'
  }
];

const categories = ['All', 'Balayage', 'Highlights', 'Colour', 'Cuts', 'Styling'];
export default function Gallery() {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredImages = selectedCategory === 'All'
    ? showcaseImages
    : showcaseImages.filter(img => img.category === selectedCategory);

  return (
    <section id="gallery" className="py-24 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <p className="text-text-primary tracking-widest uppercase mb-4">
            Portfolio
          </p>
          <h2 className={`${cormorant.className} text-4xl md:text-5xl font-medium uppercase text-text-primary mb-6`}>
            My Latest Work
          </h2>
          <p className="text-lg text-text-body font-light">
            Explore transformations that celebrate individuality and style
          </p>
        </motion.div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`
                px-6 py-2 rounded font-medium transition-all duration-300 cursor-pointer
                ${selectedCategory === category
                  ? 'bg-interactive-active text-white shadow-lg'
                  : 'bg-interactive-hover text-brand-primary hover:bg-interactive-active'
                }
              `}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <motion.div
          layout
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredImages.map((image, index) => (
            <motion.div
              layout
              key={image.src}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{
                layout: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
                opacity: { duration: 0.25 },
                scale: { duration: 0.25 }
              }}
              className="group relative aspect-3/4 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300"
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-linear-to-t from-stone-900/90 via-stone-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400">
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-400">
                  <p className="text-xs font-semibold uppercase tracking-wider opacity-70 mb-1">{image.category}</p>
                  <p className="text-lg font-bold">{image.alt}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Instagram CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <Link href="https://www.instagram.com/victoriablushcollections" target="_blank" className="inline-block">
            <div className="inline-flex items-center gap-4 bg-brand-secondary text-text-primary px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
              <div className="text-left">
                <p className="text-sm opacity-90 font-medium">Follow me on Instagram</p>
                <p className="font-bold text-lg">@victoriablushcollections</p>
              </div>
            </div>
          </Link>
        <script src="https://elfsightcdn.com/platform.js" async></script>
        </motion.div>
        <div className="elfsight-app-b5c63793-7124-4070-8649-eca569fb4f4c" data-elfsight-app-lazy></div>
      </div>
    </section >
  );
}
