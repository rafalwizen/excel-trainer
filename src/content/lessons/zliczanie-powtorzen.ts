import { workbook, type LessonInput, type WorkbookInit } from "../schema";

/**
 * Lesson 21 — counting repeats with COUNTIF: an occurrence counter per row,
 * then a duplicate flag (IF around COUNTIF), closing with a report that
 * counts rows belonging to returning clients. The counter uses an absolute
 * range $A$2:$A$11 so the formula survives being copied down.
 */
function ordersSheet(
  extraRows: Record<string, Record<string, { v: string | number } | { f: string }>> = {},
): WorkbookInit {
  const rows: Record<string, Record<string, { v: string | number } | { f: string }>> =
    {
      "0": { "0": { v: "Klient" } },
      "1": { "0": { v: "Kowalska" } },
      "2": { "0": { v: "Nowak" } },
      "3": { "0": { v: "Kowalska" } },
      "4": { "0": { v: "Wiśniewska" } },
      "5": { "0": { v: "Nowak" } },
      "6": { "0": { v: "Kowalska" } },
      "7": { "0": { v: "Zielińska" } },
      "8": { "0": { v: "Nowak" } },
      "9": { "0": { v: "Wójcik" } },
      "10": { "0": { v: "Wiśniewska" } },
    };
  for (const [row, cols] of Object.entries(extraRows)) {
    rows[row] = { ...rows[row], ...cols };
  }
  return workbook("Zamówienia", 20, 8, rows);
}

// Counter formulas for the whole column, prefilled from task 2 on.
const counters: Record<string, Record<string, { f: string }>> = {
  "1": { "1": { f: "=COUNTIF($A$2:$A$11,A2)" } },
  "2": { "1": { f: "=COUNTIF($A$2:$A$11,A3)" } },
  "3": { "1": { f: "=COUNTIF($A$2:$A$11,A4)" } },
  "4": { "1": { f: "=COUNTIF($A$2:$A$11,A5)" } },
  "5": { "1": { f: "=COUNTIF($A$2:$A$11,A6)" } },
  "6": { "1": { f: "=COUNTIF($A$2:$A$11,A7)" } },
  "7": { "1": { f: "=COUNTIF($A$2:$A$11,A8)" } },
  "8": { "1": { f: "=COUNTIF($A$2:$A$11,A9)" } },
  "9": { "1": { f: "=COUNTIF($A$2:$A$11,A10)" } },
  "10": { "1": { f: "=COUNTIF($A$2:$A$11,A11)" } },
};

export const zliczaniePowtorzenLesson: LessonInput = {
  slug: "zliczanie-powtorzen",
  title: "Zliczanie powtórzeń",
  shortDescription:
    "COUNTIF na duplikatach: policz, ile razy wraca klient, oflaguj powtórzenia i zrób z tego raport.",
  category: "Praca z danymi",
  difficulty: 2,
  estimatedMinutes: 20,
  learningGoals: [
    "Liczyć wystąpienia wartości w kolumnie funkcją COUNTIF",
    "Blokować zakres dolarami, żeby formuła „widziała” całą listę po skopiowaniu",
    "Oflagować duplikaty przez IF z COUNTIF w środku",
    "Policzyć wiersze powracających klientów jednym COUNTIF",
  ],
  tasks: [
    {
      title: "Ile razy wrócił ten klient? — COUNTIF na sobie",
      instructions:
        "Lista zamówień ma dziesięć wpisów, ale klientów mniej — nazwiska się powtarzają. W **B2** policz, ile razy nazwisko z A2 występuje w całej kolumnie:\n" +
        "`=COUNTIF($A$2:$A$11,A2)`\n" +
        "Zakres obejmuje **całą listę** i jest zablokowany dolarami; kryterium to bieżący wiersz (A2).\n" +
        "(W polskim Excelu: **LICZ.JEŻELI** — ten arkusz liczy angielskie nazwy funkcji.)",
      initialWorkbook: ordersSheet({ "0": { "1": { v: "Ile zamówień" } } }),
      hints: [
        "Bez dolarów, po skopiowaniu w dół, zakres „przesunąłby się” z każdym wierszem — i liczyłby tylko kawałek listy.",
        "Kowalska pojawia się na liście trzy razy.",
      ],
      checks: [
        {
          type: "cellFormula",
          cell: "B2",
          aliases: ["=COUNTIF($A$2:$A$11,A2)"],
          mustInclude: ["$A$2:$A$11"],
        },
        { type: "cellValue", cell: "B2", expected: 3 },
      ],
    },
    {
      title: "Licznik dla całej listy",
      instructions:
        "Skopiuj formułę z **B2** do **B3:B11**. Dzięki `$A$2:$A$11` każda komórka liczy wystąpienia **swojego** nazwiska w tej samej, nieruchomej liście.",
      initialWorkbook: ordersSheet({
        "0": { "1": { v: "Ile zamówień" } },
        "1": { "1": { f: "=COUNTIF($A$2:$A$11,A2)" } },
      }),
      hints: [
        "Formuła w B5 powinna wyglądać tak: =COUNTIF($A$2:$A$11,A5).",
        "Zielińska i Wójcik występują po jednym razie — ich liczniki pokażą 1.",
      ],
      checks: [
        {
          type: "rangeValues",
          range: "B3:B11",
          expected: [3, 3, 2, 3, 3, 1, 3, 1, 2],
        },
      ],
    },
    {
      title: "Flaga duplikatu — IF z COUNTIF w środku",
      instructions:
        "Licznik sam w sobie niewiele mówi kliencie; potrzebna **decyzja**. W **C2** wpisz:\n" +
        '`=IF(COUNTIF($A$2:$A$11,A2)>1,"DUPLIKAT","OK")`\n' +
        "i skopiuj do **C3:C11**. COUNTIF liczy na bieżąco, IF zamienia wynik na flagę: więcej niż 1 → DUPLIKAT.",
      initialWorkbook: ordersSheet({
        "0": { "1": { v: "Ile zamówień" }, "2": { v: "Flaga" } },
        ...counters,
      }),
      hints: [
        "Warunkiem może być całe wyrażenie — tu porównanie COUNTIF(...) z 1.",
        "Osiem wierszy dostanie DUPLIKAT, tylko dwa OK — lista jest mocno powtórzona.",
      ],
      checks: [
        {
          type: "cellFormula",
          cell: "C2",
          aliases: ['=IF(COUNTIF($A$2:$A$11,A2)>1,"DUPLIKAT","OK")'],
          mustInclude: ["COUNTIF", "$A$2:$A$11"],
        },
        { type: "cellValue", cell: "C2", expected: "DUPLIKAT" },
        {
          type: "rangeValues",
          range: "C3:C11",
          expected: [
            "DUPLIKAT",
            "DUPLIKAT",
            "DUPLIKAT",
            "DUPLIKAT",
            "DUPLIKAT",
            "OK",
            "DUPLIKAT",
            "OK",
            "DUPLIKAT",
          ],
        },
      ],
    },
    {
      title: "Raport — zamówienia powracających klientów",
      instructions:
        "Na koniec jeden licznik dla szefa: **ile zamówień złożyli klienci, którzy zamówili więcej niż raz?** W **E2** (obok etykiety w D2) wpisz:\n" +
        '`=COUNTIF(B2:B11,">1")`\n' +
        "Liczymy w kolumnie liczników B — wiersze, gdzie wynik przekracza 1. To wszystko dzięki temu, że najpierw zrobiliśmy licznik per wiersz.",
      initialWorkbook: ordersSheet({
        "0": { "1": { v: "Ile zamówień" }, "2": { v: "Flaga" } },
        "1": {
          "1": { f: "=COUNTIF($A$2:$A$11,A2)" },
          "2": { f: '=IF(COUNTIF($A$2:$A$11,A2)>1,"DUPLIKAT","OK")' },
          "3": { v: "Zamówienia powracających" },
        },
        "2": {
          "1": { f: "=COUNTIF($A$2:$A$11,A3)" },
          "2": { f: '=IF(COUNTIF($A$2:$A$11,A3)>1,"DUPLIKAT","OK")' },
        },
        "3": {
          "1": { f: "=COUNTIF($A$2:$A$11,A4)" },
          "2": { f: '=IF(COUNTIF($A$2:$A$11,A4)>1,"DUPLIKAT","OK")' },
        },
        "4": {
          "1": { f: "=COUNTIF($A$2:$A$11,A5)" },
          "2": { f: '=IF(COUNTIF($A$2:$A$11,A5)>1,"DUPLIKAT","OK")' },
        },
        "5": {
          "1": { f: "=COUNTIF($A$2:$A$11,A6)" },
          "2": { f: '=IF(COUNTIF($A$2:$A$11,A6)>1,"DUPLIKAT","OK")' },
        },
        "6": {
          "1": { f: "=COUNTIF($A$2:$A$11,A7)" },
          "2": { f: '=IF(COUNTIF($A$2:$A$11,A7)>1,"DUPLIKAT","OK")' },
        },
        "7": {
          "1": { f: "=COUNTIF($A$2:$A$11,A8)" },
          "2": { f: '=IF(COUNTIF($A$2:$A$11,A8)>1,"DUPLIKAT","OK")' },
        },
        "8": {
          "1": { f: "=COUNTIF($A$2:$A$11,A9)" },
          "2": { f: '=IF(COUNTIF($A$2:$A$11,A9)>1,"DUPLIKAT","OK")' },
        },
        "9": {
          "1": { f: "=COUNTIF($A$2:$A$11,A10)" },
          "2": { f: '=IF(COUNTIF($A$2:$A$11,A10)>1,"DUPLIKAT","OK")' },
        },
        "10": {
          "1": { f: "=COUNTIF($A$2:$A$11,A11)" },
          "2": { f: '=IF(COUNTIF($A$2:$A$11,A11)>1,"DUPLIKAT","OK")' },
        },
      }),
      hints: [
        "Kryterium `\">1\"` łapie wyniki licznika 2 i 3 — a takich wierszy jest osiem.",
        "Zwróć uwagę: to COUNTIF na LICZBACH z kolumny B, nie na nazwiskach.",
      ],
      checks: [
        {
          type: "cellFormula",
          cell: "E2",
          aliases: ['=COUNTIF(B2:B11,">1")'],
        },
        { type: "cellValue", cell: "E2", expected: 8 },
      ],
    },
  ],
};
