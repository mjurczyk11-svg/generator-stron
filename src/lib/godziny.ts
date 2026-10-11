import { DNI, strona } from './dane';

// "8:00-16:00" albo "8-12, 13-17" -> [["08:00","16:00"], ...]; puste/"zamknięte" -> []
export function przedzialy(wartosc: unknown): [string, string][] {
  if (wartosc == null || wartosc === false) return [];
  const s = String(wartosc).trim().toLowerCase();
  if (!s || /zamkn|closed|nieczyn|-$/.test(s)) return [];
  const norm = (t: string) => {
    const [h, m = '00'] = t.trim().split(/[:.]/);
    return `${h.padStart(2, '0')}:${m.padEnd(2, '0')}`;
  };
  return s.split(/[,;]/).map((cz) => cz.split(/\s*[-–—]\s*/)).filter((p) => p.length === 2).map(([a, b]) => [norm(a), norm(b)]);
}

export const godzinyTydzien = () => DNI.map((d) => ({ dzien: d, przedzialy: przedzialy(strona.godziny[d]) }));

export const pokazGodziny = (p: [string, string][]) => p.map(([a, b]) => `${a.replace(/^0/, '')}–${b.replace(/^0/, '')}`).join(', ');

export const maGodziny = () => DNI.some((d) => strona.godziny[d] != null);

const SCHEMA_DNI = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
export const godzinySchema = () =>
  godzinyTydzien().flatMap(({ przedzialy: p }, i) => p.map(([opens, closes]) => ({ '@type': 'OpeningHoursSpecification', dayOfWeek: SCHEMA_DNI[i], opens, closes })));
