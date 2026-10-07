import Image from 'next/image';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { ArrowRight, Mail } from 'lucide-react';
import { cormorant } from '@/app/fonts';
import { getHomepageData } from '@/lib/actions/homepage.actions';
import Footer from '@/components/sections/Footer';

export const legalContact = 'hello@victoriablushcollections.co.uk';
export const companyNumber = '16268010';
export const registeredAddress = 'Sora House, Willcox House, Cardiff CF11 0BA';

export const LegalEmail = () => <a className="font-medium text-text-primary underline underline-offset-4" href={`mailto:${legalContact}`}>{legalContact}</a>;

export type LegalSection = { id: string; icon: LucideIcon; title: string; body: React.ReactNode };
export type LegalHighlight = { icon: LucideIcon; label: string; value: string };

type LegalPageProps = {
  eyebrow: string;
  title: string;
  intro: React.ReactNode;
  updated: string;
  highlights: LegalHighlight[];
  sections: LegalSection[];
  cta: { heading: string; text: string; link: { href: string; label: string } };
};

export default async function LegalPage({ eyebrow, title, intro, updated, highlights, sections, cta }: LegalPageProps) {
  const { data: homepageData } = await getHomepageData();

  return <>
    <main className="bg-bg-primary text-text-body">
      <section className="bg-bg-section pt-32 pb-14 md:pt-40 md:pb-20">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 md:flex-row md:items-end md:px-8">
          <div className="min-w-0 flex-1">
            <p className="mb-3 text-sm uppercase tracking-[0.2em] text-text-secondary">{eyebrow}</p>
            <h1 className={`${cormorant.className} text-5xl font-medium text-text-primary md:text-6xl`}>{title}</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8">{intro}</p>
            <p className="mt-4 text-sm text-text-muted">Last updated {updated}</p>
          </div>
          <Image src="/assets/images/Vicky.jpg" alt="Victoria" width={150} height={188} className="hidden shrink-0 rounded-xl object-cover shadow-lg md:block" />
        </div>
      </section>

      <section aria-label="At a glance" className="mx-auto -mt-8 max-w-6xl px-4 md:px-8">
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {highlights.map(({ icon: Icon, label, value }) => <li key={label} className="flex items-center gap-4 rounded-xl border border-border-default bg-white p-5 shadow-sm">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent-subtle text-interactive-active"><Icon size={20} aria-hidden="true" /></span>
            <span className="min-w-0"><span className="block text-xs uppercase tracking-wider text-text-muted">{label}</span><span className="block font-medium text-text-primary">{value}</span></span>
          </li>)}
        </ul>
      </section>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:px-8 lg:grid-cols-[240px_1fr] lg:py-20">
        <nav aria-label="Contents" className="hidden lg:block">
          <div className="sticky top-32">
            <p className="mb-4 text-xs uppercase tracking-[0.2em] text-text-muted">Contents</p>
            <ol className="space-y-1 border-l border-border-medium">
              {sections.map(({ id, title }, index) => <li key={id}><a href={`#${id}`} className="-ml-px flex gap-3 border-l-2 border-transparent py-1.5 pl-4 text-sm transition-colors hover:border-interactive-active hover:text-text-primary"><span className="tabular-nums text-text-muted">{String(index + 1).padStart(2, '0')}</span>{title}</a></li>)}
            </ol>
          </div>
        </nav>

        <div className="min-w-0 space-y-5">
          {sections.map(({ id, icon: Icon, title, body }, index) => <section key={id} id={id} aria-labelledby={`${id}-heading`} className="scroll-mt-32 rounded-2xl border border-border-default bg-white p-6 shadow-sm md:p-8">
            <div className="mb-4 flex items-center gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent-subtle text-interactive-active"><Icon size={20} aria-hidden="true" /></span>
              <h2 id={`${id}-heading`} className={`${cormorant.className} text-2xl font-medium text-text-primary md:text-3xl`}><span className="mr-2 text-text-muted">{String(index + 1).padStart(2, '0')}</span>{title}</h2>
            </div>
            <div className="space-y-3 leading-7">{body}</div>
          </section>)}

          <section aria-labelledby="questions-heading" className="rounded-2xl bg-bg-dark p-8 text-white md:p-10">
            <h2 id="questions-heading" className={`${cormorant.className} text-3xl font-medium`}>{cta.heading}</h2>
            <p className="mt-3 max-w-xl leading-7 text-white/80">{cta.text}</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <a href={`mailto:${legalContact}`} className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-6 py-3 font-medium text-text-primary transition-colors hover:bg-brand-primary-hover"><Mail size={18} aria-hidden="true" /> Email Victoria</a>
              <Link href={cta.link.href} className="inline-flex items-center justify-center gap-2 rounded-md border border-white/40 px-6 py-3 font-medium transition-colors hover:bg-white/10">{cta.link.label} <ArrowRight size={18} aria-hidden="true" /></Link>
            </div>
          </section>
        </div>
      </div>
    </main>
    <Footer description={homepageData?.footer_description} />
  </>;
}
