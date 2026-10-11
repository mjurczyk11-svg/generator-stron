import { strona, PODGLAD } from '../lib/dane';
export function GET() {
  const domena = (strona.domena ?? '').replace(/\/$/, '');
  const tekst = PODGLAD ? 'User-agent: *\nDisallow: /\n' : `User-agent: *\nAllow: /\n${domena ? `Sitemap: ${domena}/sitemap.xml\n` : ''}`;
  return new Response(tekst);
}
