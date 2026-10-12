// Ustawienia domyślne trzech szablonów (nisz). Plik klienta może nadpisać każde z nich.

export type Szablon = {
  sekcje: string[];
  schema: string;
  wyglad: string;
  kolory: { glowny: string; akcent: string };
  cta: { pl: string; en: string };
  formularz: 'kontakt' | 'termin' | 'warsztat' | 'wycena';
  hero: 'zdjecie' | 'podzielony' | 'prosty' | 'srodek' | 'panorama' | 'kolaz';
  uslugi_styl: 'kafelki' | 'lista' | 'zdjecia' | 'numerowane';
};

export const SZABLONY: Record<string, Szablon> = {
  gabinet: {
    sekcje: ['uslugi', 'o-nas', 'zespol', 'pierwsza-wizyta', 'cennik', 'galeria', 'opinie', 'faq', 'rezerwacja', 'kontakt'],
    schema: 'MedicalClinic',
    wyglad: 'spokojny',
    kolory: { glowny: '#2f6f73', akcent: '#d9a441' },
    cta: { pl: 'Umów wizytę', en: 'Book a visit' },
    formularz: 'termin',
    hero: 'podzielony',
    uslugi_styl: 'lista',
  },
  warsztat: {
    sekcje: ['uslugi', 'marki', 'dlaczego-my', 'galeria', 'opinie', 'faq', 'kontakt'],
    schema: 'AutoRepair',
    wyglad: 'mocny',
    kolory: { glowny: '#d62828', akcent: '#ffb703' },
    cta: { pl: 'Umów wizytę', en: 'Book a service' },
    formularz: 'warsztat',
    hero: 'zdjecie',
    uslugi_styl: 'kafelki',
  },
  remonty: {
    sekcje: ['uslugi', 'realizacje', 'proces', 'dlaczego-my', 'obszar', 'opinie', 'dofinansowania', 'faq', 'kontakt'],
    schema: 'HomeAndConstructionBusiness',
    wyglad: 'rzemieslniczy',
    kolory: { glowny: '#1f3d36', akcent: '#e08a2c' },
    cta: { pl: 'Bezpłatna wycena', en: 'Free quote' },
    formularz: 'wycena',
    hero: 'zdjecie',
    uslugi_styl: 'zdjecia',
  },
};

// Warianty wyglądu i gotowe motywy są w motywy.mjs (korzysta z nich też astro.config.mjs).
export { WYGLADY, MOTYWY, motywyNiszy } from './motywy.mjs';
