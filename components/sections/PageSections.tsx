import { ArrowRight } from 'lucide-react';
import { cormorant } from '@/app/fonts';
import { isSafeSectionLink, type PageSection } from '@/lib/sections';
import { sanitizeSectionCopy } from '@/lib/section-html';

export default function PageSections({ sections }: { sections: PageSection[] }) {
  return sections.map((section) => (
    <section key={section.id} id={`section-${section.id}`} className={section.background_colour === 'green' ? 'bg-bg-section' : 'bg-white'}>
      <div className="mx-auto max-w-7xl">
        <div className={`max-w-4xl px-6 py-16 md:px-10 md:py-24 ${section.position === 'left' ? 'mr-auto' : section.position === 'right' ? 'ml-auto' : 'mx-auto'}`}>
          <h2 className={`${cormorant.className} text-3xl md:text-4xl lg:text-5xl leading-tight font-medium text-text-primary mb-8 wrap-break-word`}>
            {section.heading}
          </h2>
          <div className="section-copy text-lg leading-8 text-text-primary/85" dangerouslySetInnerHTML={{ __html: sanitizeSectionCopy(section.copy) }} />
          {section.has_cta && section.cta_text && isSafeSectionLink(section.cta_link) && (
            <a href={section.cta_link} className="mt-8 inline-flex max-w-full items-center gap-3 rounded-md bg-interactive-active px-6 py-4 font-medium text-white transition-colors hover:bg-bg-dark focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-interactive-focus">
              <span className="min-w-0 wrap-break-word">{section.cta_text}</span><ArrowRight className="size-5 shrink-0" />
            </a>
          )}
        </div>
      </div>
    </section>
  ));
}