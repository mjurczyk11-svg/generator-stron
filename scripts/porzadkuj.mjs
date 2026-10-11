// Doprowadza pliki klientów do postaci, którą rozumie panel edycji (/admin):
// teksty zawsze jako { pl: "...", en: "..." }, sekcje-listy jako { lista: [...] }.
// Strona wygląda po tym tak samo, zmienia się tylko zapis w pliku.
//   npm run porzadkuj              -> wszyscy klienci
//   npm run porzadkuj -- nazwa     -> jeden klient
//   (z --sprawdz tylko wypisuje, które pliki trzeba uporządkować)
import fs from 'node:fs';
import path from 'node:path';
import { load, dump } from 'js-yaml';
import { uporzadkuj } from '../panel/porzadek.mjs';

export { uporzadkuj };

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
