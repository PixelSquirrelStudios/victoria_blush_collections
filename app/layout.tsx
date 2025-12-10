import './globals.css';
import React from 'react';
import type { Metadata } from 'next';
import { moderustic, outfit } from './fonts';
import ScrollToTopButton from '@/components/shared/ScrollToTopButton';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'Victoria Blush Collections | Premium Hair Artistry in London',
  description: 'Expert hair stylist specializing in balayage, lived-in color, and bespoke styling. Transform your hair with Victoria Blush Collections.',
  keywords: ['hair stylist', 'balayage', 'hair color', 'London hairdresser', 'lived-in color', 'hair treatments'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${moderustic.className} custom-scrollbar font-sans overflow-x-hidden`}>
        {children}
        <ScrollToTopButton />
        <Toaster expand />
      </body>
    </html>
  );
}
