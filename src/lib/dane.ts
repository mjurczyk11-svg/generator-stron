// Wczytuje plik klienta (klienci/<KLIENT>/strona.yaml) i uzupełnia go ustawieniami szablonu.
import fs from 'node:fs';
import path from 'node:path';
import { load } from 'js-yaml';
import { SZABLONY, WYGLADY } from './szablony';
import { TEKSTY } from './teksty';

export type Jezyk = 'pl' | 'en';
export type Tekst = string | { pl?: string; en?: string } | undefined | null;

export const KLIENT = process.env.KLIENT || fs.readdirSync('klienci').filter((d) => !d.startsWith('_') && fs.existsSync(path.join('klienci', d, 'strona.yaml')))[0];
export const PODGLAD = process.env.PODGLAD === '1';

// W podglądzie oznacza elementy, które edytor (/admin) pozwala kliknąć i zmienić. Na stronie klienta nic nie dodaje.
export const p = (sciezka: string) => (PODGLAD ? { 'data-pole': sciezka } : {});

function wczytaj(): any {
  const plik = path.join('klienci', KLIENT, 'strona.yaml');
  if (!fs.existsSync(plik)) throw new Error(`Brak pliku ${plik}. Ustaw KLIENT=<nazwa-folderu>.`);
  try {
    return load(fs.readFileSync(plik, 'utf8')) ?? {};
  } catch (e: any) {
    const linia = e.mark ? ` (linia ${e.mark.line + 1})` : '';
    throw new Error(`Błąd w pliku ${plik}${linia}. Najczęstsza przyczyna: tekst z dwukropkiem, przecinkiem w { } albo cudzysłowem nie jest ujęty w "...".\n${e.message}`);
  }
}

// Sekcje można zapisać jako samą listę albo jako obiekt z polem "lista".
function jakoObiekt(v: any) {
  if (v == null) return undefined;
  return Array.isArray(v) ? { lista: v } : v;
}

const surowe = wczytaj();
const szablon = SZABLONY[surowe.szablon] ?? SZABLONY.gabinet;
const wyglad = WYGLADY[surowe.wyglad ?? szablon.wyglad] ?? WYGLADY.czysty;

export const strona = {
  ...surowe,
  slug: KLIENT,
  szablon: surowe.szablon ?? 'gabinet',
  jezyki: (surowe.jezyki ?? ['pl']) as Jezyk[],
  sekcje: (surowe.sekcje ?? szablon.sekcje) as string[],
  wyglad,
  kolory: { ...szablon.kolory, ...(surowe.kolory ?? {}) },
  schema: surowe.firma?.typ_schema ?? szablon.schema,
  cta: surowe.cta ?? szablon.cta,
  firma: surowe.firma ?? {},
  kontakt: surowe.kontakt ?? {},
  godziny: surowe.godziny ?? {},
  hero: { uklad: szablon.hero, ...(surowe.hero ?? {}) },
  formularz: { typ: szablon.formularz, dostawca: 'netlify', ...(surowe.formularz ?? {}) },
  uslugi: { styl: szablon.uslugi_styl, ...jakoObiekt(surowe.uslugi) },
  galeria: jakoObiekt(surowe.galeria),
  realizacje: jakoObiekt(surowe.realizacje),
  zespol: jakoObiekt(surowe.zespol),
  faq: jakoObiekt(surowe.faq),
  marki: jakoObiekt(surowe.marki),
  dlaczego_my: jakoObiekt(surowe.dlaczego_my),
  obszar: jakoObiekt(surowe.obszar),
  wyrozniki: surowe.wyrozniki ?? [],
};

export const DNI = ['pon', 'wt', 'sr', 'czw', 'pt', 'sob', 'nd'] as const;

export function tlumacz(lang: Jezyk) {
  const t = (v: Tekst): string => {
    if (v == null) return '';
    if (typeof v === 'string' || typeof v === 'number') return String(v);
    return (v as any)[lang] ?? (v as any).pl ?? '';
  };
  const u = (klucz: string): any => {
    const slownik = TEKSTY[lang] as any;
    return slownik[`${klucz}.${strona.szablon}`] ?? slownik[klucz] ?? (TEKSTY.pl as any)[klucz] ?? klucz;
  };
  // Adres w obrębie strony z uwzględnieniem języka i ścieżki podglądu.
  const url = (p = '') => {
    const baza = import.meta.env.BASE_URL.replace(/\/?$/, '/');
    return baza + (lang === 'pl' ? '' : `${lang}/`) + p.replace(/^\//, '');
  };
  return { t, u, url, lang };
}

export const tel = (n?: string) => (n ? 'tel:' + n.replace(/[^\d+]/g, '') : '');

export const adresTekst = () => {
  const a = strona.kontakt.adres ?? {};
  return [a.ulica, [a.kod, a.miasto].filter(Boolean).join(' ')].filter(Boolean).join(', ');
};

export const mapaZapytanie = () => strona.kontakt.mapa ?? [strona.firma.nazwa, adresTekst()].filter(Boolean).join(', ');
export const linkNawigacji = () => 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(mapaZapytanie());

// Dane sekcji ("o-nas" w liście sekcji -> pole "o_nas" w pliku).
export const daneSekcji = (klucz: string): any => (strona as any)[klucz.replace(/-/g, '_')];

export function tytulSekcji(klucz: string, lang: Jezyk) {
  const { t, u } = tlumacz(lang);
  return t(daneSekcji(klucz)?.tytul) || u(`sekcja.${klucz}`);
}

// Czy sekcja ma treść do pokazania (pusta sekcja znika ze strony i z menu).
export function sekcjaMaTresc(klucz: string) {
  if (klucz === 'kontakt') return true;
  const d = daneSekcji(klucz);
  if (!d) return false;
  if (klucz === 'rezerwacja') return Boolean(d.url || d.kod);
  if (klucz === 'cennik') return Boolean(d.kategorie?.length || d.lista?.length);
  if (klucz === 'pierwsza-wizyta' || klucz === 'proces') return Boolean(d.kroki?.length || d.lista?.length);
  if (klucz === 'obszar') return Boolean(d.miejscowosci?.length || d.lista?.length || d.tekst);
  if (klucz === 'o-nas' || klucz === 'dofinansowania') return Boolean(d.tekst);
  return Boolean(d.lista?.length);
}

export const aktywneSekcje = () => strona.sekcje.filter(sekcjaMaTresc);

// Główna akcja (przycisk w menu i hero): rezerwacja online, jeśli jest, inaczej formularz.
export function glownaAkcja(lang: Jezyk) {
  const { t, url } = tlumacz(lang);
  const r = strona.rezerwacja;
  const href = r?.url && r?.typ === 'link' ? r.url : url(aktywneSekcje().includes('rezerwacja') ? '#rezerwacja' : '#formularz');
  return { tekst: t(strona.cta), href, zewnetrzny: href.startsWith('http') };
}

// Ocena w formacie danego języka: 4,9 (pl) / 4.9 (en).
export const ocena = (v: number | string, lang: Jezyk) => Number(v).toLocaleString(lang === 'pl' ? 'pl-PL' : 'en-GB', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
