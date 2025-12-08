'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-linear-to-br from-rose-50 via-white to-stone-50">
      <div className="absolute inset-0 bg-[url('/assets/patterns/subtle-dots.svg')] opacity-5"></div>

      <div className="container mx-auto px-4 py-20 grid lg:grid-cols-2 gap-12 items-center relative z-10">
        {/* Text Content */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          <div className="space-y-4">
            <p className="text-brand-secondary font-medium tracking-wider uppercase text-sm inline-block pb-1">
              Premium Hair Artistry
            </p>
            <h1 className="text-5xl md:text-[80px] font-bold text-bg-dark/95 leading-tight">
              Victoria Blush
              <span className="block text-5xl md:text-6xl text-brand-secondary">Collections</span>
            </h1>
            <p className="text-xl text-text-body leading-relaxed max-w-xl">
              Transforming hair into art. Specialising in balayage, lived-in color,
              and bespoke styling that celebrates your unique beauty.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="#contact"
              className="px-8 py-4 bg-brand-primary text-white font-semibold rounded-md hover:bg-brand-primary-hover transition-all duration-300 shadow-lg hover:shadow-xl text-center"
            >
              Book Appointment
            </a>
            <a
              href="#prices"
              className="px-8 py-4 bg-bg-primary border-2 border-border-emphasis text-text-primary font-semibold rounded-md hover:bg-bg-subtle transition-all duration-300 text-center"
            >
              View Prices
            </a>
          </div>
          <div className="grid grid-cols-3 gap-8 pt-8 border-t border-border-medium">
            <div>
              <p className="text-3xl font-bold text-text-secondary">8+</p>
              <p className="text-text-body text-sm">Years Experience</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-text-secondary">500+</p>
              <p className="text-text-body text-sm">Happy Clients</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-text-secondary">★ 5.0</p>
              <p className="text-text-body text-sm">Client Rating</p>
            </div>
          </div>
        </motion.div>

        {/* Image Content */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative"
        >
          <div className="relative aspect-3/4 xl:rounded-t-none rounded-b-3xl rounded-t-3xl overflow-hidden shadow-2xl">
            <Image
              src="/assets/images/victoria-hero.jpg"
              alt="Victoria - Master Hair Stylist"
              fill
              className="object-cover"
              priority
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
            />
            {/* Decorative Elements */}
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-border-medium rounded-full blur-3xl opacity-40"></div>
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-border-default rounded-full blur-3xl opacity-40"></div>
          </div>

          {/* Floating Badge */}
          {/* <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 1 }}
            className="absolute -bottom-6 -left-6 bg-bg-primary rounded-2xl shadow-xl p-6 border border-border-light"
          >
            <p className="text-sm text-text-body font-medium">Certified by</p>
            <p className="text-lg font-bold text-text-primary">Kerastase</p>
          </motion.div> */}
        </motion.div>
      </div>
    </section>
  );
}
