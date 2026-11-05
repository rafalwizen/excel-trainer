import { workbook, type LessonInput, type WorkbookInit } from "../schema";

/**
 * Lesson 20 — ordering data: one manual task (retype amounts descending) and
 * three SORT formula tasks. SORT is an array function: one formula "spills"
 * down the column by itself, so checks pair a cellFormula on the anchor with
 * rangeValues over the spilled area. Fallback if spill misbehaves is to drop
 * the SORT tasks — verified empirically in the probe.
 */
function firmsSheet(
  extraRows: Record<string, Record<string, { v: string | number } | { f: string }>> = {},
): WorkbookInit {
  const rows: Record<string, Record<string, { v: string | number } | { f: string }>> =
    {
      "0": { "0": { v: "Firma" }, "1": { v: "Kwota (zł)" } },
      "1": { "0": { v: "Alfa Sp. z o.o." }, "1": { v: 12450 } },
      "2": { "0": { v: "Beta S.A." }, "1": { v: 8300 } },
      "3": { "0": { v: "Gamma Consulting" }, "1": { v: 15200 } },
      "4": { "0": { v: "Delta Logistyka" }, "1": { v: 4300 } },
      "5": { "0": { v: "Epsilon Media" }, "1": { v: 9800 } },
      "6": { "0": { v: "Zeta Print" }, "1": { v: 6150 } },
      "7": { "0": { v: "Omega Foods" }, "1": { v: 11500 } },
    };
  for (const [row, cols] of Object.entries(extraRows)) {
    rows[row] = { ...rows[row], ...cols };
  }
  return workbook("Klienci", 20, 10, rows);
}

export const sortowanieIOrganizacjaLesson: LessonInput = {
  slug: "sortowanie-i-organizacja",
  title: "Sortowanie i organizacja danych",
  shortDescription:
    "Porządkowanie listy: najpierw ręcznie, potem jedną formułą SORT — rosnąco, malejąco i całą tabelę.",
  category: "Praca z danymi",
  difficulty: 2,
  estimatedMinutes: 25,
  learningGoals: [
    "Uporządkować dane ręcznie — i wiedzieć, kiedy to wystarczy",
    "Sortować jedną formułą SORT, bez ruszania oryginału",
    "Sortować malejąco z argumentem -1",
    "Sortować dwukolumnową tabelę tak, aby wiersze zostały razem",
  ],
  tasks: [
    {
      title: "Ranking ręcznie — od największej do najmniejszej",
      instructions:
        "Kierownik chce zobaczyć faktury **malejąco**: od największej kwoty. W prawdziwym Excelu służy do tego sortowanie z menu; w tym arkuszu zrobisz ranking ręcznie.\n" +
        "W kolumnie **C** (nagłówek już czeka) przepisz kwoty z B w kolejności **od największej do najmniejszej** — same liczby, bez formuł.",
      initialWorkbook: firmsSheet({ "0": { "2": { v: "Malejąco (przepisz)" } } }),
      hints: [
        "Największa kwota w kolumnie B to 15200 — od niej zacznij.",
        "Siedem kwot, siedem komórek: C2 do C8.",
      ],
      checks: [
        {
          type: "rangeValues",
          range: "C2:C8",
          expected: [15200, 12450, 11500, 9800, 8300, 6150, 4300],
        },
      ],
    },
    {
      title: "Jedna formuła sortuje — SORT",
      instructions:
        "Ręczne przepisywanie się nie skaluje. Funkcja SORT sortuje zakres i **sama rozlewa wynik w dół** — wpisyujesz formułę tylko w pierwszej komórce:\n" +
        "W **D2** wpisz `=SORT(B2:B8)`\n" +
        "i zobacz, jak cała kolumna D wypełnia się kwotami rosnąco. Oryginał w B zostaje nietknięty.",
      initialWorkbook: firmsSheet({
        "0": { "2": { v: "Malejąco (przepisz)" }, "3": { v: "SORT rosnąco" } },
        "1": { "2": { v: 15200 } },
        "2": { "2": { v: 12450 } },
        "3": { "2": { v: 11500 } },
        "4": { "2": { v: 9800 } },
        "5": { "2": { v: 8300 } },
        "6": { "2": { v: 6150 } },
        "7": { "2": { v: 4300 } },
      }),
      hints: [
        "Formuła tylko w D2 — dolne komórki wypełnią się same. Nie kopiuj jej w dół.",
        "SORT domyślnie sortuje rosnąco: od najmniejszej do największej.",
      ],
      checks: [
        { type: "cellFormula", cell: "D2", aliases: ["=SORT(B2:B8)"] },
        {
          type: "rangeValues",
          range: "D2:D8",
          expected: [4300, 6150, 8300, 9800, 11500, 12450, 15200],
        },
      ],
    },
    {
      title: "Malejąco — SORT z kierunkiem",
      instructions:
        "SORT przyjmuje dwa dodatkowe argumenty: **którą kolumną** sortować i **w którą stronę** (`1` rosnąco, `-1` malejąco).\n" +
        "W **E2** wpisz `=SORT(B2:B8,1,-1)` — ta sama kolumna, ale od największej do najmniejszej. Teraz porównaj z kolumną C: identyczny ranking, zero przepisywania.",
      initialWorkbook: firmsSheet({
        "0": {
          "2": { v: "Malejąco (przepisz)" },
          "3": { v: "SORT rosnąco" },
          "4": { v: "SORT malejąco" },
        },
        "1": { "2": { v: 15200 }, "3": { f: "=SORT(B2:B8)" } },
        "2": { "2": { v: 12450 } },
        "3": { "2": { v: 11500 } },
        "4": { "2": { v: 9800 } },
        "5": { "2": { v: 8300 } },
        "6": { "2": { v: 6150 } },
        "7": { "2": { v: 4300 } },
      }),
      hints: [
        "Drugi argument `1` = sortuj według pierwszej kolumny zakresu.",
        "Trzeci argument `-1` odwraca kierunek — to robi z rankingu malejący.",
      ],
      checks: [
        { type: "cellFormula", cell: "E2", aliases: ["=SORT(B2:B8,1,-1)"] },
        {
          type: "rangeValues",
          range: "E2:E8",
          expected: [15200, 12450, 11500, 9800, 8300, 6150, 4300],
        },
      ],
    },
    {
      title: "Cała tabela — SORT dwóch kolumn",
      instructions:
        "Na koniec sortowanie **całej tabeli**: nazwy razem z kwotami, alfabetycznie.\n" +
        "W **G2** wpisz `=SORT(A2:B8)`\n" +
        "Formuła rozleje **dwie kolumny naraz**: firmy w G (alfabetycznie) i ich kwoty w H — wiersze zostają w parach, bo sortujemy całość.",
      initialWorkbook: firmsSheet({
        "0": {
          "2": { v: "Malejąco (przepisz)" },
          "3": { v: "SORT rosnąco" },
          "4": { v: "SORT malejąco" },
          "6": { v: "Firma" },
          "7": { v: "Kwota (zł)" },
        },
        "1": { "2": { v: 15200 }, "3": { f: "=SORT(B2:B8)" }, "4": { f: "=SORT(B2:B8,1,-1)" } },
        "2": { "2": { v: 12450 } },
        "3": { "2": { v: 11500 } },
        "4": { "2": { v: 9800 } },
        "5": { "2": { v: 8300 } },
        "6": { "2": { v: 6150 } },
        "7": { "2": { v: 4300 } },
      }),
      hints: [
        "Zakres A2:B8 obejmuje obie kolumny — wynik też będzie dwukolumnowy.",
        "Sortowanie szło po pierwszej kolumnie (nazwach), kwoty po prostu jadą razem.",
      ],
      checks: [
        { type: "cellFormula", cell: "G2", aliases: ["=SORT(A2:B8)"] },
        {
          type: "rangeValues",
          range: "G2:G8",
          expected: [
            "Alfa Sp. z o.o.",
            "Beta S.A.",
            "Delta Logistyka",
            "Epsilon Media",
            "Gamma Consulting",
            "Omega Foods",
            "Zeta Print",
          ],
        },
        {
          type: "rangeValues",
          range: "H2:H8",
          expected: [12450, 8300, 4300, 9800, 15200, 11500, 6150],
        },
      ],
    },
  ],
};
