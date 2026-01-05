'use client';

import PriceListCard from '../cards/ServiceCard';
import PriceListCardList from '../cards/ServiceCardList';
import { motion } from 'motion/react';
import { useState } from 'react';
import { LayoutGrid, List } from 'lucide-react';
import { cormorant } from '@/app/fonts';

interface Service {
  id: string;
  icon: string;
  title: string;
  description: string;
  price: string;
  is_highlighted: boolean;
  created_at: string;
  categories_services: { categories: { id: string; name: string; } | { id: string; name: string; }[]; }[];
}

interface ServicesProps {
  services: Service[];
  subheading?: string;
  description?: string;
  importantNotice?: string;
}

export default function Services({ services, subheading, description, importantNotice }: ServicesProps) {
  const MotionDiv = motion.div as any;

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Extract unique categories from services
  const categories = ['All', ...Array.from(
    new Set(
      services.flatMap(service =>
        service.categories_services
          ?.filter(cs => cs?.categories)
          .map(cs => {
            const cat = cs.categories;
            return Array.isArray(cat) ? cat[0]?.name : cat?.name;
          })
          .filter(Boolean) || []
      )
    )
  ).sort()];

  // Filter services based on selected category
  const filteredServices = selectedCategory === 'All'
    ? services
    : services.filter(service =>
      service.categories_services?.some(cs => {
        const cat = cs?.categories;
        const catName = Array.isArray(cat) ? cat[0]?.name : cat?.name;
        return catName === selectedCategory;
      })
    );

  return (
    <section id="services" className="py-24 bg-linear-to-b from-bg-muted via-bg-section to-bg-section">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-8"
        >
          <p className="text-text-primary tracking-widest uppercase mb-4">
            {subheading || 'Transparent Pricing'}
          </p>
          <h2 className={`${cormorant.className} text-4xl md:text-5xl font-medium uppercase text-text-primary mb-6`}>
            Services & Pricing
          </h2>
          <p className="text-lg text-text-body font-light">
            {description || 'Premium hair services tailored to your unique style and needs. All prices include consultation and aftercare advice.'}
          </p>
        </MotionDiv>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
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
            {filteredServices.map((service, index) => (
              <MotionDiv
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="w-[320px]"
              >
                <PriceListCard
                  id={service.id}
                  icon={service.icon}
                  title={service.title}
                  description={service.description}
                  price={service.price}
                  highlight={service.is_highlighted}
                  categories={service.categories_services?.map((cs: any) => cs.categories).filter(Boolean) || []
                  }
                />
              </MotionDiv>
            ))}
          </div>
        ) : (
          <div className="max-w-7xl mx-auto mb-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredServices.map((service, index) => (
                <MotionDiv
                  key={service.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <PriceListCardList
                    icon={service.icon}
                    title={service.title}
                    description={service.description}
                    price={service.price}
                    highlight={service.is_highlighted}
                  />
                </MotionDiv>
              ))}
            </div>
          </div>
        )}

        {/* Important Notice */}
        <MotionDiv
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
              {importantNotice || `A skin test is required if it's your first visit with me or if you haven't had your hair colored for 6 months. This ensures your safety and the best results.`}
            </p>
          </div>
        </MotionDiv>
      </div>
    </section>
  );
}
