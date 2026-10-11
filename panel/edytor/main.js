// Edytor stron: podgląd strony klienta z edycją po kliknięciu, asystent AI i proste ustawienia.
import { GitHub, wczytajToken, zapiszToken } from './github.js';
import { wczytajYaml, zapiszYaml, kopia, pobierz, ustaw, tekst, ustawTekst } from './dane.js';
import { czat, nowaStrona, wczytajKlucz, zapiszKlucz, bladApi } from './ai.js';
import { uporzadkuj } from '../porzadek.mjs';
import { SEKCJE } from '../pola.mjs';
import { SZABLONY } from '../../src/lib/szablony.ts';

const $ = (s) => document.querySelector(s);
const el = (tag, atrybuty = {}, ...dzieci) => {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(atrybuty)) {
    if (k === 'class') e.className = v;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else if (v != null && v !== false) e.setAttribute(k, v === true ? '' : v);
  }
  for (const d of dzieci.flat()) if (d != null) e.append(d);
  return e;
};

const stan = {
  gh: null,
  klienci: [], // [{ slug, nazwa }]
  slug: '',
  dane: {},
  oryginal: '',
  sha: '',
  lang: 'pl',
  zdjecia: new Map(), // nazwa pliku -> { base64, url } (wgrane, jeszcze niezapisane)
  cofnij: [],
  historia: [],
  zaznaczone: null,
  edytowany: null,
  publikacja: null,
};

// ---------- Komunikaty ----------
let zegarKomunikatu;
function komunikat(tresc, dlugo = 4000) {
  const k = $('#komunikat');
  k.textContent = tresc;
  k.hidden = false;
  clearTimeout(zegarKomunikatu);
  zegarKomunikatu = setTimeout(() => (k.hidden = true), dlugo);
}

function zaslona(tresc) {
  $('#zaslona').hidden = !tresc;
  if (tresc) $('#zaslona-tekst').textContent = tresc;
}

// ---------- Logowanie ----------
async function zaloguj(token) {
  const gh = new GitHub(token);
  if (!(await gh.sprawdz())) throw new Error('Ten klucz nie ma prawa zapisu do repozytorium stron. Zrób nowy z uprawnieniem „Contents: Read and write”.');
  stan.gh = gh;
}

async function start() {
  const token = wczytajToken();
  if (token) {
    try {
      await zaloguj(token);
      return uruchom();
    } catch (e) {
      if (e.status !== 401 && e.status !== 403) {
        // Brak sieci albo chwilowy błąd GitHuba: pokaż komunikat zamiast logowania.
        $('#blad-logowania').textContent = `Nie udało się połączyć z GitHubem (${e.message}).`;
        $('#blad-logowania').hidden = false;
      }
    }
  }
  $('#logowanie').hidden = false;
}

$('#form-logowanie').addEventListener('submit', async (e) => {
  e.preventDefault();
  const token = $('#pole-token').value.trim();
  const blad = $('#blad-logowania');
  blad.hidden = true;
  try {
    await zaloguj(token);
    zapiszToken(token);
    $('#logowanie').hidden = true;
    uruchom();
  } catch (err) {
    blad.textContent = err.status === 401 ? 'Ten klucz jest nieprawidłowy albo wygasł.' : err.message;
    blad.hidden = false;
  }
});

// ---------- Lista klientów ----------
async function wczytajKlientow() {
  const lista = await stan.gh.lista('klienci');
  const foldery = lista.filter((x) => x.type === 'dir' && !x.name.startsWith('_'));
  stan.klienci = await Promise.all(
    foldery.map(async (f) => {
      const plik = await stan.gh.plik(`klienci/${f.name}/strona.yaml`).catch(() => null);
      if (!plik) return null;
      let nazwa = f.name;
      try {
        nazwa = wczytajYaml(plik.tekst).firma?.nazwa || f.name;
      } catch {}
      return { slug: f.name, nazwa };
    }),
  ).then((l) => l.filter(Boolean).sort((a, b) => (a.slug.startsWith('przyklad') - b.slug.startsWith('przyklad')) || a.nazwa.localeCompare(b.nazwa, 'pl')));
  pokazKlientow();
}

function pokazKlientow() {
  const s = $('#klient');
  s.replaceChildren(...stan.klienci.map((k) => el('option', { value: k.slug }, k.slug.startsWith('przyklad') ? `${k.nazwa} (przykład)` : k.nazwa)));
  s.value = stan.slug;
}

async function uruchom() {
  $('#aplikacja').hidden = false;
  $('#adres-baza').textContent = `${location.host}/`;
  pokazKluczAI();
  zaslona('Wczytuję strony klientów…');
  await wczytajKlientow();
  let poczatkowy = decodeURIComponent(location.hash.slice(1));
  try {
    poczatkowy ||= localStorage.getItem('edytor.klient') || '';
  } catch {}
  if (!stan.klienci.some((k) => k.slug === poczatkowy)) poczatkowy = stan.klienci[0]?.slug;
  if (poczatkowy) await wybierzKlienta(poczatkowy);
  else zaslona('Nie ma jeszcze żadnej strony. Kliknij „+ Nowa strona”.');
}

$('#klient').addEventListener('change', async (e) => {
  const nowy = e.target.value;
  if (maZmiany() && !confirm('Masz niezapisane zmiany. Przejść do innej strony bez zapisywania?')) {
    e.target.value = stan.slug;
    return;
  }
  await wybierzKlienta(nowy);
});

// plik: { tekst, sha } gdy już jest wczytany (np. zaraz po utworzeniu strony).
async function wybierzKlienta(slug, plik) {
  zaslona('Wczytuję stronę…');
  plik ??= await stan.gh.plik(`klienci/${slug}/strona.yaml`);
  if (!plik) {
    zaslona('Nie znalazłem pliku tej strony.');
    return;
  }
  Object.assign(stan, { slug, dane: wczytajYaml(plik.tekst), sha: plik.sha, cofnij: [], historia: [], zaznaczone: null, zdjecia: new Map() });
  stan.oryginal = zapiszYaml(stan.dane);
  $('#klient').value = slug;
  history.replaceState(null, '', `#${slug}`);
  try {
    localStorage.setItem('edytor.klient', slug);
  } catch {}
  $('#wiadomosci').replaceChildren();
  powitanie();
  pokazZaznaczone();
  odswiezPrzyciski();
  if (!$('#szuflada').hidden) zbudujUstawienia();
  const jezyki = stan.dane.jezyki ?? ['pl'];
  if (!jezyki.includes(stan.lang)) stan.lang = 'pl';
  pokazJezyk();
  await zaladujPodglad();
}

// ---------- Podgląd ----------
const adresStrony = () => `/${stan.slug}/${stan.lang === 'en' ? 'en/' : ''}`;

async function zaladujPodglad() {
  $('#link-strona').href = adresStrony();
  const odp = await fetch(adresStrony(), { cache: 'no-store' }).catch(() => null);
  if (!odp?.ok) {
    zaslona('Ta strona jeszcze się buduje. Pokaże się tu sama za 1–3 minuty.');
    czekajNaStrone();
    return;
  }
  zaslona('Ładuję podgląd…');
  const ramka = $('#ramka');
  ramka.onload = () => {
    podepnijPodglad(ramka.contentDocument);
    odswiezPodglad();
    zaslona('');
  };
  ramka.src = `${adresStrony()}?podglad=${Date.now()}`;
}

let zegarStrony;
function czekajNaStrone() {
  clearInterval(zegarStrony);
  const slug = stan.slug;
  zegarStrony = setInterval(async () => {
    if (stan.slug !== slug) return clearInterval(zegarStrony);
    const odp = await fetch(adresStrony(), { cache: 'no-store' }).catch(() => null);
    if (odp?.ok) {
      clearInterval(zegarStrony);
      zaladujPodglad();
    }
  }, 10000);
}

const STYL_PODGLADU = `
[data-pole]{cursor:text;outline:2px dashed transparent;outline-offset:3px;transition:outline-color .15s;border-radius:2px}
[data-pole]:hover{outline-color:rgba(37,99,235,.65)}
img[data-pole],.obraz-zastepczy[data-pole]{cursor:pointer}
img[data-pole]:hover,.obraz-zastepczy[data-pole]:hover{outline:3px solid rgba(37,99,235,.8);outline-offset:-3px}
[data-pole][contenteditable=true],[data-pole][contenteditable=plaintext-only]{outline:2px solid #2563eb!important;background:rgba(37,99,235,.06);cursor:text}
.hero--zdjecie .hero-tresc{pointer-events:none}.hero--zdjecie .hero-tresc>*{pointer-events:auto}.hero-tlo::after{pointer-events:none}
`;

// Element do edycji pod kursorem, także zdjęcie przykryte warstwą (np. tło na górze strony).
const zdjeciePod = (doc, e) => doc.elementsFromPoint(e.clientX, e.clientY).map((x) => x.closest('[data-pole]')).find((x) => x && czyZdjecie(x));

const czyZdjecie = (e) => e.tagName === 'IMG' || e.classList.contains('obraz-zastepczy');

function podepnijPodglad(doc) {
  if (!doc) return;
  doc.head.append(Object.assign(doc.createElement('style'), { textContent: STYL_PODGLADU }));
  doc.addEventListener(
    'click',
    (e) => {
      const link = e.target.closest('a[href]');
      const cel = e.target.closest('[data-pole]') ?? (link ? null : zdjeciePod(doc, e));
      if (cel) {
        e.preventDefault();
        e.stopPropagation();
        if (czyZdjecie(cel)) return wybierzZdjecie(cel);
        if (cel.isContentEditable) return;
        return edytujTekst(cel, e);
      }
      // Linki prowadzące poza tę stronę nie działają w edytorze, żeby nie zgubić zmian.
      if (link && !link.getAttribute('href').startsWith('#')) {
        e.preventDefault();
        komunikat('Linki nie działają w edytorze. Otwórz stronę w nowej karcie (menu ⋯).');
      }
    },
    true,
  );
  doc.addEventListener('submit', (e) => e.preventDefault(), true);
}

// Tekst elementu tak, jak jest zapisany (bez wielkich liter dodanych przez styl strony).
function tekstElementu(e) {
  const stary = e.style.textTransform;
  e.style.textTransform = 'none';
  const t = e.innerText;
  e.style.textTransform = stary;
  return t;
}

const wieleAkapitow = (pole, e) => /odpowiedz$|\.tekst$/.test(pole) || e.querySelector('p');

function edytujTekst(e, klik) {
  const pole = e.dataset.pole;
  const doc = e.ownerDocument;
  zapamietaj();
  // Podczas pisania widać prawdziwe litery, nie te zmienione stylem strony.
  const transformacja = e.style.textTransform;
  e.style.textTransform = 'none';
  e.contentEditable = 'plaintext-only';
  if (e.contentEditable !== 'plaintext-only') e.contentEditable = 'true';
  e.focus();
  // Kursor w miejscu kliknięcia.
  const zakres = doc.caretRangeFromPoint?.(klik.clientX, klik.clientY);
  if (zakres) {
    const s = doc.getSelection();
    s.removeAllRanges();
    s.addRange(zakres);
  }
  stan.edytowany = e;
  zaznacz(pole, e.innerText.trim());
  const przyZmianie = () => {
    ustawTekst(stan.dane, pole, stan.lang, e.innerText.replace(/\n{3,}/g, '\n\n').trim());
    stan.zaznaczone = { sciezka: pole, tekst: e.innerText.trim() };
    odswiezPrzyciski();
  };
  const klawisz = (k) => {
    if (k.key === 'Escape' || (k.key === 'Enter' && !k.shiftKey && !wieleAkapitow(pole, e))) {
      k.preventDefault();
      e.blur();
    }
  };
  const koniec = () => {
    e.contentEditable = 'false';
    e.removeAttribute('contenteditable');
    e.style.textTransform = transformacja;
    e.removeEventListener('input', przyZmianie);
    e.removeEventListener('keydown', klawisz);
    if (stan.edytowany === e) stan.edytowany = null;
    porzucPustaZmiane();
  };
  e.addEventListener('input', przyZmianie);
  e.addEventListener('keydown', klawisz);
  e.addEventListener('blur', koniec, { once: true });
}

// Wgrywanie zdjęcia w miejsce klikniętego.
let celZdjecia = null;
function wybierzZdjecie(e) {
  celZdjecia = e;
  zaznacz(e.dataset.pole, 'zdjęcie');
  $('#plik-zdjecia').value = '';
  $('#plik-zdjecia').click();
}

$('#plik-zdjecia').addEventListener('change', async (ev) => {
  const plik = ev.target.files[0];
  if (!plik || !celZdjecia) return;
  const e = celZdjecia;
  try {
    const zdj = await przygotujZdjecie(plik);
    zapamietaj();
    stan.zdjecia.set(zdj.nazwa, zdj);
    ustaw(stan.dane, e.dataset.pole, zdj.nazwa);
    pokazZdjecie(e, zdj.url);
    odswiezPrzyciski();
    komunikat('Zdjęcie podmienione. Kliknij „Zapisz”, żeby było na stronie.');
  } catch (err) {
    komunikat(`Nie udało się wczytać zdjęcia: ${err.message}`);
  }
});

function pokazZdjecie(e, url) {
  if (e.tagName === 'IMG') {
    e.dataset.oryginal ??= JSON.stringify({ src: e.getAttribute('src'), srcset: e.getAttribute('srcset') });
    e.removeAttribute('srcset');
    e.src = url;
  } else {
    const img = e.ownerDocument.createElement('img');
    img.className = e.className.replace('obraz-zastepczy', '').trim();
    img.dataset.pole = e.dataset.pole;
    img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block';
    img.src = url;
    e.replaceWith(img);
  }
}

// Zmniejsza zdjęcie z telefonu do rozsądnego rozmiaru (max 2000 px, JPEG).
const nazwaPliku = (n) =>
  n.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ł/g, 'l').replace(/\.[^.]+$/, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'zdjecie';

async function przygotujZdjecie(plik, nazwa) {
  const bitmapa = await createImageBitmap(plik);
  const skala = Math.min(1, 2000 / Math.max(bitmapa.width, bitmapa.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmapa.width * skala);
  canvas.height = Math.round(bitmapa.height * skala);
  canvas.getContext('2d').drawImage(bitmapa, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise((r) => canvas.toBlob(r, 'image/jpeg', 0.85));
  const base64 = await new Promise((r) => {
    const fr = new FileReader();
    fr.onload = () => r(fr.result.split(',')[1]);
    fr.readAsDataURL(blob);
  });
  return { nazwa: nazwa ?? `${nazwaPliku(plik.name)}-${Date.now().toString(36)}.jpg`, base64, url: URL.createObjectURL(blob) };
}

// Ustawia na podglądzie teksty i zdjęcia zgodnie z bieżącymi danymi (po czacie, cofnięciu, zmianie języka).
function odswiezPodglad() {
  const doc = $('#ramka').contentDocument;
  if (!doc) return;
  for (const e of doc.querySelectorAll('[data-pole]')) {
    if (e === stan.edytowany) continue;
    const v = pobierz(stan.dane, e.dataset.pole);
    if (czyZdjecie(e)) {
      if (stan.zdjecia.has(v)) pokazZdjecie(e, stan.zdjecia.get(v).url);
      else if (e.dataset.oryginal) {
        const o = JSON.parse(e.dataset.oryginal);
        if (o.srcset) e.setAttribute('srcset', o.srcset);
        e.src = o.src;
        delete e.dataset.oryginal;
      }
      continue;
    }
    const t = tekst(v, stan.lang).trim();
    if (t && tekstElementu(e).trim() !== t) e.innerText = t;
  }
  const k = stan.dane.kolory ?? {};
  if (k.glowny) doc.documentElement.style.setProperty('--glowny', k.glowny);
  if (k.akcent) doc.documentElement.style.setProperty('--akcent', k.akcent);
}

// ---------- Zmiany, cofanie, zapis ----------
const maZmiany = () => stan.slug && zapiszYaml(stan.dane) !== stan.oryginal;

function zapamietaj() {
  stan.cofnij.push(kopia(stan.dane));
  if (stan.cofnij.length > 50) stan.cofnij.shift();
  odswiezPrzyciski();
}

// Kliknięcie w tekst bez zmiany nie zostawia pustego kroku do cofnięcia.
function porzucPustaZmiane() {
  const ost = stan.cofnij.at(-1);
  if (ost && JSON.stringify(ost) === JSON.stringify(stan.dane)) stan.cofnij.pop();
  odswiezPrzyciski();
}

$('#przycisk-cofnij').addEventListener('click', () => {
  const poprzednie = stan.cofnij.pop();
  if (!poprzednie) return;
  stan.dane = poprzednie;
  odswiezPodglad();
  if (!$('#szuflada').hidden) zbudujUstawienia();
  odswiezPrzyciski();
  komunikat('Cofnięto ostatnią zmianę.');
});

function odswiezPrzyciski() {
  const zm = maZmiany();
  const z = $('#przycisk-zapisz');
  z.disabled = !zm;
  z.textContent = zm ? 'Zapisz zmiany' : 'Zapisano';
  z.classList.toggle('pulsuje', zm);
  $('#przycisk-cofnij').disabled = stan.cofnij.length === 0;
}

$('#przycisk-zapisz').addEventListener('click', zapisz);

async function zapisz() {
  if (!maZmiany()) return;
  const przycisk = $('#przycisk-zapisz');
  przycisk.disabled = true;
  przycisk.textContent = 'Zapisuję…';
  try {
    const sciezka = `klienci/${stan.slug}/strona.yaml`;
    const teraz = await stan.gh.plik(sciezka);
    if (teraz && teraz.sha !== stan.sha && zapiszYaml(wczytajYaml(teraz.tekst)) !== stan.oryginal) {
      if (!confirm('Ktoś zmienił tę stronę w międzyczasie (np. Claude albo formularze). Zapisać Twoją wersję mimo to?')) throw new Error('Zapis anulowany.');
    }
    const yaml = zapiszYaml(stan.dane);
    const pliki = [{ sciezka, tekst: yaml }];
    for (const [nazwa, z] of stan.zdjecia) if (yaml.includes(nazwa)) pliki.push({ sciezka: `klienci/${stan.slug}/zdjecia/${nazwa}`, base64: z.base64 });
    await stan.gh.zapisz(pliki, `Edytor: zmiany na stronie ${stan.slug}`);
    stan.oryginal = yaml;
    stan.sha = (await stan.gh.plik(sciezka))?.sha ?? stan.sha;
    komunikat('Zapisano. Strona zaktualizuje się sama za 1–3 minuty.', 6000);
    czekajNaPublikacje();
  } catch (e) {
    komunikat(e.message === 'Zapis anulowany.' ? e.message : `Nie udało się zapisać: ${e.message}`, 8000);
  }
  odswiezPrzyciski();
}

// Po zapisie sprawdza co 10 s, czy nowa wersja strony jest już opublikowana.
async function czekajNaPublikacje() {
  clearInterval(stan.publikacja);
  const slug = stan.slug;
  const adres = adresStrony();
  const przed = await fetch(adres, { cache: 'no-store' }).then((r) => r.text()).catch(() => '');
  let prob = 0;
  stan.publikacja = setInterval(async () => {
    if (stan.slug !== slug || ++prob > 48) return clearInterval(stan.publikacja);
    const teraz = await fetch(adres, { cache: 'no-store' }).then((r) => (r.ok ? r.text() : '')).catch(() => '');
    if (teraz && teraz !== przed) {
      clearInterval(stan.publikacja);
      komunikat('Nowa wersja jest już na stronie.', 6000);
      if (!maZmiany()) zaladujPodglad();
    }
  }, 10000);
}

window.addEventListener('beforeunload', (e) => {
  if (maZmiany()) e.preventDefault();
});

// ---------- Język i widok ----------
function pokazJezyk() {
  const jezyki = stan.dane.jezyki ?? ['pl'];
  $('#jezyk').hidden = !jezyki.includes('en');
  for (const b of $('#jezyk').querySelectorAll('button')) b.setAttribute('aria-pressed', String(b.dataset.lang === stan.lang));
}

$('#jezyk').addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (!b || b.dataset.lang === stan.lang) return;
  stan.lang = b.dataset.lang;
  pokazJezyk();
  zaladujPodglad();
});

$('#urzadzenie').addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (!b) return;
  for (const x of $('#urzadzenie').querySelectorAll('button')) x.setAttribute('aria-pressed', String(x === b));
  $('#ramka-kontener').classList.toggle('telefon', b.dataset.widok === 'telefon');
});

// ---------- Zaznaczony element (kontekst dla asystenta) ----------
function zaznacz(sciezka, t) {
  stan.zaznaczone = { sciezka, tekst: t };
  pokazZaznaczone();
}
function pokazZaznaczone() {
  const z = stan.zaznaczone;
  $('#zaznaczone').hidden = !z;
  if (z) $('#zaznaczone-tekst').textContent = z.tekst.length > 60 ? z.tekst.slice(0, 60) + '…' : z.tekst;
}
$('#odznacz').addEventListener('click', () => {
  stan.zaznaczone = null;
  pokazZaznaczone();
});

// ---------- Asystent AI ----------
function pokazKluczAI(wymus = false) {
  const brak = !wczytajKlucz();
  $('#czat-klucz').hidden = !(brak || wymus);
}

$('#form-klucz').addEventListener('submit', (e) => {
  e.preventDefault();
  const k = $('#pole-klucz').value.trim();
  if (!k.startsWith('sk-ant-')) return komunikat('Klucz Claude zaczyna się od „sk-ant-”.');
  zapiszKlucz(k);
  $('#pole-klucz').value = '';
  pokazKluczAI();
  komunikat('Klucz zapisany. Możesz pisać do asystenta.');
});

$('#przycisk-klucz').addEventListener('click', () => {
  $('.menu').open = false;
  pokazKluczAI(true);
  $('#pole-klucz').focus();
});

function dymek(rola, tresc, dodatki) {
  const d = el('div', { class: `dymek ${rola}` }, el('p', {}, tresc), dodatki);
  $('#wiadomosci').append(d);
  d.scrollIntoView({ block: 'end', behavior: 'smooth' });
  return d;
}

function powitanie() {
  const nazwa = stan.dane.firma?.nazwa ?? stan.slug;
  dymek('asystent', `Edytujesz stronę „${nazwa}”. Kliknij tekst na podglądzie, żeby go zmienić, albo napisz mi, co zrobić, np. „dodaj usługę wymiana sprzęgła” albo „zmień kolor na granatowy”.`);
}

$('#pole-czat').addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    $('#form-czat').requestSubmit();
  }
});

$('#form-czat').addEventListener('submit', async (e) => {
  e.preventDefault();
  const prosba = $('#pole-czat').value.trim();
  if (!prosba || !stan.slug) return;
  const klucz = wczytajKlucz();
  if (!klucz) {
    pokazKluczAI(true);
    return komunikat('Najpierw wklej klucz Claude.');
  }
  $('#pole-czat').value = '';
  dymek('ja', prosba);
  const czeka = dymek('asystent czeka', 'Pracuję nad tym…');
  $('#przycisk-wyslij').disabled = true;
  try {
    const wynik = await czat(klucz, {
      yaml: zapiszYaml(stan.dane),
      prosba,
      historia: stan.historia,
      zaznaczone: stan.zaznaczone,
      lang: stan.lang,
    });
    czeka.remove();
    stan.historia.push({ rola: 'user', tekst: prosba }, { rola: 'assistant', tekst: wynik.odpowiedz });
    if (wynik.zmiany.length) {
      zapamietaj();
      const przed = zapiszYaml(stan.dane);
      for (const z of wynik.zmiany) ustaw(stan.dane, z.sciezka, z.wartosc);
      stan.dane = uporzadkuj(stan.dane);
      const zmienione = zapiszYaml(stan.dane) !== przed;
      odswiezPodglad();
      pokazJezyk();
      if (!$('#szuflada').hidden) zbudujUstawienia();
      odswiezPrzyciski();
      const widoczne = wynik.zmiany.every((z) => $('#ramka').contentDocument?.querySelector(`[data-pole="${CSS.escape(z.sciezka.replace(/\.(pl|en)$/, ''))}"]`));
      dymek(
        'asystent',
        wynik.odpowiedz,
        zmienione
          ? el('p', { class: 'drobne' },
              widoczne ? '' : 'Część zmian zobaczysz na podglądzie dopiero po zapisaniu. ',
              el('button', { type: 'button', class: 'link', onclick: () => $('#przycisk-cofnij').click() }, 'Cofnij'))
          : null,
      );
    } else dymek('asystent', wynik.odpowiedz);
  } catch (err) {
    czeka.remove();
    dymek('asystent blad', bladApi(err));
    if (/Klucz Claude/.test(bladApi(err))) pokazKluczAI(true);
  }
  $('#przycisk-wyslij').disabled = false;
});

// ---------- Ustawienia strony (kilka prostych wyborów) ----------
const WYGLADY = [
  ['spokojny', 'Spokojny'], ['czysty', 'Czysty'], ['elegancki', 'Elegancki'], ['mocny', 'Mocny'], ['rzemieslniczy', 'Rzemieślniczy'],
];
const DNI = [['pon', 'Poniedziałek'], ['wt', 'Wtorek'], ['sr', 'Środa'], ['czw', 'Czwartek'], ['pt', 'Piątek'], ['sob', 'Sobota'], ['nd', 'Niedziela']];

function zmien(sciezka, wartosc) {
  zapamietaj();
  ustaw(stan.dane, sciezka, wartosc === '' ? null : wartosc);
  stan.dane = uporzadkuj(stan.dane);
  porzucPustaZmiane();
  odswiezPodglad();
}

function kafle(nazwa, opcje, wartosc, przyZmianie) {
  return el('div', { class: 'kafle male' }, opcje.map(([v, l]) =>
    el('label', {}, el('input', { type: 'radio', name: nazwa, value: v, checked: v === wartosc, onchange: () => przyZmianie(v) }), el('span', {}, l))));
}

const pole = (etykieta, sciezka, typ = 'text', dodatki = {}) =>
  el('label', {}, etykieta, el('input', { type: typ, value: pobierz(stan.dane, sciezka) ?? '', ...dodatki, onchange: (e) => zmien(sciezka, typ === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value.trim()) }));

function zbudujUstawienia() {
  const d = stan.dane;
  const szablon = SZABLONY[d.szablon] ?? SZABLONY.gabinet;
  const grupa = (tytul, ...tresc) => el('section', { class: 'grupa' }, el('h3', {}, tytul), ...tresc);

  // Sekcje: kolejność i widoczność.
  const kolejnosc = d.sekcje ?? szablon.sekcje;
  const wszystkie = [...kolejnosc, ...SEKCJE.map((s) => s.value).filter((s) => !kolejnosc.includes(s))];
  const nazwaSekcji = Object.fromEntries(SEKCJE.map((s) => [s.value, s.label]));
  const zapiszSekcje = (lista) => zmien('sekcje', lista);
  const sekcje = el('ol', { class: 'sekcje' }, wszystkie.map((s, i) => {
    const wl = kolejnosc.includes(s);
    return el('li', { class: wl ? '' : 'wylaczona' },
      el('label', { class: 'obok' }, el('input', { type: 'checkbox', checked: wl, onchange: (e) => zapiszSekcje(e.target.checked ? [...kolejnosc, s] : kolejnosc.filter((x) => x !== s)) }), nazwaSekcji[s] ?? s),
      wl ? el('span', { class: 'strzalki' },
        el('button', { type: 'button', class: 'btn maly', disabled: i === 0, 'aria-label': 'Wyżej', onclick: () => { const l = [...kolejnosc]; [l[i - 1], l[i]] = [l[i], l[i - 1]]; zapiszSekcje(l); zbudujUstawienia(); } }, '↑'),
        el('button', { type: 'button', class: 'btn maly', disabled: i === kolejnosc.length - 1, 'aria-label': 'Niżej', onclick: () => { const l = [...kolejnosc]; [l[i + 1], l[i]] = [l[i], l[i + 1]]; zapiszSekcje(l); zbudujUstawienia(); } }, '↓')) : null);
  }));

  $('#ustawienia').replaceChildren(
    el('p', { class: 'drobne' }, 'Teksty zmieniasz, klikając je na podglądzie albo pisząc do asystenta. Zmiany wyglądu i sekcji zobaczysz w pełni po zapisaniu.'),
    grupa('Styl', kafle('u-wyglad', WYGLADY, d.wyglad ?? szablon.wyglad, (v) => zmien('wyglad', v))),
    grupa('Kolory',
      el('div', { class: 'dwa' },
        el('label', {}, 'Główny', el('input', { type: 'color', value: d.kolory?.glowny ?? szablon.kolory.glowny, oninput: (e) => { ustaw(stan.dane, 'kolory.glowny', e.target.value); odswiezPodglad(); odswiezPrzyciski(); }, onfocus: zapamietaj })),
        el('label', {}, 'Dodatkowy', el('input', { type: 'color', value: d.kolory?.akcent ?? szablon.kolory.akcent, oninput: (e) => { ustaw(stan.dane, 'kolory.akcent', e.target.value); odswiezPodglad(); odswiezPrzyciski(); }, onfocus: zapamietaj })))),
    grupa('Góra strony', kafle('u-hero', [['zdjecie', 'Duże zdjęcie'], ['podzielony', 'Tekst obok zdjęcia'], ['prosty', 'Bez zdjęcia']], d.hero?.uklad ?? szablon.hero, (v) => zmien('hero.uklad', v))),
    grupa('Przyciski', kafle('u-przyciski', [['', 'Jak w stylu'], ['okragle', 'Zaokrąglone']], d.wyglad_przyciski ?? '', (v) => zmien('wyglad_przyciski', v))),
    grupa('Języki', el('label', { class: 'obok' }, el('input', { type: 'checkbox', checked: (d.jezyki ?? ['pl']).includes('en'), onchange: (e) => { zmien('jezyki', e.target.checked ? ['pl', 'en'] : ['pl']); pokazJezyk(); } }), 'Wersja angielska (teksty EN dopisze asystent, jeśli go poprosisz)')),
    grupa('Sekcje na stronie', el('p', { class: 'drobne' }, 'Odznacz, żeby ukryć sekcję. Strzałki zmieniają kolejność. Sekcja bez treści się nie pokaże.'), sekcje),
    grupa('Kontakt', pole('Telefon', 'kontakt.telefon', 'tel'), pole('E-mail', 'kontakt.email', 'email'), el('div', { class: 'dwa' }, pole('Ulica i numer', 'kontakt.adres.ulica'), pole('Kod', 'kontakt.adres.kod')), pole('Miasto', 'kontakt.adres.miasto')),
    grupa('Godziny otwarcia', el('p', { class: 'drobne' }, 'np. 8:00-16:00, przerwa: 8:00-12:00, 13:00-17:00, wolne: zamknięte'), el('div', { class: 'godziny' }, DNI.map(([k, n]) => pole(n, `godziny.${k}`)))),
    grupa('Pasek z komunikatem', pole('Treść (puste = brak paska)', `komunikat.tekst.${stan.lang}`)),
    grupa('Opinie Google', el('div', { class: 'dwa' }, pole('Ocena', 'opinie.ocena', 'number', { step: '0.1', min: '1', max: '5' }), pole('Liczba opinii', 'opinie.liczba', 'number')), pole('Link do opinii', 'opinie.link', 'url')),
  );
}

$('#przycisk-ustawienia').addEventListener('click', () => {
  zbudujUstawienia();
  $('#szuflada').hidden = false;
});
$('#zamknij-szuflade').addEventListener('click', () => ($('#szuflada').hidden = true));

// ---------- Nowa strona ----------
const slugZNazwy = (n) => nazwaPliku(n.replace(/\.[^.]+$/, '') + '.x');
let slugRecznie = false;
$('#form-nowa').elements.nazwa.addEventListener('input', (e) => {
  if (!slugRecznie) $('#form-nowa').elements.slug.value = slugZNazwy(e.target.value);
});
$('#form-nowa').elements.slug.addEventListener('input', () => (slugRecznie = true));

$('#przycisk-nowa').addEventListener('click', () => {
  if (maZmiany() && !confirm('Masz niezapisane zmiany na obecnej stronie. Mimo to zacząć nową?')) return;
  $('#form-nowa').reset();
  slugRecznie = false;
  $('#blad-nowa').hidden = true;
  $('#okno-nowa').showModal();
});
$('#anuluj-nowa').addEventListener('click', () => $('#okno-nowa').close());

$('#form-nowa').addEventListener('submit', async (e) => {
  e.preventDefault();
  const f = e.target.elements;
  const blad = $('#blad-nowa');
  blad.hidden = true;
  const pokazBlad = (t) => {
    blad.textContent = t;
    blad.hidden = false;
  };
  const klucz = wczytajKlucz();
  if (!klucz) return pokazBlad('Nowe strony pisze asystent AI. Najpierw wklej klucz Claude w panelu asystenta (po prawej).');
  const slug = f.slug.value.trim();
  if (stan.klienci.some((k) => k.slug === slug)) return pokazBlad('Strona o takim adresie już jest. Zmień adres podglądu.');

  const przycisk = $('#utworz-nowa');
  przycisk.disabled = true;
  const status = (t) => (przycisk.textContent = t);
  try {
    status('Przygotowuję zdjęcia…');
    const zdjecia = [];
    for (const [i, plik] of [...f.zdjecia.files].entries()) zdjecia.push(await przygotujZdjecie(plik, i === 0 ? 'hero.jpg' : `zdjecie-${i}.jpg`));
    const wzor = (await stan.gh.plik(`klienci/przyklad-${f.szablon.value}/strona.yaml`))?.tekst ?? '';
    const formularz = {
      nazwa: f.nazwa.value.trim(),
      szablon: f.szablon.value,
      miasto: f.miasto.value.trim(),
      telefon: f.telefon.value.trim(),
      email: f.email.value.trim(),
      ulica: f.ulica.value.trim(),
      jezyki: f.en.checked ? ['pl', 'en'] : ['pl'],
      wyglad: f.wyglad.value || undefined,
      kolor: f['kolor-wlasny'].checked ? f.kolor.value : undefined,
      informacje: f.informacje.value.trim(),
    };
    const adresy = f.adresy.value.split(/\s+/).filter((a) => /^https?:\/\//.test(a));
    status('Asystent pisze stronę…');
    const wynik = await nowaStrona(klucz, { formularz, wzor, zdjecia: zdjecia.map((z) => z.nazwa), adresy }, (znaki) => status(`Asystent pisze stronę… (${Math.round(znaki / 100) / 10} tys. znaków)`));
    const dane = wczytajYaml(wynik.yaml);
    // Dane z formularza mają pierwszeństwo przed tym, co napisał asystent.
    Object.assign(dane, { szablon: formularz.szablon, jezyki: formularz.jezyki });
    if (formularz.wyglad) dane.wyglad = formularz.wyglad;
    if (formularz.kolor) dane.kolory = { ...dane.kolory, glowny: formularz.kolor };
    ustaw(dane, 'firma.nazwa', formularz.nazwa);
    ustaw(dane, 'kontakt.telefon', formularz.telefon);
    if (formularz.email) ustaw(dane, 'kontakt.email', formularz.email);
    if (formularz.ulica) ustaw(dane, 'kontakt.adres.ulica', formularz.ulica);
    ustaw(dane, 'kontakt.adres.miasto', formularz.miasto);
    status('Zapisuję…');
    const yaml = zapiszYaml(uporzadkuj(dane));
    await stan.gh.zapisz(
      [{ sciezka: `klienci/${slug}/strona.yaml`, tekst: yaml }, ...zdjecia.map((z) => ({ sciezka: `klienci/${slug}/zdjecia/${z.nazwa}`, base64: z.base64 }))],
      `Edytor: nowa strona ${slug}`,
    );
    $('#okno-nowa').close();
    stan.klienci.push({ slug, nazwa: formularz.nazwa });
    pokazKlientow();
    await wybierzKlienta(slug, { tekst: yaml, sha: '' });
    dymek('asystent', `Strona gotowa i zapisana. ${wynik.uwagi}`);
  } catch (err) {
    pokazBlad(bladApi(err));
  }
  przycisk.disabled = false;
  przycisk.textContent = 'Utwórz stronę';
});

// ---------- Menu ----------
$('#przycisk-wyloguj').addEventListener('click', () => {
  zapiszToken('');
  zapiszKlucz('');
  try {
    localStorage.removeItem('sveltia-cms.user');
  } catch {}
  location.reload();
});
document.addEventListener('click', (e) => {
  const menu = $('.menu');
  if (menu.open && !menu.contains(e.target)) menu.open = false;
});

start();
