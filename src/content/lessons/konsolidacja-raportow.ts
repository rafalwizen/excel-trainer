import { type LessonInput, type SheetInit } from "../schema";

/**
 * Lesson 28 — consolidating branch reports. Two branch sheets ("Oddzial
 * Krakow", "Oddzial Warszawa") hold identical category tables; the "Raport"
 * sheet adds them cell by cell. The branch names contain spaces on purpose:
 * formulas must wrap them in apostrophes ('Oddzial Krakow'!B2), which is the
 * lesson's second act after plain sheet refs in dane-wiele-arkuszy.
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

const CATEGORIES = ["Usługi", "Szkolenia", "Licencje", "Serwis", "Inne"];

function branchSheet(
  name: string,
  amounts: number[],
): SheetInit {
  const rows: Record<string, Record<string, { v: string | number }>> = {
    "0": { "0": { v: "Kategoria" }, "1": { v: `Kwota ${name} (zł)` } },
  };
  CATEGORIES.forEach((cat, i) => {
    rows[String(i + 1)] = { "0": { v: cat }, "1": { v: amounts[i] } };
  });
  return { name, rowCount: 20, columnCount: 10, cellData: rows };
}

const raportRows: Record<string, Record<string, { v: string | number }>> = {
  "0": {
    "0": { v: "Kategoria" },
    "1": { v: "Razem oba oddziały (zł)" },
    "2": { v: "Udział" },
  },
  "1": { "0": { v: CATEGORIES[0] } },
  "2": { "0": { v: CATEGORIES[1] } },
  "3": { "0": { v: CATEGORIES[2] } },
  "4": { "0": { v: CATEGORIES[3] } },
  "5": { "0": { v: CATEGORIES[4] } },
  "6": { "0": { v: "RAZEM" } },
};

function raportWorkbook(extraRows: ExtraRows = {}) {
  return {
    sheets: [
      { name: "Raport", rowCount: 30, columnCount: 10, cellData: withExtras(raportRows, extraRows) },
      branchSheet("Oddzial Krakow", [12400, 8600, 21300, 7400, 4300]),
      branchSheet("Oddzial Warszawa", [15200, 9800, 25600, 8900, 5100]),
    ],
  };
}

export const konsolidacjaRaportowLesson: LessonInput = {
  slug: "konsolidacja-raportow",
  title: "Konsolidacja raportów",
  shortDescription:
    "Dwa oddziały, dwie karty, jeden raport: sumowanie po arkuszach i udziały procentowe kategorii.",
  category: "Raporty i analiza",
  difficulty: 3,
  estimatedMinutes: 30,
  prerequisites: ["dane-wiele-arkuszy", "suma-warunkow-zaawansowana"],
  learningGoals: [
    "Odwoływać się do arkusza, którego nazwa ma spację (apostrofy)",
    "Konsolidować wiersz po wierszu dane z dwóch arkuszy",
    "Sprawdzać sumę kontrolną raportu sumami źródłowymi",
    "Liczyć udział procentowy kategorii z blokadą `$B$7`",
  ],
  tasks: [
    {
      title: "Nazwa ze spacją — apostrofy",
      instructions:
        "Arkusz `Oddzial Krakow` ma **spację w nazwie** — i to zmienia składnię odwołania. W **B2** wyciągnij kwotę Usług z Krakowa:\n" +
        "`='Oddzial Krakow'!B2`\n" +
        "Nazwa ze spacją wchodzi w **apostrofy**. Bez nich Excel nie wie, gdzie kończy się nazwa arkusza.",
      initialWorkbook: raportWorkbook(),
      hints: [
        "Apostrofy to zwykłe pojedyncze cudzysłowy (klawisz obok Enter) — nie myl ich z odwrotnymi.",
        "Wykrzyknik zostaje zaraz za zamykającym apostrofem.",
      ],
      checks: [
        {
          type: "cellFormula",
          cell: "B2",
          sheet: "Raport",
          aliases: ["='Oddzial Krakow'!B2"],
          mustInclude: ["Oddzial Krakow'!"],
        },
        { type: "cellValue", cell: "B2", sheet: "Raport", expected: 12400 },
      ],
    },
    {
      title: "Konsolidacja — dwa arkusze w jednej formule",
      instructions:
        "Raport ma pokazywać **sumę obu oddziałów** dla każdej kategorii. W **B2** wpisz:\n" +
        "`='Oddzial Krakow'!B2+'Oddzial Warszawa'!B2`\n" +
        "i skopiuj do **B3:B6**. Dwa odwołania, jeden plus — to już jest konsolidacja.",
      initialWorkbook: raportWorkbook(),
      hints: [
        "Obie nazwy arkuszy potrzebują apostrofów — składnia obowiązuje przy każdym odwołaniu.",
        "Usługi: 12400 + 15200.",
      ],
      checks: [
        {
          type: "cellFormula",
          cell: "B2",
          sheet: "Raport",
          aliases: ["='Oddzial Krakow'!B2+'Oddzial Warszawa'!B2"],
        },
        {
          type: "rangeValues",
          range: "B2:B6",
          sheet: "Raport",
          expected: [27600, 18400, 46900, 16300, 9400],
        },
      ],
    },
    {
      title: "Suma kontrolna",
      instructions:
        "Konsolidacja zasługuje na kontrolę. W **B7** policz total raportu:\n" +
        "`=SUM(B2:B6)`\n" +
        "Kontrola po drugiej stronie: suma bezpośrednio po arkuszach (`=SUM('Oddzial Krakow'!B2:B6)+SUM('Oddzial Warszawa'!B2:B6)`) musi dać ten sam wynik.",
      initialWorkbook: raportWorkbook({
        "1": { "1": { f: "='Oddzial Krakow'!B2+'Oddzial Warszawa'!B2" } },
        "2": { "1": { f: "='Oddzial Krakow'!B3+'Oddzial Warszawa'!B3" } },
        "3": { "1": { f: "='Oddzial Krakow'!B4+'Oddzial Warszawa'!B4" } },
        "4": { "1": { f: "='Oddzial Krakow'!B5+'Oddzial Warszawa'!B5" } },
        "5": { "1": { f: "='Oddzial Krakow'!B6+'Oddzial Warszawa'!B6" } },
      }),
      hints: [
        "Total raportu to zwykła suma pięciu skonsolidowanych wierszy.",
        "Obie strony równania powinny wskazać 118600.",
      ],
      checks: [
        { type: "cellFormula", cell: "B7", sheet: "Raport", aliases: ["=SUM(B2:B6)"] },
        { type: "cellValue", cell: "B7", sheet: "Raport", expected: 118600 },
      ],
    },
    {
      title: "Udział kategorii — procenty raportu",
      instructions:
        "Na koniec struktura: **jaka część wydatków przypada na każdą kategorię**. W **C2** wpisz:\n" +
        "`=B2/$B$7`\n" +
        "i skopiuj do **C3:C6**. Total w B7 musi zostać na miejscu przy kopiowaniu — stąd `$B$7`. Potem zaznacz **C2:C6** i ustaw format **Procent** z paska narzędzi (ikona %).",
      initialWorkbook: raportWorkbook({
        "1": { "1": { f: "='Oddzial Krakow'!B2+'Oddzial Warszawa'!B2" } },
        "2": { "1": { f: "='Oddzial Krakow'!B3+'Oddzial Warszawa'!B3" } },
        "3": { "1": { f: "='Oddzial Krakow'!B4+'Oddzial Warszawa'!B4" } },
        "4": { "1": { f: "='Oddzial Krakow'!B5+'Oddzial Warszawa'!B5" } },
        "5": { "1": { f: "='Oddzial Krakow'!B6+'Oddzial Warszawa'!B6" } },
        "6": { "1": { f: "=SUM(B2:B6)" } },
      }),
      hints: [
        "Licznik relatywny (B2→B3…), mianownik zablokowany dolarami — klasyczne mieszane adresowanie.",
        "Udziały muszą sumować się do 100%.",
      ],
      checks: [
        {
          type: "cellFormula",
          cell: "C2",
          sheet: "Raport",
          aliases: ["=B2/$B$7"],
          mustInclude: ["$B$7"],
        },
        {
          type: "rangeValues",
          range: "C2:C6",
          sheet: "Raport",
          tolerance: 0.001,
          expected: [0.2327, 0.1551, 0.3954, 0.1374, 0.0793],
        },
        { type: "cellStyle", cell: "C2", sheet: "Raport", numberFormatSet: true },
      ],
    },
  ],
};
