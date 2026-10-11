# Generator stron: instrukcja dla Claude

Właściciel (Michał) nie programuje i pisze po polsku. Odpowiadaj po polsku, prostym językiem, bez żargonu.

## Jak zbudowana jest strona klienta

- Astro 5, strona statyczna. Dane klienta: `klienci/<slug>/strona.yaml`, zdjęcia: `klienci/<slug>/zdjecia/`.
- `src/lib/dane.ts` wczytuje plik klienta (zmienna `KLIENT`) i łączy go z ustawieniami szablonu z `src/lib/szablony.ts`.
- Sekcje w `src/sekcje/`, wspólne elementy w `src/components/`, style w `src/styles/globalne.css` (kolory i czcionki jako zmienne CSS z `src/layouts/Uklad.astro`).
- Napisy interfejsu PL/EN: `src/lib/teksty.ts`. Teksty klienta mogą być stringiem albo `{ pl, en }`.
- Ikony: nazwy z https://lucide.dev/icons albo własne SVG w `src/ikony/`.
- `scripts/build.mjs`: bez `KLIENT` buduje wszystkich do `dist/<slug>/` z `noindex` (podgląd) i panel edycji do `dist/admin/`; z `KLIENT` buduje jedną stronę do `dist/` (bez panelu).

## Panel edycji (/admin)

- Michał edytuje strony w panelu `<adres podglądu>/admin/` (Sveltia CMS, logowanie tokenem GitHub). Panel zapisuje zmiany prosto do gałęzi `main`, Netlify przebudowuje podgląd.
- Pola panelu opisuje `panel/pola.mjs`. Nowe pole w `strona.yaml` = dopisz je też tam, inaczej Michał go nie zobaczy w panelu.
- Panel wymaga tekstów zawsze w postaci `{ pl: "...", en: "..." }` (także na stronach tylko po polsku) i sekcji-list jako `{ lista: [...] }`. Po ręcznej edycji plików klienta uruchom `npm run porzadkuj`; `npm run sprawdz` zgłasza pliki, które tego wymagają.
- Przed własnymi zmianami w `klienci/` pobierz najnowszy `main`, bo Michał mógł coś zmienić w panelu.

## Nowy klient (typowy przebieg)

1. Zbierz dane ze starej strony i z wizytówki Google: nazwa, adres, telefon, e-mail, godziny, usługi, opinie (ocena, liczba, 3 cytaty), zdjęcia, NIP.
2. `npm run nowy -- <slug> <gabinet|warsztat|remonty>` i wypełnij `strona.yaml`. Teksty pisz od nowa: krótkie zdania, konkret, miasto w tytule i nagłówku.
3. Gabinety lekarskie i stomatologiczne: zakaz reklamy (Kodeks Etyki Lekarskiej, art. 63). Tylko informacja, bez „najlepszy”, promocji i rabatów. Tak samo spokojnie piszemy dla fizjoterapeutów.
4. Teksty w nawiasach `{ }` z przecinkiem albo dwukropkiem zawsze w cudzysłowie.
5. `npm run porzadkuj -- <slug>`, `npm run sprawdz -- <slug>`, potem `KLIENT=<slug> npm run build` i sprawdź wygląd na telefonie i komputerze.
6. Wypchnij zmiany. Podgląd dla klienta: `<adres podglądu>/<slug>/`.

Wymagania per nisza: `/mnt/project-files/nisze/nisze-i-wymagania.md` (w projekcie Claude).
