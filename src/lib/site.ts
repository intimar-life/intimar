export const CONTACT_EMAIL = 'contacto@intimar.life';

// Off until messages from /contact have somewhere to go: hides the header
// "Contacto" and footer "Escríbenos" links, and keeps the still-built page
// noindexed and out of the sitemap. Flip to true to bring it all back.
export const CONTACT_PAGE_ENABLED = false;

// Where "Quiero Inscribirme" sends people while there's no messaging
// system: Intimar's WhatsApp Business short link. Used instead of a
// wa.me/<number>?text= link so the phone number never appears in the
// site's HTML; the trade-off is that short links ignore ?text= and always
// open the one greeting configured in WhatsApp Business (Settings →
// Business tools → Short link), so it can't name the event.
export const WHATSAPP_URL = 'https://wa.me/message/ADKIDDUXI3F5H1';

// Umami Cloud (cookieless analytics: visits, sources, UTM campaigns and the
// "Quiero Inscribirme" event, without a consent banner). Public ID from
// cloud.umami.is → the site's settings; analytics stay off while it's empty.
export const UMAMI_WEBSITE_ID: string = 'be06cccc-ccc4-4dde-a6d9-c09ca9342cc2';

// Prefixes a root-relative internal path with the site's configured base
// path (astro.config.mjs's `base`, exposed as import.meta.env.BASE_URL).
// Astro rewrites its own generated URLs automatically (asset imports,
// getStaticPaths routes, the canonical/sitemap links built from Astro.url),
// but a plain string literal like href="/events" is not — production
// (intimar.life) serves from the domain root so base is '/', while the
// GitHub Pages staging build serves from /intimar, so every hand-written
// internal href needs to go through this.
export function withBase(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}${path}`;
}
