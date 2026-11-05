import { workbook, type LessonInput, type WorkbookInit } from "../schema";

/**
 * Lesson 18 — text functions on a messy import: CONCAT to join, LEFT/RIGHT
 * to slice, TRIM to clean whitespace, LEN as the closing check. TRIM in the
 * engine collapses internal runs of spaces like Excel does, so "Piotr  Nowak"
 * cleans to "Piotr Nowak".
 */
function importSheet(
  extraRows: Record<string, Record<string, { v: string | number } | { f: string }>> = {},
): WorkbookInit {
  const rows: Record<string, Record<string, { v: string | number } | { f: string }>> =
    {
      "0": {
        "0": { v: "Imię" },
        "1": { v: "Nazwisko" },
        "2": { v: "Nr zamówienia" },
        "3": { v: "Z importu" },
      },
      "1": {
        "0": { v: "Anna" },
        "1": { v: "Kowalska" },
        "2": { v: "ZAM/2026/1043" },
        "3": { v: "  Anna Kowalska  " },
      },
      "2": {
        "0": { v: "Piotr" },
        "1": { v: "Nowak" },
        "2": { v: "ZAM/2026/1087" },
        "3": { v: "Piotr  Nowak" },
      },
      "3": {
        "0": { v: "Maria" },
        "1": { v: "Wiśniewska" },
        "2": { v: "ZAM/2026/0921" },
        "3": { v: "Maria Wiśniewska   " },
      },
    };
  for (const [row, cols] of Object.entries(extraRows)) {
    rows[row] = { ...rows[row], ...cols };
  }
  return workbook("Import", 20, 10, rows);
}

export const tekstPodstawyLesson: LessonInput = {
  slug: "tekst-podstawy",
  title: "Funkcje tekstowe: podstawy",
  shortDescription:
    "CONCAT, LEFT, RIGHT, TRIM i LEN — porządkowanie danych wciśniętych w jedną kolumnę przez stary system.",
  category: "Tekst i daty",
  difficulty: 2,
  estimatedMinutes: 25,
  learningGoals: [
    "Sklejać teksty funkcją CONCAT, także ze stałym separatorem",
    "Wycinać początek i koniec tekstu: LEFT i RIGHT",
    "Czyścić nadmiarowe spacje funkcją TRIM",
    "Mierzyć długość tekstu funkcją LEN",
  ],
  tasks: [
    {
      title: "Imię i nazwisko razem — CONCAT",
      instructions:
        "Stary system trzyma imię i nazwisko osobno; do listy adresowej potrzebne jest jedno pole.\n" +
        "W **F2** wpisz:\n" +
        '`=CONCAT(A2," ",B2)`\n' +
        "Środkowy argument to spacja w cudzysłowach — bez niej wyszłoby „AnnaKowalska”. Skopiuj formułę do **F3:F4**.\n" +
        "(W polskim Excelu: **ZŁĄCZ.TEKSTY** — ten arkusz liczy angielskie nazwy funkcji.)",
      initialWorkbook: importSheet({ "0": { "5": { v: "Pełna nazwa" } } }),
      hints: [
        "CONCAT skleja argumenty w kolejności, w jakiej je podasz — przecinki między nimi.",
        "Spacja też jest tekstem: musi być w cudzysłowach.",
      ],
      checks: [
        { type: "cellFormula", cell: "F2", aliases: ['=CONCAT(A2," ",B2)'] },
        {
          type: "rangeValues",
          range: "F2:F4",
          expected: ["Anna Kowalska", "Piotr Nowak", "Maria Wiśniewska"],
        },
      ],
    },
    {
      title: "Trzy litery nazwiska — LEFT",
      instructions:
        "Login w firmie to pierwsze trzy litery nazwiska. W **G2** wpisz:\n" +
        "`=LEFT(B2,3)`\n" +
        "i skopiuj do **G3:G4**. LEFT odcina **tyle znaków, ile powiesz**, licząc od lewej. (Po polsku: **LEWY**.)",
      initialWorkbook: importSheet({
        "0": { "5": { v: "Pełna nazwa" }, "6": { v: "Login" } },
        "1": { "5": { f: '=CONCAT(A2," ",B2)' } },
        "2": { "5": { f: '=CONCAT(A3," ",B3)' } },
        "3": { "5": { f: '=CONCAT(A4," ",B4)' } },
      }),
      hints: [
        "Drugi argument to liczba znaków — bez cudzysłowów.",
        "Dla „Wiśniewska” trzy znaki to W, i, ś — polskie litery liczą się jak każde inne.",
      ],
      checks: [
        { type: "cellFormula", cell: "G2", aliases: ["=LEFT(B2,3)"] },
        { type: "rangeValues", range: "G2:G4", expected: ["Kow", "Now", "Wiś"] },
      ],
    },
    {
      title: "Numer z końca zamówienia — RIGHT",
      instructions:
        "Kolejny widok: w **H2** wytnij **ostatnie 4 znaki** numeru zamówienia (numer sprawy wewnętrznej):\n" +
        "`=RIGHT(C2,4)`\n" +
        "i skopiuj do **H3:H4**. RIGHT liczy od prawej — perfect do numerów, kodów, końcówek. (Po polsku: **PRAWY**.)",
      initialWorkbook: importSheet({
        "0": { "5": { v: "Pełna nazwa" }, "6": { v: "Login" }, "7": { v: "Sprawa" } },
        "1": { "5": { f: '=CONCAT(A2," ",B2)' }, "6": { f: "=LEFT(B2,3)" } },
        "2": { "5": { f: '=CONCAT(A3," ",B3)' }, "6": { f: "=LEFT(B3,3)" } },
        "3": { "5": { f: '=CONCAT(A4," ",B4)' }, "6": { f: "=LEFT(B4,3)" } },
      }),
      hints: [
        "RIGHT czyta od końca — nie musisz wiedzieć, jak długi jest cały numer.",
        "ZAM/2026/0921 → ostatnie cztery znaki to 0921 (z zerem włączonym).",
      ],
      checks: [
        { type: "cellFormula", cell: "H2", aliases: ["=RIGHT(C2,4)"] },
        { type: "rangeValues", range: "H2:H4", expected: ["1043", "1087", "0921"] },
      ],
    },
    {
      title: "Sprzątanie importu — TRIM",
      instructions:
        "Kolumna D to nazwy **prosto z importu** — z podwójnymi spacjami i spacjami na brzegach. W **I2** wpisz:\n" +
        "`=TRIM(D2)`\n" +
        "i skopiuj do **I3:I4**. TRIM zdejmuje spacje z początku i końca oraz zwija podwójne spacje w pojedyncze.\n" +
        "(Po polsku: **USUŃ.ZBĘDNE.ODSTĘPY**.)",
      initialWorkbook: importSheet({
        "0": {
          "5": { v: "Pełna nazwa" },
          "6": { v: "Login" },
          "7": { v: "Sprawa" },
          "8": { v: "Po TRIM" },
        },
        "1": {
          "5": { f: '=CONCAT(A2," ",B2)' },
          "6": { f: "=LEFT(B2,3)" },
          "7": { f: "=RIGHT(C2,4)" },
        },
        "2": {
          "5": { f: '=CONCAT(A3," ",B3)' },
          "6": { f: "=LEFT(B3,3)" },
          "7": { f: "=RIGHT(C3,4)" },
        },
        "3": {
          "5": { f: '=CONCAT(A4," ",B4)' },
          "6": { f: "=LEFT(B4,3)" },
          "7": { f: "=RIGHT(C4,4)" },
        },
      }),
      hints: [
        "Spacje widać dopiero, gdy coś pójdzie nie tak — przy TRIM po prostu porównaj D2 i I2.",
        "TRIM nie usuwa spacji w środku pojedynczych — „Piotr  Nowak” stanie się „Piotr Nowak”.",
      ],
      checks: [
        { type: "cellFormula", cell: "I2", aliases: ["=TRIM(D2)"] },
        {
          type: "rangeValues",
          range: "I2:I4",
          expected: ["Anna Kowalska", "Piotr Nowak", "Maria Wiśniewska"],
        },
      ],
    },
    {
      title: "Ile to znaków? — LEN",
      instructions:
        "Na koniec kontrola jakości: pole „Pełna nazwa” mieści maksymalnie **20 znaków**. W **J2** sprawdź długość pierwszego wpisu:\n" +
        "`=LEN(F2)`\n" +
        "(Po polsku: **DŁ**.) Gdyby wynik przekraczał 20, wiedziałbyś, że pole trzeba przyciąć — np. funkcją LEFT.",
      initialWorkbook: importSheet({
        "0": {
          "5": { v: "Pełna nazwa" },
          "6": { v: "Login" },
          "7": { v: "Sprawa" },
          "8": { v: "Po TRIM" },
          "9": { v: "Znaków" },
        },
        "1": {
          "5": { f: '=CONCAT(A2," ",B2)' },
          "6": { f: "=LEFT(B2,3)" },
          "7": { f: "=RIGHT(C2,4)" },
          "8": { f: "=TRIM(D2)" },
        },
        "2": {
          "5": { f: '=CONCAT(A3," ",B3)' },
          "6": { f: "=LEFT(B3,3)" },
          "7": { f: "=RIGHT(C3,4)" },
          "8": { f: "=TRIM(D3)" },
        },
        "3": {
          "5": { f: '=CONCAT(A4," ",B4)' },
          "6": { f: "=LEFT(B4,3)" },
          "7": { f: "=RIGHT(C4,4)" },
          "8": { f: "=TRIM(D4)" },
        },
      }),
      hints: [
        "LEN liczy każdy znak — także spacje w środku.",
        "„Anna Kowalska”: 4 litery + spacja + 8 liter.",
      ],
      checks: [
        { type: "cellFormula", cell: "J2", aliases: ["=LEN(F2)"] },
        { type: "cellValue", cell: "J2", expected: 13 },
      ],
    },
  ],
};
