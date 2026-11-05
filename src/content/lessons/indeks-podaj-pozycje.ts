import { workbook, type LessonInput, type WorkbookInit } from "../schema";

/**
 * Lesson 23 — INDEX + MATCH, the classic duo older than XLOOKUP. MATCH finds
 * a position in a column, INDEX returns a value at a position; combined they
 * do two-dimensional lookups (row AND column by number), which neither
 * VLOOKUP nor plain XLOOKUP covers as directly. Data: quarterly product
 * sales, so the 2D task has a natural second axis.
 */
function salesSheet(
  extraRows: Record<string, Record<string, { v: string | number } | { f: string }>> = {},
): WorkbookInit {
  const rows: Record<string, Record<string, { v: string | number } | { f: string }>> =
    {
      "0": { "0": { v: "Produkt" }, "1": { v: "I kw. (szt.)" }, "2": { v: "II kw. (szt.)" } },
      "1": { "0": { v: "Papier A4" }, "1": { v: 120 }, "2": { v: 135 } },
      "2": { "0": { v: "Toner HP" }, "1": { v: 18 }, "2": { v: 22 } },
      "3": { "0": { v: "Notebook 15" }, "1": { v: 6 }, "2": { v: 9 } },
      "4": { "0": { v: "Mysz bezprzewodowa" }, "1": { v: 31 }, "2": { v: 27 } },
      "5": { "0": { v: "Zeszyt A5" }, "1": { v: 84 }, "2": { v: 90 } },
      "6": { "0": { v: "Monitor 24" }, "1": { v: 11 }, "2": { v: 14 } },
      "7": { "0": { v: "Długopis" }, "1": { v: 150 }, "2": { v: 120 } },
    };
  for (const [row, cols] of Object.entries(extraRows)) {
    rows[row] = { ...rows[row], ...cols };
  }
  return workbook("Sprzedaż", 20, 10, rows);
}

export const indeksPodajPozycjeLesson: LessonInput = {
  slug: "indeks-podaj-pozycje",
  title: "INDEX + MATCH",
  shortDescription:
    "MATCH znajduje pozycję, INDEX wyciąga wartość — razem wyszukiwanie dwuwymiarowe bez numerowania kolumn.",
  category: "Wyszukiwanie",
  difficulty: 3,
  estimatedMinutes: 30,
  prerequisites: ["wyszukaj-pionowo"],
  learningGoals: [
    "Znaleźć pozycję wartości w kolumnie funkcją MATCH",
    "Wyciągnąć wartość z listy po numerie pozycji funkcją INDEX",
    "Połączyć oba w klasyczne INDEX(MATCH(...))",
    "Wyszukiwać dwuwymiarowo: wiersz i kolumna jako liczby",
  ],
  tasks: [
    {
      title: "Gdzie on jest? — MATCH",
      instructions:
        "MATCH nie zwraca wartości — zwraca **numer pozycji** w zakresie. W **E2** wpisz:\n" +
        '`=MATCH("Toner HP",A2:A8,0)`\n' +
        "Trzeci argument `0` to dopasowanie dokładne — zapamiętaj go jako stały element tej funkcji.\n" +
        "(W polskim Excelu: **PODAJ.POZYCJĘ** — ten arkusz liczy angielskie nazwy funkcji.)",
      initialWorkbook: salesSheet({ "0": { "4": { v: "Kontrola" } } }),
      hints: [
        "Pozycję liczymy od góry zakresu, nie od wiersza arkusza.",
        "Toner HP jest drugi na liście.",
      ],
      checks: [
        {
          type: "cellFormula",
          cell: "E2",
          aliases: ['=MATCH("Toner HP",A2:A8,0)'],
          mustInclude: [",0)"],
        },
        { type: "cellValue", cell: "E2", expected: 2 },
      ],
    },
    {
      title: "Co stoi na pozycji? — INDEX",
      instructions:
        "INDEX działa w drugą stronę: dostaje **numer pozycji** i zwraca wartość. W **E3** wpisz:\n" +
        "`=INDEX(B2:B8,E2)`\n" +
        "E2 trzyma pozycję z poprzedniego zadania — INDEX wyciągnie sprzedaż Tonera HP z I kwartału.",
      initialWorkbook: salesSheet({
        "0": { "4": { v: "Kontrola" } },
        "1": { "4": { f: '=MATCH("Toner HP",A2:A8,0)' } },
      }),
      hints: [
        "Pierwszy argument to zakres, drugi to pozycja — INDEX nie zna adresów, tylko liczby.",
        "Sprzedaż Tonera w I kw. to liczba z tabeli, nie nazwa.",
      ],
      checks: [
        { type: "cellFormula", cell: "E3", aliases: ["=INDEX(B2:B8,E2)"] },
        { type: "cellValue", cell: "E3", expected: 18 },
      ],
    },
    {
      title: "Duet — INDEX(MATCH(...))",
      instructions:
        "Prawdziwa siła: MATCH wstawiony **w środek** INDEX jako numer pozycji. W **E4** policz sprzedaż monitorów w I kwartale:\n" +
        '`=INDEX(B2:B8,MATCH("Monitor 24",A2:A8,0))`\n' +
        "Czytamy od środka: MATCH znajduje pozycję monitora, INDEX bierze z tej pozycji wartość z kolumny B.",
      initialWorkbook: salesSheet({
        "0": { "4": { v: "Kontrola" } },
        "1": { "4": { f: '=MATCH("Toner HP",A2:A8,0)' } },
        "2": { "4": { f: "=INDEX(B2:B8,E2)" } },
      }),
      hints: [
        "Najpierw policz MATCH w głowie: monitor jest szósty na liście.",
        "Domknięcie nawiasów: dwa otwarte, dwa zamknięte.",
      ],
      checks: [
        {
          type: "cellFormula",
          cell: "E4",
          aliases: ['=INDEX(B2:B8,MATCH("Monitor 24",A2:A8,0))'],
        },
        { type: "cellValue", cell: "E4", expected: 11 },
      ],
    },
    {
      title: "Dwa wymiary — wiersz i kolumna",
      instructions:
        "INDEX przyjmuje też **numer kolumny** — i to jest rzeczy, której VLOOKUP nie zrobi elegancko: wyszukiwanie dwuwymiarowe. W **E5** wpisz:\n" +
        '`=INDEX(B2:C8,MATCH("Zeszyt A5",A2:A8,0),2)`\n' +
        "Drugi argument to pozycja **wiersza** (z MATCH), trzeci to numer **kolumny** w zakresie B2:C8: 1 = I kwartał, 2 = II kwartał.",
      initialWorkbook: salesSheet({
        "0": { "4": { v: "Kontrola" } },
        "1": { "4": { f: '=MATCH("Toner HP",A2:A8,0)' } },
        "2": { "4": { f: "=INDEX(B2:B8,E2)" } },
        "3": { "4": { f: '=INDEX(B2:B8,MATCH("Monitor 24",A2:A8,0))' } },
      }),
      hints: [
        "Kolumny liczone od początku zakresu: B = 1, C = 2.",
        "Zeszyt A5 w II kwartale — najpierw MATCH (piąty), potem kolumna 2.",
      ],
      checks: [
        {
          type: "cellFormula",
          cell: "E5",
          aliases: ['=INDEX(B2:C8,MATCH("Zeszyt A5",A2:A8,0),2)'],
          mustInclude: ["MATCH"],
        },
        { type: "cellValue", cell: "E5", expected: 90 },
      ],
    },
  ],
};
