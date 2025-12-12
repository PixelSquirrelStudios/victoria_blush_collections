'use client';

import { cormorant } from '@/app/fonts';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function About() {
  return (
    <section id="about" className="py-24 bg-bg-subtle">
      <div className="container mx-auto px-6">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className={`${cormorant.className} text-4xl md:text-5xl font-medium uppercase text-text-primary mb-4`}>
              About Me
            </h2>
            <div className="w-24 h-1 bg-brand-primary mx-auto"></div>
          </motion.div>

          {/* Content Grid */}
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Image Column */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative aspect-3/4 rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/assets/images/victoria.jpg"
                  alt="Victoria - Freelance Hairstylist"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
              {/* Decorative accent */}
              <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-brand-primary opacity-10 rounded-full -z-10"></div>
            </motion.div>

            {/* Text Column */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="space-y-6 text-text-body font-light"
            >
              <p className="text-base leading-7">
                Hi, I'm Victoria — freelance hairstylist, educator and mum of four (yes… four. Coffee is my personality at this point).
                I founded and ran Blush in Llandaff, one of Cardiff's most loved salons, before deciding it was time to swap the hustle of running a full team for something more personal — and a lot more peaceful.
              </p>

              <p className="text-base leading-7">
                Now I work 1:1 with clients in a calm, friendly space where you will feel free to relax, gossip, offload, laugh, or hide from your responsibilities for a couple of hours. Wanting some quiet time? Perfect. Want to talk about your ex, your job, your dog, life crisis, and everything in between? Even better — I've heard it all.
              </p>

              <p className="text-base leading-7">
                I'm known for genuinely seeing people — I listen, I support, I'm honest, which also means I'll gently steer you away from hair ideas you'll regret by the weekend. My goal is simple: hair that suits your vibe, your lifestyle, and your sanity. That's something we will work out together.
              </p>

              <p className="text-base leading-7">
                Alongside my freelance work, I also train stylists to meet their potential in colour, cutting, consultation and client care — so yes, I am a bit obsessed with neat blends, perfect placement and making sure your hair behaves when you're not here.
              </p>

              <p className="text-base leading-7">
                My chair is a welcoming place for everyone — all ages, all styles, all stages of life.
              </p>

              <p className="text-base leading-7">
                If you are looking for hair that feels like you, whether that be a trim, a huge transformation, I'd love to look after you to feel fully yourself.
              </p>

              <p className="text-base leading-7 italic">
                (And if you leave feeling amazing and slightly addicted to coming back… don't say I didn't warn you.)
              </p>
              {/* CTA Button */}
              <div className="pt-6">
                <a
                  href="#contact"
                  className="inline-block bg-interactive-active hover:bg-interactive-active/90 text-white px-8 py-4 rounded-lg font-medium  transition-all duration-300 shadow-md hover:shadow-xl"
                >
                  Book Your Appointment
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
