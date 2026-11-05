import { workbook, type LessonInput, type WorkbookInit } from "../schema";

/**
 * Lesson 26 — SUMIFS and COUNTIFS: budget reporting on multiple criteria.
 * SUMIF takes one condition; the plural forms take any number of
 * range/criteria pairs, including comparison operators like ">500". Data:
 * twelve department expenses across quarters.
 */
function budgetSheet(
  extraRows: Record<string, Record<string, { v: string | number } | { f: string }>> = {},
): WorkbookInit {
  const rows: Record<string, Record<string, { v: string | number } | { f: string }>> =
    {
      "0": {
        "0": { v: "Dział" },
        "1": { v: "Kwartał" },
        "2": { v: "Kwota (zł)" },
        "4": { v: "Pytanie" },
        "5": { v: "Wynik" },
        "7": { v: "Dział" },
        "8": { v: "Suma (zł)" },
      },
      "1": { "0": { v: "IT" }, "1": { v: "Q1" }, "2": { v: 1200 }, "4": { v: "IT w Q1 (zł)" }, "7": { v: "IT" } },
      "2": { "0": { v: "IT" }, "1": { v: "Q2" }, "2": { v: 800 }, "4": { v: "pozycji IT > 500 zł" }, "7": { v: "HR" } },
      "3": { "0": { v: "IT" }, "1": { v: "Q1" }, "2": { v: 300 }, "4": { v: "Sprzedaż > 1000 zł" }, "7": { v: "Sprzedaż" } },
      "4": { "0": { v: "HR" }, "1": { v: "Q1" }, "2": { v: 950 } },
      "5": { "0": { v: "HR" }, "1": { v: "Q3" }, "2": { v: 620 } },
      "6": { "0": { v: "Sprzedaż" }, "1": { v: "Q1" }, "2": { v: 2100 } },
      "7": { "0": { v: "Sprzedaż" }, "1": { v: "Q2" }, "2": { v: 1400 } },
      "8": { "0": { v: "Sprzedaż" }, "1": { v: "Q2" }, "2": { v: 900 } },
      "9": { "0": { v: "IT" }, "1": { v: "Q3" }, "2": { v: 1500 } },
      "10": { "0": { v: "HR" }, "1": { v: "Q2" }, "2": { v: 480 } },
      "11": { "0": { v: "IT" }, "1": { v: "Q1" }, "2": { v: 700 } },
      "12": { "0": { v: "Sprzedaż" }, "1": { v: "Q4" }, "2": { v: 1100 } },
    };
  for (const [row, cols] of Object.entries(extraRows)) {
    rows[row] = { ...rows[row], ...cols };
  }
  return workbook("Budżet", 20, 10, rows);
}

export const sumaWarunkowZaawansowanaLesson: LessonInput = {
  slug: "suma-warunkow-zaawansowana",
  title: "Raporty warunkowe: SUMIFS i COUNTIFS",
  shortDescription:
    "Budżet pod lupą: SUMIFS i COUNTIFS liczą sumy i pozycje po dwóch kryteriach naraz.",
  category: "Raporty i analiza",
  difficulty: 3,
  estimatedMinutes: 35,
  prerequisites: ["suma-jezeli"],
  learningGoals: [
    "Sumować po dwóch kryteriach funkcją SUMIFS",
    "Liczyć pozycje po wielu warunkach funkcją COUNTIFS",
    "Używać operatorów porównania („>1000”) jako kryterium",
    "Składać raport per dział z formuł SUMIFS",
  ],
  tasks: [
    {
      title: "Dwa kryteria naraz — SUMIFS",
      instructions:
        "SUMIF umiało jedno kryterium; budżet pyta o kombinacje: **ile wydał IT w pierwszym kwartale?** W **F2** wpisz:\n" +
        '`=SUMIFS(C2:C13,A2:A13,"IT",B2:B13,"Q1")`\n' +
        "Uwaga na kolejność: **najpierw zakres sumowania**, potem pary `zakres;kryterium` — ile chcesz par.\n" +
        "(W polskim Excelu: **SUMA.WARUNKÓW** — ten arkusz liczy angielskie nazwy funkcji.)",
      initialWorkbook: budgetSheet(),
      hints: [
        "Każde kryterium musi mieć SWÓJ zakres tej samej wysokości co zakres sumowania.",
        "W budżecie są trzy pozycje IT w Q1.",
      ],
      checks: [
        {
          type: "cellFormula",
          cell: "F2",
          aliases: ['=SUMIFS(C2:C13,A2:A13,"IT",B2:B13,"Q1")'],
        },
        { type: "cellValue", cell: "F2", expected: 2200 },
      ],
    },
    {
      title: "Licznik warunkowy — COUNTIFS",
      instructions:
        "Ile **pozycji** IT przekracza 500 zł? COUNTIFS liczy wiersze spełniające wszystkie warunki naraz. W **F3** wpisz:\n" +
        '`=COUNTIFS(A2:A13,"IT",C2:C13,">500")`\n' +
        "Kryterium `\">500\"` to operator i liczba w jednym tekście — cudzysłów wokół całości.\n" +
        "(Po polsku: **LICZ.WARUNKI**.)",
      initialWorkbook: budgetSheet({
        "1": { "5": { f: '=SUMIFS(C2:C13,A2:A13,"IT",B2:B13,"Q1")' } },
      }),
      hints: [
        "COUNTIFS nie ma zakresu sumowania — od razu pary warunków.",
        "Operator w cudzysłowie: „>500”, nie >500.",
      ],
      checks: [
        {
          type: "cellFormula",
          cell: "F3",
          aliases: ['=COUNTIFS(A2:A13,"IT",C2:C13,">500")'],
          mustInclude: ['">500"'],
        },
        { type: "cellValue", cell: "F3", expected: 4 },
      ],
    },
    {
      title: "Operator w kryterium — SUMIFS z progiem kwoty",
      instructions:
        "Sprzedaż ma sporo małych pozycji; kierownik chce tylko **istotne**: powyżej 1000 zł. W **F4** wpisz:\n" +
        '`=SUMIFS(C2:C13,A2:A13,"Sprzedaż",C2:C13,">1000")`\n' +
        "Dział i próg kwotowy to dwa niezależne filtry — jeden przejazd formuły.",
      initialWorkbook: budgetSheet({
        "1": { "5": { f: '=SUMIFS(C2:C13,A2:A13,"IT",B2:B13,"Q1")' } },
        "2": { "5": { f: '=COUNTIFS(A2:A13,"IT",C2:C13,">500")' } },
      }),
      hints: [
        "Trzy pozycje Sprzedaży przekraczają 1000 zł.",
        "Zakres kryterium kwoty i zakres sumowania to ta sama kolumna C — to normalne.",
      ],
      checks: [
        {
          type: "cellFormula",
          cell: "F4",
          aliases: ['=SUMIFS(C2:C13,A2:A13,"Sprzedaż",C2:C13,">1000")'],
        },
        { type: "cellValue", cell: "F4", expected: 4600 },
      ],
    },
    {
      title: "Raport per dział",
      instructions:
        "Na koniec mini-raport: suma wydatków **każdego działu** w I2:I4. W **I2** wpisz:\n" +
        '`=SUMIFS(C2:C13,A2:A13,H2)`\n' +
        "i skopiuj do **I3:I4**. Kryterium nie musi być tekstem w cudzysłowie — może być **odwołanie do komórki** (tu H2 z nazwą działu). To schemat, na którym stoją prawdziwe raporty.",
      initialWorkbook: budgetSheet({
        "1": { "5": { f: '=SUMIFS(C2:C13,A2:A13,"IT",B2:B13,"Q1")' } },
        "2": { "5": { f: '=COUNTIFS(A2:A13,"IT",C2:C13,">500")' } },
        "3": { "5": { f: '=SUMIFS(C2:C13,A2:A13,"Sprzedaż",C2:C13,">1000")' } },
      }),
      hints: [
        "Jedna formuła skopiowana trzy razy — kryterium zmienia się razem z wierszem (H2→H3→H4).",
        "IT wydało najwięcej: ponad 4500 zł.",
      ],
      checks: [
        {
          type: "cellFormula",
          cell: "I2",
          aliases: ["=SUMIFS(C2:C13,A2:A13,H2)"],
          mustInclude: ["H2"],
        },
        {
          type: "rangeValues",
          range: "I2:I4",
          expected: [4500, 2050, 5500],
        },
      ],
    },
  ],
};
