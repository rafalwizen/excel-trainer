# Autoring lekcji

Lekcje to zwykłe moduły TS w `src/content/lessons/`, walidowane schematem zod
oraz invariantami **przy każdym buildzie** — błędna treść psuje build, a nie
sesję użytkownika. Dodanie lekcji = jeden plik + wpis w tablicy `rawLessons`
w `src/content/lessons/index.ts` (kolejność tablicy = kolejność w katalogu).

## Struktura lekcji

```ts
import { workbook, type Lesson } from "../schema";

export const mojaLekcjaLesson: Lesson = {
  slug: "moja-lekcja",            // wyłącznie [a-z0-9-]; NIE zmieniamy slugów istniejących lekcji (klucz postępu w DB)
  title: "Tytuł widoczny w katalogu",
  shortDescription: "1–2 zdania: co robi użytkownik i na jakich danych.",
  category: "Formuły i funkcje",   // wyłącznie wartości z CATEGORIES (src/content/categories.ts)
  difficulty: 2,                   // 1 Podstawowy | 2 Średniozaawansowany | 3 Zaawansowany
  learningGoals: [                 // 3–6 konkretnych umiejętności ("Czego się nauczysz")
    "Warunek walidacji: min. 8 znaków na cel",
  ],
  estimatedMinutes: 25,            // d1: 15–20, d2: 20–30, d3: 25–40
  prerequisites: ["inna-lekcja"],  // opcjonalnie, max 3; slug musi istnieć (registry to sprawdza)
  tasks: [ /* 3–5 zadań */ ],
};
```

## Zadanie

- `initialWorkbook` zadania N powinno zaczynać się od stanu po zadaniu N-1.
  Formuły z poprzednich zadań wstawiaj przez pole `f:` (patrz
  `adresowanie-wzgledne-bezwzgledne.ts`).
- Arkusz buduj helperem `workbook(name, rowCount, columnCount, cellData)`
  (wspólny przypadek: jeden arkusz). Lekcje wieloarkuszowe: `sheets: [...]`,
  max 3 arkusze.
- Współdzielona tabela bazowa w obrębie lekcji = factory-helper **w pliku lekcji**
  (wzorzec: `priceTable()` w `formuly-podstawowe.ts`). Nie buduj wspólnych
  helperów między lekcjami — lekcje mają być samowystarczalne i czytelne w diffie.
- Wymiary: ≤200 wierszy × ≤26 kolumn (typowo 12–40 wierszy).
- `hints`: maks. 3, o rosnącej szczegółowości.
- Instrukcje: mini-markdown — `**pogrubienie**`, `` `kod` ``, listy `- `.
  Liczby dziesiętne z kropką: `0.23`.

### Nazwy funkcji — KONWENCJA KRYTYCZNA

Silnik formuł Univer liczy **wyłącznie angielskie nazwy funkcji**
(`=SUMA()` → `#NAME?`). Zasady:

- w instrukcjach i podpowiedziach ucz angielskiej nazwy z dopiskiem
  „(W polskim Excelu: **SUMA**)",
- w każdej lekcji formułowej jedna wczesna podpowiedź przypomina, że ten
  arkusz liczy angielskie nazwy,
- `aliases`/`mustInclude` w checkach pisz po angielsku — normalizator
  i tak zamieni polskie aliasy wpisane przez użytkownika
  (patrz `src/lib/validators/normalize.ts`).

## Checki (src/content/schema.ts)

| Rodzaj | Kiedy | Uwagi |
|---|---|---|
| `cellValue` | wartość jednej komórki | liczby porównywane z `tolerance` |
| `cellFormula` | wymagana formuła | **zawsze paruj z `cellValue`** — daje czytelny komunikat przy `#NAME?` |
| `rangeValues` | cały zakres w kolejności | `null` = komórka ma być pusta |
| `rangeFilled` | liczba wypełnionych komórek | |
| `cellStyle` | formatowanie (pogrubienie, kursywa, wypełnienie, format liczbowy) | wymaga ≥1 warunku (invariant); paruj z `cellValue` |
| `rangeValuesUnordered` | zbiór wartości bez kolejności | długość = rozmiar zakresu |
| `sheetExists` | użytkownik ma utworzyć arkusz | nazwa NIE może istnieć w stanie początkowym (invariant) |

`check.sheet` (opcjonalne) musi wskazywać arkusz z `initialWorkbook.sheets`
— domyślnie pierwszy arkusz.

## Dane i treść

- Treść po polsku; komentarze w kodzie po angielsku.
- Realistyczne biurowe zestawy danych: faktury zakupowe, budżet, magazyn,
  pracownicy, harmonogramy. Nie używaj danych osobowych prawdziwych osób.
- Każda lekcja kończy się zadaniem-podsumowaniem (raport/suma/wniosek).

## Zanim wyślesz

1. `npm test` — suity `content` (schema, invariants, registry) łapią większość
   błędów autorskich.
2. Otwórz lekcję w dev (`/lekcje/<slug>`) i przejdź ją w całości — checki
   muszą przechodzić przy poprawnym rozwiązaniu.

## Czego NIE da się sprawdzać (stan silnika)

Menu sortowania/filtrowania, walidacja danych (listy rozwijane), formatowanie
warunkowe, wykresy, tabele przestawne, druk — preset Univer ich nie zawiera.
Tematy pokrewne nauczaj formułami (SORT/FILTER) lub odraczaj na przyszłość.
