import { strona } from '../lib/dane';
export function GET() {
  const domena = (strona.domena ?? '').replace(/\/$/, '');
  const adresy = strona.jezyki.flatMap((j: string) => {
    const p = j === 'pl' ? '' : `/${j}`;
    return [`${domena}${p}/`, `${domena}${p}/polityka-prywatnosci/`];
  });
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${adresy.map((a) => `  <url><loc>${a}</loc></url>`).join('\n')}\n</urlset>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
}
