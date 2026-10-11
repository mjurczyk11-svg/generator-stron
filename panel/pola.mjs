// Opis pól panelu edycji (/admin). Z tego pliku powstaje konfiguracja Sveltia CMS
// (scripts/panel.mjs) i z niego korzysta porządkowanie plików klientów (npm run porzadkuj).
// Każde pole z pliku strona.yaml, które ma być edytowalne w panelu, musi być tu opisane.

// Pola tekstowe, które mogą mieć wersję PL i EN. W pliku zapisują się jako { pl: "...", en: "..." }.
export const TEKSTY = new WeakSet();
// Sekcje, które w pliku mogą być samą listą, a w panelu zawsze mają postać { lista: [...] }.
export const LISTY_W_OBIEKCIE = new WeakSet();

export function tekst(name, label, { dlugi = false, hint } = {}) {
  const pole = {
    name,
    label,
    widget: 'object',
    required: false,
    hint,
    summary: '{{pl}}',
    fields: [
      { name: 'pl', label: 'Po polsku', widget: dlugi ? 'text' : 'string', required: false },
      { name: 'en', label: 'Po angielsku (tylko gdy strona ma wersję EN)', widget: dlugi ? 'text' : 'string', required: false },
    ],
  };
  TEKSTY.add(pole);
  return pole;
}

const napis = (name, label, o = {}) => ({ name, label, widget: 'string', required: false, ...o });
const liczba = (name, label, o = {}) => ({ name, label, widget: 'number', value_type: 'int', required: false, ...o });
const zdjecie = (name, label, o = {}) => ({ name, label, widget: 'image', required: false, choose_url: false, ...o });
const wybor = (name, label, options, o = {}) => ({ name, label, widget: 'select', options, required: false, ...o });
const obiekt = (name, label, fields, o = {}) => ({ name, label, widget: 'object', required: false, collapsed: true, fields, ...o });
const lista = (name, label, fields, o = {}) => ({ name, label, widget: 'list', required: false, collapsed: true, allow_reorder: true, fields, ...o });
const ikona = () => napis('ikona', 'Ikona', { hint: 'Nazwa ikony z [lucide.dev/icons](https://lucide.dev/icons), np. `phone`, `wrench`, `shield-check`.' });

// Sekcja z nagłówkiem, krótkim wstępem i listą pozycji.
function sekcja(name, label, polaPozycji, { summary, dodatkowe = [], hint } = {}) {
  const pole = obiekt(name, label, [
    tekst('naglowek', 'Nagłówek sekcji'),
    tekst('wstep', 'Wstęp pod nagłówkiem', { dlugi: true }),
    lista('lista', 'Pozycje (przeciągnij, aby zmienić kolejność)', polaPozycji, { summary }),
    ...dodatkowe,
  ], { hint });
  LISTY_W_OBIEKCIE.add(pole);
  return pole;
}

const kroki = (name, label) => obiekt(name, label, [
  tekst('naglowek', 'Nagłówek sekcji'),
  tekst('wstep', 'Wstęp pod nagłówkiem', { dlugi: true }),
  lista('kroki', 'Kroki', [tekst('tytul', 'Tytuł kroku'), tekst('opis', 'Opis', { dlugi: true })], { summary: '{{tytul.pl}}' }),
  tekst('uwagi', 'Uwagi pod krokami', { dlugi: true }),
]);

export const SEKCJE = [
  { value: 'uslugi', label: 'Usługi' },
  { value: 'o-nas', label: 'O nas' },
  { value: 'zespol', label: 'Zespół' },
  { value: 'pierwsza-wizyta', label: 'Pierwsza wizyta (kroki)' },
  { value: 'proces', label: 'Jak pracujemy (kroki)' },
  { value: 'cennik', label: 'Cennik' },
  { value: 'galeria', label: 'Galeria' },
  { value: 'realizacje', label: 'Realizacje (przed/po)' },
  { value: 'dlaczego-my', label: 'Dlaczego my' },
  { value: 'marki', label: 'Marki' },
  { value: 'obszar', label: 'Obszar działania' },
  { value: 'dofinansowania', label: 'Dofinansowania' },
  { value: 'opinie', label: 'Opinie' },
  { value: 'faq', label: 'Pytania (FAQ)' },
  { value: 'rezerwacja', label: 'Rezerwacja online' },
  { value: 'kontakt', label: 'Kontakt' },
];

const FIRMA = [
  obiekt('firma', 'Firma', [
    napis('nazwa', 'Nazwa firmy', { required: true }),
    napis('nazwa_prawna', 'Pełna nazwa prawna (do polityki prywatności)'),
    napis('nip', 'NIP'),
    napis('regon', 'REGON'),
    tekst('branza', 'Branża', { hint: 'np. Gabinet stomatologiczny, Mechanik samochodowy' }),
    tekst('opis', 'Opis firmy (1–2 zdania, pokazuje się w Google)', { dlugi: true }),
    tekst('opis_krotki', 'Krótki opis w stopce (opcjonalnie)'),
    zdjecie('logo', 'Logo (bez logo pokazuje się nazwa)'),
    napis('typ_schema', 'Rodzaj firmy dla Google', { hint: 'Np. Dentist, MedicalClinic, Physiotherapy, AutoRepair, GeneralContractor, HomeAndConstructionBusiness, Plumber, Electrician.' }),
    napis('przedzial_cen', 'Przedział cen dla Google (opcjonalnie)', { hint: 'np. $$' }),
  ], { collapsed: false, required: true }),

  obiekt('kontakt', 'Kontakt i adres', [
    napis('telefon', 'Telefon', { required: true, hint: 'np. +48 500 100 200' }),
    napis('email', 'E-mail'),
    obiekt('adres', 'Adres', [napis('ulica', 'Ulica i numer'), napis('kod', 'Kod pocztowy'), napis('miasto', 'Miasto')], { collapsed: false }),
    napis('mapa', 'Co wyszukać na mapie Google (opcjonalnie)', { hint: 'Zostaw puste, wtedy mapa pokaże nazwę firmy i adres.' }),
    tekst('dojazd', 'Dojazd i parking', { dlugi: true }),
    tekst('dostepnosc', 'Dostępność dla osób z niepełnosprawnościami', { dlugi: true }),
    tekst('godziny_uwaga', 'Uwaga pod godzinami otwarcia'),
    obiekt('social', 'Media społecznościowe (pełne adresy)', [
      napis('facebook', 'Facebook'), napis('instagram', 'Instagram'), napis('tiktok', 'TikTok'), napis('youtube', 'YouTube'), napis('google', 'Wizytówka Google'),
    ]),
  ], { collapsed: false, required: true }),

  obiekt('godziny', 'Godziny otwarcia', [
    napis('pon', 'Poniedziałek'), napis('wt', 'Wtorek'), napis('sr', 'Środa'), napis('czw', 'Czwartek'),
    napis('pt', 'Piątek'), napis('sob', 'Sobota'), napis('nd', 'Niedziela'),
  ], { hint: 'Wpisuj tak: 8:00-16:00. Przerwa: 8:00-12:00, 13:00-17:00. Dzień wolny: zamknięte.' }),

  obiekt('komunikat', 'Pasek z komunikatem na górze strony (opcjonalnie)', [
    tekst('tekst', 'Treść komunikatu', { hint: 'Zostaw puste, aby ukryć pasek.' }),
    napis('link', 'Link po kliknięciu (opcjonalnie)'),
  ]),

];

// Ustawienia wyglądu i układu strony.
const WYGLAD = [
  wybor('szablon', 'Rodzaj strony', [
    { value: 'gabinet', label: 'Gabinet (lekarz, dentysta, fizjoterapeuta)' },
    { value: 'warsztat', label: 'Warsztat samochodowy' },
    { value: 'remonty', label: 'Remonty i instalacje' },
  ], { required: true }),
  wybor('wyglad', 'Styl wyglądu', [
    { value: 'spokojny', label: 'Spokojny' },
    { value: 'czysty', label: 'Czysty' },
    { value: 'elegancki', label: 'Elegancki' },
    { value: 'mocny', label: 'Mocny' },
    { value: 'rzemieslniczy', label: 'Rzemieślniczy' },
  ]),
  obiekt('kolory', 'Kolory', [
    { name: 'glowny', label: 'Kolor główny (przyciski, akcenty)', widget: 'color', required: false },
    { name: 'akcent', label: 'Kolor dodatkowy (detale)', widget: 'color', required: false },
  ], { collapsed: false }),
  wybor('wyglad_przyciski', 'Kształt przycisków', [{ value: 'okragle', label: 'Zaokrąglone' }], { hint: 'Puste = jak w stylu wyglądu.' }),
  wybor('jezyki', 'Języki strony', [{ value: 'pl', label: 'Polski' }, { value: 'en', label: 'Angielski' }], { multiple: true, required: true, default: ['pl'] }),
  napis('domena', 'Docelowy adres strony', { hint: 'np. https://www.firma.pl (może zostać puste do czasu publikacji)', pattern: ['^(https://.+)?$', 'Adres musi zaczynać się od https://'] }),
  {
    name: 'sekcje',
    label: 'Sekcje i ich kolejność',
    widget: 'list',
    required: false,
    allow_reorder: true,
    hint: 'Przeciągnij, aby zmienić kolejność. Usuń pozycję, aby ukryć sekcję. Gdy lista jest pusta, strona używa kolejności z szablonu. Sekcja bez treści i tak się nie pokaże.',
    field: wybor('sekcja', 'Sekcja', SEKCJE, { required: true }),
  },
];

const HERO = [
  obiekt('hero', 'Góra strony (pierwszy ekran)', [
    tekst('etykieta', 'Mały napis nad tytułem', { hint: 'np. Gabinet stomatologiczny · Radom' }),
    tekst('tytul', 'Główny tytuł'),
    tekst('podtytul', 'Tekst pod tytułem', { dlugi: true }),
    zdjecie('zdjecie', 'Zdjęcie główne'),
    wybor('uklad', 'Układ', [
      { value: 'zdjecie', label: 'Zdjęcie na całą szerokość' },
      { value: 'podzielony', label: 'Tekst obok zdjęcia' },
      { value: 'prosty', label: 'Bez zdjęcia' },
    ]),
  ], { collapsed: false }),
  tekst('cta', 'Napis na głównym przycisku', { hint: 'Puste = domyślny dla szablonu (np. Umów wizytę).' }),
  lista('wyrozniki', 'Wyróżniki pod przyciskami (2–4 krótkie hasła)', [ikona(), tekst('tekst', 'Tekst')], { summary: '{{tekst.pl}}' }),
];

const SEKCJE_POLA = [
  sekcja('uslugi', 'Usługi', [
    tekst('nazwa', 'Nazwa usługi'),
    tekst('opis', 'Opis', { dlugi: true }),
    ikona(),
    zdjecie('zdjecie', 'Zdjęcie (pokazuje się w stylu „ze zdjęciami”)'),
    liczba('cena', 'Cena od (zł, opcjonalnie)'),
  ], {
    summary: '{{nazwa.pl}}',
    dodatkowe: [wybor('styl', 'Wygląd listy usług', [
      { value: 'kafelki', label: 'Kafelki z ikonami' },
      { value: 'lista', label: 'Lista' },
      { value: 'zdjecia', label: 'Ze zdjęciami' },
    ], { hint: 'Puste = domyślny dla szablonu.' })],
  }),

  obiekt('o_nas', 'O nas', [
    tekst('naglowek', 'Nagłówek sekcji'),
    tekst('tekst', 'Tekst (pusty wiersz = nowy akapit)', { dlugi: true }),
    zdjecie('zdjecie', 'Zdjęcie'),
    tekst('zdjecie_opis', 'Opis zdjęcia (dla niewidomych i Google)'),
    lista('liczby', 'Liczby (np. 15 lat doświadczenia)', [napis('wartosc', 'Liczba'), tekst('opis', 'Opis')], { summary: '{{wartosc}} {{opis.pl}}' }),
  ]),

  sekcja('zespol', 'Zespół', [
    napis('imie', 'Imię i nazwisko'),
    tekst('rola', 'Stanowisko / specjalizacja'),
    tekst('opis', 'Opis', { dlugi: true }),
    zdjecie('zdjecie', 'Zdjęcie'),
  ], { summary: '{{imie}}' }),

  kroki('pierwsza_wizyta', 'Pierwsza wizyta (kroki)'),
  kroki('proces', 'Jak pracujemy (kroki)'),

  obiekt('cennik', 'Cennik', [
    tekst('naglowek', 'Nagłówek sekcji'),
    tekst('wstep', 'Wstęp', { dlugi: true }),
    lista('kategorie', 'Kategorie', [
      tekst('nazwa', 'Nazwa kategorii'),
      lista('pozycje', 'Pozycje', [tekst('nazwa', 'Nazwa'), liczba('cena', 'Cena (zł)')], { summary: '{{nazwa.pl}}: {{cena}} zł' }),
    ], { summary: '{{nazwa.pl}}' }),
    { name: 'od', label: 'Pisz „od” przed ceną', widget: 'boolean', required: false, default: true },
    tekst('uwaga', 'Uwaga pod cennikiem', { dlugi: true }),
  ]),

  sekcja('galeria', 'Galeria', [
    zdjecie('plik', 'Zdjęcie'),
    tekst('opis', 'Opis'),
    tekst('kategoria', 'Kategoria (opcjonalnie, do filtrów)'),
  ], { summary: '{{opis.pl}}' }),

  sekcja('realizacje', 'Realizacje', [
    tekst('tytul', 'Tytuł'),
    napis('miejscowosc', 'Miejscowość'),
    tekst('czas', 'Czas realizacji', { hint: 'np. 3 tygodnie' }),
    tekst('kategoria', 'Kategoria', { hint: 'np. Łazienki' }),
    tekst('opis', 'Opis', { dlugi: true }),
    zdjecie('przed', 'Zdjęcie PRZED (z suwakiem przed/po)'),
    zdjecie('po', 'Zdjęcie PO'),
    { name: 'zdjecia', label: 'Albo zwykłe zdjęcia (bez suwaka)', widget: 'image', multiple: true, required: false, choose_url: false },
  ], { summary: '{{tytul.pl}}' }),

  sekcja('dlaczego_my', 'Dlaczego my', [ikona(), tekst('tytul', 'Tytuł'), tekst('opis', 'Opis', { dlugi: true })], { summary: '{{tytul.pl}}' }),

  obiekt('marki', 'Marki', [
    tekst('naglowek', 'Nagłówek sekcji'),
    tekst('wstep', 'Wstęp', { dlugi: true }),
    { name: 'lista', label: 'Marki (przeciągnij, aby zmienić kolejność)', widget: 'list', required: false },
    tekst('uwaga', 'Uwaga pod listą'),
  ]),

  obiekt('obszar', 'Obszar działania', [
    tekst('naglowek', 'Nagłówek sekcji'),
    tekst('wstep', 'Wstęp', { dlugi: true }),
    tekst('tekst', 'Tekst', { dlugi: true }),
    { name: 'miejscowosci', label: 'Miejscowości', widget: 'list', required: false },
  ]),

  obiekt('dofinansowania', 'Dofinansowania', [
    tekst('naglowek', 'Nagłówek sekcji'),
    tekst('tekst', 'Tekst (pusty wiersz = nowy akapit)', { dlugi: true }),
    { name: 'punkty', label: 'Punkty', widget: 'list', required: false, allow_reorder: true, field: tekst('punkt', 'Punkt') },
  ]),

  obiekt('opinie', 'Opinie', [
    tekst('naglowek', 'Nagłówek sekcji'),
    { name: 'ocena', label: 'Średnia ocena (np. 4.9)', widget: 'number', value_type: 'float', step: 0.1, min: 1, max: 5, required: false },
    liczba('liczba', 'Liczba opinii'),
    napis('zrodlo', 'Źródło opinii', { hint: 'np. Google' }),
    napis('link', 'Link do opinii'),
    lista('lista', 'Cytaty z opinii', [napis('autor', 'Autor'), tekst('tekst', 'Treść', { dlugi: true })], { summary: '{{autor}}' }),
  ]),

  sekcja('faq', 'Pytania (FAQ)', [tekst('pytanie', 'Pytanie'), tekst('odpowiedz', 'Odpowiedź', { dlugi: true })], { summary: '{{pytanie.pl}}' }),

  obiekt('rezerwacja', 'Rezerwacja online', [
    wybor('typ', 'Sposób', [{ value: 'link', label: 'Przycisk z linkiem' }, { value: 'ramka', label: 'Kalendarz wbudowany w stronę' }]),
    napis('url', 'Adres strony rezerwacji', { hint: 'np. profil w ZnanyLekarz, Booksy' }),
    { name: 'kod', label: 'Albo kod widżetu (wklej z serwisu rezerwacji)', widget: 'text', required: false },
    tekst('naglowek', 'Nagłówek sekcji'),
    tekst('wstep', 'Tekst', { dlugi: true }),
    tekst('przycisk', 'Napis na przycisku'),
  ]),

  obiekt('formularz', 'Formularz kontaktowy', [
    wybor('typ', 'Rodzaj formularza', [
      { value: 'kontakt', label: 'Zwykły kontakt' },
      { value: 'termin', label: 'Prośba o termin wizyty' },
      { value: 'warsztat', label: 'Warsztat (marka, model, zdjęcia)' },
      { value: 'wycena', label: 'Wycena prac (zakres, zdjęcia)' },
    ]),
    tekst('tytul', 'Tytuł formularza (opcjonalnie)'),
    wybor('dostawca', 'Obsługa formularza', [{ value: 'netlify', label: 'Netlify' }, { value: 'web3forms', label: 'Web3Forms' }]),
    napis('klucz', 'Klucz Web3Forms (tylko przy Web3Forms)'),
  ]),

  obiekt('seo', 'Google (SEO)', [
    tekst('tytul', 'Tytuł w Google', { hint: 'Usługa + miasto + nazwa, np. Dentysta Radom – Dentica' }),
    tekst('opis', 'Opis w Google (puste = opis firmy)', { dlugi: true }),
    zdjecie('zdjecie', 'Obrazek przy udostępnianiu (puste = zdjęcie główne)'),
  ]),
];

// Pełna lista pól pliku strona.yaml w kolejności, w jakiej pokazuje je panel.
export const FIELDS = [
  ...FIRMA,
  ...WYGLAD,
  ...HERO,
  ...SEKCJE_POLA,
];
