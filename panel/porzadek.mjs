// Doprowadza dane strony klienta do postaci, którą rozumieją panele edycji:
// teksty zawsze jako { pl, en }, sekcje-listy jako { lista: [...] }. Działa w Node i w przeglądarce.
import { FIELDS, TEKSTY, LISTY_W_OBIEKCIE } from './pola.mjs';

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
