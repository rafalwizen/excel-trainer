import { workbook, type LessonInput, type WorkbookInit } from "../schema";

/**
 * Lesson 17 — VLOOKUP in exact-match mode over a warehouse price list.
 * The lookup range is written with absolute references ($A$2:$C$8) on purpose:
 * absolute addressing is this lesson's prerequisite and the formulas get
 * copied down, where relative refs would drift off the price list.
 */
function catalogSheet(
  extraRows: Record<string, Record<string, { v: string | number } | { f: string }>> = {},
): WorkbookInit {
  const rows: Record<string, Record<string, { v: string | number } | { f: string }>> =
    {
      "0": {
        "0": { v: "Kod" },
        "1": { v: "Produkt" },
        "2": { v: "Cena (zł)" },
        "4": { v: "Kod" },
        "5": { v: "Sztuk" },
        "6": { v: "Nazwa" },
        "7": { v: "Cena (zł)" },
        "8": { v: "Wartość (zł)" },
      },
      "1": { "0": { v: "K-101" }, "1": { v: "Papier A4" }, "2": { v: 24.9 }, "4": { v: "K-104" }, "5": { v: 3 } },
      "2": { "0": { v: "K-102" }, "1": { v: "Toner HP" }, "2": { v: 129.9 }, "4": { v: "K-102" }, "5": { v: 1 } },
      "3": { "0": { v: "K-103" }, "1": { v: "Notebook 15" }, "2": { v: 3400 }, "4": { v: "K-106" }, "5": { v: 2 } },
      "4": { "0": { v: "K-104" }, "1": { v: "Mysz bezprzewodowa" }, "2": { v: 89 }, "4": { v: "K-101" }, "5": { v: 10 } },
      "5": { "0": { v: "K-105" }, "1": { v: "Zeszyt A5" }, "2": { v: 6.5 } },
      "6": { "0": { v: "K-106" }, "1": { v: "Monitor 24" }, "2": { v: 789 } },
      "7": { "0": { v: "K-107" }, "1": { v: "Długopis" }, "2": { v: 2.5 } },
    };
  for (const [row, cols] of Object.entries(extraRows)) {
    rows[row] = { ...rows[row], ...cols };
  }
  return workbook("Magazyn", 20, 10, rows);
}

const PRICE_LOOKUP = "$A$2:$C$8";

export const wyszukajPionowoLesson: LessonInput = {
  slug: "wyszukaj-pionowo",
  title: "WYSZUKAJ.PIONOWO (VLOOKUP)",
  shortDescription:
    "VLOOKUP: arkusz sam znajduje cenę i nazwę po kodzie produktu — dokładnie tak działa cennik w zamówieniu.",
  category: "Wyszukiwanie",
  difficulty: 2,
  estimatedMinutes: 25,
  prerequisites: ["adresowanie-wzgledne-bezwzgledne"],
  learningGoals: [
    "Wyszukiwać po kluczu funkcją VLOOKUP z dopasowaniem dokładnym",
    "Rozumieć cztery argumenty: czego, gdzie, którą kolumnę, FALSE",
    "Blokować zakres wyszukiwania adresami bezwzględnymi ($A$2:$C$8)",
    "Łączyć VLOOKUP z mnożeniem w jednej formule",
  ],
  tasks: [
    {
      title: "Pierwsze wyszukiwanie — nazwa po kodzie",
      instructions:
        "Po lewej stoi cennik magazynu (kody w A), po prawe zamówienie: kod i liczba sztuk.\n" +
        "W **G2** wpisz, jaka nazwa produktu kryje się pod kodem z E2:\n" +
        "`=VLOOKUP(E2,$A$2:$C$8,2,FALSE)`\n" +
        "Czytamy: znajdź wartość z E2 w **pierwszej kolumnie** zakresu $A$2:$C$8 i zwróć to, co stoi w jego **drugiej kolumnie**. `FALSE` = dopasowanie dokładne (nie „coś podobnego”).\n" +
        "(W polskim Excelu: **WYSZUKAJ.PIONOWO** — ten arkusz liczy angielskie nazwy.)",
      initialWorkbook: catalogSheet(),
      hints: [
        "Zakres blokujemy dolarami — formułę wkrótce skopiujemy w dół i bez `$` cennik by „uciekał”.",
        "Liczba kolumn liczy się od początku zakresu: Kod=1, Produkt=2, Cena=3.",
      ],
      checks: [
        {
          type: "cellFormula",
          cell: "G2",
          aliases: [`=VLOOKUP(E2,${PRICE_LOOKUP},2,FALSE)`],
          mustInclude: ["$A$2:$C$8", "FALSE"],
        },
        { type: "cellValue", cell: "G2", expected: "Mysz bezprzewodowa" },
      ],
    },
    {
      title: "Zmiana kolumny — cena po kodzie",
      instructions:
        "Ta sama mechanika, inna kolumna: w **H2** wyciągnij **cenę** produktu z E2:\n" +
        "`=VLOOKUP(E2,$A$2:$C$8,3,FALSE)`\n" +
        "Zmienił się tylko numer kolumny: 2 → 3.",
      initialWorkbook: catalogSheet({
        "1": { "6": { f: `=VLOOKUP(E2,${PRICE_LOOKUP},2,FALSE)` } },
      }),
      hints: [
        "Cena to trzecia kolumna zakresu — licz razem z tą, w której szukasz.",
      ],
      checks: [
        {
          type: "cellFormula",
          cell: "H2",
          aliases: [`=VLOOKUP(E2,${PRICE_LOOKUP},3,FALSE)`],
        },
        { type: "cellValue", cell: "H2", expected: 89, tolerance: 0.01 },
      ],
    },
    {
      title: "Całe zamówienie — kopiowanie w dół",
      instructions:
        "Zaznacz **G2:H2** i przeciągnij uchwytem wypełniania do **wiersza 5** (albo Ctrl+C / Ctrl+V). " +
        "Kody z E przesuwają się (E2→E3…), a zakres cennika `$A$2:$C$8` dzięki dolarom zostaje na miejscu — " +
        "arkusz domknie całe zamówienie sam.",
      initialWorkbook: catalogSheet({
        "1": {
          "6": { f: `=VLOOKUP(E2,${PRICE_LOOKUP},2,FALSE)` },
          "7": { f: `=VLOOKUP(E2,${PRICE_LOOKUP},3,FALSE)` },
        },
      }),
      hints: [
        "Zaznacz OBIE komórki G2 i H2 naraz — uchwyt wypełni obie kolumny jednym ruchem.",
        "Gdyby wyniki w dolnych wierszach były dziwne, sprawdź, czy w formule dalej stoi $A$2:$C$8.",
      ],
      checks: [
        {
          type: "rangeValues",
          range: "G3:G5",
          expected: ["Toner HP", "Monitor 24", "Papier A4"],
        },
        {
          type: "rangeValues",
          range: "H3:H5",
          expected: [129.9, 789, 24.9],
          tolerance: 0.01,
        },
      ],
    },
    {
      title: "Wartość pozycji — VLOOKUP w obliczeniu",
      instructions:
        "Na koniec policz wartość każdej pozycji: **cena ze cennika × liczba sztuk**. W **I2** wpisz:\n" +
        "`=VLOOKUP(E2,$A$2:$C$8,3,FALSE)*F2`\n" +
        "i skopiuj do **I3:I5**. Wynik funkcji może od razu wchodzić do mnożenia — bez pomijania kroków.",
      initialWorkbook: catalogSheet({
        "1": {
          "6": { f: `=VLOOKUP(E2,${PRICE_LOOKUP},2,FALSE)` },
          "7": { f: `=VLOOKUP(E2,${PRICE_LOOKUP},3,FALSE)` },
        },
        "2": {
          "6": { f: `=VLOOKUP(E3,${PRICE_LOOKUP},2,FALSE)` },
          "7": { f: `=VLOOKUP(E3,${PRICE_LOOKUP},3,FALSE)` },
        },
        "3": {
          "6": { f: `=VLOOKUP(E4,${PRICE_LOOKUP},2,FALSE)` },
          "7": { f: `=VLOOKUP(E4,${PRICE_LOOKUP},3,FALSE)` },
        },
        "4": {
          "6": { f: `=VLOOKUP(E5,${PRICE_LOOKUP},2,FALSE)` },
          "7": { f: `=VLOOKUP(E5,${PRICE_LOOKUP},3,FALSE)` },
        },
      }),
      hints: [
        "Najpierw VLOOKUP znajduje cenę, potem gwiazdka mnoży ją przez sztuki z F2.",
        "Mysz: 89 zł × 3 sztuki = 267 zł.",
      ],
      checks: [
        {
          type: "cellFormula",
          cell: "I2",
          aliases: [
            `=VLOOKUP(E2,${PRICE_LOOKUP},3,FALSE)*F2`,
            "=H2*F2",
          ],
          mustInclude: ["F2"],
        },
        { type: "cellValue", cell: "I2", expected: 267, tolerance: 0.01 },
        {
          type: "rangeValues",
          range: "I3:I5",
          expected: [129.9, 1578, 249],
          tolerance: 0.01,
        },
      ],
    },
  ],
};
