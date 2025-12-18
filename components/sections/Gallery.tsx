'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { cormorant } from '@/app/fonts';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const showcaseImages = [
  {
    image_url: '/assets/images/balayage-1.jpg',
    description: 'Balayage hair transformation',
    category: 'Balayage'
  },
  {
    image_url: '/assets/images/balayage-2.jpg',
    description: 'Lived in color',
    category: 'Balayage'
  },
  {
    image_url: '/assets/images/colour-1.jpg',
    description: 'Colour transformation',
    category: 'Colour'
  },
  {
    image_url: '/assets/images/styling-1.jpg',
    description: 'Hair styling',
    category: 'Styling'
  },
  {
    image_url: '/assets/images/blonde-1.jpg',
    description: 'Platinum blonde',
    category: 'Highlights'
  },
  {
    image_url: '/assets/images/cut-1.jpg',
    description: 'Precision haircut',
    category: 'Cuts'
  },
  {
    image_url: '/assets/images/balayage-3.jpg',
    description: 'Natural balayage',
    category: 'Balayage'
  },
  {
    image_url: '/assets/images/blonde-2.jpg',
    description: 'Blonde highlights',
    category: 'Highlights'
  },
  {
    image_url: '/assets/images/colour-2.jpg',
    description: 'Rich colour',
    category: 'Colour'
  },
  {
    image_url: '/assets/images/balayage-4.jpg',
    description: 'Balayage style',
    category: 'Balayage'
  },
  {
    image_url: '/assets/images/highlights.jpg',
    description: 'Natural highlights',
    category: 'Highlights'
  },
  {
    image_url: '/assets/images/grey-blending.jpg',
    description: 'Natural grey blending',
    category: 'Grey Blending'
  },
  {
    image_url: '/assets/images/colour-gloss.jpg',
    description: 'Colour Gloss',
    category: 'Colour'
  }
];

const categories = ['All', 'Balayage', 'Highlights', 'Colour', 'Grey Blending', 'Cuts', 'Styling'];

export default function Gallery() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedImage, setSelectedImage] = useState<typeof showcaseImages[0] | null>(null);
  const [canScroll, setCanScroll] = useState({ prev: false, next: true });
  const [scrollProgress, setScrollProgress] = useState(0);
  const [visibleSlots, setVisibleSlots] = useState(4);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const filteredImages = selectedCategory === 'All'
    ? showcaseImages
    : showcaseImages.filter(img => img.category === selectedCategory);

  const updateCanScroll = () => {
    const container = scrollRef.current;
    if (!container) return;
    const { scrollLeft, scrollWidth, clientWidth } = container;
    setCanScroll({
      prev: scrollLeft > 0,
      next: scrollLeft < scrollWidth - clientWidth - 10,
    });
    const progress = (scrollLeft / Math.max(1, scrollWidth - clientWidth)) * 100;
    setScrollProgress(Math.min(progress, 100));
  };

  useEffect(() => {
    const updateSlots = () => {
      const w = window.innerWidth;
      if (w < 768) {
        setVisibleSlots(1);
      } else if (w < 1024) {
        setVisibleSlots(2);
      } else {
        setVisibleSlots(4);
      }
    };

    updateSlots();
    updateCanScroll();

    window.addEventListener('resize', updateSlots);
    window.addEventListener('resize', updateCanScroll);
    return () => {
      window.removeEventListener('resize', updateSlots);
      window.removeEventListener('resize', updateCanScroll);
    };
  }, []);

  useEffect(() => {
    updateCanScroll();
  }, [filteredImages.length, visibleSlots]);
  const handleScroll = () => updateCanScroll();

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

        {/* Gallery Carousel */}
        <div className="relative w-full">
          <div
            onScroll={handleScroll}
            ref={scrollRef}
            className="overflow-x-auto overflow-y-hidden scroll-smooth snap-x snap-mandatory [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            <div className="flex gap-4 px-0 carousel-track">
              {filteredImages.map((image) => (
                <div key={image.image_url} className="w-full md:w-[calc(50%-8px)] lg:w-[calc(25%-12px)] shrink-0 snap-start">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{
                      opacity: { duration: 0.25 },
                      scale: { duration: 0.25 }
                    }}
                    className="group relative aspect-3/4 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 cursor-pointer h-full"
                    onClick={() => setSelectedImage(image)}
                  >
                    <Image
                      src={image.image_url}
                      alt={image.description}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 24vw"
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-linear-to-t from-stone-900/90 via-stone-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400">
                      <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-400">
                        <p className="text-xs font-semibold uppercase tracking-wider opacity-70 mb-1">{image.category}</p>
                        <p className="text-lg font-bold">{image.description}</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          {canScroll.prev && (
            <button
              onClick={() => {
                const carousel = scrollRef.current;
                const firstItem = document.querySelector('.carousel-track > *') as HTMLElement | null;
                if (carousel) {
                  const width = firstItem?.getBoundingClientRect().width ?? carousel.clientWidth / 4;
                  carousel.scrollBy({ left: -(width + 16), behavior: 'smooth' });
                  requestAnimationFrame(updateCanScroll);
                }
              }}
              className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-10 bg-brand-secondary/60 hover:bg-brand-primary/80 text-text-primary p-2 rounded-full transition-all duration-200"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
          )}

          {canScroll.next && (
            <button
              onClick={() => {
                const carousel = scrollRef.current;
                const firstItem = document.querySelector('.carousel-track > *') as HTMLElement | null;
                if (carousel) {
                  const width = firstItem?.getBoundingClientRect().width ?? carousel.clientWidth / 4;
                  carousel.scrollBy({ left: width + 16, behavior: 'smooth' });
                  requestAnimationFrame(updateCanScroll);
                }
              }}
              className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-10 bg-brand-secondary/60 hover:bg-brand-primary/80 text-text-primary p-2 rounded-full transition-all duration-200"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          )}

          {/* Progress Bar */}
          {filteredImages.length > visibleSlots && (
            <div className="mt-6 h-1 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-linear-to-r from-brand-primary to-brand-secondary rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: `${scrollProgress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          )}
        </div>

        {/* Full Screen Image Dialog */}
        <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
          <DialogContent className="max-w-full w-screen h-[80vh] p-0 border-0 bg-black flex items-center justify-center [&_button[type=button]:last-child]:hidden">
            <DialogTitle className="sr-only">
              {selectedImage?.description}
            </DialogTitle>
            <DialogDescription className="sr-only">
              {selectedImage?.category}
            </DialogDescription>
            {selectedImage && (
              <div className="relative w-full h-full flex items-center justify-center">
                <Image
                  src={selectedImage.image_url}
                  alt={selectedImage.description}
                  fill
                  className="object-cover"
                  sizes="100vw"
                  priority
                />
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-4 right-4 z-50 text-white hover:text-gray-300 transition-colors"
                >
                  <X className="w-8 h-8" />
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/90 to-transparent p-6 text-white z-10">
                  <p className="text-sm font-semibold uppercase tracking-wider opacity-70 mb-2">{selectedImage.category}</p>
                  <p className="text-2xl font-bold">{selectedImage.description}</p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

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
