// Ustawienia domyślne trzech szablonów (nisz). Plik klienta może nadpisać każde z nich.

export type Szablon = {
  sekcje: string[];
  schema: string;
  wyglad: string;
  kolory: { glowny: string; akcent: string };
  cta: { pl: string; en: string };
  formularz: 'kontakt' | 'termin' | 'warsztat' | 'wycena';
  hero: 'zdjecie' | 'podzielony' | 'prosty';
  uslugi_styl: 'kafelki' | 'lista' | 'zdjecia';
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

// Warianty wyglądu: czcionki, zaokrąglenia, tło. Kolory przychodzą z szablonu albo od klienta.
export const WYGLADY: Record<string, { naglowki: string; tekst: string; promien: string; tlo: string; tlo2: string; tekstKolor: string; naglowkiStyl?: string }> = {
  spokojny: { naglowki: "'Fraunces Variable', Georgia, serif", tekst: "'Inter Variable', system-ui, sans-serif", promien: '18px', tlo: '#fbfaf7', tlo2: '#f1eee7', tekstKolor: '#1d2422' },
  czysty: { naglowki: "'Manrope Variable', system-ui, sans-serif", tekst: "'Manrope Variable', system-ui, sans-serif", promien: '12px', tlo: '#ffffff', tlo2: '#f3f5f7', tekstKolor: '#16191d' },
  elegancki: { naglowki: "'Playfair Display Variable', Georgia, serif", tekst: "'Inter Variable', system-ui, sans-serif", promien: '4px', tlo: '#fcfaf6', tlo2: '#f3eee4', tekstKolor: '#1f1c18' },
  mocny: { naglowki: "'Inter Variable', system-ui, sans-serif", tekst: "'Inter Variable', system-ui, sans-serif", promien: '6px', tlo: '#ffffff', tlo2: '#f2f2f2', tekstKolor: '#111111', naglowkiStyl: 'uppercase' },
  rzemieslniczy: { naglowki: "'DM Serif Display', Georgia, serif", tekst: "'Manrope Variable', system-ui, sans-serif", promien: '10px', tlo: '#faf7f2', tlo2: '#efe9df', tekstKolor: '#1e1d1a' },
};
