# Generator stron: instrukcja dla Claude

Właściciel (Michał) nie programuje i pisze po polsku. Odpowiadaj po polsku, prostym językiem, bez żargonu.

## Jak zbudowana jest strona klienta

- Astro 5, strona statyczna. Dane klienta: `klienci/<slug>/strona.yaml`, zdjęcia: `klienci/<slug>/zdjecia/`.
- `src/lib/dane.ts` wczytuje plik klienta (zmienna `KLIENT`) i łączy go z ustawieniami szablonu z `src/lib/szablony.ts`.
- Sekcje w `src/sekcje/`, wspólne elementy w `src/components/`, style w `src/styles/globalne.css` (kolory i czcionki jako zmienne CSS z `src/layouts/Uklad.astro`).
- Napisy interfejsu PL/EN: `src/lib/teksty.ts`. Teksty klienta mogą być stringiem albo `{ pl, en }`.
- Ikony: nazwy z https://lucide.dev/icons albo własne SVG w `src/ikony/`.
- `scripts/build.mjs`: bez `KLIENT` buduje wszystkich do `dist/<slug>/` z `noindex` (podgląd); z `KLIENT` buduje jedną stronę do `dist/`.

## Nowy klient (typowy przebieg)

1. Zbierz dane ze starej strony i z wizytówki Google: nazwa, adres, telefon, e-mail, godziny, usługi, opinie (ocena, liczba, 3 cytaty), zdjęcia, NIP.
2. `npm run nowy -- <slug> <gabinet|warsztat|remonty>` i wypełnij `strona.yaml`. Teksty pisz od nowa: krótkie zdania, konkret, miasto w tytule i nagłówku.
3. Gabinety lekarskie i stomatologiczne: zakaz reklamy (Kodeks Etyki Lekarskiej, art. 63). Tylko informacja, bez „najlepszy”, promocji i rabatów. Tak samo spokojnie piszemy dla fizjoterapeutów.
4. Teksty w nawiasach `{ }` z przecinkiem albo dwukropkiem zawsze w cudzysłowie.
5. `npm run sprawdz -- <slug>`, potem `KLIENT=<slug> npm run build` i sprawdź wygląd na telefonie i komputerze.
6. Wypchnij zmiany. Podgląd dla klienta: `<adres podglądu>/<slug>/`.

Wymagania per nisza: `/mnt/project-files/nisze/nisze-i-wymagania.md` (w projekcie Claude).
