'use client';

import { cormorant } from '@/app/fonts';
import { motion } from 'framer-motion';
import { GraduationCap, Scissors, MessageCircle, Briefcase, CheckCircle, ArrowRight } from 'lucide-react';

const MotionDiv = motion.div as any;

export default function Education() {
  const emailSubject = encodeURIComponent('Education & Salon Support - Enquiry');
  const enquireHref = `mailto:hello@victoriablushcollections.co.uk?subject=${emailSubject}`;

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-linear-to-br from-rose-50 via-white to-stone-50">
        <div className="container mx-auto px-4 py-20 grid lg:grid-cols-2 gap-12 items-center">
          <MotionDiv
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <p className="text-text-primary tracking-widest uppercase">Education & Salon Support</p>
            <h1 className={`${cormorant.className} uppercase text-bg-dark/95 leading-tight font-medium`}>
              <span className="block text-4xl md:text-5xl xl:text-6xl">Helping salons build confident teams,</span>
              <span className="block text-xl md:text-2xl xl:text-3xl mt-2 text-bg-dark/70">loyal clients & more profitable businesses</span>
            </h1>
            <div className="space-y-4 text-lg text-text-body font-light leading-8">
              <p>
                With over 20 years in the industry, and as the founder of Blush in Llandaff, Cardiff — a salon I built into a thriving business and successfully sold — I now support salons through practical training, consultation skills and business guidance that works in real salon environments.
              </p>
              <p>
                Because this isn&apos;t just a job for me — I genuinely care about the people I work with, and my goal is always to help others grow, feel more confident and succeed.
              </p>
            </div>
            <div className="pt-4">
              <a
                href={enquireHref}
                className="inline-flex items-center gap-2 px-8 py-4 bg-interactive-active text-brand-primary font-medium tracking-wide rounded-md hover:bg-interactive-active/90 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Enquire Now
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </MotionDiv>

          {/* Placeholder Image */}
          <MotionDiv
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="relative aspect-3/4 rounded-2xl overflow-hidden shadow-2xl bg-bg-muted">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-4 text-text-muted">
                  <GraduationCap className="w-16 h-16 mx-auto" />
                  <p className="text-lg font-medium">Image Placeholder</p>
                  <p className="text-sm">Training / salon environment</p>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-brand-primary opacity-10 rounded-full -z-10"></div>
          </MotionDiv>
        </div>
      </section>

      {/* What I Offer Section */}
      <section className="py-24 bg-bg-subtle">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            {/* Section Header */}
            <MotionDiv
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className={`${cormorant.className} text-4xl md:text-5xl font-medium uppercase text-text-primary mb-4`}>
                What I Offer
              </h2>
              <div className="w-24 h-1 bg-brand-primary mx-auto"></div>
            </MotionDiv>

            {/* In-Salon Training */}
            <MotionDiv
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-16"
            >
              <div className="bg-bg-primary rounded-2xl p-8 md:p-10 shadow-md border border-border-light">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-bg-muted rounded-lg">
                    <Scissors className="w-7 h-7 text-text-secondary" />
                  </div>
                  <h3 className={`${cormorant.className} text-2xl md:text-3xl font-medium text-text-primary`}>
                    In-Salon Training
                  </h3>
                </div>
                <p className="text-text-body font-light leading-7 mb-6">
                  Practical, hands-on training designed around your team and the clients you see every day.
                </p>
                <ul className="space-y-3">
                  {[
                    'Blonding & colour confidence',
                    'Colour correction techniques',
                    'Modern cutting & lived-in styles',
                    'Real client demonstrations',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-text-body font-light">
                      <CheckCircle className="w-5 h-5 text-interactive-active mt-0.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </MotionDiv>

            {/* Consultation, Client Experience & Pricing */}
            <MotionDiv
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-16"
            >
              <div className="bg-bg-primary rounded-2xl p-8 md:p-10 shadow-md border border-border-light">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-bg-muted rounded-lg">
                    <MessageCircle className="w-7 h-7 text-text-secondary" />
                  </div>
                  <h3 className={`${cormorant.className} text-2xl md:text-3xl font-medium text-text-primary`}>
                    Consultation, Client Experience & Pricing
                  </h3>
                </div>
                <p className="text-text-body font-light leading-7 mb-6">
                  Helping your team feel more confident, improve client relationships and increase overall spend.
                </p>
                <ul className="space-y-3">
                  {[
                    'Confident, structured consultations',
                    'Managing expectations & avoiding misunderstandings',
                    'Increasing client spend through better communication',
                    'Creating loyal, long-term clients',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-text-body font-light">
                      <CheckCircle className="w-5 h-5 text-interactive-active mt-0.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </MotionDiv>

            {/* Business Support */}
            <MotionDiv
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="bg-bg-primary rounded-2xl p-8 md:p-10 shadow-md border border-border-light">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-bg-muted rounded-lg">
                    <Briefcase className="w-7 h-7 text-text-secondary" />
                  </div>
                  <h3 className={`${cormorant.className} text-2xl md:text-3xl font-medium text-text-primary`}>
                    Business Support for Salon Owners & Managers
                  </h3>
                </div>
                <p className="text-text-body font-light leading-7 mb-6">
                  Support based on real experience of building and running a successful salon.
                </p>
                <ul className="space-y-3">
                  {[
                    'Pricing structure & profitability',
                    'Understanding your numbers',
                    'Team confidence, performance & development',
                    'Improving client retention',
                    'Creating a stronger, more consistent salon experience',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-text-body font-light">
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

      {/* Why Work With Me */}
      <section className="relative min-h-screen flex items-center justify-center bg-linear-to-b from-bg-muted via-bg-section to-bg-section">
        <div className="container mx-auto px-6">
          <div className="max-w-7xl mx-auto">
            <MotionDiv
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className={`${cormorant.className} text-4xl md:text-5xl font-medium uppercase text-text-primary mb-4`}>
                Why Work With Me
              </h2>
              <div className="w-24 h-1 bg-brand-primary mx-auto"></div>
            </MotionDiv>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <MotionDiv
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="space-y-6 text-text-body font-light leading-8 text-lg"
              >
                <p>
                  I&apos;ve been in your position — managing a team, juggling a busy column, and trying to grow a successful salon at the same time.
                </p>
                <p>
                  I built Blush in Cardiff over 20 years into a thriving, well-respected business before successfully selling it — so everything I offer comes from real experience, not theory.
                </p>
                <p>
                  My approach is honest, supportive and practical, focused on helping you and your team feel more confident, work smarter and build a stronger, more successful business.
                </p>
                <p>
                  I care about the results you get — not just on the day, but long after the training.
                </p>
                <p>
                  My goal is to leave you and your team feeling more confident, more capable and clearer in how to move your business forward.
                </p>
              </MotionDiv>

              {/* Image Placeholder */}
              <MotionDiv
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative hidden lg:block"
              >
                <div className="relative aspect-4/5 rounded-2xl overflow-hidden shadow-2xl bg-bg-muted">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center space-y-4 text-text-muted">
                      <Scissors className="w-16 h-16 mx-auto" />
                      <p className="text-lg font-medium">Image Placeholder</p>
                      <p className="text-sm">Working in salon environment</p>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-6 -left-6 w-48 h-48 bg-brand-primary opacity-10 rounded-full -z-10"></div>
              </MotionDiv>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works & Let's Chat */}
      <section className="min-h-screen flex items-center justify-center bg-bg-subtle">
        <div className="container mx-auto px-6">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            {/* How It Works - Left */}
            <MotionDiv
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div>
                <h2 className={`${cormorant.className} text-4xl md:text-5xl font-medium uppercase text-text-primary mb-4`}>
                  How It Works
                </h2>
                <div className="w-24 h-1 bg-brand-primary"></div>
              </div>
              <p className="text-lg text-text-body font-light leading-8">
                Training and support can be tailored to suit your salon, whether that&apos;s:
              </p>
              <ul className="space-y-3">
                {[
                  'A full team training day',
                  'Smaller group sessions',
                  '1:1 support for owners or managers',
                  'Specific focus areas your team need help with',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-text-body font-light text-lg">
                    <CheckCircle className="w-5 h-5 text-interactive-active mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="text-lg text-text-body font-light leading-8">
                Everything is designed not just to fit your salon, but to genuinely make a difference to you and your team.
              </p>
            </MotionDiv>

            {/* Let's Chat - Right */}
            <MotionDiv
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-center space-y-6 bg-bg-primary rounded-2xl p-10 md:p-12 shadow-md border border-border-light"
            >
              <h3 className={`${cormorant.className} text-3xl md:text-4xl font-medium uppercase text-text-primary`}>
                Let&apos;s Chat
              </h3>
              <p className="text-lg text-text-body font-light leading-8">
                If you&apos;re looking to strengthen your team, build more confidence within your salon or create a more profitable, structured business, I&apos;d love to help.
              </p>
              <div className="pt-4">
                <a
                  href={enquireHref}
                  className="inline-flex items-center gap-2 px-10 py-4 bg-interactive-active text-brand-primary font-medium tracking-wide rounded-md hover:bg-interactive-active/90 transition-all duration-300 shadow-lg hover:shadow-xl text-lg"
                >
                  Enquire Now
                  <ArrowRight className="w-5 h-5" />
                </a>
              </div>
              <p className="text-text-muted text-sm italic">
                Introductory rates available for first bookings.
              </p>
            </MotionDiv>
          </div>
        </div>
      </section>


    </main>
  );
}
