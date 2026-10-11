// Asystent AI (Claude) w edytorze: zmiany na stronie z czatu i nowe strony z krótkiego formularza.
// Klucz API Claude jest zapisany tylko w tej przeglądarce i wysyłany prosto do Anthropic.
import Anthropic from '@anthropic-ai/sdk';
import { opisPol } from './dane.js';

const MODEL = 'claude-opus-5-5';

export function wczytajKlucz() {
  try {
    return localStorage.getItem('edytor.claude') || '';
  } catch {
    return '';
  }
}
export function zapiszKlucz(klucz) {
  try {
    if (klucz) localStorage.setItem('edytor.claude', klucz);
    else localStorage.removeItem('edytor.claude');
  } catch {}
}

const klient = (klucz) => new Anthropic({ apiKey: klucz, dangerouslyAllowBrowser: true, maxRetries: 2 });

// Przy odmowie modelu API samo spróbuje modelu zapasowego.
const ZAPAS = { betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' };

const ZASADY = `Zasady pisania tekstów:
- Po polsku, prostym językiem, krótkie zdania, konkret. Miasto w tytule strony i w nagłówku.
- Gabinety lekarskie, stomatologiczne i fizjoterapia: zakaz reklamy (Kodeks Etyki Lekarskiej, art. 63). Tylko informacja: bez „najlepszy”, superlatywów, promocji i rabatów.
- Nie wymyślaj faktów o firmie (cen, lat działania, nazwisk, opinii, certyfikatów). Jeśli czegoś brakuje, zostaw pole puste albo napisz to ogólnie.
- Teksty mają postać {"pl": "...", "en": "..."}. Wersję "en" wypełniaj tylko, gdy strona ma język en w polu "jezyki".
- Ikony to nazwy z lucide.dev/icons (np. "phone", "wrench", "shield-check", "clock", "sparkles").
- Godziny zapisuj jak "8:00-16:00", przerwa "8:00-12:00, 13:00-17:00", dzień wolny "zamknięte".
- Pole "sekcje" to kolejność sekcji (gdy go brak, strona używa kolejności z szablonu). Możliwe sekcje: uslugi, o-nas, zespol, pierwsza-wizyta, proces, cennik, galeria, realizacje, dlaczego-my, marki, obszar, dofinansowania, opinie, faq, rezerwacja, kontakt.`;

const SYSTEM_CZAT = `Pomagasz Michałowi zmieniać strony internetowe jego klientów. Michał nie programuje i pisze po polsku.
Każda strona jest opisana jednym plikiem danych (YAML). Dostajesz aktualne dane strony i prośbę Michała. Odpowiadasz listą zmian w danych i krótką odpowiedzią dla Michała.

Pola pliku (ścieżka — opis):
${opisPol()}

Jak opisywać zmiany:
- Każda zmiana to "sciezka" (kropki, pozycje list numerowane od 0, np. "uslugi.lista.2.opis.pl") i "wartosc_json" (wartość zapisana jako JSON, np. "\\"Nowy tytuł\\"", "4.9", "[\\"pl\\", \\"en\\"]", "{\\"pl\\": \\"Tekst\\"}").
- Zmiana tylko polskiego tekstu: ścieżka kończy się na ".pl". Tylko angielskiego: ".en".
- Nowa pozycja listy: ścieżka z numerem równym długości listy (np. lista ma 3 pozycje, więc "faq.lista.3") i cała pozycja jako obiekt JSON.
- Usunięcie pola albo pozycji listy: "wartosc_json": "null". Usuwając kilka pozycji z jednej listy, podawaj je od najwyższego numeru.
- Przestawienie pozycji: zastąp całą listę (np. ścieżka "uslugi.lista" z nową listą).
- Gdy Michał wskazuje kliknięty element, zmiana dotyczy zwykle właśnie jego.
- Jeśli prośba jest niejasna albo nie da się jej spełnić danymi (np. zmiana układu, którego szablon nie ma), nie zmieniaj nic i wyjaśnij krótko, co można zrobić zamiast tego.
- Zdjęć nie wymyślaj: Michał wgrywa je, klikając zdjęcie na podglądzie.

${ZASADY}

"odpowiedz": 1–2 zdania po polsku, co zmieniłeś (bez ścieżek i nazw pól). Przypomnij o przycisku „Zapisz”, gdy coś zmieniłeś.`;

const SCHEMAT_CZAT = {
  type: 'object',
  properties: {
    odpowiedz: { type: 'string' },
    zmiany: {
      type: 'array',
      items: {
        type: 'object',
        properties: { sciezka: { type: 'string' }, wartosc_json: { type: 'string' } },
        required: ['sciezka', 'wartosc_json'],
        additionalProperties: false,
      },
    },
  },
  required: ['odpowiedz', 'zmiany'],
  additionalProperties: false,
};

function tekstOdpowiedzi(msg) {
  if (msg.stop_reason === 'refusal') throw new Error('Asystent odmówił wykonania tej prośby. Spróbuj ją sformułować inaczej.');
  if (msg.stop_reason === 'max_tokens') throw new Error('Odpowiedź była za długa. Podziel prośbę na mniejsze części.');
  const t = msg.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
  try {
    return JSON.parse(t);
  } catch {
    throw new Error('Asystent zwrócił niepoprawną odpowiedź. Spróbuj jeszcze raz.');
  }
}

export function bladApi(e) {
  if (e instanceof Anthropic.AuthenticationError) return 'Klucz Claude jest nieprawidłowy. Wklej go jeszcze raz (przycisk „Klucz AI”).';
  if (e instanceof Anthropic.PermissionDeniedError) return 'Ten klucz Claude nie ma dostępu. Sprawdź go na console.anthropic.com.';
  if (e instanceof Anthropic.RateLimitError) return 'Za dużo zapytań naraz. Poczekaj chwilę i spróbuj ponownie.';
  if (e instanceof Anthropic.BadRequestError && /credit|billing|balance/i.test(e.message)) return 'Na koncie Claude skończyły się środki. Doładuj je na console.anthropic.com (Billing).';
  if (e instanceof Anthropic.APIConnectionError) return 'Brak połączenia z Claude. Sprawdź internet i spróbuj ponownie.';
  if (e instanceof Anthropic.APIError) return `Błąd Claude (${e.status}). Spróbuj ponownie za chwilę.`;
  return e?.message || String(e);
}

// historia: [{ rola: 'user'|'assistant', tekst }]. Zwraca { odpowiedz, zmiany: [{ sciezka, wartosc }] }.
export async function czat(klucz, { yaml, prosba, historia, zaznaczone, lang }) {
  const kontekst = [
    `Aktualne dane strony (YAML):\n\`\`\`yaml\n${yaml}\n\`\`\``,
    `Michał ogląda wersję językową: ${lang}.`,
    zaznaczone ? `Kliknięty element na podglądzie: ${zaznaczone.sciezka} (obecny tekst: "${zaznaczone.tekst}").` : '',
    `Prośba Michała: ${prosba}`,
  ].filter(Boolean).join('\n\n');
  const messages = [
    ...historia.slice(-12).map((h) => ({ role: h.rola, content: h.tekst })),
    { role: 'user', content: kontekst },
  ];
  const msg = await klient(klucz).beta.messages.create({
    model: MODEL,
    max_tokens: 16000,
    system: [{ type: 'text', text: SYSTEM_CZAT, cache_control: { type: 'ephemeral' } }],
    messages,
    output_config: { effort: 'medium', format: { type: 'json_schema', schema: SCHEMAT_CZAT } },
    ...ZAPAS,
  });
  const wynik = tekstOdpowiedzi(msg);
  const zmiany = [];
  for (const z of wynik.zmiany ?? []) {
    try {
      zmiany.push({ sciezka: z.sciezka, wartosc: JSON.parse(z.wartosc_json) });
    } catch {
      // Pomijamy zmianę, której wartości nie da się odczytać.
    }
  }
  return { odpowiedz: wynik.odpowiedz, zmiany };
}

const SYSTEM_NOWA = `Tworzysz dane nowej strony internetowej firmy (plik YAML) na podstawie krótkiego formularza od Michała, informacji, które wkleił, i (jeśli podano adresy) starej strony firmy lub jej wizytówki Google.
Dostajesz wzór: plik przykładowej strony z tej samej branży. Zachowaj jego budowę (te same pola i sekcje), ale wszystkie treści napisz od nowa dla tej firmy.

Pola pliku (ścieżka — opis):
${opisPol()}

${ZASADY}
- Dane kontaktowe, godziny, usługi, ceny i opinie bierz tylko z informacji od Michała albo ze stron, które pobrałeś. Sekcje, do których nie ma danych (np. zespół, cennik, opinie), usuń z pliku, zamiast je zmyślać.
- Opinie: tylko prawdziwe cytaty z podanych źródeł, z oceną i liczbą opinii, jeśli są znane.
- Zdjęcia: używaj wyłącznie nazw plików z listy wgranych zdjęć. Pierwsze zdjęcie to zdjęcie główne (hero.zdjecie). Gdy zdjęć nie ma, pomiń pola zdjęć.
- "domena" zostaw pustą. "formularz.dostawca": netlify.

Zwróć: "yaml" — kompletny plik YAML (teksty zawsze jako {pl: ..., en: ...}, sekcje-listy jako {lista: [...]}), "uwagi" — 1–3 zdania po polsku dla Michała: czego brakowało i co warto uzupełnić.`;

const SCHEMAT_NOWA = {
  type: 'object',
  properties: { yaml: { type: 'string' }, uwagi: { type: 'string' } },
  required: ['yaml', 'uwagi'],
  additionalProperties: false,
};

// Tworzy dane nowej strony. formularz: pola z okna „Nowa strona”, wzor: YAML przykładu z branży.
export async function nowaStrona(klucz, { formularz, wzor, zdjecia, adresy }, postep) {
  const opis = [
    `Wzór (przykładowa strona z branży "${formularz.szablon}"):\n\`\`\`yaml\n${wzor}\n\`\`\``,
    `Dane z formularza:\n${JSON.stringify(formularz, null, 2)}`,
    `Wgrane zdjęcia: ${zdjecia.length ? zdjecia.join(', ') : 'brak'}`,
    adresy.length ? `Pobierz i wykorzystaj te strony: ${adresy.join(' ')}` : '',
  ].filter(Boolean).join('\n\n');
  const narzedzia = adresy.length ? [{ type: 'web_fetch_20260209', name: 'web_fetch', max_uses: 6 }] : undefined;
  const messages = [{ role: 'user', content: opis }];
  const c = klient(klucz);
  for (let tura = 0; tura < 4; tura++) {
    const strumien = c.beta.messages.stream({
      model: MODEL,
      max_tokens: 64000,
      system: SYSTEM_NOWA,
      messages,
      ...(narzedzia ? { tools: narzedzia } : {}),
      output_config: { effort: 'medium', format: { type: 'json_schema', schema: SCHEMAT_NOWA } },
      ...ZAPAS,
    });
    let znaki = 0;
    strumien.on('text', (t) => {
      znaki += t.length;
      postep?.(znaki);
    });
    const msg = await strumien.finalMessage();
    if (msg.stop_reason === 'pause_turn') {
      // Pobieranie stron trwało długo: kontynuujemy tę samą odpowiedź.
      messages.push({ role: 'assistant', content: msg.content });
      continue;
    }
    return tekstOdpowiedzi(msg);
  }
  throw new Error('Tworzenie strony trwało za długo. Spróbuj ponownie bez adresów stron.');
}
