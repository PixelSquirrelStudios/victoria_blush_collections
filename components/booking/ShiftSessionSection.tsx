import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cormorant } from '@/app/fonts';
import BookingWidget from './BookingWidget';

export default function ShiftSessionSection({ homepage = false }: { homepage?: boolean }) {
  return <section id="shift-session" aria-labelledby="shift-session-heading" className="scroll-mt-28 bg-bg-section py-16 md:py-24">
    <div className="mx-auto max-w-6xl px-4 md:px-8">
      <div className="mb-10 flex items-start gap-6">
        <Image src="/assets/images/Vicky.jpg" alt="Victoria" width={88} height={110} className="hidden rounded-md object-cover sm:block" />
        <div className="min-w-0"><p className="mb-2 text-sm uppercase">{homepage ? 'Education & Salon Support' : 'A conversation with Victoria'}</p><h2 id="shift-session-heading" className={`${cormorant.className} text-4xl md:text-5xl font-medium`}>The Shift Session</h2><p className="mt-4 max-w-2xl text-lg leading-8">Space to step back, talk honestly and find clarity about what comes next in your working life.</p>{homepage && <Link href="/education" className="mt-5 inline-flex items-center gap-2 underline underline-offset-4">Explore Education & Salon Support <ArrowRight size={18} /></Link>}</div>
      </div>
      <BookingWidget />
    </div>
  </section>;
}