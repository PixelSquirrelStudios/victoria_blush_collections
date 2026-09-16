'use client';

import { cormorant } from '@/app/fonts';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';

const MotionDiv = motion.div as any;

interface EducationProps {
  heroHeading?: string;
  heroSubheading?: string;
  heroDescription1?: string;
  heroDescription2?: string;
  heroImageUrl?: string;
  contactButtonText?: string;
  children?: ReactNode;
}

export default function Education({
  heroHeading = 'Education built from over twenty years behind the chair',
  heroSubheading = 'Helping salons and stylists build confidence, raise standards and grow stronger businesses.',
  heroDescription1 = 'After over twenty years in the industry — building and running Blush in Cardiff and successfully selling the business — I now work with salons and stylists to help them improve, both behind the chair and within their business.',
  heroDescription2 = 'This isn\'t just about hair. It\'s about confidence, consistency, client experience and creating something that actually works long term.',
  heroImageUrl = '/assets/images/Vicky.jpg',
  contactButtonText = 'Enquire about education',
  children,
}: EducationProps) {
  const emailSubject = encodeURIComponent('Education & Salon Support - Enquiry');
  const enquireHref = `mailto:hello@victoriablushcollections.co.uk?subject=${emailSubject}`;

  const resolveImageUrl = (url: string) => {
    if (!url || url === '') return '';
    if (url.startsWith('/') || url.startsWith('http')) return url;
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/${url}`;
  };

  return (
    <main className="min-h-screen">
      {/* ───────── Hero Section ───────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-linear-to-br from-rose-50 via-white to-stone-50">
        <div className="container mx-auto px-4 py-20 grid lg:grid-cols-2 gap-12 items-center">
          <MotionDiv
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <h1 className={`${cormorant.className} uppercase text-bg-dark/95 leading-tight font-medium text-3xl md:text-4xl xl:text-5xl`}>
              {heroHeading}
            </h1>
            <p className={`${cormorant.className} text-xl md:text-2xl xl:text-3xl text-bg-dark/70 font-medium`}>
              {heroSubheading}
            </p>
            <div className="space-y-4 text-lg text-text-body font-light leading-8">
              <p className="whitespace-pre-line">{heroDescription1}</p>
              <p className="whitespace-pre-line">{heroDescription2}</p>
            </div>
            <div className="pt-4">
              <a
                href={enquireHref}
                className="inline-flex items-center gap-2 px-8 py-4 bg-interactive-active text-brand-primary font-medium tracking-wide rounded-md hover:bg-interactive-active/90 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                {contactButtonText}
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </MotionDiv>

          <MotionDiv
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative hidden lg:block -mt-20"
          >
            <div className="relative aspect-3/4 xl:rounded-t-none rounded-b-3xl rounded-t-3xl overflow-hidden shadow-2xl">
              <Image src={resolveImageUrl(heroImageUrl)} alt="Education & Salon Support" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" priority />
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-border-medium rounded-full blur-3xl opacity-40"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-border-default rounded-full blur-3xl opacity-40"></div>
            </div>
            <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-brand-primary opacity-10 rounded-full -z-10"></div>
          </MotionDiv>
        </div>
      </section>

      {children}
    </main>
  );
}
