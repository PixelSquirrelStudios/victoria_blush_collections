export const bookingLogoUrl = 'https://mfenauruirpaqfynbugx.supabase.co/storage/v1/object/public/images/Victoria%20Blush%20Collections%20Logo.png';

export const escapeBookingHtml = (value: unknown) => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]!));

export function bookingEmailButton(url: string, label: string) {
  return `<p style="margin:24px 0"><a href="${escapeBookingHtml(url)}" style="display:inline-block;background:#35483e;color:#ffffff;border:1px solid #35483e;border-radius:4px;padding:14px 22px;text-decoration:none;font-family:Arial,sans-serif;font-size:15px;font-weight:bold;line-height:1.5;text-align:center">${escapeBookingHtml(label)}</a></p>`;
}

export function renderBookingEmail(subject: string, content: string, origin: string) {
  const home = escapeBookingHtml(origin.replace(/\/$/, ''));
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="light"><title>${escapeBookingHtml(subject)}</title>
<style>body{margin:0;padding:0}a{color:#35483e}p{margin:0 0 18px}img{border:0} @media only screen and (max-width:480px){.email-pad{padding:24px 20px!important}.email-title{font-size:26px!important}.email-logo{width:230px!important}}</style></head>
<body style="margin:0;padding:0;background-color:#f1f3ef;color:#28362e;letter-spacing:0">
<div style="display:none;font-size:1px;color:#f1f3ef;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all">${escapeBookingHtml(subject)} | Victoria Blush Collections</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f1f3ef"><tr><td align="center" style="padding:24px 8px">
<table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:600px;background-color:#ffffff;border-top:5px solid #35483e">
<tr><td align="center" class="email-pad" style="padding:36px 36px 28px;background-color:#ffffff"><a href="${home}" style="text-decoration:none"><img class="email-logo" src="${bookingLogoUrl}" width="280" alt="Victoria Blush Collections" style="display:block;width:280px;max-width:100%;height:auto;color:#28362e;font-family:Georgia,serif;font-size:24px"></a></td></tr>
<tr><td class="email-pad" style="padding:28px 36px;background-color:#e5ebe1;border-bottom:3px solid #cbd3c5"><p style="margin:0 0 10px;font:12px Arial,sans-serif;color:#52634f">THE SHIFT SESSION</p><h1 class="email-title" style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:30px;font-weight:400;line-height:1.25;color:#28362e;overflow-wrap:break-word">${escapeBookingHtml(subject)}</h1></td></tr>
<tr><td class="email-pad" style="padding:32px 36px;font-family:Arial,sans-serif;font-size:16px;line-height:1.75;overflow-wrap:anywhere;word-break:break-word">${content}<p style="margin:30px 0 0">Warmly,<br><span style="font-family:Georgia,'Times New Roman',serif;font-size:28px;color:#35483e">Victoria</span></p><p style="margin:4px 0 0;font-size:12px;color:#667363">VICTORIA BLUSH COLLECTIONS</p></td></tr>
<tr><td class="email-pad" style="padding:22px 36px;background-color:#dce5d5;border-top:1px solid #bbcbb1;font-family:Arial,sans-serif;font-size:14px;line-height:1.7"><p style="margin:0 0 4px;font-weight:bold">A question before your session?</p><p style="margin:0">Reply to this email or contact<br><a href="mailto:hello@victoriablushcollections.co.uk" style="color:#35483e;overflow-wrap:anywhere;word-break:break-word">hello@victoriablushcollections.co.uk</a></p></td></tr>
<tr><td class="email-pad" align="center" style="padding:24px 30px;font-family:Arial,sans-serif;font-size:12px;line-height:1.8;color:#687266"><p style="margin:0 0 12px">Victoria Blush Collections Limited</p>
<table role="presentation" align="center" cellspacing="0" cellpadding="0" border="0" style="margin:0 auto 16px"><tr>
<td style="padding:0 6px"><a href="https://instagram.com/victoriablushcollections" target="_blank" rel="noopener noreferrer" aria-label="Instagram" title="Instagram" style="display:inline-block;width:24px;height:24px;padding:10px;background-color:#e6e6e6;border-radius:50%"><img src="https://img.icons8.com/ios-glyphs/64/35483e/instagram-new.png" width="24" height="24" alt="Instagram" style="display:block;width:24px;height:24px;border:0"></a></td>
<td style="padding:0 6px"><a href="mailto:hello@victoriablushcollections.co.uk" aria-label="Email Victoria" title="Email Victoria" style="display:inline-block;width:24px;height:24px;padding:10px;background-color:#e6e6e6;border-radius:50%"><img src="https://img.icons8.com/ios-glyphs/64/35483e/new-post.png" width="24" height="24" alt="Email Victoria" style="display:block;width:24px;height:24px;border:0"></a></td>
</tr></table><a href="${home}" style="color:#35483e">Visit Victoria Blush Collections</a><br><a href="${home}/privacy-policy" style="color:#35483e">Privacy policy</a> &nbsp;|&nbsp; <a href="${home}/booking-terms" style="color:#35483e">Booking terms</a></td></tr>
</table></td></tr></table></body></html>`;
}