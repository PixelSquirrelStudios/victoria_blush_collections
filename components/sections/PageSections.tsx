import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { cormorant } from '@/app/fonts';
import { isSafeSectionImage, isSafeSectionLink, type PageSection } from '@/lib/sections';
import { sanitizeSectionCopy } from '@/lib/section-html';

export default function PageSections({ sections }: { sections: PageSection[] }) {
  return sections.map((section) => {
    const hasImage = (section.position === 'left' || section.position === 'right') && !!section.image_url && isSafeSectionImage(section.image_url);
    const matchesEducationHero = section.type === 'education' && (section.position === 'left' || section.position === 'right');
    return (
    <section key={section.id} id={`section-${section.id}`} className={section.background_colour === 'green' ? 'bg-bg-section' : 'bg-white'}>
      <div className={`mx-auto ${matchesEducationHero ? `container px-4 py-16 md:py-24 ${hasImage ? 'grid items-start gap-12 lg:grid-cols-2' : ''}` : `max-w-7xl ${hasImage ? 'grid items-start gap-10 px-6 py-16 md:px-10 md:py-24 lg:grid-cols-2 lg:gap-16' : ''}`}`}>
        <div className={`min-w-0 ${hasImage ? (section.position === 'right' ? 'lg:col-start-2 lg:row-start-1' : '') : `max-w-4xl ${matchesEducationHero ? '' : 'px-6 py-16 md:px-10 md:py-24'} ${section.position === 'left' ? 'mr-auto' : section.position === 'right' ? 'ml-auto' : 'mx-auto'}`}`}>
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
        {hasImage && <div className={`relative aspect-square w-full overflow-hidden rounded-lg lg:aspect-auto ${section.position === 'right' ? 'lg:col-start-1 lg:row-start-1' : ''}`}>
          <Image src={section.image_url} alt={section.image_alt || ''} fill sizes={matchesEducationHero ? '(min-width: 1536px) 728px, (min-width: 1280px) 600px, (min-width: 1024px) 472px, (min-width: 768px) 736px, (min-width: 640px) 608px, calc(100vw - 32px)' : '(min-width: 1280px) 568px, (min-width: 1024px) calc((100vw - 144px) / 2), (min-width: 768px) calc(100vw - 80px), calc(100vw - 48px)'} className="rounded-lg object-cover lg:static! lg:h-auto! lg:object-contain" />
        </div>}
      </div>
    </section>
    );
  });
}