# Generator stron dla klientów

Jedno repozytorium, z którego powstają strony-wizytówki dla wielu firm. Każdy klient to jeden folder w `klienci/` z plikiem `strona.yaml` (wszystkie teksty i dane) i folderem `zdjecia/`.

## Szablony (nisze)

| Szablon | Dla kogo | Główny przycisk | Formularz |
|---|---|---|---|
| `gabinet` | dentyści, fizjoterapeuci, psycholodzy | Umów wizytę | prośba o termin |
| `warsztat` | mechanicy, wulkanizacja, blacharstwo | Umów wizytę | marka, model, rok, opis, zdjęcia |
| `remonty` | remonty, łazienki, instalatorzy | Bezpłatna wycena | rodzaj prac, miejscowość, zakres, zdjęcia |

Wygląd zmieniasz polem `wyglad` (`spokojny`, `czysty`, `elegancki`, `mocny`, `rzemieslniczy`) i kolorami w `kolory`. Kolejność i zestaw sekcji ustawia pole `sekcje` (domyślnie zależy od szablonu). Sekcja bez treści sama znika.

Przykłady (zmyślone firmy): `klienci/przyklad-gabinet`, `klienci/przyklad-warsztat`, `klienci/przyklad-remonty`. Plik `przyklad-gabinet/strona.yaml` ma opis każdego pola.

## Co ma każda strona

- wersja na telefon ze stałym paskiem „Zadzwoń” i głównym przyciskiem,
- sekcja główna z oceną Google, wyróżnikami i godzinami otwarcia,
- usługi, o nas, zespół, cennik, galeria z powiększaniem, realizacje z suwakiem przed/po, opinie, FAQ, rezerwacja online, kontakt,
- godziny z informacją „Teraz otwarte / zamknięte”, przycisk „Nawiguj”, mapa Google ładowana po kliknięciu,
- formularz z ochroną przed spamem, zgodą RODO i klauzulą informacyjną,
- polityka prywatności generowana z danych firmy, strona „Dziękujemy”,
- SEO: tytuł z usługą i miastem, dane strukturalne dla Google (firma lokalna + FAQ), mapa strony, robots, favicon, obrazek do udostępniania,
- język polski i opcjonalnie angielski (przełącznik PL/EN),
- zdjęcia automatycznie zmniejszane i zapisywane w nowoczesnym formacie.

## Polecenia

```
npm install                                   # raz, na początku
npm run nowy -- nazwa-klienta gabinet         # nowy klient z przykładu niszy
npm run sprawdz                               # sprawdza pliki klientów i wypisuje, co poprawić
npm run build                                 # buduje podgląd wszystkich klientów: dist/<klient>/
KLIENT=nazwa-klienta npm run build            # buduje jedną stronę klienta do dist/
KLIENT=nazwa-klienta npm run dev              # podgląd na żywo podczas edycji
```

## Publikacja (Netlify)

1. **Podgląd dla klientów:** jedna strona na Netlify podpięta do tego repozytorium, bez dodatkowych ustawień. Każdy klient ma adres `https://<podglad>.netlify.app/<nazwa-klienta>/`. Podgląd jest ukryty przed Google.
2. **Strona klienta po akceptacji:** nowa strona na Netlify z tego samego repozytorium, ze zmienną środowiskową `KLIENT=<nazwa-klienta>`, i podpięta domena klienta.
3. **Formularze:** w ustawieniach strony na Netlify włącz „Form detection” i w „Form notifications” dodaj e-mail klienta. Netlify obsługuje też załączane zdjęcia.

Vercel też działa (`vercel.json`), ale tam formularz musi iść przez Web3Forms (`formularz: dostawca: web3forms` i `klucz`), bez załączników.
