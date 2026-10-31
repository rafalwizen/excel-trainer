import type { Lesson, WorkbookInit } from "../schema";

/**
 * Lesson 3 — relative vs absolute references, taught on VAT and a discount:
 * one $F$1 cell feeds a whole column, so copying the formula down must keep
 * $F$1 and shift B2→B3. Later tasks pre-fill the earlier formulas (via the
 * `f` field) because each task starts from a fresh workbook.
 */
function productSheet(
  extraRows: Record<string, Record<string, { v?: string | number; f?: string }>> = {},
): WorkbookInit {
  const rows: Record<string, Record<string, { v?: string | number; f?: string }>> =
    {
      "0": {
        "0": { v: "Produkt" },
        "1": { v: "Cena netto (zł)" },
        "2": { v: "Cena brutto (zł)" },
      },
      "1": { "0": { v: "Kawa" }, "1": { v: 12 } },
      "2": { "0": { v: "Herbata" }, "1": { v: 9 } },
      "3": { "0": { v: "Kakao" }, "1": { v: 11 } },
      "4": { "0": { v: "Sok" }, "1": { v: 29 } },
      "5": { "0": { v: "Woda" }, "1": { v: 5 } },
    };
  for (const [row, cols] of Object.entries(extraRows)) {
    rows[row] = { ...rows[row], ...cols };
  }
  return {
    sheetName: "Arkusz1",
    rowCount: 20,
    columnCount: 10,
    cellData: rows,
  };
}

// The brutto formula every task builds on, filled down across rows 2-6.
const bruttoFormulas: Record<string, Record<string, { f: string }>> = {
  "1": { "2": { f: "=B2*(1+$F$1)" } },
  "2": { "2": { f: "=B3*(1+$F$1)" } },
  "3": { "2": { f: "=B4*(1+$F$1)" } },
  "4": { "2": { f: "=B5*(1+$F$1)" } },
  "5": { "2": { f: "=B6*(1+$F$1)" } },
};

export const adresowanieWzgledneBezwzgledneLesson: Lesson = {
  slug: "adresowanie-wzgledne-bezwzgledne",
  title: "Adresowanie względne i bezwzględne",
  shortDescription:
    "Względne B2 czy bezwzględne $F$1? Policz VAT i rabat, kopiując jedną formułę na całą kolumnę.",
  category: "Adresowanie",
  difficulty: 2,
  tasks: [
    {
      title: "Stawka VAT w jednej komórce",
      instructions:
        "W komórce **F1**, obok etykiety „Stawka VAT”, wpisz `0.23` — z kropką dziesiętną. " +
        "Wszystkie formuły w tej lekcji będą się odwoływać właśnie do tej jednej komórki.",
      initialWorkbook: productSheet({ "0": { "4": { v: "Stawka VAT" } } }),
      hints: [
        "Liczby dziesiętne wpisuj z kropką: `0.23`, nie `0,23`.",
        "F1 to skrzyżowanie kolumny F i wiersza 1.",
      ],
      checks: [
        { type: "cellValue", cell: "F1", expected: 0.23, tolerance: 0.005 },
      ],
    },
    {
      title: "Formuła z adresem bezwzględnym",
      instructions:
        "W **C2** wpisz `=B2*(1+$F$1)` — cena netto razy (1 + VAT).\n" +
        "Znaki `$` w `$F$1` to adres **bezwzględny**: komórka jest „zamrożona” i po skopiowaniu " +
        "formuły zawsze wskazuje na F1. Samo `B2` to adres **względny** — ten będzie się przesuwał.",
      initialWorkbook: productSheet({
        "0": { "4": { v: "Stawka VAT" }, "5": { v: 0.23 } },
      }),
      hints: [
        "Dolar wpisujesz z klawiatury (Shift+4) albo klawiszem **F4** podczas edycji adresu — przełącza on B2 → $B$2 → B$2 → B2.",
        "Bez dolarów formuła wyglądałaby na poprawną, ale w następnym zadaniu po skopiowaniu wskazałaby złe komórki.",
      ],
      checks: [
        {
          type: "cellFormula",
          cell: "C2",
          aliases: ["=B2*(1+$F$1)"],
          mustInclude: ["B2", "$F$1"],
        },
        { type: "cellValue", cell: "C2", expected: 14.76, tolerance: 0.01 },
      ],
    },
    {
      title: "Kopiujemy formułę w dół",
      instructions:
        "Skopiuj formułę z **C2** do **C3:C6**: zaznacz C2, złap uchwyt wypełniania " +
        "(mały kwadracik w prawym dolnym rogu zaznaczenia) i przeciągnij w dół do C6. " +
        "Możesz też skopiować Ctrl+C i wkleić Ctrl+V.\n" +
        "Patrz na pasek formuły: `B2` zmienia się na `B3`, `B4`…, a `$F$1` zostaje bez zmian — " +
        "na tym polega różnica między adresowaniem względnym i bezwzględnym.",
      initialWorkbook: productSheet({
        "0": { "4": { v: "Stawka VAT" }, "5": { v: 0.23 } },
        ...bruttoFormulas,
      }),
      hints: [
        "Uchwyt wypełniania pojawi się, gdy najedziesz kursorem na prawy dolny róg zaznaczonej komórki.",
        "Nie chce się przeciągać? Skopiuj C2 (Ctrl+C), zaznacz C3:C6 i wklej (Ctrl+V).",
      ],
      checks: [
        {
          type: "rangeValues",
          range: "C3:C6",
          expected: [11.07, 13.53, 35.67, 6.15],
          tolerance: 0.01,
        },
        {
          type: "cellFormula",
          cell: "C3",
          aliases: ["=B3*(1+$F$1)"],
          mustInclude: ["$F$1"],
        },
      ],
    },
    {
      title: "Rabat — drugi adres bezwzględny",
      instructions:
        "Sklep daje rabat 10%:\n" +
        "- w **I1**, obok etykiety „Rabat”, wpisz `0.1`\n" +
        "- w **D2** wpisz `=C2*(1-$I$1)` i skopiuj do **D3:D6** (uchwytem wypełniania lub Ctrl+C/V)",
      initialWorkbook: productSheet({
        "0": {
          "4": { v: "Stawka VAT" },
          "5": { v: 0.23 },
          "3": { v: "Po rabacie (zł)" },
          "7": { v: "Rabat" },
        },
        ...bruttoFormulas,
      }),
      hints: [
        "Tym razem dolar „zamraża” I1 — rabat masz w jednym miejscu i możesz go zmienić dla całej kolumny.",
        "Formuła mnoży cenę brutto przez (1 − rabat), czyli odejmuje 10%.",
      ],
      checks: [
        { type: "cellValue", cell: "I1", expected: 0.1, tolerance: 0.005 },
        {
          type: "cellFormula",
          cell: "D2",
          aliases: ["=C2*(1-$I$1)"],
          mustInclude: ["$I$1"],
        },
        {
          type: "cellFormula",
          cell: "D3",
          aliases: ["=C3*(1-$I$1)"],
          mustInclude: ["$I$1"],
        },
        {
          type: "rangeValues",
          range: "D2:D6",
          expected: [13.284, 9.963, 12.177, 32.103, 5.535],
          tolerance: 0.01,
        },
      ],
    },
    {
      title: "Suma brutto — raport końcowy",
      instructions:
        "Na koniec policz całą kasę: w **C8** wpisz `=SUM(C2:C6)` — sumę wszystkich cen brutto. " +
        "(Po polsku: **SUMA**.)",
      initialWorkbook: productSheet({
        "0": { "4": { v: "Stawka VAT" }, "5": { v: 0.23 } },
        "7": { "0": { v: "Razem brutto (zł)" } },
        ...bruttoFormulas,
      }),
      hints: [
        "To ta sama funkcja co w lekcji o formułach — tym razem sumujesz kolumnę C.",
      ],
      checks: [
        { type: "cellFormula", cell: "C8", aliases: ["=SUM(C2:C6)"] },
        { type: "cellValue", cell: "C8", expected: 81.18, tolerance: 0.01 },
      ],
    },
  ],
};
