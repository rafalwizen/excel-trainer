import { workbook, type LessonInput, type WorkbookInit } from "../schema";

/**
 * Lesson 4 — the fill handle: numeric series vs plain copying. Checks assert
 * final values only, so dragging the handle or typing both pass. Empirical
 * note (Univer 1.3.1): typed dates are stored as text, so only NUMBERS form
 * series here — the text-copy task is the honest local version of "why
 * won't my months extend". Initials chain: each task adds its seeds on top
 * of the previous final state.
 */
type CellMap = Record<string, { v: string | number }>;

/** {"2": {v: 3}, ...} for consecutive integers, offset by a row count. */
function serialRows(from: number, to: number, offsetRow = 0): CellMap {
  const rows: CellMap = {};
  for (let v = from; v <= to; v++) rows[String(v - from + offsetRow)] = { v };
  return rows;
}

/** Merges per-column row maps into cellData (column index 0 = A, 1 = B…). */
function sheetOf(...columns: CellMap[]): WorkbookInit {
  const rows: Record<string, Record<string, { v: string | number }>> = {};
  columns.forEach((colMap, colIndex) => {
    for (const [row, cell] of Object.entries(colMap)) {
      rows[row] = { ...rows[row], [String(colIndex)]: cell };
    }
  });
  return workbook("Seria", 20, 8, rows);
}

const fillCodes: CellMap = { "0": { v: "FV/2026/001" } };

/** Column B after task 2: the completed step-5 series 5…40. */
const bSeries: CellMap = {
  "0": { v: 5 },
  "1": { v: 10 },
  "2": { v: 15 },
  "3": { v: 20 },
  "4": { v: 25 },
  "5": { v: 30 },
  "6": { v: 35 },
  "7": { v: 40 },
};

export const wypelnianieSeriamiLesson: LessonInput = {
  slug: "wypelnianie-seriami",
  title: "Wypełnianie seriami",
  shortDescription:
    "Uchwyt wypełniania: szybkie serie liczb (1, 2, 3…) i kopiowanie tekstu — i kiedy jest które.",
  category: "Podstawy",
  difficulty: 1,
  learningGoals: [
    "Wypełniać serię liczb uchwytem wypełniania",
    "Budować serie z własnym krokiem, np. co 5",
    "Rozróżniać kopiowanie tekstu od przedłużania serii liczb",
    "Wiedzieć, że dwie pierwsze komórki definiują krok serii",
  ],
  estimatedMinutes: 15,
  tasks: [
    {
      title: "Seria 1, 2, 3… do dziesięciu",
      instructions:
        "W A1 i A2 stoją już `1` i `2`. Zaznacz obie komórki (kliknij A1 i przeciągnij do A2), chwyć **mały kwadrat** w prawym dolnym rogu zaznaczenia (uchwyt wypełniania) i przeciągnij go w dół **do A10**. Arkusz przedłuży serię: 3, 4, 5…",
      initialWorkbook: sheetOf({ "0": { v: 1 }, "1": { v: 2 } }),
      hints: [
        "Uchwyt pojawi się, gdy zaznaczysz komórki — to mały kwadracik na rogu zaznaczenia.",
        "Krok serii arkusz liczy z dwóch pierwszych komórek: 1 i 2 oznacza krok 1.",
        "Nie udało się przeciągnąć? Brakujące liczby możesz po prostu wpisać ręcznie.",
      ],
      checks: [
        {
          type: "rangeValues",
          range: "A3:A10",
          expected: [3, 4, 5, 6, 7, 8, 9, 10],
        },
      ],
    },
    {
      title: "Krok 5 — od piątki do czterdziestki",
      instructions:
        "Podobnie w kolumnie B: w B1 i B2 stoją `5` i `10`. Zaznacz B1:B2 i przeciągnij uchwytem wypełniania **do B8**. Ponieważ różnica to 5, arkusz da 15, 20, 25…",
      initialWorkbook: sheetOf(serialRows(1, 10), { "0": { v: 5 }, "1": { v: 10 } }),
      hints: [
        "Zaznacz dokładnie dwie komórki (B1 i B2) — z jednej arkusz nie odczyta kroku.",
        "Miejsce, w którym puścisz przycisk myszy, wyznacza koniec serii — do B8.",
      ],
      checks: [
        {
          type: "rangeValues",
          range: "B3:B8",
          expected: [15, 20, 25, 30, 35, 40],
        },
      ],
    },
    {
      title: "Tekst się nie przedłuża — kopiuje",
      instructions:
        "W C1 stoi numer dokumentu `FV/2026/001`. Zaznacz C1 i przeciągnij uchwytem wypełniania **do C6**.\n" +
        "Zobacz, co się stanie: tekst **nie tworzy serii** — po prostu kopiuje się sześć razy. Numery dokumentów buduje się inaczej (zwykle z liczb albo funkcjami tekstowymi — to na dalszych lekcjach).",
      initialWorkbook: sheetOf(serialRows(1, 10), bSeries, fillCodes),
      hints: [
        "Ten sam uchwyt, inny efekt: liczby przedłużają serię, tekst tylko się powiela.",
        "Jeśli przeciągnięcie dało coś innego, dokończ kopiowanie ręcznie — wszystkie komórki mają zawierać FV/2026/001.",
      ],
      checks: [
        {
          type: "rangeValues",
          range: "C2:C6",
          expected: [
            "FV/2026/001",
            "FV/2026/001",
            "FV/2026/001",
            "FV/2026/001",
            "FV/2026/001",
          ],
        },
      ],
    },
    {
      title: "Numery co 5 — seria z krokiem",
      instructions:
        "W D1 i D2 stoją `105` i `110` — początki numeracji przesyłek. Przeciągnij uchwytem tak, by seria z krokiem 5 dotarła **do D8** (ostatni numer to `140`).",
      initialWorkbook: sheetOf(
        serialRows(1, 10),
        bSeries,
        { ...fillCodes, "1": { v: "FV/2026/001" }, "2": { v: "FV/2026/001" }, "3": { v: "FV/2026/001" }, "4": { v: "FV/2026/001" }, "5": { v: "FV/2026/001" } },
        { "0": { v: 105 }, "1": { v: 110 } },
      ),
      hints: [
        "Jak zawsze: zaznacz obie komórki z seedami (D1 i D2), dopiero wtedy ciągnij.",
        "Krok 5 arkusz odczyta sam — 105, 110, więc dalej 115, 120…",
      ],
      checks: [
        {
          type: "rangeValues",
          range: "D3:D8",
          expected: [115, 120, 125, 130, 135, 140],
        },
      ],
    },
  ],
};
