import { workbook, type LessonInput, type WorkbookInit } from "../schema";

/**
 * Lesson 30 — data cleaning: TRIM+PROPER in one formula, SUBSTITUTE to strip
 * a prefix, TEXTSPLIT to explode CSV-like cells into columns (horizontal
 * spill, verified in the probe — numeric fragments come back as numbers),
 * and a closing task that accepts any method (typed or formula) via an
 * unordered range check.
 */
function importSheet(
  extraRows: Record<string, Record<string, { v: string | number } | { f: string }>> = {},
): WorkbookInit {
  const rows: Record<string, Record<string, { v: string | number } | { f: string }>> =
    {
      "0": {
        "0": { v: "Nazwisko (bałagan)" },
        "1": { v: "Telefon z prefiksem" },
        "2": { v: "Dane (przecinki)" },
        "3": { v: "Miasto" },
        "5": { v: "Nazwisko czyste" },
        "6": { v: "Telefon czysty" },
        "8": { v: "Nazwisko" },
        "9": { v: "Imię" },
        "10": { v: "Wiek" },
        "12": { v: "Miasta bez powtórek" },
      },
      "1": { "0": { v: "  anna kowalska  " }, "1": { v: "tel: 601-234-567" }, "2": { v: "Kowalski,Anna,32" }, "3": { v: "Warszawa" } },
      "2": { "0": { v: "piotr  nowak" }, "1": { v: "tel: 502-111-222" }, "2": { v: "Nowak,Piotr,45" }, "3": { v: "Kraków" } },
      "3": { "0": { v: "MARIA WIŚNIEWSKA" }, "1": { v: "tel: 693-888-999" }, "2": { v: "Zieliński,Łukasz,28" }, "3": { v: "Warszawa" } },
      "4": { "0": { v: "łukasz   zieliński" }, "1": { v: "tel: 725-555-121" }, "2": { v: "Wójcik,Katarzyna,39" }, "3": { v: "Gdańsk" } },
      "5": { "0": { v: "katarzyna wójcik" }, "1": { v: "tel: 600-101-202" }, "2": { v: "Wiśniewska,Maria,51" }, "3": { v: "Poznań" } },
      "6": { "3": { v: "Kraków" } },
      "7": { "3": { v: "Warszawa" } },
      "8": { "3": { v: "Wrocław" } },
      "9": { "3": { v: "Poznań" } },
      "10": { "3": { v: "Gdańsk" } },
      "11": { "3": { v: "Kraków" } },
    };
  for (const [row, cols] of Object.entries(extraRows)) {
    rows[row] = { ...rows[row], ...cols };
  }
  return workbook("Import", 20, 14, rows);
}

export const czyszczenieDanychLesson: LessonInput = {
  slug: "czyszczenie-danych",
  title: "Czyszczenie danych",
  shortDescription:
    "TRIM z PROPER, usuwanie prefiksów SUBSTITUTE i rozbijanie TEXTSPLIT — z bałaganu importu do czystej listy.",
  category: "Praca z danymi",
  difficulty: 3,
  estimatedMinutes: 35,
  prerequisites: ["tekst-podstawy"],
  learningGoals: [
    "Czyścić tekst jedną formułą łańcuchową: TRIM w PROPER",
    "Usuwać prefiksy funkcją SUBSTITUTE",
    "Rozbijać pole z przecinkami na kolumny funkcją TEXTSPLIT",
    "Wyciągać listę unikalnych miast z dowolnej pozycji",
  ],
  tasks: [
    {
      title: "Nazwiska do porządku — PROPER(TRIM(...))",
      instructions:
        "Import wyrzuca nazwiska w każdym stylu: spacje na brzegach, podwójne spacje, WIELKIE LITERY. Dwie funkcje łańcuchowo i po sprawie. W **F2** wpisz:\n" +
        "`=PROPER(TRIM(A2))`\n" +
        "i skopiuj do **F3:F6**. Czytamy od środka: TRIM zbiera spacje z brzegów i zwija podwójne, PROPER kapitalizuje pierwsze litery słów.\n" +
        "(W polskim Excelu: **Z.WIELKIEJ.LITERY(USUŃ.ZBĘDNE.ODSTĘPY(...))** — ten arkusz liczy angielskie nazwy funkcji.)",
      initialWorkbook: importSheet(),
      hints: [
        "Kolejność ma znaczenie: najpierw TRIM czyści, potem PROPER kapitalizuje.",
        "„MARIA WIŚNIEWSKA” też przejdzie — PROPER ściska nadmiarowe wielkie litery.",
      ],
      checks: [
        { type: "cellFormula", cell: "F2", aliases: ["=PROPER(TRIM(A2))"] },
        {
          type: "rangeValues",
          range: "F2:F6",
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
      title: "Prefiks w koszu — SUBSTITUTE",
      instructions:
        "Telefony przyszły z nadrukowanym `tel: `, a system chce same cyfry. W **G2** wpisz:\n" +
        '`=SUBSTITUTE(B2,"tel: ","")`\n' +
        "i skopiuj do **G3:G6**. Zamiennik na pusty tekst (`\"\"`) po prostu usuwa szukany fragment.",
      initialWorkbook: importSheet({
        "1": { "5": { f: "=PROPER(TRIM(A2))" } },
        "2": { "5": { f: "=PROPER(TRIM(A3))" } },
        "3": { "5": { f: "=PROPER(TRIM(A4))" } },
        "4": { "5": { f: "=PROPER(TRIM(A5))" } },
        "5": { "5": { f: "=PROPER(TRIM(A6))" } },
      }),
      hints: [
        "Wyszukiwany fragment musi pasować co do znaku — łącznie ze spacją za dwukropkiem.",
        "Myślniki zostają: usuwamy tylko prefiks.",
      ],
      checks: [
        { type: "cellFormula", cell: "G2", aliases: ['=SUBSTITUTE(B2,"tel: ","")'] },
        {
          type: "rangeValues",
          range: "G2:G6",
          expected: ["601-234-567", "502-111-222", "693-888-999", "725-555-121", "600-101-202"],
        },
      ],
    },
    {
      title: "Jedno pole na trzy kolumny — TEXTSPLIT",
      instructions:
        "Trzecia kolumna to trzy informacje zbite w jedno: `nazwisko,imię,wiek`. TEXTSPLIT rozbija tekst **na przecinku** i rozlewa wynik w prawo. W **I2** wpisz:\n" +
        '`=TEXTSPLIT(C2,",")`\n' +
        "i skopiuj do **I3:I6**. Każdy wiersz rozleje się na trzy komórki: I (nazwisko), J (imię), K (wiek).\n" +
        "(Po polsku: **PODZIEL.TEKST**.)",
      initialWorkbook: importSheet({
        "1": {
          "5": { f: "=PROPER(TRIM(A2))" },
          "6": { f: '=SUBSTITUTE(B2,"tel: ","")' },
        },
        "2": {
          "5": { f: "=PROPER(TRIM(A3))" },
          "6": { f: '=SUBSTITUTE(B3,"tel: ","")' },
        },
        "3": {
          "5": { f: "=PROPER(TRIM(A4))" },
          "6": { f: '=SUBSTITUTE(B4,"tel: ","")' },
        },
        "4": {
          "5": { f: "=PROPER(TRIM(A5))" },
          "6": { f: '=SUBSTITUTE(B5,"tel: ","")' },
        },
        "5": {
          "5": { f: "=PROPER(TRIM(A6))" },
          "6": { f: '=SUBSTITUTE(B6,"tel: ","")' },
        },
      }),
      hints: [
        "Separator w cudzysłowie to zwykły przecinek: \",\".",
        "Wiek wyjdzie jako liczba — TEXTSPLIT rozpoznaje liczby w kawałkach.",
      ],
      checks: [
        { type: "cellFormula", cell: "I2", aliases: ['=TEXTSPLIT(C2,",")'] },
        {
          type: "rangeValues",
          range: "I2:K6",
          expected: [
            "Kowalski", "Anna", 32,
            "Nowak", "Piotr", 45,
            "Zieliński", "Łukasz", 28,
            "Wójcik", "Katarzyna", 39,
            "Wiśniewska", "Maria", 51,
          ],
        },
      ],
    },
    {
      title: "Miasta bez powtórek — po swojemu",
      instructions:
        "Ostatni raport: **jakie miasta odwiedziła firma** — każdy raz jeden, kolejność obojętna. Wpisz pięć miast do **M2:M6**. Możesz ręcznie (masz listę w D), a możesz formułą: `=SORT(UNIQUE(D2:D11))` w M2 rozleje się sama — wybór należy do Ciebie.",
      initialWorkbook: importSheet({
        "1": {
          "5": { f: "=PROPER(TRIM(A2))" },
          "6": { f: '=SUBSTITUTE(B2,"tel: ","")' },
          "8": { f: '=TEXTSPLIT(C2,",")' },
        },
        "2": {
          "5": { f: "=PROPER(TRIM(A3))" },
          "6": { f: '=SUBSTITUTE(B3,"tel: ","")' },
          "8": { f: '=TEXTSPLIT(C3,",")' },
        },
        "3": {
          "5": { f: "=PROPER(TRIM(A4))" },
          "6": { f: '=SUBSTITUTE(B4,"tel: ","")' },
          "8": { f: '=TEXTSPLIT(C4,",")' },
        },
        "4": {
          "5": { f: "=PROPER(TRIM(A5))" },
          "6": { f: '=SUBSTITUTE(B5,"tel: ","")' },
          "8": { f: '=TEXTSPLIT(C5,",")' },
        },
        "5": {
          "5": { f: "=PROPER(TRIM(A6))" },
          "6": { f: '=SUBSTITUTE(B6,"tel: ","")' },
          "8": { f: '=TEXTSPLIT(C6,",")' },
        },
      }),
      hints: [
        "Miast jest pięć: Warszawa, Kraków, Gdańsk, Poznań, Wrocław.",
        "Kolejność nie ma znaczenia — sprawdzarka szuka wartości, nie kolejności.",
      ],
      checks: [
        {
          type: "rangeValuesUnordered",
          range: "M2:M6",
          expected: ["Warszawa", "Kraków", "Gdańsk", "Poznań", "Wrocław"],
        },
      ],
    },
  ],
};
