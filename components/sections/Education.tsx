'use client';

import { cormorant } from '@/app/fonts';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight } from 'lucide-react';
import Image from 'next/image';

const MotionDiv = motion.div as any;

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

interface EducationProps {
  heroHeading?: string;
  heroSubheading?: string;
  heroDescription1?: string;
  heroDescription2?: string;
  heroImageUrl?: string;
  whoHeading?: string;
  whoDescriptions?: string[];
  helpHeading?: string;
  helpDescription?: string;
  helpItems?: string[];
  expectHeading?: string;
  approachHeading?: string;
  approachParagraphs?: string[];
  outcomeHeading?: string;
  outcomeParagraphs?: string[];
  whyMeHeading?: string;
  whyMeParagraphs?: string[];
  whyMeImageUrl?: string;
  contactHeading?: string;
  contactDescription?: string;
  contactButtonText?: string;
  contactNote?: string;
}

export default function Education({
  heroHeading = 'Education built from over twenty years behind the chair',
  heroSubheading = 'Helping salons and stylists build confidence, raise standards and grow stronger businesses.',
  heroDescription1 = 'After over twenty years in the industry — building and running Blush in Cardiff and successfully selling the business — I now work with salons and stylists to help them improve, both behind the chair and within their business.',
  heroDescription2 = 'This isn\'t just about hair. It\'s about confidence, consistency, client experience and creating something that actually works long term.',
  heroImageUrl = '/assets/images/Vicky.jpg',
  whoHeading = 'Who This Is For',
  whoDescriptions = [
    'For salon owners and stylists who want to feel more confident, more consistent and more in control of what they\'re doing.',
    'Whether that\'s improving your skills, strengthening your team or creating a better client experience, this is built around real salon life \u2014 not theory.',
  ],
  helpHeading = 'What I Can Help With',
  helpDescription = 'This can be tailored depending on what you need, but often includes:',
  helpItems = [],
  expectHeading = 'What You Can Expect',
  approachHeading = 'What You Can Expect',
  approachParagraphs = [],
  outcomeHeading = 'The Outcome',
  outcomeParagraphs = [],
  whyMeHeading = 'Why Work With Me',
  whyMeParagraphs = [],
  whyMeImageUrl = '/assets/images/VBC - Salon.jpg',
  contactHeading = 'Get In Touch',
  contactDescription = 'If you\'re ready to improve your skills, your team or your business, I\'d love to hear from you.',
  contactButtonText = 'Enquire about education',
  contactNote,
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
              <p>{heroDescription1}</p>
              <p>{heroDescription2}</p>
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

      {/* ───────── Who This Is For ───────── */}
      <section className="relative flex items-center justify-center bg-bg-subtle overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-brand-secondary/10 blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-interactive-active/5 blur-3xl"></div>

        <div className="container mx-auto px-6 py-32 md:py-40">
          <div className="max-w-[90rem] mx-auto">
            <MotionDiv
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className={`${cormorant.className} text-4xl md:text-5xl lg:text-6xl font-medium uppercase text-text-primary mb-4`}>
                {whoHeading}
              </h2>
              <div className="w-24 h-1 bg-interactive-active/30 mx-auto"></div>
            </MotionDiv>

            <div className="grid md:grid-cols-3 gap-8">
              {whoDescriptions.map((desc, i) => (
                <MotionDiv
                  key={i}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 + i * 0.15 }}
                  className="relative bg-bg-primary rounded-2xl p-8 md:p-10 shadow-md border border-border-light border-l-4 border-l-interactive-active/40 hover:shadow-lg transition-shadow flex items-center"
                >
                  <p className="text-lg md:text-xl text-text-body font-light leading-8">
                    {desc}
                  </p>
                </MotionDiv>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ───────── What I Can Help With ───────── */}
      <section className="relative flex items-center justify-center py-28 bg-bg-primary overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="max-w-7xl mx-auto">
            <MotionDiv
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className={`${cormorant.className} text-4xl md:text-5xl lg:text-6xl font-medium uppercase text-text-primary mb-4`}>
                {helpHeading}
              </h2>
              <div className="w-24 h-1 bg-interactive-active/30 mx-auto mb-6"></div>
              <p className="text-lg text-text-body font-light leading-8 max-w-2xl mx-auto">
                {helpDescription}
              </p>
            </MotionDiv>

            <MotionDiv
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="bg-bg-subtle rounded-2xl p-8 md:p-10 shadow-md border border-border-light max-w-3xl mx-auto">
                <ul className="space-y-4">
                  {helpItems.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-text-body font-light text-lg">
                      <CheckCircle className="w-5 h-5 text-interactive-active mt-0.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </MotionDiv>
          </div>
        </div>
      </section>

      {/* ───────── My Approach & The Outcome ───────── */}
      <section className="relative flex items-center bg-bg-subtle overflow-hidden">
        <div className="container mx-auto px-6 py-32 md:py-40">
          <div className="max-w-7xl mx-auto">
            <MotionDiv
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-20"
            >
              <h2 className={`${cormorant.className} text-4xl md:text-5xl lg:text-6xl font-medium uppercase text-text-primary mb-4`}>
                {expectHeading}
              </h2>
              <div className="w-24 h-1 bg-interactive-active/30 mx-auto"></div>
            </MotionDiv>

            <div className="grid md:grid-cols-[1fr_auto_1fr] gap-10 md:gap-16">
              <MotionDiv
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="relative"
              >
                <h3 className={`${cormorant.className} text-3xl md:text-4xl font-medium uppercase text-text-primary mb-6`}>
                  {approachHeading}
                </h3>
                <div className="space-y-5">
                  {approachParagraphs.map((p, i) => (
                    <p key={i} className="text-lg text-text-body font-light leading-8">{p}</p>
                  ))}
                </div>
              </MotionDiv>

              <div className="hidden md:block w-px bg-interactive-active/30 self-stretch"></div>

              <MotionDiv
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="relative"
              >
                <h3 className={`${cormorant.className} text-3xl md:text-4xl font-medium uppercase text-text-primary mb-6`}>
                  {outcomeHeading}
                </h3>
                <div className="space-y-5">
                  {outcomeParagraphs.map((p, i) => (
                    <p key={i} className="text-lg text-text-body font-light leading-8">{p}</p>
                  ))}
                </div>
              </MotionDiv>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── Why Work With Me ───────── */}
      <section className="relative flex items-center justify-center bg-bg-primary">
        <div className="container mx-auto px-6 py-24">
          <div className="max-w-7xl mx-auto">
            <MotionDiv
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className={`${cormorant.className} text-4xl md:text-5xl lg:text-6xl font-medium uppercase text-text-primary mb-4`}>
                {whyMeHeading}
              </h2>
              <div className="w-24 h-1 bg-interactive-active/30 mx-auto"></div>
            </MotionDiv>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <MotionDiv
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="space-y-6"
              >
                <div className="space-y-6 text-text-body font-light leading-8 text-lg">
                  {whyMeParagraphs.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>

                {/* Contact card */}
                <div className="bg-bg-subtle rounded-2xl p-10 md:p-12 shadow-md border border-border-light text-center mt-10">
                  <h3 className={`${cormorant.className} text-3xl md:text-4xl font-medium uppercase text-text-primary mb-3`}>
                    {contactHeading}
                  </h3>
                  <div className="w-24 h-1 bg-interactive-active/30 mx-auto mb-6"></div>
                  <p className="text-lg text-text-body font-light leading-8 mb-6">
                    {contactDescription}
                  </p>
                  <a
                    href={enquireHref}
                    className="inline-flex items-center gap-2 px-10 py-4 bg-interactive-active text-brand-primary font-medium tracking-wide rounded-md hover:bg-interactive-active/90 transition-all duration-300 shadow-lg hover:shadow-xl text-lg"
                  >
                    {contactButtonText}
                    <ArrowRight className="w-5 h-5" />
                  </a>
                  {contactNote && (
                    <p className="text-sm text-text-body/60 italic mt-4">{contactNote}</p>
                  )}
                </div>
              </MotionDiv>

              <MotionDiv
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative hidden lg:block"
              >
                <div className="relative aspect-4/5 rounded-2xl overflow-hidden shadow-2xl bg-bg-muted">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Image src={resolveImageUrl(whyMeImageUrl)} alt="Education & Salon Support" width={400} height={500} className="object-cover w-full h-full" />
                  </div>
                </div>
                <div className="absolute -top-6 -left-6 w-48 h-48 bg-brand-primary opacity-10 rounded-full -z-10"></div>
              </MotionDiv>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
