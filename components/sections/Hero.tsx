'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { cormorant } from '@/app/fonts';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-linear-to-br from-rose-50 via-white to-stone-50">
      <div className="container mx-auto px-4 py-20 grid lg:grid-cols-2 gap-12 items-center relative z-10">
        {/* Text Content */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          <div className='space-y-4'>
            <p className="text-text-primary tracking-widest uppercase inline-block pt-3 pb-1">
              Premium Hair Artistry
            </p>
            <h1 className={`${cormorant.className} text-6xl max-sm:text-[48px] max-lg:text-6xl xl:text-[80px] font-semibold uppercase text-bg-dark/95 leading-tight text-nowrap`}>
              Victoria Blush
              <span className="block text-5xl md:text-[4rem] max-sm:text-[45px] text-text-primary/60 tracking-wide">Collections</span>
            </h1>
            <p className='text-lg text-text-body font-light leading-8 max-w-og-2xl'>
              A calm, friendly space where you can relax and enjoy beautiful hair.
              One-to-one appointments specialising in balayage, lived-in colour, colour correction and precision cutting — helping you feel like the best version of you.
            </p>
          </div>

          {/* Image Content - Mobile Only */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative lg:hidden"
          >
            <div className="relative aspect-3/4 rounded-3xl overflow-hidden shadow-2xl">
              <Image
                src="/assets/images/victoria-hero.jpg"
                alt="Victoria - Master Hair Stylist"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                priority
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
              />
              {/* Decorative Elements */}
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-border-medium rounded-full blur-3xl opacity-40"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-border-default rounded-full blur-3xl opacity-40"></div>
            </div>
          </motion.div>

          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="#contact"
              className="px-8 py-4 bg-interactive-active text-brand-primary font-medium tracking-wide rounded-md hover:bg-interactive-active/90 transition-all duration-300 shadow-lg hover:shadow-xl text-center"
            >
              Book Appointment
            </a>
            <a
              href="#services"
              className="px-8 py-4 bg-brand-primary border-2 border-interactive-hover text-text-primary font-medium tracking-wide rounded-md hover:bg-brand-secondary transition-all duration-300 text-center"
            >
              View Services
            </a>
          </div>
          <div className="grid grid-cols-3 gap-8 pt-8 border-t border-border-medium">
            <div>
              <p className="text-3xl font-semibold text-text-secondary">15+</p>
              <p className="text-text-body md:text-sm text-xs">Years Experience</p>
            </div>
            <div>
              <p className="text-3xl font-semibold text-text-secondary">500+</p>
              <p className="text-text-body md:text-sm text-xs">Happy Clients</p>
            </div>
            <div>
              <p className="text-3xl font-semibold text-text-secondary">★ 5.0</p>
              <p className="text-text-body md:text-sm text-xs">Client Rating</p>
            </div>
          </div>
        </motion.div>

        {/* Image Content - Desktop Only */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative hidden lg:block"
        >
          <div className="relative aspect-3/4 xl:rounded-t-none rounded-b-3xl rounded-t-3xl overflow-hidden shadow-2xl">
            <Image
              src="/assets/images/victoria-hero.jpg"
              alt="Victoria - Master Hair Stylist"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
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
