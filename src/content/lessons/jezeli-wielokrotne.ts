import { workbook, type LessonInput, type WorkbookInit } from "../schema";

/**
 * Lesson 24 — IFS and SWITCH: many conditions without nesting IF inside IF.
 * IFS fits ordered thresholds (the first true condition wins); SWITCH maps
 * codes to labels with a default. The closing task rebuilds IFS as a nested
 * IF, because in real spreadsheets both dialects occur.
 */
function invoicesSheet(
  extraRows: Record<string, Record<string, { v: string | number } | { f: string }>> = {},
): WorkbookInit {
  const rows: Record<string, Record<string, { v: string | number } | { f: string }>> =
    {
      "0": {
        "0": { v: "Klient" },
        "1": { v: "Kwota (zł)" },
        "3": { v: "Kod" },
        "4": { v: "Obsługa" },
      },
      "1": { "0": { v: "Kowalska" }, "1": { v: 450 }, "3": { v: "P" } },
      "2": { "0": { v: "Nowak" }, "1": { v: 12500 }, "3": { v: "N" } },
      "3": { "0": { v: "Wiśniewska" }, "1": { v: 3200 }, "3": { v: "S" } },
      "4": { "0": { v: "Zielińska" }, "1": { v: 780 }, "3": { v: "P" } },
      "5": { "0": { v: "Wójcik" }, "1": { v: 15900 }, "3": { v: "N" } },
      "6": { "0": { v: "Kaczmarek" }, "1": { v: 2100 }, "3": { v: "S" } },
      "7": { "0": { v: "Mazur" }, "1": { v: 640 }, "3": { v: "X" } },
      "8": { "0": { v: "Krawczyk" }, "1": { v: 9800 }, "3": { v: "N" } },
    };
  for (const [row, cols] of Object.entries(extraRows)) {
    rows[row] = { ...rows[row], ...cols };
  }
  return workbook("Faktury", 20, 10, rows);
}

export const jezeliWielokrotneLesson: LessonInput = {
  slug: "jezeli-wielokrotne",
  title: "IFS i SWITCH",
  shortDescription:
    "Wiele warunków bez wieży zagnieżdżonych IF: IFS dla progów, SWITCH dla map kodów.",
  category: "Formuły i funkcje",
  difficulty: 3,
  estimatedMinutes: 25,
  prerequisites: ["funkcje-logiczne"],
  learningGoals: [
    "Klasyfikować wartości progami funkcją IFS",
    "Czytać IFS jako listę „warunek → wynik” ocenianą od góry",
    "Zamieniać kody na etykiety funkcją SWITCH z wartością domyślną",
    "Zapisać te same progi jako zagnieżdżone IF",
  ],
  tasks: [
    {
      title: "Progi jednym wzorem — IFS",
      instructions:
        "Trzy klasy faktur: **duże** od 10000 zł, **średnie** od 1000 zł, reszta **małe**. Zagnieżdżony IF zdałby egzamin, ale IFS czyta się jak listę. W **C2** wpisz:\n" +
        '`=IFS(B2>=10000,"duże",B2>=1000,"średnie",TRUE,"małe")`\n' +
        "IFS ocenia pary `warunek;wynik` od góry i staje na pierwszej prawdzie. Para `TRUE,\"małe\"` to łapacz na wszystko, co nie złapało się wyżej.\n" +
        "(W polskim Excelu: **WARUNKI** — ten arkusz liczy angielskie nazwy funkcji.)",
      initialWorkbook: invoicesSheet({ "0": { "2": { v: "Klasa" } } }),
      hints: [
        "Kolejność progów ma znaczenie: od najostrzejszego w dół.",
        "Gdyby `\"małe\"` stało pierwszy, wszystkie faktury byłyby małe — warunek TRUE jest zawsze prawdziwy.",
      ],
      checks: [
        {
          type: "cellFormula",
          cell: "C2",
          aliases: ['=IFS(B2>=10000,"duże",B2>=1000,"średnie",TRUE,"małe")'],
        },
        { type: "cellValue", cell: "C2", expected: "małe" },
      ],
    },
    {
      title: "Klasyfikacja całej listy",
      instructions: "Skopiuj formułę z **C2** do **C3:C9** — każda faktura dostanie swoją klasę.",
      initialWorkbook: invoicesSheet({
        "0": { "2": { v: "Klasa" } },
        "1": { "2": { f: '=IFS(B2>=10000,"duże",B2>=1000,"średnie",TRUE,"małe")' } },
      }),
      hints: [
        "Odwołania biegną w dół razem z formułą: B2→B3→B4…",
        "Trzy duże, dwie średnie, trzy małe.",
      ],
      checks: [
        {
          type: "rangeValues",
          range: "C3:C9",
          expected: ["duże", "średnie", "małe", "duże", "średnie", "małe", "średnie"],
        },
      ],
    },
    {
      title: "Mapa kodów — SWITCH",
      instructions:
        "Kolumna D trzyma kody obsługi: `P`, `N`, `S` — a czasem trafi się coś obcego (`X`). SWITCH zamienia kod na etykietę. W **E2** wpisz:\n" +
        '`=SWITCH(D2,"P","Priorytet","N","Normalny","S","Serwis","Nieznany")`\n' +
        "i skopiuj do **E3:E9**. Pary `kod;etykieta`, a ostatni samotny argument to wartość domyślna dla wszystkiego, czego nie ma na liście.\n" +
        "(Po polsku: **PRZEŁĄCZ**.)",
      initialWorkbook: invoicesSheet({
        "0": { "2": { v: "Klasa" } },
        "1": { "2": { f: '=IFS(B2>=10000,"duże",B2>=1000,"średnie",TRUE,"małe")' } },
        "2": { "2": { f: '=IFS(B3>=10000,"duże",B3>=1000,"średnie",TRUE,"małe")' } },
        "3": { "2": { f: '=IFS(B4>=10000,"duże",B4>=1000,"średnie",TRUE,"małe")' } },
        "4": { "2": { f: '=IFS(B5>=10000,"duże",B5>=1000,"średnie",TRUE,"małe")' } },
        "5": { "2": { f: '=IFS(B6>=10000,"duże",B6>=1000,"średnie",TRUE,"małe")' } },
        "6": { "2": { f: '=IFS(B7>=10000,"duże",B7>=1000,"średnie",TRUE,"małe")' } },
        "7": { "2": { f: '=IFS(B8>=10000,"duże",B8>=1000,"średnie",TRUE,"małe")' } },
        "8": { "2": { f: '=IFS(B9>=10000,"duże",B9>=1000,"średnie",TRUE,"małe")' } },
      }),
      hints: [
        "SWITCH porównuje dokładnie: `P` to nie `p`.",
        "Ósmy wiersz listy (Mazur) ma kod X — tam zadziała wartość domyślna.",
      ],
      checks: [
        {
          type: "cellFormula",
          cell: "E2",
          aliases: ['=SWITCH(D2,"P","Priorytet","N","Normalny","S","Serwis","Nieznany")'],
        },
        { type: "cellValue", cell: "E2", expected: "Priorytet" },
        { type: "cellValue", cell: "E8", expected: "Nieznany" },
      ],
    },
    {
      title: "Stara szkoła — zagnieżdżone IF",
      instructions:
        "Starsze skoroszyty pełne są zagnieżdżonych IF — musisz je czytać, zanim przepiszesz na IFS. W **F2** zapisz klasę faktury **jednym zagnieżdżonym IF** (IF w IF), bez IFS:\n" +
        "`=IF(B2>=10000,\"duże\",IF(B2>=1000,\"średnie\",\"małe\"))`\n" +
        "Zewnętrzny IF łapie duże; wewnętrzny rozstrzyga resztę. Ten sam wynik co IFS, czytany od środka.",
      initialWorkbook: invoicesSheet({
        "0": { "2": { v: "Klasa" }, "5": { v: "Klasa (IF)" } },
        "1": { "2": { f: '=IFS(B2>=10000,"duże",B2>=1000,"średnie",TRUE,"małe")' } },
        "2": { "2": { f: '=IFS(B3>=10000,"duże",B3>=1000,"średnie",TRUE,"małe")' } },
        "3": { "2": { f: '=IFS(B4>=10000,"duże",B4>=1000,"średnie",TRUE,"małe")' } },
        "4": { "2": { f: '=IFS(B5>=10000,"duże",B5>=1000,"średnie",TRUE,"małe")' } },
        "5": { "2": { f: '=IFS(B6>=10000,"duże",B6>=1000,"średnie",TRUE,"małe")' } },
        "6": { "2": { f: '=IFS(B7>=10000,"duże",B7>=1000,"średnie",TRUE,"małe")' } },
        "7": { "2": { f: '=IFS(B8>=10000,"duże",B8>=1000,"średnie",TRUE,"małe")' } },
        "8": { "2": { f: '=IFS(B9>=10000,"duże",B9>=1000,"średnie",TRUE,"małe")' } },
      }),
      hints: [
        "Struktura: IF(prog duży, „duże”, IF(prog średni, „średnie”, „małe”)).",
        "Wynik musi być zgodny z C2 — porównaj po wpisaniu.",
      ],
      checks: [
        {
          type: "cellFormula",
          cell: "F2",
          aliases: ['=IF(B2>=10000,"duże",IF(B2>=1000,"średnie","małe"))'],
        },
        { type: "cellValue", cell: "F2", expected: "małe" },
      ],
    },
  ],
};
