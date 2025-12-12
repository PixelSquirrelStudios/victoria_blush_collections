'use client';

import PriceListCard from './PriceListCard';
import PriceListCardList from './PriceListCardList';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { LayoutGrid, List } from 'lucide-react';
import { cormorant } from '@/app/fonts';

const services = [
  {
    icon: '/assets/icons/cut.svg',
    title: 'Cut and Finish',
    description: 'Expert precision cutting with professional styling',
    price: '£75',
    category: 'cutting'
  },
  {
    icon: '/assets/icons/blowdry.svg',
    title: 'Blow Dry & Styling',
    description: 'Luxurious blow dry with beautiful styling',
    price: '£45',
    category: 'cutting'
  },
  {
    icon: '/assets/icons/balayage.svg',
    title: 'Full Lived In / Balayage',
    description: 'Natural, sun-kissed dimension and depth',
    price: '£140-£200',
    highlight: true,
    category: 'coloring'
  },
  {
    icon: '/assets/icons/balayage.svg',
    title: 'Maintenance Lived In',
    description: 'Touch-up for your existing balayage',
    price: '£120-£140',
    category: 'coloring'
  },
  {
    icon: '/assets/icons/foils_full.svg',
    title: 'Full Head Foils',
    description: 'Complete coverage with beautiful highlights',
    price: '£130-£180',
    category: 'colouring'
  },
  {
    icon: '/assets/icons/foils.svg',
    title: 'Half Head Foils',
    description: 'Targeted highlighting for a fresh look',
    price: '£110-£150',
    category: 'colouring'
  },
  {
    icon: '/assets/icons/colour.svg',
    title: 'Global Colour',
    description: 'All-over color transformation',
    price: 'from £100',
    category: 'colouring'
  },
  {
    icon: '/assets/icons/roots.svg',
    title: 'Global Roots',
    description: 'Root touch-up service',
    price: 'from £75',
    category: 'colouring',
    highlight: true
  },
  {
    icon: '/assets/icons/toning.svg',
    title: 'Toning Service',
    description: 'Perfect your colour tone',
    price: 'from £30',
    category: 'colouring',
    highlight: true
  },
  {
    icon: '/assets/icons/bleach.svg',
    title: 'Global Bleach',
    description: 'Full bleach application',
    price: 'On Quotation',
    category: 'specialist'
  },
  {
    icon: '/assets/icons/kerastase.svg',
    title: 'Kérastase Fusio',
    description: 'Luxury treatment for hair health',
    price: '£25',
    category: 'treatments'
  },
  {
    icon: '/assets/icons/k18.svg',
    title: 'K18 Treatment',
    description: 'Revolutionary molecular repair',
    price: '£25',
    category: 'treatments'
  },
  {
    icon: '/assets/icons/colour_correction.svg',
    title: 'Colour Correction',
    description: 'Expert correction for previous colour issues',
    price: 'On Quotation',
    category: 'specialist',
    highlight: true
  },
];

export default function PriceList() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  return (
    <section id="prices" className="py-24 bg-linear-to-b from-bg-muted via-bg-section to-bg-section">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-8"
        >
          <p className="text-text-primary tracking-widest uppercase mb-4">
            Transparent Pricing
          </p>
          <h2 className={`${cormorant.className} text-4xl md:text-5xl font-medium uppercase text-text-primary mb-6`}>
            Services & Pricing
          </h2>
          <p className="text-lg text-text-body font-light">
            Premium hair services tailored to your unique style and needs.
            All prices include consultation and aftercare advice.
          </p>
        </motion.div>

        {/* View Toggle */}
        <div className="flex justify-center gap-2 mb-12">
          <button
            onClick={() => setViewMode('grid')}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-300
              ${viewMode === 'grid'
                ? 'bg-interactive-active text-brand-primary shadow-lg'
                : 'bg-interactive-hover text-brand-primary hover:bg-interactive-active border border-border-default'
              }
            `}
          >
            <LayoutGrid className="w-5 h-5" />
            Grid View
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-300
              ${viewMode === 'list'
                ? 'bg-interactive-active text-white shadow-lg'
                : 'bg-interactive-hover text-brand-primary hover:bg-interactive-active border border-border-default'
              }
            `}
          >
            <List className="w-5 h-5" />
            List View
          </button>
        </div>

        {/* Services Grid/List */}
        {viewMode === 'grid' ? (
          <div className="flex flex-wrap justify-center gap-8 mb-12">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="w-[320px]"
              >
                <PriceListCard {...service} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="max-w-7xl mx-auto mb-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {services.map((service, index) => (
                <motion.div
                  key={service.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <PriceListCardList {...service} />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Important Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <div className="bg-bg-muted border-2 border-border-medium rounded-lg p-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-2 h-2 bg-text-primary rounded-full animate-pulse"></div>
              <p className="text-text-primary/90 font-semibold text-lg">Important Notice</p>
              <div className="w-2 h-2 bg-text-primary rounded-full animate-pulse"></div>
            </div>
            <p className="text-text-secondary font-light leading-relaxed">
              A skin test is required if it's your first visit with me or if you haven't had
              your hair colored for 6 months. This ensures your safety and the best results.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
