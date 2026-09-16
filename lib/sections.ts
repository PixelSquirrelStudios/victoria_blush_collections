import { z } from 'zod';

export const sectionTypeSchema = z.enum(['education', 'homepage']);

export function isSafeSectionLink(value: string) {
  if (!value || /[\s\\\u0000-\u001f\u007f]/.test(value)) return false;
  if (/^\/(?!\/)/.test(value) || /^#[\w-]+$/.test(value)) return true;
  try {
    const url = new URL(value);
    return ['https:', 'http:', 'mailto:', 'tel:'].includes(url.protocol);
  } catch {
    return false;
  }
}

export function isSafeSectionImage(value: string) {
  return isSafeSectionLink(value) && (/^https?:\/\//i.test(value) || value.startsWith('/'));
}

export const sectionSchema = z.object({
  type: sectionTypeSchema.default('education'),
  heading: z.string().trim().min(1, 'Enter a heading.').max(500),
  copy: z.string().trim().min(1, 'Enter section copy.').max(100000),
  has_cta: z.boolean(),
  cta_text: z.string().trim().max(200).default(''),
  cta_link: z.string().trim().max(2000).default(''),
  background_colour: z.enum(['white', 'green']),
  position: z.enum(['left', 'centre', 'right']).default('centre'),
  image_url: z.string().trim().max(2000).refine((value) => !value || isSafeSectionImage(value), 'Select a valid image.').default(''),
  image_alt: z.string().trim().max(500).default(''),
}).superRefine((section, context) => {
  if (section.has_cta && !section.cta_text) {
    context.addIssue({ code: 'custom', path: ['cta_text'], message: 'Enter button text.' });
  }
  if (section.has_cta && !isSafeSectionLink(section.cta_link)) {
    context.addIssue({ code: 'custom', path: ['cta_link'], message: 'Enter a web, email, phone or relative link.' });
  }
});

export type SectionInput = z.infer<typeof sectionSchema>;
export type SectionType = z.infer<typeof sectionTypeSchema>;
export type PageSection = SectionInput & { id: string; sort_order: number };