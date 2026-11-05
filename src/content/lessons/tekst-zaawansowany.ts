import { workbook, type LessonInput, type WorkbookInit } from "../schema";

/**
 * Lesson 25 — advanced text functions on a staff roster: SUBSTITUTE to strip
 * separators, PROPER for title case (Polish diacritics verified in the
 * engine probe), MID to slice from the middle, TEXTJOIN with skip-empty.
 */
function rosterSheet(
  extraRows: Record<string, Record<string, { v: string | number } | { f: string }>> = {},
): WorkbookInit {
  const rows: Record<string, Record<string, { v: string | number } | { f: string }>> =
    {
      "0": {
        "0": { v: "Nazwisko (do poprawy)" },
        "1": { v: "Miasto" },
        "2": { v: "Telefon" },
        "3": { v: "Uwagi" },
        "5": { v: "Telefon cyframi" },
        "6": { v: "Nazwa pełna" },
        "7": { v: "Środek numeru" },
        "8": { v: "Wizytówka" },
      },
      "1": { "0": { v: "anna kowalska" }, "1": { v: "Warszawa" }, "2": { v: "601-234-567" } },
      "2": { "0": { v: "piotr nowak" }, "1": { v: "Kraków" }, "2": { v: "502-111-222" } },
      "3": {
        "0": { v: "maria wiśniewska" },
        "1": { v: "Gdańsk" },
        "2": { v: "693-888-999" },
        "3": { v: "faktura VAT" },
      },
      "4": { "0": { v: "łukasz zieliński" }, "1": { v: "Poznań" }, "2": { v: "725-555-121" } },
      "5": { "0": { v: "katarzyna wójcik" }, "1": { v: "Wrocław" }, "2": { v: "600-101-202" } },
    };
  for (const [row, cols] of Object.entries(extraRows)) {
    rows[row] = { ...rows[row], ...cols };
  }
  return workbook("Kartoteka", 20, 12, rows);
}

export const tekstZaawansowanyLesson: LessonInput = {
  slug: "tekst-zaawansowany",
  title: "Funkcje tekstowe: zaawansowane",
  shortDescription:
    "SUBSTITUTE, PROPER, MID i TEXTJOIN — doprowadzanie kartoteki do porządku jedną formułą na krok.",
  category: "Tekst i daty",
  difficulty: 3,
  estimatedMinutes: 35,
  prerequisites: ["tekst-podstawy"],
  learningGoals: [
    "Podmieniać znaki w tekście funkcją SUBSTITUTE",
    "Naprawiać wielkość liter funkcją PROPER",
    "Wycinać środek tekstu funkcją MID",
    "Sklejać wiele pól funkcją TEXTJOIN z pomijaniem pustych",
  ],
  tasks: [
    {
      title: "Telefon bez myślników — SUBSTITUTE",
      instructions:
        "System kartotek chce telefony samymi cyframi, a ludzie wpisują je z myślnikami. SUBSTITUTE podmienia **każde** wystąpienie znaku. W **F2** wpisz:\n" +
        '`=SUBSTITUTE(C2,"-","")`\n' +
        "i skopiuj do **F3:F6**. Trzy argumenty: gdzie, co, na co. Pusty trzeci argument (`\"\"`) znaczy „usuń”.\n" +
        "(W polskim Excelu: **PODSTAW** — ten arkusz liczy angielskie nazwy funkcji.)",
      initialWorkbook: rosterSheet(),
      hints: [
        "SUBSTITUTE zamienia wszystkie myślniki naraz — nie jeden na raz.",
        "Wynik to tekst z cyframi: 601-234-567 stanie się 601234567.",
      ],
      checks: [
        { type: "cellFormula", cell: "F2", aliases: ['=SUBSTITUTE(C2,"-","")'] },
        {
          type: "rangeValues",
          range: "F2:F6",
          expected: ["601234567", "502111222", "693888999", "725555121", "600101202"],
        },
      ],
    },
    {
      title: "Wielkie litery tam, gdzie trzeba — PROPER",
      instructions:
        "Nazwiska wpisywano na luzie: małe litery, bez kapitali. PROPER kapitalizuje **pierwszą literę każdego słowa**. W **G2** wpisz:\n" +
        "`=PROPER(A2)`\n" +
        "i skopiuj do **G3:G6**. Polskie znaki diakrytyczne (ł, ś, ó…) traktuje jak zwykłe litery.\n" +
        "(Po polsku: **Z.WIELKIEJ.LITERY**.)",
      initialWorkbook: rosterSheet({
        "1": { "5": { f: '=SUBSTITUTE(C2,"-","")' } },
        "2": { "5": { f: '=SUBSTITUTE(C3,"-","")' } },
        "3": { "5": { f: '=SUBSTITUTE(C4,"-","")' } },
        "4": { "5": { f: '=SUBSTITUTE(C5,"-","")' } },
        "5": { "5": { f: '=SUBSTITUTE(C6,"-","")' } },
      }),
      hints: [
        "PROPER działa na słowach, nie na całym tekście naraz — każde słowo dostaje swoją wielką literę.",
        "„łukasz zieliński” musi wyjść jako „Łukasz Zieliński”.",
      ],
      checks: [
        { type: "cellFormula", cell: "G2", aliases: ["=PROPER(A2)"] },
        {
          type: "rangeValues",
          range: "G2:G6",
          expected: [
            "Anna Kowalska",
            "Piotr Nowak",
            "Maria Wiśniewska",
            "Łukasz Zieliński",
            "Katarzyna Wójcik",
          ],
        },
      ],
    },
    {
      title: "Środek numeru — MID",
      instructions:
        "Dział techniczny chce z numeru telefonu wyciąć **centralę**: trzy cyfry ze środka. LEFT i RIGHT odpadają — potrzebny MID, który tnie **od dowolnego miejsca**. W **H2** wpisz:\n" +
        "`=MID(F2,4,3)`\n" +
        "i skopiuj do **H3:H6**. Argumenty: tekst, od której pozycji, ile znaków. F2 trzyma już numer bez myślników z pierwszego zadania.\n" +
        "(Po polsku: **FRAGMENT.TEKSTU**.)",
      initialWorkbook: rosterSheet({
        "1": {
          "5": { f: '=SUBSTITUTE(C2,"-","")' },
          "6": { f: "=PROPER(A2)" },
        },
        "2": {
          "5": { f: '=SUBSTITUTE(C3,"-","")' },
          "6": { f: "=PROPER(A3)" },
        },
        "3": {
          "5": { f: '=SUBSTITUTE(C4,"-","")' },
          "6": { f: "=PROPER(A4)" },
        },
        "4": {
          "5": { f: '=SUBSTITUTE(C5,"-","")' },
          "6": { f: "=PROPER(A5)" },
        },
        "5": {
          "5": { f: '=SUBSTITUTE(C6,"-","")' },
          "6": { f: "=PROPER(A6)" },
        },
      }),
      hints: [
        "Cyfry liczymy od lewej: 601 to pozycje 1-3, środek zaczyna się od pozycji 4.",
        "MID zwraca tekst — nawet gdy wycina same cyfry.",
      ],
      checks: [
        { type: "cellFormula", cell: "H2", aliases: ["=MID(F2,4,3)"] },
        { type: "rangeValues", range: "H2:H6", expected: ["234", "111", "888", "555", "101"] },
      ],
    },
    {
      title: "Wizytówka — TEXTJOIN z pomijaniem pustych",
      instructions:
        "Zbierz wszystko w jedno pole „Nazwa, Miasto, Uwagi”. TEXTJOIN dokleja elementy z separatorem — a drugi argument `TRUE` każe mu **pomijać puste komórki**. W **I2** wpisz:\n" +
        '`=TEXTJOIN(", ",TRUE,G2,B2,D2)`\n' +
        "i skopiuj do **I3:I6**. Kolumna Uwagi (D) jest prawie pusta: tylko jedna osoba ma tam dopisek — u niej wizytówka będzie dłuższa.\n" +
        "(Po polsku: **POŁĄCZ.TEKSTY**.)",
      initialWorkbook: rosterSheet({
        "1": {
          "5": { f: '=SUBSTITUTE(C2,"-","")' },
          "6": { f: "=PROPER(A2)" },
          "7": { f: "=MID(F2,4,3)" },
        },
        "2": {
          "5": { f: '=SUBSTITUTE(C3,"-","")' },
          "6": { f: "=PROPER(A3)" },
          "7": { f: "=MID(F3,4,3)" },
        },
        "3": {
          "5": { f: '=SUBSTITUTE(C4,"-","")' },
          "6": { f: "=PROPER(A4)" },
          "7": { f: "=MID(F4,4,3)" },
        },
        "4": {
          "5": { f: '=SUBSTITUTE(C5,"-","")' },
          "6": { f: "=PROPER(A5)" },
          "7": { f: "=MID(F5,4,3)" },
        },
        "5": {
          "5": { f: '=SUBSTITUTE(C6,"-","")' },
          "6": { f: "=PROPER(A6)" },
          "7": { f: "=MID(F6,4,3)" },
        },
      }),
      hints: [
        "Gdyby drugi argument był FALSE, pusta kolumna D zostawiłaby wiszący przecinek.",
        "„Maria Wiśniewska” ma dopisek w D — jej wizytówka ma trzy elementy.",
      ],
      checks: [
        { type: "cellFormula", cell: "I2", aliases: ['=TEXTJOIN(", ",TRUE,G2,B2,D2)'] },
        {
          type: "rangeValues",
          range: "I2:I6",
          expected: [
            "Anna Kowalska, Warszawa",
            "Piotr Nowak, Kraków",
            "Maria Wiśniewska, Gdańsk, faktura VAT",
            "Łukasz Zieliński, Poznań",
            "Katarzyna Wójcik, Wrocław",
          ],
        },
      ],
    },
  ],
};
