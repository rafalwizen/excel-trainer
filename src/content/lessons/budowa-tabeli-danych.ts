import { workbook, type LessonInput, type WorkbookInit } from "../schema";

/**
 * Lesson 5 — building a clean data table from scratch: headers, one data
 * type per column, and an unordered list check (rangeValuesUnordered) in the
 * final task. Dates are typed strings in the RRRR-MM-DD format (see lesson
 * wpisywanie-i-poprawianie-danych for the empirical note).
 */
type Rows = Record<string, Record<string, { v: string | number }>>;

const HEADER_ROW: Rows = {
  "0": {
    "0": { v: "Data" },
    "1": { v: "Kontrahent" },
    "2": { v: "Nr faktury" },
    "3": { v: "Kwota netto (zł)" },
    "4": { v: "VAT (zł)" },
  },
};

const THREE_INVOICES: Rows = {
  "1": {
    "0": { v: "2026-03-02" },
    "1": { v: "Alfa Sp. z o.o." },
    "2": { v: "FV/100/03" },
    "3": { v: 2400 },
    "4": { v: 552 },
  },
  "2": {
    "0": { v: "2026-03-09" },
    "1": { v: "Beta S.A." },
    "2": { v: "FV/101/03" },
    "3": { v: 1200 },
    "4": { v: 276 },
  },
  "3": {
    "0": { v: "2026-03-16" },
    "1": { v: "Gamma Trading" },
    "2": { v: "FV/102/03" },
    "3": { v: 3100 },
    "4": { v: 713 },
  },
};

function invoiceSheet(rows: Rows = {}): WorkbookInit {
  return workbook("Faktury", 20, 8, rows);
}

export const budowaTabeliDanychLesson: LessonInput = {
  slug: "budowa-tabeli-danych",
  title: "Budowa czytelnej tabeli",
  shortDescription:
    "Tabela danych od zera: nagłówki, jeden typ danych w kolumnie i wpisy bez wpadającego w oko formatu.",
  category: "Podstawy",
  difficulty: 1,
  learningGoals: [
    "Zbudować tabelę od zera: nagłówki i wiersze danych",
    "Trzymać jeden typ danych w całej kolumnie",
    "Wpisować daty i kwoty w formatach, które arkusz rozumie",
    "Tworzyć listy kontrolne, w których kolejność nie ma znaczenia",
  ],
  estimatedMinutes: 20,
  tasks: [
    {
      title: "Nagłówki kolumn",
      instructions:
        "Zacznij pusty rejestr faktur. W pierwszym wierszu wpisz nagłówki:\n" +
        "- **A1**: `Data`\n" +
        "- **B1**: `Kontrahent`\n" +
        "- **C1**: `Nr faktury`\n" +
        "- **D1**: `Kwota netto (zł)`\n" +
        "- **E1**: `VAT (zł)`",
      initialWorkbook: invoiceSheet(),
      hints: [
        "Nagłówki to zwykły tekst — wpisz je dokładnie tak, jak w zadaniu.",
        "Tab przeskakuje do komórki po prawej, Enter do komórki w dół.",
      ],
      checks: [
        {
          type: "rangeValues",
          range: "A1:E1",
          expected: ["Data", "Kontrahent", "Nr faktury", "Kwota netto (zł)", "VAT (zł)"],
        },
      ],
    },
    {
      title: "Pierwsze faktury",
      instructions:
        "Wpisz trzy faktury — po jednej na wiersz:\n" +
        "- wiersz 2: `2026-03-02`, `Alfa Sp. z o.o.`, `FV/100/03`, `2400`, `552`\n" +
        "- wiersz 3: `2026-03-09`, `Beta S.A.`, `FV/101/03`, `1200`, `276`\n" +
        "- wiersz 4: `2026-03-16`, `Gamma Trading`, `FV/102/03`, `3100`, `713`\n" +
        "Kwoty wpisuj jako liczby (bez zł), daty w formacie `RRRR-MM-DD`.",
      initialWorkbook: invoiceSheet(HEADER_ROW),
      hints: [
        "Każda faktura to jeden wiersz — nie mieszaj danych jednej faktury w dwóch wierszach.",
        "Liczby oddzielone kropką dziesiętną, np. 2400 — bez spacji tysięcy.",
      ],
      checks: [
        {
          type: "rangeValues",
          range: "A2:E4",
          expected: [
            "2026-03-02",
            "Alfa Sp. z o.o.",
            "FV/100/03",
            2400,
            552,
            "2026-03-09",
            "Beta S.A.",
            "FV/101/03",
            1200,
            276,
            "2026-03-16",
            "Gamma Trading",
            "FV/102/03",
            3100,
            713,
          ],
        },
      ],
    },
    {
      title: "Jeden typ danych w kolumnie",
      instructions:
        "Wiersz 5 to faktura `2026-03-23`, `Delta Usługi`, `FV/103/03`, `900` — ale w kolumnie VAT ktoś wpisał tekst `b.d.`.\n" +
        "Tekst w kolumnie liczb psuje sumowanie i sortowanie. Księgowość doliczyła VAT: **23% z 900**. Zamień `b.d.` w E5 na tę kwotę.",
      initialWorkbook: invoiceSheet({
        ...HEADER_ROW,
        ...THREE_INVOICES,
        "4": {
          "0": { v: "2026-03-23" },
          "1": { v: "Delta Usługi" },
          "2": { v: "FV/103/03" },
          "3": { v: 900 },
          "4": { v: "b.d." },
        },
      }),
      hints: [
        "23% z 900 to 900 × 0.23 — możesz policzyć w komórce E5 od razu wzorem, ale wynik ma być liczbą.",
        "Sam wpis `207` wystarczy — to już poprawna wartość VAT.",
      ],
      checks: [{ type: "cellValue", cell: "E5", expected: 207 }],
    },
    {
      title: "Lista działów — kolejność bez znaczenia",
      instructions:
        "Do sporządzenia raportu potrzebna jest lista działów firmy. W kolumnie **G** (G1:G5) wpisz wszystkie pięć: `Kadry`, `Marketing`, `Finanse`, `IT`, `Obsługa klienta`.\n" +
        "W tej liście kolejność nie ma znaczenia — ważne, żeby wszystkie działy były.",
      initialWorkbook: invoiceSheet({
        ...HEADER_ROW,
        ...THREE_INVOICES,
        "4": {
          "0": { v: "2026-03-23" },
          "1": { v: "Delta Usługi" },
          "2": { v: "FV/103/03" },
          "3": { v: 900 },
          "4": { v: 207 },
        },
      }),
      hints: [
        "Zacznij w G1 i wpisuj kolejno w dół, do G5.",
        "Nie zostawiaj pustych komórek między działami — lista ma być ciągła.",
      ],
      checks: [
        {
          type: "rangeValuesUnordered",
          range: "G1:G5",
          expected: ["Kadry", "Marketing", "Finanse", "IT", "Obsługa klienta"],
        },
      ],
    },
  ],
};
