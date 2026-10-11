// Sprawdza pliki klientów i wypisuje po polsku, co trzeba poprawić.
//   npm run sprawdz              -> wszyscy klienci
//   npm run sprawdz -- nazwa     -> jeden klient
import fs from 'node:fs';
import path from 'node:path';
import { load } from 'js-yaml';

const SZABLONY = ['gabinet', 'warsztat', 'remonty'];
const WYGLADY = ['spokojny', 'czysty', 'elegancki', 'mocny', 'rzemieslniczy'];
const ZDJECIE = /\.(jpe?g|png|webp|avif|svg)$/i;
const DNI = ['pon', 'wt', 'sr', 'czw', 'pt', 'sob', 'nd'];

const wybrani = process.argv.slice(2);
const klienci = wybrani.length ? wybrani : fs.readdirSync('klienci').filter((d) => fs.existsSync(path.join('klienci', d, 'strona.yaml')));
let bledyRazem = 0;

for (const k of klienci) {
  const plik = path.join('klienci', k, 'strona.yaml');
  const bledy = [];
  const uwagi = [];
  let d;
  try {
    d = load(fs.readFileSync(plik, 'utf8')) ?? {};
  } catch (e) {
    console.log(`\n✗ ${k}\n  - Plik ma błąd składni w linii ${e.mark ? e.mark.line + 1 : '?'}. Ujmij ten tekst w cudzysłów "...".`);
    bledyRazem++;
    continue;
  }
  const en = (d.jezyki ?? ['pl']).includes('en');

  if (!SZABLONY.includes(d.szablon)) bledy.push(`"szablon" musi być jednym z: ${SZABLONY.join(', ')}.`);
  if (d.wyglad && !WYGLADY.includes(d.wyglad)) bledy.push(`"wyglad" musi być jednym z: ${WYGLADY.join(', ')}.`);
  if (!d.firma?.nazwa) bledy.push('Brak nazwy firmy (firma → nazwa).');
  if (!d.kontakt?.telefon) bledy.push('Brak telefonu (kontakt → telefon).');
  if (!d.kontakt?.adres?.miasto) uwagi.push('Brak miasta w adresie. Bez niego tytuł strony w Google będzie słabszy.');
  if (!d.kontakt?.email) uwagi.push('Brak e-maila (potrzebny w polityce prywatności).');
  if (!d.hero?.zdjecie) uwagi.push('Brak zdjęcia głównego (hero → zdjecie). Strona pokaże kolorowe tło.');
  if (d.domena && !/^https:\/\//.test(d.domena)) bledy.push('"domena" musi zaczynać się od https://');
  if (d.formularz?.dostawca === 'web3forms' && !d.formularz?.klucz) bledy.push('Formularz Web3Forms wymaga pola "klucz".');
  if (d.kolory) for (const [n, v] of Object.entries(d.kolory)) if (!/^#[0-9a-f]{3}([0-9a-f]{3})?$/i.test(String(v))) bledy.push(`Kolor "${n}" musi mieć postać "#1f6f5c".`);
  for (const dz of Object.keys(d.godziny ?? {})) if (!DNI.includes(dz)) bledy.push(`Nieznany dzień w godzinach: "${dz}". Używaj: ${DNI.join(', ')}.`);

  // Przegląd wszystkich wartości: zdjęcia, tłumaczenia, rozbite przecinkiem teksty.
  const przejdz = (v, sciezka) => {
    if (Array.isArray(v)) return v.forEach((x, i) => przejdz(x, `${sciezka}[${i + 1}]`));
    if (v && typeof v === 'object') {
      const klucze = Object.keys(v);
      if (klucze.includes('pl')) {
        const obce = klucze.filter((x) => x !== 'pl' && x !== 'en');
        if (obce.length) bledy.push(`${sciezka}: tekst z przecinkiem trzeba ująć w cudzysłów "..." (ucięty fragment: "${obce[0]}").`);
        if (en && !v.en) uwagi.push(`${sciezka}: brak tłumaczenia "en".`);
        return;
      }
      return klucze.forEach((x) => przejdz(v[x], sciezka ? `${sciezka} → ${x}` : x));
    }
    if (typeof v === 'string' && ZDJECIE.test(v) && !/^https?:/.test(v) && !fs.existsSync(path.join('klienci', k, 'zdjecia', v))) bledy.push(`${sciezka}: brak pliku zdjecia/${v}.`);
  };
  przejdz(d, '');

  if (bledy.length) bledyRazem += bledy.length;
  console.log(`\n${bledy.length ? '✗' : '✓'} ${k}`);
  bledy.forEach((b) => console.log(`  BŁĄD: ${b}`));
  uwagi.forEach((u) => console.log(`  uwaga: ${u}`));
}
console.log(bledyRazem ? `\nDo poprawy: ${bledyRazem}.` : '\nWszystko w porządku.');
process.exitCode = bledyRazem ? 1 : 0;
