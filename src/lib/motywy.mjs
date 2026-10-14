// Wyglądy i motywy stron. Zwykły plik JS, bo korzystają z niego: strona (Astro), ustawienia budowania
// (astro.config.mjs dobiera czcionki) i panel edycji.
//
// WYGLĄD = czcionki, zaokrąglenia, kolory tła i tekstu.
// MOTYW = gotowy projekt całej strony dla jednej niszy: wygląd + kolory + układ góry strony,
//         styl usług, nagłówek, tła sekcji, animacje i dodatki. Plik klienta może nadpisać każde ustawienie.

/** Czcionki: nazwa rodziny -> pliki CSS z pakietów @fontsource. */
export const CZCIONKI = {
  'Inter Variable': ['@fontsource-variable/inter'],
  'Manrope Variable': ['@fontsource-variable/manrope'],
  'Fraunces Variable': ['@fontsource-variable/fraunces'],
  'Playfair Display Variable': ['@fontsource-variable/playfair-display'],
  'DM Serif Display': ['@fontsource/dm-serif-display'],
  'Lora Variable': ['@fontsource-variable/lora'],
  'Plus Jakarta Sans Variable': ['@fontsource-variable/plus-jakarta-sans'],
  'Cormorant Garamond Variable': ['@fontsource-variable/cormorant-garamond'],
  'Outfit Variable': ['@fontsource-variable/outfit'],
  'Archivo Variable': ['@fontsource-variable/archivo/wdth.css'],
  'Oswald Variable': ['@fontsource-variable/oswald'],
  'Sora Variable': ['@fontsource-variable/sora'],
  'Space Grotesk Variable': ['@fontsource-variable/space-grotesk'],
  'Nunito Variable': ['@fontsource-variable/nunito'],
  'DM Sans Variable': ['@fontsource-variable/dm-sans'],
  'Barlow Condensed': ['@fontsource/barlow-condensed/500.css', '@fontsource/barlow-condensed/600.css', '@fontsource/barlow-condensed/700.css', '@fontsource/barlow-condensed/800.css'],
};

const serif = 'Georgia, serif';
const sans = 'system-ui, sans-serif';

/** Warianty wyglądu (pole "wyglad" w pliku klienta). */
export const WYGLADY = {
  spokojny: { naglowki: `'Fraunces Variable', ${serif}`, tekst: `'Inter Variable', ${sans}`, promien: '18px', tlo: '#fbfaf7', tlo2: '#f1eee7', tekstKolor: '#1d2422' },
  czysty: { naglowki: `'Manrope Variable', ${sans}`, tekst: `'Manrope Variable', ${sans}`, promien: '12px', tlo: '#ffffff', tlo2: '#f3f5f7', tekstKolor: '#16191d' },
  elegancki: { naglowki: `'Playfair Display Variable', ${serif}`, tekst: `'Inter Variable', ${sans}`, promien: '4px', tlo: '#fcfaf6', tlo2: '#f3eee4', tekstKolor: '#1f1c18' },
  mocny: { naglowki: `'Inter Variable', ${sans}`, tekst: `'Inter Variable', ${sans}`, promien: '6px', tlo: '#ffffff', tlo2: '#f2f2f2', tekstKolor: '#111111', naglowkiStyl: 'uppercase' },
  rzemieslniczy: { naglowki: `'DM Serif Display', ${serif}`, tekst: `'Manrope Variable', ${sans}`, promien: '10px', tlo: '#faf7f2', tlo2: '#efe9df', tekstKolor: '#1e1d1a' },
};

/**
 * Motywy (pole "motyw" w pliku klienta). Ustawienia:
 *  wyglad      – czcionki i tła (jak w WYGLADY)
 *  kolory      – glowny, akcent, opcjonalnie ciemny (tło ciemnych sekcji i stopki)
 *  hero        – układ góry strony: zdjecie | srodek | podzielony | panorama | kolaz | prosty
 *  uslugi_styl – kafelki | lista | zdjecia | numerowane
 *  naglowek    – standard | przezroczysty (nad dużym zdjęciem, po przewinięciu pełny)
 *  gorny_pasek – cienki pasek nad menu z telefonem, godzinami i adresem
 *  pasek       – przewijający się pasek z nazwami usług pod górą strony
 *  liczby_w_hero – liczby z sekcji „O nas” pokazane na dole pierwszego ekranu
 *  animacje    – lagodne | mocne | eleganckie
 *  przyciski   – okragle (puste = jak zaokrąglenia wyglądu)
 *  tla         – tła wybranych sekcji: alt | ciemne | kolor | jasne
 */
export const MOTYWY = {
  // ---------- GABINETY ----------
  aura: {
    nisza: 'gabinet', nazwa: 'Aura', opis: 'Jasny i spokojny, miękkie kształty, zdjęcie obok tekstu.',
    wyglad: { naglowki: `'Fraunces Variable', ${serif}`, tekst: `'Inter Variable', ${sans}`, promien: '22px', tlo: '#f8fbfa', tlo2: '#eef5f3', tekstKolor: '#15211f' },
    kolory: { glowny: '#2a7a76', akcent: '#f0a98f', ciemny: '#173a38' },
    hero: 'podzielony', uslugi_styl: 'kafelki', naglowek: 'standard', animacje: 'lagodne', przyciski: 'okragle',
    tla: { 'pierwsza-wizyta': 'kolor', opinie: 'alt' },
  },
  klinika: {
    nisza: 'gabinet', nazwa: 'Klinika', opis: 'Nowoczesny, czysty, niebieski. Tytuł na środku i szerokie zdjęcie.',
    wyglad: { naglowki: `'Plus Jakarta Sans Variable', ${sans}`, tekst: `'Plus Jakarta Sans Variable', ${sans}`, promien: '16px', tlo: '#ffffff', tlo2: '#f2f6fc', tekstKolor: '#0d1b2e' },
    kolory: { glowny: '#1f5fd6', akcent: '#17b5a2', ciemny: '#0b1f3d' },
    hero: 'panorama', uslugi_styl: 'kafelki', naglowek: 'standard', gorny_pasek: true, animacje: 'lagodne',
    tla: { 'pierwsza-wizyta': 'ciemne', cennik: 'alt' },
  },
  perla: {
    nisza: 'gabinet', nazwa: 'Perła', opis: 'Elegancki, krem i złoto, duże zdjęcie na cały ekran.',
    wyglad: { naglowki: `'Cormorant Garamond Variable', ${serif}`, tekst: `'Inter Variable', ${sans}`, promien: '0px', tlo: '#faf7f1', tlo2: '#f2ece1', tekstKolor: '#1c1a16' },
    kolory: { glowny: '#1c1a16', akcent: '#b08d57', ciemny: '#16140f' },
    hero: 'srodek', uslugi_styl: 'numerowane', naglowek: 'przezroczysty', animacje: 'eleganckie',
    tla: { opinie: 'ciemne', 'pierwsza-wizyta': 'alt' },
  },
  ruch: {
    nisza: 'gabinet', nazwa: 'Ruch', opis: 'Energiczny, zieleń i limonka, duże zaokrąglenia. Dla fizjoterapii.',
    wyglad: { naglowki: `'Outfit Variable', ${sans}`, tekst: `'Outfit Variable', ${sans}`, promien: '28px', tlo: '#ffffff', tlo2: '#f1f5ef', tekstKolor: '#0c1f16' },
    kolory: { glowny: '#0f5a3e', akcent: '#c8f169', ciemny: '#0b2a1e' },
    hero: 'podzielony', uslugi_styl: 'kafelki', naglowek: 'standard', pasek: true, animacje: 'mocne', przyciski: 'okragle',
    tla: { 'pierwsza-wizyta': 'ciemne', opinie: 'alt' },
  },
  harmonia: {
    nisza: 'gabinet', nazwa: 'Harmonia', opis: 'Ciepły i naturalny, łukowe zdjęcia, barwy ziemi.',
    wyglad: { naglowki: `'DM Serif Display', ${serif}`, tekst: `'Manrope Variable', ${sans}`, promien: '20px', tlo: '#fbf6f0', tlo2: '#f3e8dc', tekstKolor: '#2b221d' },
    kolory: { glowny: '#9b5a43', akcent: '#7e9a7a', ciemny: '#3a2a22' },
    hero: 'podzielony', uslugi_styl: 'lista', naglowek: 'standard', animacje: 'eleganckie', przyciski: 'okragle',
    tla: { 'pierwsza-wizyta': 'alt', opinie: 'ciemne' },
  },

  // ---------- WARSZTATY ----------
  turbo: {
    nisza: 'warsztat', nazwa: 'Turbo', opis: 'Ciemny, czerwień i biel, ukośne cięcia, dynamiczny.',
    wyglad: { naglowki: `'Archivo Variable', ${sans}`, tekst: `'Inter Variable', ${sans}`, promien: '4px', tlo: '#0e0e10', tlo2: '#17171b', tekstKolor: '#f1f1f3', naglowkiStyl: 'uppercase', ciemny: true },
    kolory: { glowny: '#e3170a', akcent: '#e3170a', ciemny: '#050506' },
    hero: 'zdjecie', uslugi_styl: 'kafelki', naglowek: 'przezroczysty', pasek: true, animacje: 'mocne',
    tla: {},
  },
  garaz: {
    nisza: 'warsztat', nazwa: 'Garaż', opis: 'Industrialny, czerń i żółć, wąskie mocne litery.',
    wyglad: { naglowki: `'Oswald Variable', ${sans}`, tekst: `'Inter Variable', ${sans}`, promien: '2px', tlo: '#f4f1ea', tlo2: '#e9e4d8', tekstKolor: '#161616', naglowkiStyl: 'uppercase' },
    kolory: { glowny: '#161616', akcent: '#ffc21a', ciemny: '#161616' },
    hero: 'zdjecie', uslugi_styl: 'numerowane', naglowek: 'standard', gorny_pasek: true, liczby_w_hero: false, animacje: 'mocne',
    tla: { 'dlaczego-my': 'ciemne', marki: 'akcent' },
  },
  serwis: {
    nisza: 'warsztat', nazwa: 'Serwis', opis: 'Jasny i rzeczowy, granat i pomarańcz, godziny na wierzchu.',
    wyglad: { naglowki: `'Manrope Variable', ${sans}`, tekst: `'Manrope Variable', ${sans}`, promien: '12px', tlo: '#ffffff', tlo2: '#f2f5f9', tekstKolor: '#0e1a2b' },
    kolory: { glowny: '#0b4dbb', akcent: '#ff7a1a', ciemny: '#0a1a33' },
    hero: 'podzielony', uslugi_styl: 'kafelki', naglowek: 'standard', gorny_pasek: true, animacje: 'lagodne',
    tla: { 'dlaczego-my': 'ciemne', marki: 'alt' },
  },
  polysk: {
    nisza: 'warsztat', nazwa: 'Połysk', opis: 'Premium, czarny z błękitem, szklane karty. Dla detailingu.',
    wyglad: { naglowki: `'Sora Variable', ${sans}`, tekst: `'Inter Variable', ${sans}`, promien: '18px', tlo: '#0a0b0e', tlo2: '#111319', tekstKolor: '#e8ecf2', ciemny: true },
    kolory: { glowny: '#43c6ec', akcent: '#c3cad6', ciemny: '#050608' },
    hero: 'srodek', uslugi_styl: 'numerowane', naglowek: 'przezroczysty', animacje: 'eleganckie', przyciski: 'okragle',
    tla: {},
  },
  sasiad: {
    nisza: 'warsztat', nazwa: 'Sąsiad', opis: 'Przyjazny, rodzinny, pomarańcz i zieleń, kolaż zdjęć.',
    wyglad: { naglowki: `'Nunito Variable', ${sans}`, tekst: `'Nunito Variable', ${sans}`, promien: '22px', tlo: '#fffaf3', tlo2: '#fdeedc', tekstKolor: '#2a1c10' },
    kolory: { glowny: '#d9570b', akcent: '#1f6f5c', ciemny: '#2a1c10' },
    hero: 'kolaz', uslugi_styl: 'kafelki', naglowek: 'standard', animacje: 'mocne', przyciski: 'okragle',
    tla: { 'dlaczego-my': 'akcent' },
  },

  // ---------- REMONTY I INSTALACJE ----------
  fundament: {
    nisza: 'remonty', nazwa: 'Fundament', opis: 'Rzemieślniczy, zieleń i miedź, duże zdjęcie realizacji.',
    wyglad: { naglowki: `'DM Serif Display', ${serif}`, tekst: `'Manrope Variable', ${sans}`, promien: '12px', tlo: '#faf7f2', tlo2: '#efe8dc', tekstKolor: '#1e1d1a' },
    kolory: { glowny: '#1f3d36', akcent: '#e08a2c', ciemny: '#14261f' },
    hero: 'zdjecie', uslugi_styl: 'zdjecia', naglowek: 'przezroczysty', liczby_w_hero: true, animacje: 'lagodne',
    tla: { proces: 'ciemne', dofinansowania: 'alt' },
  },
  beton: {
    nisza: 'remonty', nazwa: 'Beton', opis: 'Architektoniczny minimalizm, szarości i pomarańcz, duża typografia.',
    wyglad: { naglowki: `'Space Grotesk Variable', ${sans}`, tekst: `'Space Grotesk Variable', ${sans}`, promien: '0px', tlo: '#efefeb', tlo2: '#e3e3dd', tekstKolor: '#121212' },
    kolory: { glowny: '#121212', akcent: '#ff5a1f', ciemny: '#121212' },
    hero: 'panorama', uslugi_styl: 'numerowane', naglowek: 'standard', pasek: true, animacje: 'mocne',
    tla: { proces: 'ciemne' },
  },
  studio: {
    nisza: 'remonty', nazwa: 'Studio', opis: 'Elegancki, granat i mosiądz, kolaż zdjęć wnętrz.',
    wyglad: { naglowki: `'Playfair Display Variable', ${serif}`, tekst: `'Inter Variable', ${sans}`, promien: '6px', tlo: '#fbfaf8', tlo2: '#f1ede7', tekstKolor: '#1b1f27' },
    kolory: { glowny: '#1f2a44', akcent: '#b8894a', ciemny: '#141b2d' },
    hero: 'kolaz', uslugi_styl: 'zdjecia', naglowek: 'standard', animacje: 'eleganckie',
    tla: { proces: 'alt', opinie: 'ciemne' },
  },
  energia: {
    nisza: 'remonty', nazwa: 'Energia', opis: 'Świeży i nowoczesny, zieleń i słońce. Dla pomp ciepła i fotowoltaiki.',
    wyglad: { naglowki: `'DM Sans Variable', ${sans}`, tekst: `'DM Sans Variable', ${sans}`, promien: '20px', tlo: '#ffffff', tlo2: '#eef6f1', tekstKolor: '#0f1d17' },
    kolory: { glowny: '#0b8a57', akcent: '#ffc83d', ciemny: '#0b2a1f' },
    hero: 'podzielony', uslugi_styl: 'kafelki', naglowek: 'standard', liczby_w_hero: true, animacje: 'lagodne', przyciski: 'okragle',
    tla: { dofinansowania: 'kolor', proces: 'alt' },
  },
  fach: {
    nisza: 'remonty', nazwa: 'Fach', opis: 'Mocny wykonawca, granat i pomarańcz, liczby na pierwszym ekranie.',
    wyglad: { naglowki: `'Barlow Condensed', ${sans}`, tekst: `'Inter Variable', ${sans}`, promien: '4px', tlo: '#ffffff', tlo2: '#f1f3f6', tekstKolor: '#0f1828', naglowkiStyl: 'uppercase' },
    kolory: { glowny: '#13294b', akcent: '#f26b1d', ciemny: '#0c1a31' },
    hero: 'zdjecie', uslugi_styl: 'zdjecia', naglowek: 'standard', gorny_pasek: true, liczby_w_hero: true, pasek: true, animacje: 'mocne',
    tla: { proces: 'ciemne', 'dlaczego-my': 'alt' },
  },
};

/** Lista motywów jednej niszy: [[id, nazwa], ...] (do panelu edycji). */
export const motywyNiszy = (nisza) => Object.entries(MOTYWY).filter(([, m]) => m.nisza === nisza).map(([id, m]) => [id, m.nazwa]);

/** Rodziny czcionek użyte w wyglądzie -> pliki CSS do zaimportowania. */
export function plikiCzcionek(wyglad) {
  const tekst = `${wyglad?.naglowki ?? ''} ${wyglad?.tekst ?? ''}`;
  return Object.entries(CZCIONKI).filter(([nazwa]) => tekst.includes(`'${nazwa}'`)).flatMap(([, pliki]) => pliki);
}
