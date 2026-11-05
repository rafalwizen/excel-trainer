import { type LessonInput, type SheetInit } from "../schema";

/**
 * Lesson 27 — multi-sheet workbooks. Real reports never fit one sheet: data
 * lives in its own tabs and the report pulls from them. The workbook opens
 * on the "Raport" sheet; the data sheets ("Sprzedaz", "Koszty") sit behind
 * it, so every task starts with tab navigation. Sheet names avoid spaces on
 * purpose — a plain `=Sprzedaz!B2` needs no apostrophes.
 */

type ExtraRows = Record<string, Record<string, { v: string | number } | { f: string }>>;

function withExtras(
  rows: Record<string, Record<string, { v: string | number } | { f: string }>>,
  extraRows: ExtraRows,
): SheetInit["cellData"] {
  const merged: Record<string, Record<string, { v: string | number } | { f: string }>> =
    structuredClone(rows);
  for (const [row, cols] of Object.entries(extraRows)) {
    merged[row] = { ...merged[row], ...cols };
  }
  return merged;
}

// Monthly sales for the first half of the year.
const sprzedazRows: Record<string, Record<string, { v: string | number } | { f: string }>> = {
  "0": { "0": { v: "Miesiąc" }, "1": { v: "Kwota (zł)" } },
  "1": { "0": { v: "Styczeń" }, "1": { v: 12500 } },
  "2": { "0": { v: "Luty" }, "1": { v: 14300 } },
  "3": { "0": { v: "Marzec" }, "1": { v: 11800 } },
  "4": { "0": { v: "Kwiecień" }, "1": { v: 16200 } },
  "5": { "0": { v: "Maj" }, "1": { v: 13900 } },
  "6": { "0": { v: "Czerwiec" }, "1": { v: 15100 } },
};

// Monthly costs for the same period.
const kosztyRows: Record<string, Record<string, { v: string | number } | { f: string }>> = {
  "0": { "0": { v: "Miesiąc" }, "1": { v: "Kwota (zł)" } },
  "1": { "0": { v: "Styczeń" }, "1": { v: 8200 } },
  "2": { "0": { v: "Luty" }, "1": { v: 9100 } },
  "3": { "0": { v: "Marzec" }, "1": { v: 7900 } },
  "4": { "0": { v: "Kwiecień" }, "1": { v: 9800 } },
  "5": { "0": { v: "Maj" }, "1": { v: 8600 } },
  "6": { "0": { v: "Czerwiec" }, "1": { v: 9300 } },
};

// The report sheet the learner fills in; it is the FIRST sheet, so the
// workbook opens on it and every task starts with a tab switch to see data.
const raportRows: Record<string, Record<string, { v: string | number } | { f: string }>> = {
  "0": { "0": { v: "Wskaźnik" }, "1": { v: "Wartość (zł)" } },
  "1": { "0": { v: "Sprzedaż — styczeń" } },
  "2": { "0": { v: "Sprzedaż — I połowa roku" } },
  "3": { "0": { v: "Koszty — I połowa roku" } },
  "4": { "0": { v: "Zysk — I połowa roku" } },
};

function raportWorkbook(extraRows: ExtraRows = {}) {
  return {
    sheets: [
      { name: "Raport", rowCount: 30, columnCount: 10, cellData: withExtras(raportRows, extraRows) },
      { name: "Sprzedaz", rowCount: 20, columnCount: 10, cellData: structuredClone(sprzedazRows) },
      { name: "Koszty", rowCount: 20, columnCount: 10, cellData: structuredClone(kosztyRows) },
    ],
  };
}

export const daneWieleArkuszyLesson: LessonInput = {
  slug: "dane-wiele-arkuszy",
  title: "Dane w wielu arkuszach",
  shortDescription:
    "Jeden skoroszyt, trzy arkusze: odwołania Sprzedaz!B2, sumy z innych kart i nowy arkusz Notatki.",
  category: "Praca z danymi",
  difficulty: 3,
  estimatedMinutes: 25,
  prerequisites: ["adresowanie-wzgledne-bezwzgledne"],
  learningGoals: [
    "Odwoływać się do komórki innego arkusza składnią NazwaArkusza!Adres",
    "Sumować zakres, który leży w innym arkuszu",
    "Tworzyć i nazywać nowe arkusze w skoroszycie",
    "Zbierać dane z kilku arkuszy w jednym raporcie",
  ],
  tasks: [
    {
      title: "Pierwsze odwołanie do innego arkusza",
      instructions:
        "Na dole ekranu jest **pasek arkuszy**: `Raport`, `Sprzedaz`, `Koszty`. Kliknij `Sprzedaz` i zobacz, że styczeń ma kwotę w **B2** — ale pisać będziesz w `Raport`.\n" +
        "Wróć na kartę `Raport` i w **B2** wpisz:\n" +
        "`=Sprzedaz!B2`\n" +
        "Wykrzyknik to separator: **najpierw nazwa arkusza, potem wykrzyknik, potem adres**. Tylko tak formuła wie, skąd brać dane.",
      initialWorkbook: raportWorkbook(),
      hints: [
        "Formuła musi zaczynać się od nazwy arkusza — `=B2` bez `Sprzedaz!` wyciągnie pustkę z Raportu.",
        "Nazwa arkusza bez spacji nie potrzebuje cudzysłowów ani apostrofów.",
      ],
      checks: [
        { type: "cellFormula", cell: "B2", sheet: "Raport", aliases: ["=Sprzedaz!B2"] },
        { type: "cellValue", cell: "B2", sheet: "Raport", expected: 12500 },
      ],
    },
    {
      title: "Suma całego zakresu z innego arkusza",
      instructions:
        "Pojedyncza komórka to prolog; prawdziwy raport sumuje cały okres. W **B3** policz sprzedaż z I połowy roku:\n" +
        "`=SUM(Sprzedaz!B2:B7)`\n" +
        "Zakres `B2:B7` należy do arkusza `Sprzedaz` — prefiks rozciąga się na cały zakres.",
      initialWorkbook: raportWorkbook({
        "1": { "1": { f: "=Sprzedaz!B2" } },
      }),
      hints: [
        "Prefiks arkusza pisze się raz, przed zakresem: `Sprzedaz!B2:B7`, a nie `Sprzedaz!B2:Sprzedaz!B7`.",
        "Szóstka miesięcy: od stycznia (wiersz 2) do czerwca (wiersz 7).",
      ],
      checks: [
        {
          type: "cellFormula",
          cell: "B3",
          sheet: "Raport",
          aliases: ["=SUM(Sprzedaz!B2:B7)"],
          mustInclude: ["Sprzedaz!"],
        },
        { type: "cellValue", cell: "B3", sheet: "Raport", expected: 83800 },
      ],
    },
    {
      title: "Nowy arkusz — Notatki",
      instructions:
        "Skoroszyt może mieć tyle arkuszy, ile potrzebujesz. Kliknij **+** na pasku arkuszy (obok `Koszty`) — pojawi się nowy arkusz.\n" +
        "Podwójnie kliknij jego kartę i zmień nazwę na **Notatki**. Wpisz w nim w A1 dowolną notatkę do raportu (np. „uzupełnić po kwartale”).",
      initialWorkbook: raportWorkbook({
        "1": { "1": { f: "=Sprzedaz!B2" } },
        "2": { "1": { f: "=SUM(Sprzedaz!B2:B7)" } },
      }),
      hints: [
        "Nowy arkusz dostaje tymczasową nazwę — dopiero rename kartą zmienia ją na Notatki.",
        "Nazwa musi być dokładnie `Notatki` — sprawdzarka szuka arkusza po nazwie.",
      ],
      checks: [{ type: "sheetExists", name: "Notatki" }],
    },
    {
      title: "Zysk — dane z dwóch arkuszy w jednej formule",
      instructions:
        "Na koniec domknij raport. W **B4** policz koszty I połowy roku z arkusza `Koszty`:\n" +
        "`=SUM(Koszty!B2:B7)`\n" +
        "a w **B5** zysk: sprzedaż minus koszty — zwykłe `=B3-B4`, obie wartości stoją już w Raporcie.",
      initialWorkbook: raportWorkbook({
        "1": { "1": { f: "=Sprzedaz!B2" } },
        "2": { "1": { f: "=SUM(Sprzedaz!B2:B7)" } },
      }),
      hints: [
        "Drugi arkusz danych działa identycznie: `Koszty!B2:B7`.",
        "Zysk = 83800 − koszty; jeśli wychodzi ujemny, sprawdź, czy pomyliłeś arkusze.",
      ],
      checks: [
        {
          type: "cellFormula",
          cell: "B4",
          sheet: "Raport",
          aliases: ["=SUM(Koszty!B2:B7)"],
        },
        { type: "cellValue", cell: "B4", sheet: "Raport", expected: 52900 },
        { type: "cellFormula", cell: "B5", sheet: "Raport", aliases: ["=B3-B4"] },
        { type: "cellValue", cell: "B5", sheet: "Raport", expected: 30900 },
      ],
    },
  ],
};
