'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { cormorant } from '@/app/fonts';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface GalleryImage {
  id: string;
  title: string;
  description?: string;
  image_url: string;
  categories_images: Array<{
    categories: {
      id: string;
      name: string;
    };
  }>;
}

interface GalleryProps {
  images: GalleryImage[];
  subheading?: string;
  description?: string;
}

export default function Gallery({ images, subheading, description }: GalleryProps) {
  // Extract unique categories from images
  const uniqueCategories = useMemo(
    () => [
      'All',
      ...Array.from(
        new Set(
          images.flatMap((img) => img.categories_images?.map((ci) => ci.categories.name) || [])
        )
      ).sort(),
    ],
    [images]
  );

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [canScroll, setCanScroll] = useState({ prev: false, next: true });
  const [scrollProgress, setScrollProgress] = useState(0);
  const [visibleSlots, setVisibleSlots] = useState(4);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const filteredImages = useMemo(
    () =>
      selectedCategory === 'All'
        ? images
        : images.filter((img) =>
          img.categories_images?.some((ci) => ci.categories.name === selectedCategory)
        ),
    [images, selectedCategory]
  );

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

  // Scroll to start when category changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  }, [selectedCategory]);

  const handleScroll = () => updateCanScroll();

  // Main carousel precise paging by index so highlights match positions
  const getCardWidth = () => {
    const track = scrollRef.current?.querySelector('.carousel-track') as HTMLElement | null;
    if (!track) return null;
    const firstItem = track.querySelector(':scope > *') as HTMLElement | null;
    if (!firstItem) return null;
    const rect = firstItem.getBoundingClientRect();
    const style = window.getComputedStyle(track);
    const gap = parseFloat(style.columnGap || style.gap || '16') || 16;
    return { card: rect.width, gap };
  };

  const getFirstVisibleIndex = () => {
    const container = scrollRef.current;
    if (!container) return 0;
    const dims = getCardWidth();
    if (!dims) return 0;
    const { card, gap } = dims;
    const approx = (container.scrollLeft + 1) / (card + gap);
    const idx = Math.round(approx);
    return Math.max(0, Math.min(idx, filteredImages.length - 1));
  };

  const scrollToItemIndex = (index: number) => {
    const container = scrollRef.current;
    if (!container) return;
    const dims = getCardWidth();
    if (!dims) return;
    const { card, gap } = dims;
    const left = Math.max(0, Math.min(index, filteredImages.length - 1)) * (card + gap);
    container.scrollTo({ left, behavior: 'smooth' });
    requestAnimationFrame(updateCanScroll);
  };

  const scrollPrevPage = () => {
    const firstIndex = getFirstVisibleIndex();
    const step = visibleSlots;
    const nextFirst = Math.max(0, firstIndex - step);
    scrollToItemIndex(nextFirst);
  };

  const scrollNextPage = () => {
    const firstIndex = getFirstVisibleIndex();
    const step = visibleSlots;
    const nextFirst = Math.min(filteredImages.length - 1, firstIndex + step);
    scrollToItemIndex(nextFirst);
  };

  // Dialog state and thumbnails behavior
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [dialogImages, setDialogImages] = useState<GalleryImage[]>([]);
  const dialogThumbsRef = useRef<HTMLDivElement | null>(null);

  // Thumbnails layout/scroll helpers (pure logic, no style changes)
  const THUMB_GAP = 8; // keep in sync with thumbs row gap styling
  const getThumbLayout = () => {
    const container = dialogThumbsRef.current;
    if (!container) {
      const isLarge = typeof window !== 'undefined' ? window.innerWidth >= 1024 : false;
      return { itemWidth: 0, gap: THUMB_GAP, perRow: isLarge ? 4 : 3 };
    }
    const isLarge = window.innerWidth >= 1024;
    const perRow = isLarge ? 4 : 3;
    const gap = THUMB_GAP;
    const containerWidth = container.clientWidth;
    const itemWidth =
      perRow > 0 ? (containerWidth - gap * (perRow - 1)) / perRow : containerWidth;
    return { itemWidth, gap, perRow };
  };

  // Align to the group containing index on open or big jumps
  const alignThumbsToGroup = (index: number) => {
    const container = dialogThumbsRef.current;
    if (!container) return;
    const { itemWidth, gap, perRow } = getThumbLayout();
    if (itemWidth <= 0) return;
    const groupStart = Math.floor(index / perRow) * perRow;
    const left = groupStart * (itemWidth + gap);
    container.scrollTo({ left, behavior: 'auto' });
  };

  // When moving one-by-one, only scroll by one thumb if going out of view
  const ensureThumbVisible = (index: number) => {
    const container = dialogThumbsRef.current;
    if (!container) return;
    const { itemWidth, gap, perRow } = getThumbLayout();
    if (itemWidth <= 0) return;

    const totalItem = itemWidth + gap;
    const startIndex = Math.round(container.scrollLeft / totalItem);
    const endIndex = startIndex + perRow - 1;

    if (index < startIndex) {
      container.scrollTo({ left: (startIndex - 1) * totalItem, behavior: 'smooth' });
    } else if (index > endIndex) {
      container.scrollTo({ left: (startIndex + 1) * totalItem, behavior: 'smooth' });
    }
  };

  const openDialogAt = useCallback(
    (image: GalleryImage) => {
      const list = filteredImages;
      const idx = list.findIndex((i) => i.id === image.id);
      setDialogImages(list);
      const startIndex = idx >= 0 ? idx : 0;
      setCurrentIndex(startIndex);
      setSelectedImage(image);

      // Wait for dialog render, then align thumbs to the group
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          alignThumbsToGroup(startIndex);
        });
      });
    },
    [filteredImages]
  );

  const closeDialog = () => {
    setSelectedImage(null);
    setCurrentIndex(-1);
    setDialogImages([]);
  };

  const canPrevDialog = currentIndex > 0;
  const canNextDialog = currentIndex >= 0 && currentIndex < dialogImages.length - 1;

  const goPrev = () => {
    if (!canPrevDialog) return;
    const next = currentIndex - 1;
    setCurrentIndex(next);
    ensureThumbVisible(next);
  };

  const goNext = () => {
    if (!canNextDialog) return;
    const next = currentIndex + 1;
    setCurrentIndex(next);
    ensureThumbVisible(next);
  };

  const onThumbClick = (idx: number) => {
    setCurrentIndex(idx);
    ensureThumbVisible(idx);
  };

  // Keyboard navigation while dialog open
  useEffect(() => {
    if (!selectedImage) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedImage, canPrevDialog, canNextDialog, currentIndex]);

  return (
    <section id="gallery" className="py-24 bg-white **:outline-none! [&_button]:outline-none! [&_a]:outline-none!">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <p className="text-text-primary tracking-widest uppercase mb-4">
            {subheading || 'Portfolio'}
          </p>
          <h2
            className={`${cormorant.className} text-4xl md:text-5xl font-medium uppercase text-text-primary mb-6`}
          >
            My Latest Work
          </h2>
          <p className="text-lg text-text-body font-light">
            {description || 'Explore transformations that celebrate individuality and style'}
          </p>
        </motion.div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {uniqueCategories.map((category) => (
            <button
              key={category}
              onClick={() => {
                setSelectedCategory(category);
                if (category === 'All' && scrollRef.current) {
                  scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
                }
              }}
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
                <div
                  key={image.id}
                  className="w-full md:w-[calc(50%-8px)] lg:w-[calc(25%-12px)] shrink-0 snap-start"
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{
                      opacity: { duration: 0.25 },
                      scale: { duration: 0.25 },
                    }}
                    className="group relative aspect-3/4 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 cursor-pointer h-full"
                    onClick={() => openDialogAt(image)}
                  >
                    <Image
                      src={image.image_url}
                      alt={image.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 24vw"
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-linear-to-t from-stone-900/90 via-stone-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400">
                      <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-400">
                        <p className="text-xs font-semibold uppercase tracking-wider opacity-70 mb-1">
                          {image.categories_images?.[0]?.categories.name || ''}
                        </p>
                        <p className="text-lg font-bold">{image.title}</p>
                        {image.description && (
                          <p className="text-sm mt-1 opacity-90">
                            {image.description}
                          </p>
                        )}
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
              onClick={scrollPrevPage}
              className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-10 bg-brand-secondary/60 hover:bg-brand-primary/80 text-text-primary p-2 rounded-full transition-all duration-200"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
          )}

          {canScroll.next && (
            <button
              onClick={scrollNextPage}
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

        {/* Full Screen Image Dialog (enhanced with thumbnails and arrows) */}
        <Dialog open={!!selectedImage} onOpenChange={(open) => !open && closeDialog()}>
          <DialogContent className="md:mt-10 w-full h-[85vh] p-0 border-0 flex items-center justify-center [&_button[type=button]:last-child]:hidden">
            <DialogTitle className="sr-only">
              {dialogImages[currentIndex]?.title ?? selectedImage?.title}
            </DialogTitle>
            <DialogDescription className="sr-only">
              {dialogImages[currentIndex]?.categories_images?.[0]?.categories.name ||
                selectedImage?.categories_images?.[0]?.categories.name ||
                ''}
            </DialogDescription>

            {selectedImage && currentIndex >= 0 && dialogImages.length > 0 && (
              <div className="relative w-[80vw] h-full max-sm:max-h-[70vh] flex flex-col items-center justify-center">
                {/* Main image area (kept as your object-cover full modal) */}
                <div className="relative w-full h-full flex items-center justify-center">
                  <Image
                    src={dialogImages[currentIndex].image_url}
                    alt={dialogImages[currentIndex].title}
                    fill
                    className="object-cover"
                    sizes="90vw"
                    priority
                  />

                  {/* Close button (kept) */}
                  <button
                    onClick={closeDialog}
                    className="absolute top-4 right-4 z-50 text-white hover:text-gray-300 transition-colors"
                  >
                    <X className="w-8 h-8" />
                  </button>

                  {/* Nav arrows */}
                  {canPrevDialog && (
                    <button
                      onClick={goPrev}
                      className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 z-50 text-white/90 hover:text-white transition-colors bg-black/20 hover:bg-black/30 rounded-full p-2"
                    >
                      <ChevronLeft className="w-8 h-8" />
                    </button>
                  )}
                  {canNextDialog && (
                    <button
                      onClick={goNext}
                      className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 z-50 text-white/90 hover:text-white transition-colors bg-black/20 hover:bg-black/30 rounded-full p-2"
                    >
                      <ChevronRight className="w-8 h-8" />
                    </button>
                  )}

                  {/* Gradient caption (kept the structure; your bg-linear-to-t was causing a darker overlay earlier, so I left your earlier dialog with bg-black and this caption without extra gradient to match your last code) */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white z-10">
                    <p className="text-sm font-semibold uppercase tracking-wider opacity-70 mb-2">
                      {dialogImages[currentIndex]?.categories_images?.[0]?.categories.name ||
                        ''}
                    </p>
                    <p className="text-2xl font-bold">
                      {dialogImages[currentIndex]?.title}
                    </p>
                    {dialogImages[currentIndex]?.description && (
                      <p className="text-lg mt-2 opacity-90">
                        {dialogImages[currentIndex]?.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Thumbnails row: keep your styling; only behavior wired */}
                <div className="w-full bg-transparent!">
                  <div className="mx-auto bg-transparent! max-w-6xl py-4">
                    <div
                      ref={dialogThumbsRef}
                      className="thumbs-row flex overflow-x-hidden snap-x snap-mandatory [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] select-none pointer-events-none"
                    >
                      {dialogImages.map((img, idx) => (
                        <button
                          key={img.id}
                          onClick={() => onThumbClick(idx)}
                          className={`th-item relative shrink-0 overflow-hidden border-3 focus:outline-none transition-all duration-200 pointer-events-auto ${idx === currentIndex
                            ? 'border-3 border-brand-secondary'
                            : 'border-interactive-active hover:border-brand-secondary'
                            }`}
                          aria-label={`Thumbnail ${idx + 1}`}
                        >
                          <div className="relative w-full pt-[100%]">
                            <Image
                              src={img.image_url}
                              alt={img.title}
                              fill
                              sizes="(max-width: 1023px) 33vw, 25vw"
                              className="object-cover object-center"
                            />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Keep your inline CSS that enforces 3 on small and 4 on large */}
                <style
                  dangerouslySetInnerHTML={{
                    __html: `
                      .thumbs-row { gap: 8px; }
                      .thumbs-row .th-item { width: calc((100% - (2 * 8px)) / 3); }
                      @media (min-width: 1024px) {
                        .thumbs-row .th-item { width: calc((100% - (3 * 8px)) / 4); }
                      }
                      #gallery * { outline: none !important; }
                      #gallery button:focus { outline: none !important; }
                      #gallery a:focus { outline: none !important; }
                      #gallery *:focus { outline: none !important; }
                      #gallery *:focus-visible { outline: none !important; }
                    `,
                  }}
                />
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
          <Link
            href="https://www.instagram.com/victoriablushcollections"
            target="_blank"
            className="inline-block"
          >
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
        <div
          className="elfsight-app-b5c63793-7124-4070-8649-eca569fb4f4c"
          data-elfsight-app-lazy
        ></div>
      </div>
    </section>
  );
}