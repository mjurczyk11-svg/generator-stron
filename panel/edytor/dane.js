// Operacje na danych strony klienta (obiekt z pliku strona.yaml).
import { load, dump } from 'js-yaml';
import { uporzadkuj } from '../porzadek.mjs';
import { FIELDS, TEKSTY } from '../pola.mjs';

export const wczytajYaml = (tekst) => uporzadkuj(load(tekst) ?? {});
export const zapiszYaml = (dane) => dump(dane, { lineWidth: -1, noRefs: true });
export const kopia = (v) => (v === undefined ? undefined : JSON.parse(JSON.stringify(v)));

const czesci = (sciezka) => sciezka.split('.').filter(Boolean);
const indeks = (k) => (/^\d+$/.test(k) ? Number(k) : k);

export function pobierz(dane, sciezka) {
  let v = dane;
  for (const k of czesci(sciezka)) {
    if (v == null) return undefined;
    v = v[indeks(k)];
  }
  return v;
}

// Ustawia wartość pod ścieżką (np. "uslugi.lista.2.nazwa.pl"), tworząc brakujące obiekty i listy.
// Wartość null albo undefined usuwa pole (albo pozycję listy).
export function ustaw(dane, sciezka, wartosc) {
  const k = czesci(sciezka).map(indeks);
  let v = dane;
  for (let i = 0; i < k.length - 1; i++) {
    // Numer dalej niż koniec listy oznacza nową pozycję na końcu.
    if (Array.isArray(v) && typeof k[i] === 'number' && k[i] > v.length) k[i] = v.length;
    if (v[k[i]] == null || typeof v[k[i]] !== 'object') v[k[i]] = typeof k[i + 1] === 'number' ? [] : {};
    v = v[k[i]];
  }
  const ost = k.at(-1);
  if (wartosc == null) {
    if (Array.isArray(v) && typeof ost === 'number') v.splice(ost, 1);
    else delete v[ost];
  } else if (Array.isArray(v) && typeof ost === 'number' && ost > v.length) v.push(wartosc);
  else v[ost] = wartosc;
}

// Tekst w danym języku (jak t() na stronie).
export function tekst(v, lang) {
  if (v == null) return '';
  if (typeof v !== 'object') return String(v);
  return v[lang] ?? v.pl ?? '';
}

// Zmiana tekstu klikniętego na podglądzie: w polu { pl, en } zmienia tylko bieżący język.
export function ustawTekst(dane, sciezka, lang, wartosc) {
  const obecna = pobierz(dane, sciezka);
  if (obecna && typeof obecna === 'object' && !Array.isArray(obecna)) ustaw(dane, `${sciezka}.${lang}`, wartosc);
  else if (typeof obecna === 'string' && lang === 'pl') ustaw(dane, sciezka, wartosc);
  else ustaw(dane, sciezka, czyTekst(sciezka) ? { [lang]: wartosc } : wartosc);
}

// Opis pól dla asystenta AI: ścieżka, nazwa, rodzaj. Listy oznaczone jako [].
export function opisPol() {
  const linie = [];
  const opisz = (pola, przedrostek) => {
    for (const f of pola) {
      const s = przedrostek + f.name;
      if (TEKSTY.has(f)) linie.push(`${s} — ${f.label} (tekst {pl, en})`);
      else if (f.widget === 'object' && f.fields) opisz(f.fields, s + '.');
      else if (f.widget === 'list' && f.fields) {
        linie.push(`${s}[] — ${f.label} (lista)`);
        opisz(f.fields, s + '.N.');
      } else if (f.widget === 'list' && f.field) linie.push(`${s}[] — ${f.label} (lista: ${TEKSTY.has(f.field) ? 'teksty {pl, en}' : 'napisy'})`);
      else {
        const opcje = f.options ? ` — możliwe: ${f.options.map((o) => o.value ?? o).join(', ')}` : '';
        linie.push(`${s} — ${f.label} (${f.widget === 'image' ? 'nazwa pliku zdjęcia' : f.widget || 'string'}${f.multiple ? ', lista' : ''})${opcje}`);
      }
    }
  };
  opisz(FIELDS, '');
  return linie.join('\n');
}

// Czy pole pod tą ścieżką jest tekstem { pl, en } (ścieżka bez numerów pozycji listy).
const sciezkiTekstow = (() => {
  const zbior = new Set();
  const przejdz = (pola, p) => {
    for (const f of pola) {
      const s = p + f.name;
      if (TEKSTY.has(f)) zbior.add(s);
      else if (f.fields) przejdz(f.fields, s + '.');
    }
  };
  przejdz(FIELDS, '');
  return zbior;
})();
export const czyTekst = (sciezka) => sciezkiTekstow.has(czesci(sciezka).filter((k) => !/^\d+$/.test(k)).join('.'));
