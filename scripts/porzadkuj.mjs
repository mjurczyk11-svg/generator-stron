// Doprowadza pliki klientów do postaci, którą rozumie panel edycji (/admin):
// teksty zawsze jako { pl: "...", en: "..." }, sekcje-listy jako { lista: [...] }.
// Strona wygląda po tym tak samo, zmienia się tylko zapis w pliku.
//   npm run porzadkuj              -> wszyscy klienci
//   npm run porzadkuj -- nazwa     -> jeden klient
//   (z --sprawdz tylko wypisuje, które pliki trzeba uporządkować)
import fs from 'node:fs';
import path from 'node:path';
import { load, dump } from 'js-yaml';
import { FIELDS, TEKSTY, LISTY_W_OBIEKCIE } from '../panel/pola.mjs';

const jakoTekst = (v) => (typeof v === 'string' || typeof v === 'number' ? { pl: String(v) } : v);

function pole(f, v) {
  if (v == null) return v;
  if (TEKSTY.has(f)) return jakoTekst(v);
  if (f.name === 'komunikat' && typeof v === 'string') v = { tekst: v };
  if (LISTY_W_OBIEKCIE.has(f) && Array.isArray(v)) v = { lista: v };
  if (f.widget === 'object' && f.fields && v && typeof v === 'object' && !Array.isArray(v)) return obiekt(f.fields, v);
  if (f.widget === 'list' && Array.isArray(v)) {
    if (f.fields) return v.map((x) => (x && typeof x === 'object' ? obiekt(f.fields, x) : x));
    if (f.field) return v.map((x) => pole(f.field, x));
  }
  return v;
}

function obiekt(fields, dane) {
  const wynik = { ...dane };
  for (const f of fields) if (f.name in wynik) wynik[f.name] = pole(f, wynik[f.name]);
  return wynik;
}

export function uporzadkuj(dane) {
  return obiekt(FIELDS, dane ?? {});
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const arg = process.argv.slice(2);
  const tylkoSprawdz = arg.includes('--sprawdz');
  const wybrani = arg.filter((a) => !a.startsWith('--'));
  const klienci = wybrani.length ? wybrani : fs.readdirSync('klienci').filter((d) => fs.existsSync(path.join('klienci', d, 'strona.yaml')));
  let doPoprawy = 0;
  for (const k of klienci) {
    const plik = path.join('klienci', k, 'strona.yaml');
    const tresc = fs.readFileSync(plik, 'utf8');
    const dane = load(tresc) ?? {};
    const nowe = uporzadkuj(dane);
    if (JSON.stringify(nowe) === JSON.stringify(dane)) continue;
    doPoprawy++;
    if (tylkoSprawdz) {
      console.log(`✗ ${k}: plik trzeba uporządkować (npm run porzadkuj -- ${k}), inaczej panel nie pokaże części tekstów.`);
      continue;
    }
    // Zostawiamy komentarz z góry pliku.
    const naglowek = tresc.match(/^(#.*\n|\s*\n)*/)[0].replace(/\s+$/, '');
    fs.writeFileSync(plik, (naglowek ? naglowek + '\n\n' : '') + dump(nowe, { lineWidth: -1, noRefs: true }));
    console.log(`✓ ${k}: uporządkowano`);
  }
  if (!doPoprawy) console.log('Wszystkie pliki są w porządku.');
  if (tylkoSprawdz && doPoprawy) process.exitCode = 1;
}
