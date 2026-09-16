import sanitizeHtml from 'sanitize-html';

export function sanitizeSectionCopy(copy: string) {
  return sanitizeHtml(copy, {
    allowedTags: ['p', 'br', 'strong', 'em', 'u', 's', 'span', 'h3', 'h4', 'ul', 'ol', 'li', 'blockquote', 'a'],
    allowedAttributes: { a: ['href', 'title'], p: ['style'], span: ['style'], h3: ['style'], h4: ['style'] },
    allowedStyles: { '*': { 'text-align': [/^(left|center|right)$/], 'text-decoration': [/^(underline|line-through)$/] } },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowProtocolRelative: false,
  });
}

export function hasSectionCopy(copy: string) {
  return sanitizeHtml(copy, { allowedTags: [], allowedAttributes: {} })
    .replace(/&nbsp;|&#160;/g, ' ').trim().length > 0;
}