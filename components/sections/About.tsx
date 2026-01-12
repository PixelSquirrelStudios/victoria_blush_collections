
'use client';
import { cormorant } from '@/app/fonts';
import { motion } from 'motion/react';
import Image from 'next/image';

interface AboutProps {
  aboutDescription: string;
  aboutImageUrl?: string;
  isHomepage?: boolean;
}

export default function About({ aboutDescription, aboutImageUrl, isHomepage = true }: AboutProps) {
  const bookingHref = isHomepage ? '#contact' : '/contact';

  const MotionDiv = motion.div as any;

  return (
    <section id="about" className="py-24 bg-bg-subtle">
      <div className="container mx-auto px-6">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className={`${cormorant.className} text-4xl md:text-5xl font-medium uppercase text-text-primary mb-4`}>
              About Me
            </h2>
            <div className="w-24 h-1 bg-brand-primary mx-auto"></div>
          </MotionDiv>

          {/* Content Grid */}
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Image Column */}
            <MotionDiv
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative aspect-3/4 rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src={aboutImageUrl && aboutImageUrl !== '' ? aboutImageUrl : '/assets/images/victoria.jpg'}
                  alt="Victoria - Freelance Hairstylist"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
              {/* Decorative accent */}
              <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-brand-primary opacity-10 rounded-full -z-10"></div>
            </MotionDiv>

            {/* Text Column */}
            <MotionDiv
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="space-y-6 text-text-body font-light"
            >
              {aboutDescription.split(/\r?\n/).filter(Boolean).map((para, idx) => (
                <p key={idx} className="text-base leading-7">
                  {para}
                </p>
              ))}
              {/* CTA Button */}
              <div className="pt-6">
                <a
                  href={bookingHref}
                  className="inline-block bg-interactive-active hover:bg-interactive-active/90 text-white px-8 py-4 rounded-lg font-medium  transition-all duration-300 shadow-md hover:shadow-xl"
                >
                  Book Your Appointment
                </a>
              </div>
            </MotionDiv>
          </div>
        </div>
      </div>
    </section >
  );
}
